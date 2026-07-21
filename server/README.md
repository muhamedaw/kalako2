# كلك (Kalak) — Backend

خلفية Node.js + Socket.io + SQLite للعبة أسئلة جماعية بأسلوب Fibbage: كل لاعب يكتب
إجابة كاذبة لسؤال غريب، ثم يصوّت الجميع على الإجابة الحقيقية.

## التشغيل محليًا

```bash
npm install
cp .env.example .env   # عدّل القيم عند الحاجة
npm run dev            # tsx watch — يعيد التشغيل تلقائيًا عند التعديل
npm test                # اختبارات وحدة + اختبار تكامل بـ socket.io-client حقيقي
```

الخادم يستمع افتراضيًا على المنفذ `4001` (`PORT` في `.env`). فحص الصحة: `GET /health`.

## البنية

```
src/
  config.mts          إعدادات من متغيرات البيئة
  server.mts           factory: express + http + socket.io
  index.mts             نقطة التشغيل الفعلية (listen)
  db/                   SQLite (sql.js) — أرشيف الجولات المنتهية فقط
  game/                 آلة الحالة، التسجيل، بنك الأسئلة، أكواد الغرف، QR
  socket/               معالجات أحداث Socket.io
  data/questions/       بنك الأسئلة العربي (JSON قابل للتعديل يدويًا)
tests/                  اختبارات node:test
```

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

## أحداث Socket.io

**من العميل:**
- `create_room({ isPrivate, answerTimeSeconds, roundsCount, allowedCategories, playerName }, ack)`
  → `ack({ roomCode, joinUrl, qrCodeDataUrl, playerId, room })` فورًا.
- `join_room({ roomCode, playerName } | { roomCode, playerId }, ack)` — الشكل الثاني لإعادة الانضمام.
- `start_game()`, `pick_category({ category })` — للمضيف فقط.
- `submit_answer({ text })` — لا يُبث فورًا، فقط عدّاد تقدّم (`answer_progress`).
- `submit_vote({ slotId })` — `slotId` من قائمة `VOTING`، ليس معرّف لاعب (تمنع كشف الهوية بنيويًا).

**من الخادم:** `phase_changed` (الحدث الرئيسي لكل انتقال حالة)، `answer_progress`,
`vote_progress`, `your_answer_slot` (خاص لكل لاعب)، `player_joined/left/disconnected/reconnected`.

## إعادة الاتصال

عند انقطاع الاتصال أثناء اللعب (وليس في اللوبي)، يبقى مقعد اللاعب محجوزًا 30 ثانية
(`RECONNECT_WINDOW_MS`). العميل يعيد `join_room({ roomCode, playerId })` بنفس
المعرّف الذي استلمه أول مرة لاستعادة مكانه دون فقد النقاط.

## النقاط

- تخمين الإجابة الصحيحة: **+1**
- عن كل لاعب صوّت لإجابتك الكاذبة: **+1** إضافية (تراكمية)

## SQLite

ملف واحد فقط: `data/kalak.sqlite` (عبر `sql.js`، بدون أي بناء native — يعمل على أي
منصة بدون أدوات ترجمة). يُستخدم لأرشفة الألعاب المنتهية فقط (الجولات، الإجابات،
النتائج النهائية)؛ بنك الأسئلة يبقى في ملفات JSON القابلة للتعديل اليدوي.

## النشر (PM2)

```bash
pm2 start ecosystem.config.cjs
```
