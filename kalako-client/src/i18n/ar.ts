import type { Translations } from './types'

const ar: Translations = {
  lang: 'ar',
  langLabel: 'عربي',
  dir: 'rtl',

  navHome: 'الرئيسية',
  navHowToPlay: 'كيف تلعب',
  navAbout: 'عن المطوّر',
  navLegalPrivacy: 'سياسة الخصوصية',
  navLegalTerms: 'شروط الخدمة',
  navLegalRefund: 'سياسة الاسترداد',

  navStore: 'المتجر',
  navVoting: 'التصويت',
  navPlay: 'العب',
  navNotifications: 'الإشعارات',
  navProfile: 'الملف الشخصي',

  comingSoonTitle: 'قريبًا',
  comingSoonSubtitle: 'هذه الميزة قيد التطوير، ترقّبوها قريبًا',

  settingsTitle: 'الإعدادات',
  settingsLegalLabel: 'قانوني',
  settingsCloseAria: 'إغلاق الإعدادات',

  playOnline: 'العب أونلاين',
  playCreatePrivate: 'أنشئ غرفة خاصة',

  welcomeTitle: 'كلاكو',
  welcomeSubtitle: 'لعبة أسئلة جماعية بالكذب والحقيقة',
  createRoom: 'إنشاء غرفة جديدة',
  joinRoom: 'الانضمام بكود',
  welcomeTagline: 'أضف الكذابة وتسلّي مع أصحابك',

  createRoomTitle: 'إنشاء غرفة',
  createRoomNameLabel: 'اسم الغرفة',
  createRoomNamePlaceholder: 'فوضى ليلة الجمعة',
  back: '← رجوع',
  yourName: 'اسمك',
  yourNamePlaceholder: 'اكتب اسمك هنا...',
  privateRoom: 'غرفة خاصة (للمدعوين فقط)',
  privateRoomDesc: '',
  answerTime: 'وقت الإجابة',
  rounds: 'عدد الجولات',
  categories: 'التصنيفات',
  advancedOptions: 'خيارات متقدمة',
  scoreMultiplier: 'مضاعف نقاط',
  scoreMultiplierDesc: 'ضعف النقاط في بعض الجولات',
  blindVote: 'تصويت أعمى',
  blindVoteDesc: 'لا تعرف من صوّت لك',
  adultsOnly: 'جلسة كبار',
  adultsOnlyDesc: 'للبالغين فقط',
  createRoomBtn: 'إنشاء الغرفة',
  sec: 'ثانية',
  answerTime30: '30 ثانية',
  answerTime45: '45 ثانية',
  answerTime60: '60 ثانية',
  answerTime90: '90 ثانية',
  rounds3: '3 جولات',
  rounds5: '5 جولات',
  rounds7: '7 جولات',
  rounds10: '10 جولات',

  joinRoomTitle: 'الانضمام لغرفة',
  roomCode: 'كود الغرفة',
  roomCodePlaceholder: 'مثال: ABC123',
  joinRoomBtn: 'انضم للغرفة',

  lobbyTitle: 'اللوبي',
  privateBadge: '🔒 خاصة',
  publicBadge: '🌐 عامة',
  roomCodeLabel: 'كود الغرفة',
  copyCode: '📋 نسخ الكود',
  copiedCode: '✓ تم النسخ',
  copyLink: '🔗 نسخ الرابط',
  copiedLink: '✓ تم النسخ',
  scanToJoin: 'امسح الرمز للانضمام',
  players: 'اللاعبون',
  timeLabel: 'وقت',
  roundsLabel: 'جولات',
  startGame: 'ابدأ اللعبة',
  playerCount: 'لاعب',
  waitingForHost: 'بانتظار المضيف للبدء...',
  leaveRoom: 'مغادرة الغرفة',
  playersCount: 'اللاعبون ({{count}})',
  timeFormat: '{{seconds}}ث وقت',
  roundsFormat: '{{count}} جولات',

  lobbyRecommendedRounds: 'موصى به: {{count}} جولات لعدد {{players}} لاعبين',
  lobbyUseRecommended: 'استخدم الموصى به',
  lobbyWatchOnTv: 'شاهد على التلفاز',
  lobbyDisplayCount: '{{count}} يشاهدون',
  lobbyDisplayCountOne: 'يشاهد شخص واحد',

  tournamentModeLabel: 'بطولة (أفضل من 3 مباريات)',
  tournamentModeDesc: 'نفس الغرفة تلعب 3 مباريات متتالية مع نتيجة تراكمية',
  tournamentGameLabel: 'المباراة {{current}} من {{total}}',
  tournamentStandingsTitle: 'ترتيب البطولة',
  tournamentPlayNextGame: 'العب المباراة {{next}} من {{total}}',
  tournamentOverallWinner: 'الفائز الإجمالي',
  tournamentFinalStandings: 'الترتيب النهائي للبطولة',

  categoryCompletionTitle: 'تقدم الفئات',
  categoryCompletionSeen: '{{seen}}/{{total}} شوهد',

  categoryUnlockSectionTitle: 'فتح الفئات',
  categoryExpansionSectionTitle: 'توسعات الفئات',
  categoryLocked: 'مقفلة — افتحها من المتجر',
  storeCategoryUnlockName: 'فتح {{categoryName}}',
  storeCategoryUnlockDesc: 'وصول دائم لـ {{categoryName}} — العب للأبد بدون عملات.',
  storeCategoryExpansionName: '+100 سؤال {{categoryName}}',
  storeCategoryExpansionDesc: 'أسئلة أكثر، كذبات أكثر، فوضى أكبر.',

  displayScreenWaiting: 'بانتظار بدء اللعبة...',
  displayJoinFailed: 'تعذر الانضمام كشاشة عرض — تحقق من الكود وحاول مرة أخرى.',
  displayFull: 'هذه الغرفة وصلت للحد الأقصى من شاشات العرض.',
  displaySpectatorBadge: 'يُشاهد',
  reactionsPickerAria: 'اختر رد فعل',

  suggestQuestionFormTitle: 'اقترح سؤالاً',
  suggestQuestionCategoryLabel: 'الفئة',
  suggestQuestionQuestionLabel: 'سؤالك',
  suggestQuestionAnswerLabel: 'الإجابة',
  suggestQuestionSubmitButton: 'إرسال',
  suggestQuestionThankYou: 'شكراً! سؤالك في قائمة المراجعة.',

  swapQuestionButtonLabel: 'سؤال جديد',
  freezeRoundButtonLabel: '❄️ تجميد',
  freezeRoundUsedTooltip: 'تم استخدامه في هذه الجولة',
  freezeRoundSuccessToast: '+10 ثانية! إنقاذ رائع.',

  categoryPickTitle: 'اختر التصنيف',
  pickCategoryHost: 'اختر تصنيفاً لهذه الجولة',
  pickCategoryWaiting: 'بانتظار المضيف لاختيار التصنيف...',
  tiebreaker: '⚡ جولة فاصلة',

  round: 'الجولة',
  doublePoints: '⚡ ×2 نقاط',
  questionLoading: 'جارِ تحميل السؤال...',
  answerPlaceholder: 'اكتب إجابتك هنا...',
  submitAnswer: 'إرسال الإجابة',
  answerSubmitted: '✓ تم تسجيل إجابتك',
  answerScreenPictureRound: 'جولة صور',
  answeredCount: 'أجابوا',
  charCount: '{{count}}/140',

  answerRevisionTitle: 'هذه الإجابة قد تكشفك!',
  answerRevisionBody: 'السؤال يطلب إجابة خادعة. إذا كانت إجابتك صحيحة جداً، سيكتشفها الخصم فوراً. جرّب إجابة أكثر خداعاً.',
  answerRevisionEditButton: 'أريد تعديل الإجابة',
  answerRevisionSubmitAnyway: 'إرسالها زي ما هي',

  voteTitle: 'أيهم الإجابة الصحيحة؟',
  voteSubtitle: 'اختر الإجابة التي تظنها صحيحة — الإجابات مخفية بلا أسماء',
  yourAnswer: '(إجابتك)',
  voteSubmitted: '✓ تم تسجيل تصويتك',
  votedCount: 'صوّتوا',

  roundResults: 'نتائج الجولة',
  correctAnswer: 'الإجابة الصحيحة',
  answersAndVotes: 'الإجابات والتصويت',
  votes: 'صوت',
  points: 'نقطة',
  standings: 'الترتيب',

  gameOverTitle: 'انتهت اللعبة!',
  finalStandings: 'الترتيب النهائي',
  saveImage: '📸 حفظ كصورة',
  exit: 'خروج',
  youLabel: '(أنت)',
  medal1: '🥇',
  medal2: '🥈',
  medal3: '🥉',

  reconnecting: 'جارِ إعادة الاتصال...',
  reconnectingSub: 'نحاول الاتصال بالخادم',

  devPreviewTitle: 'معاينة الأصول',
  devPreviewBack: '← رجوع للتطبيق',
  devPreviewLogos: 'الشعارات',
  devPreviewAvatars: 'الصور الرمزية',
  devPreviewCategoryIcons: 'أيقونات التصنيفات',
  devPreviewExtraIcons: 'أيقونات إضافية',
  devPreviewSoundFx: 'المؤثرات الصوتية',
  devPreviewQrCode: 'الرمز المضمين',
  devPreviewShareCard: 'بطاقة النتائج',
  devPreviewSplash: 'شاشة البداية',
  devPreviewLobbyBg: 'خلفية اللوبي',
  devPreviewHorizontal: 'أفقي',
  devPreviewSquare: 'مربع',
  devPreviewJoin: 'انضمام',
  devPreviewCountdown: 'عدّ تنازلي',
  devPreviewSubmit: 'إرسال',
  devPreviewVote: 'تصويت',
  devPreviewCorrect: 'صحيح',
  devPreviewTricked: 'خداع',
  devPreviewWin: 'فوز',
  devPreviewScoreMultiplier: 'مضاعف نقاط',
  devPreviewBlindVote: 'تصويت أعمى',
  devPreviewMostDeceptive: 'الأكثر خداعًا',
  devPreviewFamily: 'عائلي',
  devPreviewAdults: 'كبار',
  devPreviewSubtitle: 'سمة النيون بارتي — تحدي الإجابات',
  devPreviewWithNeon: 'إطار نيون',
  devPreviewSmall: 'صغير',

  logoHorizontalAria: 'شعار كلاكو أفقي',
  logoSquareAria: 'شعار كلاكو مربع',
  splashAria: 'شاشة تحميل كلاكو',
  lobbyBgAria: 'خلفية لوبي كلاكو',
  timerAria: '{{seconds}} ثانية متبقية',
  scoreMultiplierAria: 'مضاعف النقاط',
  blindVoteAria: 'تصويت أعمى',
  mostDeceptiveAria: 'الأكثر خداعًا',
  familyAdultsAria: '{{variant}}',
  shareCardResultAria: 'نتيجة {{name}}: {{score}} نقطة - المرتبة {{rank}}',
  loadingText: 'جارِ التحميل...',
  brandLabel: 'كلاكو',

  splashTagline: 'تحدي الإجابات',
  logoSubtitle: 'كلاكو',
  shareCardTitle: 'تحدي الإجابات',
  shareCardSubtitle: 'لعبة خداع جماعية',
  shareCardRank: 'المرتبة {{rank}}',
  shareCardOutOf: 'من أصل {{total}}',
  shareCardPlayerLabel: 'اللاعب',
  shareCardScoreLabel: 'النقاط',

  howToPlayTitle: 'كيف تلعب؟',
  howToPlayIntro: 'لعبة خداع جماعية — اختر كذبتك بذكاء!',
  step1Title: 'أنشئ غرفة أو انضم',
  step1Desc: 'أنشئ غرفة جديدة وشارك الكود مع أصحابك، أو انضم بكود موجود.',
  step2Title: 'اختر التصنيف',
  step2Desc: 'المضيف يختار تصنيفاً لكل جولة من 8 تصنيفات متنوعة.',
  step3Title: 'اكتب إجابة كاذبة',
  step3Desc: 'شوف السؤال واكتب إجابة تضن الناس بتختارها — كل ما كانت مقنعة كل ما كسبت نقاط.',
  step4Title: 'صوّت للإجابة الصحيحة',
  step4Desc: 'شوف كل الإجابات واختر اللي تظنها صحيحة. الإجابات مخفية بلا أسماء.',
  step5Title: 'اجمع النقاط',
  step5Desc: 'الصحيح يكسب نقطة، ومن خدع غيره يكسب نقطة بعد! الخداع فن.',

  aboutTitle: 'عن المطوّر',
  aboutGreeting: 'HELLO',
  aboutName: 'محمد عويسات',
  aboutNameEn: 'Muhammed Awesat',
  aboutRole: 'صانع لعبة تحدي الإجابات',
  aboutBio: 'مطوّر شغوف بصنع تجارب تفاعلية تجمع الناس. كلاكو من مشروعاتي المفضلة — لعبة خداع جماعية تسلّي أصحابك وتكشف مخك.',
  aboutSignature: 'صنع بكل حب ❤️',

  aboutCreatorName: 'محمد عويسات',
  aboutCreatorBio: 'مطوّر شغوف بصنع تجارب تفاعلية تجمع الناس. كلاكو من مشروعاتي المفضلة — لعبة خداع جماعية تسلّي أصحابك وتكشف مخك.',
  aboutCreditsTitle: 'الإسنادات',
  aboutCreditsBody: 'بُني بحب، بقهوة السهر، وبدعم مجتمع المصادر المفتوحة. شكر خاص لكل من لعب واختبر وشارك بالأفكار على طول الطريق.',
  playerDisconnected: 'غير متصل',

  storeSectionAvatarsDesc: 'عبّر عن شخصيتك بمظهر فريد ومجنون.',
  storeSectionEffectsDesc: 'أصوات فوز وكنفيتر ملوّن واحتفالات النصر.',
  storeSectionFramesDesc: 'زِّن بطاقاتك بإطارات نيون مبهرة.',
  storeItemSfxArcadeName: 'أصوات الأركيد',
  storeItemSfxArcadeDesc: 'بيب وبوب كلاسيكي وألحان النصر.',
  storeItemSfxRetroName: 'أصوات رجعية',
  storeItemSfxRetroDesc: 'أصوات شريط كاسيت وتشيب تيون و8-بت مجد.',
  storeItemSfxSoftName: 'هادئ وسلس',
  storeItemSfxSoftDesc: 'رنين هادئ ونقرات لطيفة وأجواء مريحة.',
  storeItemFrameGoldName: 'إطار الذهب',
  storeItemFrameGoldDesc: 'إطار ذهبي لامع يصرخ بطاقة الفائز.',
  storeItemFrameNeonName: 'ليالي النيون',
  storeItemFrameNeonDesc: 'إطار نيون متوهّج — بطاقتك بصوت عالٍ.',
  storeItemFrameFireName: 'شعلة النار',
  storeItemFrameFireDesc: 'إطار ناري لإجابات تضرب بقوة.',
  storeItemFrameRoyalName: 'الملكي',
  storeItemFrameRoyalDesc: 'بنفسجي وذهبي ملكي لملوك الكذب الحقيقيين.',
  storeInsufficientFunds: 'العملات ما كفت — كمّل لعب!',
  storePurchaseSuccess: 'تمام! صارت لك الآن.',
  storeBuyButton: 'شراء',
  storeOwnedLabel: 'مملوك',
  storeBuyCoinsTitle: 'اشترِ عملات',
  storeBuyCoinsDesc: 'عبّئ رصيدك بعملات إضافية.',
  storeTierSmallLabel: 'الباقة الصغيرة',
  storeTierMediumLabel: 'باقة المرح',
  storeTierLargeLabel: 'الباقة الكبرى',
  storeTierAmount: '{{coins}} عملة',
  storeTierPrice: '${{price}}',
  storeTierMediumBonus: '+{{bonus}} هدية',
  storeTierLargeBonus: '+{{bonus}} هدية',
  storePaymentProcessing: 'جارٍ معالجة الدفع...',
  storePaymentCancelled: 'تم إلغاء الدفع — لم تُخصم أي عملات.',
  storeCoinsPurchaseSuccess: 'تمت إضافة {{coins}} عملة! 🎉',
  storeCancelButton: 'إلغاء',
  storeGiftPremiumButton: 'هدية بريميوم',
  giftCodeGeneratedMessage: 'كود الهدية جاهز — شاركه مع صديق!',
  redeemCodeLabel: 'استخدم الكود',
  redeemCodeButton: 'استخدم',
  redeemSuccessMessage: 'استمتع بهديتك! 🎉',
  redeemInvalidCodeError: 'هذا الكود غير موجود أو تم استخدامه.',
  giftToFriendButton: 'هدية لصديق',
  giftRecipientTagLabel: 'علامة الصديق',
  giftItemSelectPlaceholder: 'اختر عنصر لإهدائه...',
  giftSuccessMessage: 'تم إرسال الهدية! 🎁',
  hallOfFameTitle: 'قاعة المشاهير',
  hallOfFameSubtitle: 'أضحك كذبة خدعت أكبر عدد — من تصويت المجتمع.',
  hallOfFameVoteButton: 'صوّت',
  hallOfFameEmpty: 'ما في كذبات أسطورية بعد. العب جولة وخلّ العظمة تبدأ!',
  notificationsCoinsEarned: 'كسبت {{amount}} عملة! 🎉',
  notificationsGiftReceived: 'تلقّيت {{itemName}} من {{senderTag}}! 🎁',
  notificationsEmpty: 'ما في إشعارات بعد.',
  profileNicknameLabel: 'الاسم المستعار',
  profileCoinsLabel: 'العملات',
  profileInventoryTitle: 'أملاكي',
  profileEditButton: 'تعديل',
  profileSaveButton: 'حفظ',
  profileCancelButton: 'إلغاء',
  profileEditAria: 'تعديل الاسم',
  profileSaveAria: 'حفظ الاسم',
  profileCancelAria: 'إلغاء التعديل',
  profilePlayerTagLabel: 'العلامة الشخصية',
  profileCopyTagButton: 'نسخ',

  appShortDescription: 'كذب، خدّع، وتغلّب على أصحابك في لعبة أسئلة جماعية مضحكة.',
  appLongDescription: 'كلاكو هي لعبة حفلات اجتماعية حيث يفوز أفضل كذّاب. اكتب إجابات مزيفة لتخدع أصحابك، صوّت على الإجابة التي تراها صحيحة، واجمع نقاطاً لكل شخص خدعته. مع 8 تصنيفات وضحك لا ينتهي، هي رفيق سهرة الألعاب المثالية.',

  legalPrivacyTitle: 'سياسة الخصوصية',
  legalPrivacyBody: `آخر تحديث: يوليو 2026

تنبيه: هذا نص عام لسياسة خصوصية للعبة مستقلة صغيرة. لم يُراجع بواسطة محامٍ. نوصي بمراجعة قانونية متخصصة قبل التوسع في معالجة المدفوعات الحقيقية على نطاق كبير، خاصة مع مراعاة الاعتبارات عبر الحدود (المُشغّل مقيم في إسرائيل، وباي بال يتضمن مستخدمين دوليين).

ما الذي نجمعه

كلاكو هي لعبة أسئلة جماعية تعمل في متصفحك. نحن نُقلل جمع البيانات إلى الحد الأدنى:

• معرّف الجهاز — معرّف عشوائي يتم إنشاؤه وتخزينه على جهازك. يُستخدم لربط ملفك الشخصي في اللعبة (الاسم المستعار، الصورة الرمزية، العملات، العناصر) عبر الجلسات. ليس هويتك الحقيقية ولا يمكن تتبعه إليك شخصياً.

• الاسم المستعار — اسم تختاره بنفسك عند إنشاء غرفة. ليس اسمك الحقيقي.

• خيارات الصورة الرمزية — التخصيصات البصرية التي تختارها في اللعبة.

• رصيد العملات وسجل المشتريات — يتتبع عملاتك في اللعبة ومشتريات العناصر الزخرفية.

• المشتريات الحقيقية — عندما تشتري عملات عبر باي بال، تقوم باي بال بمعالجة الدفع. كلاكو لا ترى أو تخزن أو يصل إلى رقم بطاقة الائتمان أو تفاصيل الحساب البنكي أو كلمة مرور باي بال. ترسل لنا باي بال فقط تأكيد المعاملة (معرف المعاملة والمبلغ) حتى نُضفي عملاتك.

لا نجمع: عناوين البريد الإلكتروني أو الأسماء الحقيقية أو كلمات المرور أو أرقام الهواتف أو الصور أو بيانات الموقع أو سجل التصفح.

كيف نستخدم بياناتك

تُستخدم بياناتك فقط لتشغيل اللعبة — إنشاء الغرف، وتتبع النتائج، وإدارة رصيد العملات، وتقديم العناصر المشتراة. لا نبيع أو نشارك أو نتاجر ببياناتك مع المعلنين أو وسطاء البيانات أو الأطراف الثالثة. تتلقى باي بال فقط الحد الأدنى من المعلومات اللازمة لمعالجة دفعك.

أين تُخزّن بياناتك

تُخزّن بيانات اللعبة على خادم المُشغّل الخاص وعلى جهازك محلياً عبر تخزين المتصفح. بالنسبة للمدفوعات الحقيقية، تحافظ باي بال على سجلات معاملاتها الخاصة وفقاً لسياسة الخصوصية الخاصة بها.

حقوقك

يمكنك طلب حذف جميع بياناتك في أي عن طريق فتح issue على https://github.com/muhamedaw/kalako2/issues بعنوان "طلب حذف البيانات" والإشارة إلى معرّف جهازك. سيُزيل المُشغّل جميع البيانات المرتبطة خلال 30 يوماً.

التغييرات على هذه السياسة

قد تُحدّث سياسة الخصوصية هذه من وقت لآخر. ستُنشر التغييرات على مستودع GitHub على https://github.com/muhamedaw/kalako2.`,

  legalTermsTitle: 'شروط الخدمة',
  legalTermsBody: `آخر تحديث: يوليو 2026

تنبيه: هذا نص عام لشروط الخدمة للعبة مستقلة صغيرة. لم يُراجع بواسطة محامٍ. نوصي بمراجعة قانونية متخصصة قبل التوسع في معالجة المدفوعات الحقيقية على نطاق كبير، خاصة مع مراعاة الاعتبارات عبر الحدود (المُشغّل مقيم في إسرائيل، وباي بال يتضمن مستخدمين دوليين).

عن الخدمة

كلاكو هي لعبة أسئلة جماعية وخداع مجانية عبر الإنترنت. مصممة لجمهور عام. تتوفر فلتر محتوى مناسب للعائلات ويمكن تفعيله عند إنشاء غرفة.

سلوك المستخدم

يختار اللاعبون أسماءهم المستعارة ويكتبون إجابات أثناء اللعب. أنت توافق على احترام جميع المحتويات. لا يُسمح بالتحرش أو خطاب الكراهية أو الألفاظ التمييزية أو المحتوى الجنسي الصريح أو المحتوى الذي يستهدف أفراداً أو مجموعات. يحتفظ المُشغّل بالحق في إزالة المحتوى غير اللائق وحظر اللاعبين الذين يكررون انتهاك هذه المعايير.

العملات_VIRTUAL

العملات المكتسبة باللعب ليس لها قيمة نقدية حقيقية. لا يمكن صرفها за نقلها للاعبين آخرين أو استردادها. العملات tồnح فقط كعملة داخل اللعبة لشراء عناصر زخرفية.

المشتريات

تتم معالجة مشتريات العملات الحقيقية عبر باي بال. تطبق شروط الخدمة الخاصة بباي بال على معاملة الدفع. كلاكو لا تضمن معالجة الدفع دون انقطاع غير مسؤول عن مشاكل باي بال.

توفر الخدمة

تُقدَّم اللعبة "كما هي" دون ضمانات من أي نوع. لا نضمن وقت تشغيل دون انقطاع أو تشغيل خالٍ من الأخطاء. يحتفظ المُشغّل بالحق في تعليق أو تعطيل أو إيقاف الميزات في أي وقت دون إشعار مسبق.

النزاعات

يجب طرح أي ناشئة من استخدام اللعبة مباشرة على المُشغّل عبر مشاكل GitHub على https://github.com/muhamedaw/kalako2/issues. تُحكم هذه الشروط بقوانين دولة إسرائيل.`,

  legalRefundTitle: 'سياسة الاسترداد',
  legalRefundBody: `آخر تحديث: يوليو 2026

تنبيه: هذا نص عام لسياسة الاسترداد للعبة مستقلة صغيرة. لم يُراجع بواسطة محامٍ. نوصي بمراجعة قانونية متخصصة قبل التوسع في معالجة المدفوعات الحقيقية على نطاق كبير، خاصة مع مراعاة الاعتبارات عبر الحدود (المُشغّل مقيم في إسرائيل، وباي بال يتضمن مستخدمين دوليين).

السياسة العامة

تُعد مشتريات العملات في كلاكو سلعاً رقمية تُسلّم فوراً لحساب اللعبة. بمجرد إضافة العملات إلى حسابك، لا تُسترد بشكل عام.

الاستثناءات

إذا واجهت خطأ تقنياً حقيقياً — على سبيل المثال، تم خصم حساب باي بال ولكن العملات لم تُسلّم إلى حسابك في اللعبة — يُرجى التواصل مع المُشغّل. سيحقق المُشغّل ويصحح الأخطاء الموثقة خلال 7 أيام عمل.

نزاعات باي بال

إذا كنت تعتقد أن الدفع حدث عن طريق الخطأ، يمكنك أيضاً فتح منازلة عبر عملية التسوية الخاصة بباي بال. تنطبق سياسات حماية المشتري الخاصة بباي بال على معاملة الدفع بشكل مستقل عن سياسة الاسترداد هذه.

التواصل

لطلب استرداد أو الإبلاغ عن مشكلة في الدفع، افتح issue على https://github.com/muhamedaw/kalako2/issues بعنوان "طلب استرداد" وقم بتضمين تفاصيل معاملتك. سيُرد المُشغّل خلال 7 أيام عمل.

ملاحظة عادلة

المُشغّل ملتزم بحل المشكلات الحقيقية بشكل عادل. بينما لا تُ garantie الاستردادات بما هو موصوف أعلاه، سيُراجع المُشغّل كل حالة على حدة.`,

  gameOverShareNudge: 'المرتبة {{rank}} من أصل {{totalPlayers}} — احفظ بطاقتك وأثبت مَن فاز.',
  hallOfFameShareCaption: 'خدعت {{trickedCount}} أشخاص بكذبتي في كلاكو — تقدر تسوّيها؟',
  lobbyInviteNudge: 'كل ما زاد اللاعبون زادت الفوضى. الدعوة تزيد المرح.',

  requestTimeout: 'انتهت مهلة الطلب — تحقق من اتصالك',
  requestRetry: 'حدث خطأ. يرجى المحاولة مرة أخرى.',

  navPremium: 'بريميوم',
  premiumBadgeAria: 'عضو بريميوم',
  premiumScreenTitle: 'كلاكو بريميوم',
  premiumTagline: 'العب بفخامة. كذباتك تستحق مسرح أكبر.',
  premiumMonthlyLabel: 'شهري',
  premiumYearlyLabel: 'سنوي',
  premiumYearlySavings: 'وفر 44%',
  premiumSubscribeButton: 'احصل على بريميوم',
  premiumCurrentPlanLabel: 'أنت بريميوم',
  premiumCancelButton: 'إلغاء',
  premiumExpiresLabel: 'ينتهي {{date}}',
  premiumNotAvailable: '',
  premiumFeature1: 'كل الباقات التوسعية المستقبلية مشمولة — جولات صور، تصنيفات جديدة، والمزيد، دون إنفاق عملة واحدة.',
  premiumFeature2: '500 عملة مكافأة تُودَع في حسابك كل شهر وأنت مشترك. وقود لخدعك الأقوى.',
  premiumFeature3: '3 عناصر تجميلية حصرية ما تقدر تحصل عليها من أي مكان ثاني — قبّعة، عيون، وإطار يصرخ بريميوم.',
  premiumFeature4: 'استضف غرفاً حتى 30 لاعب بدل 20. ناس أكثر تخدعهم، فوضى أكثر تستمتع فيها.',
  premiumFeature5: 'شارة بريميوم لامعة تتبعك في كل لوبي، كل شاشة نتائج، كل لوحة متصدرين. خلّهم يعرفون مين اللي يتعاملون معاه.',
  premiumLockedBadge: 'بريميوم',
  premiumUpsellNudge: 'هذه من مميزات بريميوم — تستاهل نظرة؟',
  premiumMonthlyPrice: '$2.99/شهرياً',
  premiumYearlyPrice: '$19.99/سنوياً',
  premiumSubscribeSuccess: 'تم تفعيل بريميوم! مرحباً بك في النادي.',

  // Auth / Login-choice screen
  authTitle: 'مرحباً بك في كلاكو',
  authGuestButton: 'العب كضيف',
  authLoginButton: 'تسجيل الدخول',
  authGuestDescription: 'ادخل بدون حساب — بدون التزامات.',
  authLoginDescription: 'احفظ تقدمك وإحصائياتك ومشترياتك.',
  authOrDivider: 'أو',

  authRecoverTitle: 'استرجاع حسابك',
  authRecoverEmailLabel: 'البريد الإلكتروني',
  authRecoverEmailPlaceholder: 'you@example.com',
  authRecoverSendCodeButton: 'إرسال الكود',
  authRecoverCodeSentNotice: 'إذا كان هذا البريد مرتبط بحساب، الكود بالطريق.',
  authRecoverSendError: 'تعذر الاتصال. تحقق من اتصالك وحاول مرة أخرى.',
  authRecoverCodeLabel: 'كود من 6 أرقام',
  authRecoverCodePlaceholder: '000000',
  authRecoverVerifyButton: 'تحقق واسترجع',
  authRecoverBackButton: 'رجوع',
  authRecoverEmailNotConfigured: 'استرجاع الحساب مو متاح حاليًا — جرب لاحقًا.',
  authRecoverInvalidCode: 'الكود غلط أو منتهي الصلاحية.',
  authRecoverSuccess: 'تم استرجاع حسابك! أهلاً بعودتك.',

  purchaseEmailNudgeTitle: 'لا تفقد هذه العملية',
  purchaseEmailNudgeBody: 'أضف بريد إلكتروني للاسترجاع عشان ما تفقد هذا الشراء — بيربط عملاتك وعناصرك بحسابك لو غيّرت جهازك.',
  purchaseAddEmailButton: 'إضافة بريد إلكتروني',
  purchaseSkipButton: 'تخطي، كمّل بدون',
  purchaseEmailVerifyButton: 'تحقق واربط',
  purchaseEmailLinkedSuccess: 'تم ربط البريد! شراؤك محمي الآن.',
  purchaseEmailInvalidCode: 'الكود غلط أو منتهي الصلاحية.',
  purchaseEmailNotConfigured: 'ربط البريد مو متاح حاليًا — هنكمل بدونه.',
  purchaseEmailSentNotice: 'تم إرسال الكود — تحقق من بريدك.',
  purchaseEmailRateLimited: 'محاولات كثيرة — جرب لاحقًا.',

  // Avatar part display names (bodies 1-4)
  avatarBody01: 'برقوق منتفخ',
  avatarBody02: 'مرجان لطيف',
  avatarBody03: 'ليمون صلب',
  avatarBody04: 'كريمي يحلم',

  // Avatar part display names (bodies 5-14)
  avatarBody05: 'نعناع مضحك',
  avatarBody06: 'لافندر يغني',
  avatarBody07: 'خوخ مبتسم',
  avatarBody08: 'أزرق يلمس',
  avatarBody09: 'وردي منسدل',
  avatarBody10: 'كهرماني يدفع',
  avatarBody11: 'ساج يغمز',
  avatarBody12: 'وردي يرتطم',
  avatarBody13: 'سماوي يرسم',
  avatarBody14: 'بني يقفز',

  // Avatar part display names (eyes 1-8)
  avatarEyes01: 'رمش مستدير',
  avatarEyes02: 'عجب عريض',
  avatarEyes03: 'حدة نعسان',
  avatarEyes04: 'بريق كبير',
  avatarEyes05: 'عيون قلب',
  avatarEyes06: 'عيون نجمة',
  avatarEyes07: 'عيون نار',
  avatarEyes08: 'عيون حلزونية',

  // Avatar part display names (eyes 9-18)
  avatarEyes09: 'نجمة تنظر',
  avatarEyes10: 'حالم يقطر',
  avatarEyes11: 'بكسل يتسلل',
  avatarEyes12: 'قمر يختلس',
  avatarEyes13: 'فقاعي يرمش',
  avatarEyes14: 'نيون يغمض',
  avatarEyes15: 'كوني يحدّق',
  avatarEyes16: 'هلام يلمع',
  avatarEyes17: 'بخار يسري',
  avatarEyes18: 'شرارة تنطلق',

  // Avatar part display names (hats — original free+premium hats)
  avatarHatNone: 'بدون قبعة',
  avatarHatParty: 'قبعة حفلة',
  avatarHatCap: 'كاب',
  avatarHatHeadband: 'شريط رأس',
  avatarHatCrown: 'تاج',
  avatarHatTophat: 'قبعة عالية',
  avatarHatWizard: 'قبعة ساحر',
  avatarHatPropeller: 'قبعة مروحة',
  avatarHatSombrero: 'سومبريرو',
  avatarHatViking: 'خوذة فايكنغ',

  // Avatar part display names (hats — new free hats)
  avatarHatBeret: 'بريه صغير',
  avatarHatCowboy: 'كابوي كيوت',
  avatarHatHood: 'كابوشون دافئ',
  avatarHatBandana: 'باندانا صاحبي',
  avatarHatHelmet: 'السلامة أولاً!',
  avatarHatFez: 'فيز صاحبي',
  avatarHatFlower: 'تاج زهرة',
  avatarHatAntenna: 'تعزيز إشارة',
  avatarHatCrownFlower: 'تاج بتلات',
  avatarHatHeadwrap: 'لفاف نجم',

  // Profile
  profileInventoryEmpty: 'ما في شي هنا — افتح المتجر!',
  profileTabBody: 'الجسم',
  profileTabEyes: 'العيون',
  profileTabHat: 'القبعة',

  // Relative timestamps
  relativeTimeJustNow: 'الآن',
  relativeTimeMinutesAgo: 'منذ {{mins}} د',
  relativeTimeHoursAgo: 'منذ {{hours}} س',
  relativeTimeDaysAgo: 'منذ {{days}} ي',

  // Store section titles (premium eyes/hats)
  storePremiumEyesTitle: 'عيون بريميوم',
  storePremiumEyesDesc: 'عيون تعبيرية تخلي أفاتارك يبرز.',
  storePremiumHatsTitle: 'قبعات بريميوم',
  storePremiumHatsDesc: 'أكمل مظهرك بقبعة أنيقة.',

  // Store item display names
  storeItemEyesHeart: 'عيون قلوب',
  storeItemEyesStar: 'عيون نجوم',
  storeItemEyesFire: 'عيون نارية',
  storeItemEyesSpiral: 'عيون حلزونية',
  storeItemEyesGalaxy: 'عيون مجرة',
  storeItemHatCrown: 'تاج',
  storeItemHatTophat: 'قبعة عالية',
  storeItemHatWizard: 'قبعة ساحر',
  storeItemHatPropeller: 'قبعة مروحة',
  storeItemHatSombrero: 'سومبريرو',
  storeItemHatViking: 'خوذة فايكنغ',
  storeItemHatHalo: 'هالة',
  storeItemFrameDiamond: 'إطار ماسي',
}

export default ar
