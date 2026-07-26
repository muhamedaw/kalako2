# كلك (Kalak) — Backend

خلفية Node.js + Socket.io + SQLite للعبة أسئلة جماعية بأسلوب Fibbage: كل لاعب يكتب
إجابة كاذبة لسؤال غريب، ثم يصوّت الجميع على الإجابة الحقيقية. يشمل نظام اقتصاد
ضيوف (عملات، متجر تجميلي، Hall of Fame، إشعارات) وشراء عملات حقيقي عبر PayPal.

## التشغيل محليًا

```bash
npm install
cp .env.example .env   # عدّل القيم عند الحاجة (بما فيها PAYPAL_CLIENT_ID/SECRET إن أردت اختبار الدفع)
npm run dev            # tsx watch — يعيد التشغيل تلقائيًا عند التعديل
npm test                # كل الاختبارات: وحدة + تكامل بـ socket.io-client حقيقي
```

الخادم يستمع افتراضيًا على المنفذ `4001` (`PORT` في `.env`). فحص الصحة: `GET /health`.

## البنية

```
src/
  config.mts          إعدادات من متغيرات البيئة (بما فيها PayPal)
  server.mts           factory: express + http + socket.io
  index.mts             نقطة التشغيل الفعلية (listen، يحمّل dotenv)
  db/                   SQLite (sql.js) — schema.sql + gameHistoryRepo
  game/                 آلة الحالة، التسجيل، بنك الأسئلة، أكواد الغرف، QR
  socket/
    index.mts            أحداث اللعب الأساسية (create_room..submit_vote) + rate limiting
    economy.mts           بروفايل الضيف، المتجر، Hall of Fame، الإشعارات
    payments.mts           شراء عملات حقيقي عبر PayPal (Orders API v2)
    rateLimit.mts           محدد معدّل بسيط في الذاكرة (نافذة زمنية منزلقة)
    validate.mts            تطبيع/تحقق أشكال المدخلات القادمة من العميل (untrusted)
    wrapHandler.mts          safeOn — يلف كل معالج حدث بـtry/catch يسجّل الخطأ بدل تعطيل الخادم
    debug.mts                get_recent_errors، محمي بـDEBUG_TOKEN
  backup/
    core.mjs                 منطق النسخ الاحتياطي (JS خالص — يعمل عبر node أو tsx)
    scheduler.mts             جدولة داخل نفس عملية kalak-backend، كل 24 ساعة
  logging/
    logger.mts                سجل أخطاء JSON lines، احتفاظ 14 يومًا
  data/questions/<lang>/  بنك أسئلة مستقل لكل لغة (ar/en/he)، JSON قابل للتعديل يدويًا
tests/                  اختبارات node:test (50 اختبار حاليًا)
scripts/
  loadtest.mjs             اختبار حمل يدوي بـ20 اتصال حقيقي (غير جزء من npm test)
  backup-db.mjs             تشغيل نسخة احتياطية يدويًا: `node scripts/backup-db.mjs`
```

## النسخ الاحتياطي التلقائي

كل 24 ساعة (مجدول داخل نفس عملية `kalak-backend` — بدون عملية PM2 ثانية)، تُنسخ
`data/kalak.sqlite` إلى `backups/kalak-YYYY-MM-DD-HHmmss.db`. عند الإقلاع، يُنفَّذ نسخ
فوري فقط إن كانت أحدث نسخة غائبة أو عمرها ≥24 ساعة (لتفادي استهلاك حصة الاحتفاظ بسبب
إعادة تشغيل PM2 المتكررة أثناء عمليات النشر). الاحتفاظ: آخر 14 نسخة فقط، الأقدم تُحذف
تلقائيًا. يبقى كل شيء داخل `server/backups/` فقط. تشغيل يدوي: `node scripts/backup-db.mjs`.

## تسجيل الأخطاء البنيوي

كل معالج حدث Socket.io ملفوف بـ`safeOn` (`socket/wrapHandler.mts`): استثناء متزامن أو
Promise مرفوض يُسجَّل بدل أن يعطّل العملية بأكملها — طلب سيّئ من لاعب واحد لا يجب أن
يُسقط الخادم عن البقية. كل سطر في `logs/error-YYYY-MM-DD.log` كائن JSON واحد
(`timestamp`, `message`, `stack` مقصوص لـ2000 حرف, `event`, `deviceId` إن وُجد) —
لا أسرار أو حمولات كاملة تُسجَّل أبدًا (الحقول المسموحة محدودة بنيويًا). احتفاظ 14 يومًا،
نفس آلية التقليم.

**`get_recent_errors`** (تصحيح فقط): يرفض بدون `DEBUG_TOKEN` الصحيح من `.env`، يرجع آخر
50 سطر عند تطابقه. ليس لوحة تحكم كاملة — أداة تشخيص بسيطة فقط.

## آلة الحالة

```
LOBBY → CATEGORY_PICK → ANSWERING → VOTING → RESULTS
                                              │
                     (round < roundsCount)  ◄─┤ (round >= roundsCount, لا تعادل)
                            │                 │
                            ▼                 ▼
                     CATEGORY_PICK        GAME_OVER
                                              ▲
                     (تعادل بالصدارة) ─── TIEBREAKER
```
`TIEBREAKER` ليست قيمة `phase` فعلية — تُمثَّل بـ`phase: 'CATEGORY_PICK'` +
`room.isTiebreakerRound: true` + الحقل `tiebreaker: true` على حدث `phase_changed`.

## أحداث Socket.io — اللعب الأساسي

**من العميل:**
- `create_room({ isPrivate, answerTimeSeconds, roundsCount, allowedCategories, playerName, familyMode?, doublePointsRoundEnabled?, blindVotingEnabled?, language?, deviceId? }, ack)`
  → `ack({ roomCode, joinUrl, qrCodeDataUrl, playerId, room })` فورًا.
  - `familyMode` (افتراضي `true`): يستبعد الأسئلة `ageRating: "adult"`.
  - `doublePointsRoundEnabled`: جولة عشوائية واحدة بمضاعفة ×2.
  - `blindVotingEnabled`: يخفي `votesReceived`/`pointsAwarded` لكل إجابة في `RESULTS`.
  - `language` (`ar`|`en`|`he`، افتراضي `ar`): بنك أسئلة مستقل تمامًا لكل لغة (مو ترجمة).
  - `deviceId` (اختياري): يربط اللاعب داخل الغرفة ببروفايل الاقتصاد الدائم؛ بدونه لا عملات تُمنح عند نهاية اللعبة (بدون كسر التوافق).
- `join_room({ roomCode, playerName, deviceId? } | { roomCode, playerId }, ack)` — الشكل الثاني لإعادة الانضمام.
- `start_game()`, `pick_category({ category })` — للمضيف فقط.
- `submit_answer({ text, forceSubmit? }, ack)` → `ack({ ok, needsRevision? })`. إذا كتب اللاعب
  الإجابة الصحيحة فعليًا (بعد تطبيع التشكيل/علامات الترقيم)، يُرسل له خاصة `answer_needs_revision`
  ويحتاج `forceSubmit:true` لتجاوزها.
- `submit_vote({ slotId })` — `slotId` من قائمة `VOTING`، ليس معرّف لاعب (يمنع كشف الهوية بنيويًا).
- `leave_room()` — مطابق لسلوك `disconnect`.

**من الخادم:** `phase_changed` (الحدث الرئيسي لكل انتقال حالة)، `answer_progress`,
`vote_progress`, `your_answer_slot` (خاص لكل لاعب)، `answer_needs_revision` (خاص)،
`player_joined`, `player_left`, `player_disconnected`, `player_reconnected`,
`player_connection_changed` (`{playerId, status: 'disconnected'|'reconnected'}` — يُبث
فورًا في كل الأطوار قبل أي منطق مهلة/إزالة).

## إعادة الاتصال

عند انقطاع الاتصال أثناء اللعب (وليس في اللوبي)، يبقى مقعد اللاعب محجوزًا 30 ثانية
(`RECONNECT_WINDOW_MS`). العميل يعيد `join_room({ roomCode, playerId })` بنفس
المعرّف الذي استلمه أول مرة لاستعادة مكانه دون فقد النقاط. في اللوبي، الانقطاع يزيل
اللاعب فورًا (ويُعاد تعيين المضيف لأول لاعب متصل إن كان هو من انقطع).

## النقاط والأكثر خداعًا

- تخمين الإجابة الصحيحة: **+1**
- عن كل لاعب صوّت لإجابتك الكاذبة: **+1** إضافية (تراكمية)
- عند `GAME_OVER`: `mostDeceptivePlayer: { id, name, timesFooledOthers } | null`

## نظام اقتصاد الضيف (device-id، بدون حساب/كلمة مرور)

كل عميل يولّد `crypto.randomUUID()` مرة واحدة، يحفظه في `localStorage`، ويرسله كـ`deviceId`
مع أي طلب اقتصادي. **لا توجد مصادقة حقيقية** — مقايضة مقصودة لأنها لعبة حفلة منخفضة
المخاطر؛ فقد جهاز = فقد البروفايل.

**أحداث العميل ← الخادم** (كلها عبر `ack`):
- `get_or_create_profile({ deviceId, nickname? })` → `{ deviceId, nickname, avatarConfig, coins, inventory }`
- `update_profile({ deviceId, nickname?, avatarConfig? })` — `avatarConfig` كائن حر (شكل `{body,eyes,hat}` الحالي في العميل)
- `get_store_catalog({})` → قائمة أقسام `{ type, title, description, items: [{id,type,name,description,price,previewId}] }`
- `purchase_item({ deviceId, itemId })` → `{success:true, coins, inventory}` أو `{error: 'insufficient_funds'|'already_owned'|'invalid_item'}`
- `get_hall_of_fame({})` → أفضل 50 إجابة كاذبة خدعت أحدًا فعليًا، مرتبة تنازليًا حسب عدد
  من خُدع ثم عدد أصوات المجتمع — مبنية مباشرة من `round_answers`/`rounds`/`game_players`
  التاريخية (بدون تكرار تخزين).
- `vote_hall_of_fame({ deviceId, entryId })` → `{success:true, newVoteCount}` أو
  `{success:false, reason:'already_voted'}` (صوت واحد لكل جهاز لكل إدخال، `PRIMARY KEY`).
- `get_notifications({ deviceId })`, `mark_notification_read({ notificationId })`,
  `get_unread_count({ deviceId })`

**كتالوج المتجر الحالي** (تجميلي بحت — لا يؤثر على اللعب): 3 حزم أصوات @75، 4 إطارات
لبطاقة النتائج @40. *(كتالوج الأفاتار المرقّم `avatar_17`..`avatar_22` أُزيل — نظام
الأفاتار في العميل انتقل بالكامل إلى `avatarConfig` بلا مسار يعتمد أرقامًا مسبقة).*

**منح العملات** (تلقائي عند `GAME_OVER`، بلا حدث جديد من العميل): لكل لاعب معه
`deviceId` — **10 ثابتة + 5 لكل جولة خمّن فيها صح + 5 لكل لاعب خدعه عبر اللعبة كاملة**
(نفس منطق `mostDeceptivePlayer` — تراكمي لكل مرة خُدع فيها، وليس لكل ضحية مختلفة).
يُضاف إشعار `coins_earned` تلقائيًا.

## شراء عملات حقيقي (PayPal Sandbox/Live)

REST API v2 (Orders) مباشرة عبر `fetch`، بدون SDK. `PAYPAL_MODE=sandbox|live` يتحكم
بالعنوان (`api-m.sandbox.paypal.com` أو `api-m.paypal.com`). رمز OAuth مخبأ بالذاكرة
حتى انتهاء صلاحيته.

**الشرائح الثابتة على الخادم** (لا تُقرأ من العميل أبدًا):

| tierId        | السعر  | العملات |
|---------------|--------|---------|
| `tier_small`  | $1.99  | 100     |
| `tier_medium` | $4.99  | 300     |
| `tier_large`  | $9.99  | 700     |

**الأحداث:**
- `create_paypal_order({ deviceId, tierId })` → `{orderId}` أو `{error: 'invalid_tier'|'paypal_not_configured'|'order_create_failed'}`
- `capture_paypal_order({ deviceId, paypalOrderId, tierId })` →
  `{success:true, newCoinBalance, alreadyProcessed?}` أو `{success:false, reason: 'payment_not_completed'|'invalid_tier'|'capture_failed'}`

**ضمان عدم التكرار (idempotency):** `UNIQUE(paypal_order_id)` على جدول `transactions`.
قبل أي نداء لـPayPal، يتحقق الخادم أولاً هل هذا `paypalOrderId` موجود مسبقًا في
`transactions` — إن كان كذلك يرجع نفس النتيجة فورًا (`alreadyProcessed:true`) بدون
منح عملات مرة ثانية ولا نداء PayPal إضافي. محاولة `capture` لطلب لم يوافق عليه الدافع
بعد ترجع `payment_not_completed` من PayPal نفسها (422 `ORDER_NOT_APPROVED`) — بدون
أي منح.

## تحديد المعدّل (rate limiting)

محدد بسيط في الذاكرة (نافذة منزلقة، `socket/rateLimit.mts`)، مفتاحه `deviceId` للأحداث
الاقتصادية/الدفع و`socket.id` لأحداث اللعب الأساسية. عند تجاوز الحد يُرجع الخادم
`{error:'rate_limited'}` (أو يتجاهل الحدث بصمت للأحداث بلا `ack`) بدل معالجة الطلب.
مصدر واحد داخل العملية — يحتاج مخزنًا مشتركًا (Redis) خلف موازن حمل لو صار أكثر من نسخة.

| الحدث | الحد |
|---|---|
| `create_room` | 5 / 60 ثانية لكل socket |
| `join_room` | 10 / 60 ثانية لكل socket |
| `pick_category`, `submit_answer`, `submit_vote` | 10-15 / 10 ثوانٍ لكل socket |
| `update_profile`, `purchase_item`, `vote_hall_of_fame` | 10 / 10 ثوانٍ لكل deviceId |
| `create_paypal_order` | 5 / 60 ثانية لكل deviceId |
| `capture_paypal_order` | 10 / 60 ثانية لكل deviceId |

## التحقق من المدخلات

كل حدث يُطبّع حمولته عبر `asObject`/`asString` (`socket/validate.mts`) قبل لمسها —
يحمي من `null`/أنواع خاطئة يرسلها عميل خبيث أو معطوب دون تعطيل العملية بالكامل. كل
معالج اقتصاد/دفع يلتف بـ`try/catch` أيضًا كطبقة دفاع ثانية.

## SQLite — كل الجداول

ملف واحد فقط: `data/kalak.sqlite` (عبر `sql.js`، بدون أي بناء native). `persistToDisk()`
يُستدعى بعد كل كتابة (sql.js في الذاكرة حتى يُصدَّر).

**أرشيف الألعاب المنتهية** (تُكتب مرة عند `GAME_OVER`، تُقرأ لـHall of Fame):
`games`, `game_players`, `rounds`, `round_answers` (يشمل `votes_received` — هو نفسه
عدّاد "الخداع" لكل إجابة، مُعاد استخدامه مباشرة لـHall of Fame بدون تكرار تخزين).

**اقتصاد الضيف:** `players` (`device_id` PK, `nickname`, `avatar_id`, `coins`),
`inventory` (`device_id`+`item_id` PK), `notifications`, `hall_of_fame_votes`
(`device_id`+`entry_id` PK — يمنع التصويت المزدوج بنيويًا).

**المدفوعات:** `transactions` (`paypal_order_id` **UNIQUE** — ضمان عدم التكرار).

## اختبار الحمل (20 لاعب)

```bash
node scripts/loadtest.mjs [url]   # افتراضي: http://localhost:4001
```
يشغّل غرفة كاملة بـ20 اتصال Socket.io حقيقي ويطبع توقيت كل مرحلة. غير جزء من `npm test`.
تم التحقق يدويًا هذه الجلسة على الإنتاج المباشر: 20 اتصال متزامن + طلبات بروفايل/كتالوج
متزامنة + جولة كاملة حتى `GAME_OVER` + منح عملات صحيح — بدون أعطال وبدون أثر على
العمليات الأخرى على نفس الخادم.

## النشر والعزل (قواعد لا تُكسر)

هذا الخادم يعمل على خادم AWS مشترك يستضيف مواقع/عملاء آخرين. القواعد التالية **دائمة**:

- **كل الملفات داخل `/var/www/manarah/kalak` فقط.** لا كتابة خارجه، لا قواعد بيانات
  أخرى، لا لمس عمليات/مواقع أخرى (`filsoof-app`, `manarah-save`, إلخ).
- **PM2**: اسم العملية `kalak-backend` فقط — `pm2 restart kalak-backend`، أبدًا
  `pm2 restart all` ولا إعادة تشغيل عملية أخرى.
- **nginx**: أي تعديل يُختبر أولًا بـ`nginx -t`، ثم `nginx -s reload` — أبدًا `restart`.
- **بدون تثبيت نظامي (`sudo apt install/upgrade`)** وبدون خدمات استضافة جديدة.
- **SQLite واحد فقط** داخل `data/kalak.sqlite` لهذا المشروع — لا قواعد بيانات مشتركة.
- **الأسرار** في `.env` (مُتجاهَل من git) فقط — أبدًا مكتوبة في الكود. `.env.example`
  يوثّق كل متغير مُستخدم فعليًا في `src/` (يُراجَع دوريًا مقابل `grep process.env`).

```bash
pm2 start ecosystem.config.cjs   # أول مرة فقط
pm2 restart kalak-backend        # بعد أي تحديث كود
```
