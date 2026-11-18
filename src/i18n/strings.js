// Translation dictionary. Keys are grouped by the screen/feature they belong
// to. `my` = Burmese. Add new keys to both languages together — a missing
// key falls back to the key itself (see LanguageContext.js's `t()`).
export const STRINGS = {
  en: {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.close': 'Close',
    'common.edit': 'Edit',
    'common.manage': 'Manage',
    'common.done': 'Done',

    // Tabs
    'tab.income': 'Income',
    'tab.expense': 'Expense',
    'tab.balance': 'Balance',
    'tab.net': 'Net',

    // Add transaction form
    'form.save': 'Save',
    'form.amount': 'Amount',
    'form.note': 'Note',
    'form.selectTag': 'Select a tag…',
    'form.selectAccount': 'Select account…',
    'form.quickAddPlaceholder': 'Quick add e.g. "coffee 3000"',
    'form.quickAddFill': 'Fill',

    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.darkMode': 'Dark Mode',
    'settings.lightMode': 'Light Mode',
    'settings.accentColor': 'Accent Color',
    'settings.language': 'Language',
    'settings.addons': 'Add-ons',
    'settings.security': 'Security',
    'settings.data': 'Data',
    'settings.pinLock': 'PIN Lock',
    'settings.changePin': 'Change PIN',
    'settings.biometricUnlock': 'Biometric Unlock',
    'settings.autoLockAfter': 'Auto-lock after',
    'settings.storage': 'Storage',
    'settings.manageTags': 'Manage Tags',
    'settings.backupData': 'Backup Data',
    'settings.restoreBackup': 'Restore Backup',
    'settings.trash': 'Trash',
    'settings.shareSetup': 'Share Setup (QR)',
    'settings.importSetup': 'Import Setup',
    'settings.accounts': 'Accounts',
    'settings.manageAccounts': 'Manage Accounts',
    'settings.debtTracker': 'Debt Tracker',
    'settings.netWorth': 'Net Worth',
    'settings.quickAdd': 'Quick Add',
    'settings.healthScore': 'Financial Health Score',

    // Trash
    'trash.title': 'Trash',
    'trash.empty': 'Trash is empty.',
    'trash.retention': 'Deleted transactions stay here for 30 days before being permanently removed.',
    'trash.restore': 'Restore',
    'trash.deleteForever': 'Delete forever',

    // Accounts
    'accounts.title': 'Accounts',
    'accounts.newAccount': 'New Account',
    'accounts.namePlaceholder': 'e.g. Bank, Savings',
    'accounts.archived': 'Archived',

    // Debt tracker
    'debts.title': 'Debts & Loans',
    'debts.newDebt': 'New Debt',
    'debts.namePlaceholder': 'Debt name (e.g. Car Loan)',
    'debts.principalPlaceholder': 'Principal amount (MMK)',
    'debts.interestPlaceholder': 'Interest rate % (optional)',
    'debts.addDebt': 'Add Debt',
    'debts.none': 'No debts tracked.',
    'debts.logPayment': 'Log',
    'debts.paidOff': 'Paid off!',

    // Net worth
    'networth.title': 'Net Worth',
    'networth.accountBalances': 'Account balances',
    'networth.otherAssets': 'Other assets',
    'networth.debtsRemaining': 'Debts remaining',
    'networth.newAsset': 'New Asset',
    'networth.namePlaceholder': 'e.g. KBZ Savings',
    'networth.valuePlaceholder': 'Value (MMK)',
    'networth.weightPlaceholder': 'Weight (kyat-tha)',
    'networth.addAsset': 'Add Asset',
    'networth.none': 'No assets added.',

    // Health score
    'health.title': 'Financial Health',
    'health.savingsRate': 'Savings rate',
    'health.incomeStability': 'Income stability',
    'health.budgetAdherence': 'Budget adherence',
    'health.stable': 'Stable',

    // QR share
    'qr.shareTitle': 'Share Setup',
    'qr.importTitle': 'Import Setup',
    'qr.shareDesc': 'Shares your tags, accounts & budget limits only — no transaction history. For full data, use Backup instead.',
    'qr.tooLarge': 'Too much data for a QR code — copy the text below instead.',
    'qr.copyAsText': 'Copy as Text',
    'qr.copied': 'Copied!',
    'qr.importDesc': 'Paste the text copied from another device\'s "Share Setup" screen. This adds their tags, accounts & budget limits without touching your transactions.',
    'qr.importPlaceholder': 'Paste setup code here…',
    'qr.import': 'Import',
  },
  my: {
    // Common
    'common.save': 'သိမ်းမည်',
    'common.cancel': 'ပယ်ဖျက်မည်',
    'common.delete': 'ဖျက်မည်',
    'common.add': 'ထည့်မည်',
    'common.close': 'ပိတ်မည်',
    'common.edit': 'ပြင်မည်',
    'common.manage': 'စီမံမည်',
    'common.done': 'ပြီးပါပြီ',

    // Tabs
    'tab.income': 'ဝင်ငွေ',
    'tab.expense': 'ထွက်ငွေ',
    'tab.balance': 'လက်ကျန်',
    'tab.net': 'အသားတင်',

    // Add transaction form
    'form.save': 'သိမ်းမည်',
    'form.amount': 'ပမာណ',
    'form.note': 'မှတ်ချက်',
    'form.selectTag': 'တဲ့ဂ် ရွေးပါ…',
    'form.selectAccount': 'အကောင့် ရွေးပါ…',
    'form.quickAddPlaceholder': 'လျင်မြန်စွာထည့်ရန် ဥပမာ "ကော်ဖီ 3000"',
    'form.quickAddFill': 'ဖြည့်မည်',

    // Settings
    'settings.title': 'ဆက်တင်များ',
    'settings.appearance': 'အသွင်အပြင်',
    'settings.darkMode': 'မှောင်မှုဒ်',
    'settings.lightMode': 'လင်းမှုဒ်',
    'settings.accentColor': 'အရောင်',
    'settings.language': 'ဘာသာစကား',
    'settings.addons': 'ထပ်ဆောင်းအင်္ဂါရပ်များ',
    'settings.security': 'လုံခြုံရေး',
    'settings.data': 'ဒေတာ',
    'settings.pinLock': 'ပင်နံပါတ် လော့ခ်',
    'settings.changePin': 'ပင်နံပါတ် ပြောင်းမည်',
    'settings.biometricUnlock': 'ဇီဝဗေဒအချက်အလက် ဖွင့်ခြင်း',
    'settings.autoLockAfter': 'အလိုအလျောက် လော့ခ်ချချိန်',
    'settings.storage': 'သိမ်းဆည်းမှု',
    'settings.manageTags': 'တဲ့ဂ်များ စီမံမည်',
    'settings.backupData': 'ဒေတာ ကူးယူသိမ်းမည်',
    'settings.restoreBackup': 'ကူးယူသိမ်းထားသည်ကို ပြန်ယူမည်',
    'settings.trash': 'ချေပစ်ရန်',
    'settings.shareSetup': 'ဆက်တင် မျှဝေမည် (QR)',
    'settings.importSetup': 'ဆက်တင် ထည့်သွင်းမည်',
    'settings.accounts': 'အကောင့်များ',
    'settings.manageAccounts': 'အကောင့်များ စီမံမည်',
    'settings.debtTracker': 'ကြွေးမြီ ခြေရာခံခြင်း',
    'settings.netWorth': 'စုစုပေါင်းပိုင်ဆိုင်မှု',
    'settings.quickAdd': 'လျင်မြန်စွာ ထည့်ခြင်း',
    'settings.healthScore': 'ငွေကြေးကျန်းမာရေး အမှတ်',

    // Trash
    'trash.title': 'ချေပစ်ရန်',
    'trash.empty': 'ချေပစ်ရန် ဘာမျှမရှိပါ။',
    'trash.retention': 'ဖျက်လိုက်သော ငွေစာရင်းများကို ရက် ၃၀ ကြာ ဤနေရာတွင် သိမ်းထားပြီး နောက်မှ အပြီးဖျက်ပါမည်။',
    'trash.restore': 'ပြန်ယူမည်',
    'trash.deleteForever': 'အပြီးဖျက်မည်',

    // Accounts
    'accounts.title': 'အကောင့်များ',
    'accounts.newAccount': 'အကောင့်အသစ်',
    'accounts.namePlaceholder': 'ဥပမာ - ဘဏ်၊ စုငွေ',
    'accounts.archived': 'သိမ်းဆည်းထားသည်',

    // Debt tracker
    'debts.title': 'ကြွေးမြီများ',
    'debts.newDebt': 'ကြွေးမြီအသစ်',
    'debts.namePlaceholder': 'ကြွေးမြီအမည် (ဥပမာ - ကားချေးငွေ)',
    'debts.principalPlaceholder': 'ငွေရင်း (ကျပ်)',
    'debts.interestPlaceholder': 'အတိုးနှုန်း % (ချန်ထားနိုင်သည်)',
    'debts.addDebt': 'ကြွေးမြီ ထည့်မည်',
    'debts.none': 'ခြေရာခံထားသော ကြွေးမြီ မရှိပါ။',
    'debts.logPayment': 'မှတ်တမ်းတင်မည်',
    'debts.paidOff': 'အပြီးပေးဆပ်ပြီးပါပြီ!',

    // Net worth
    'networth.title': 'စုစုပေါင်းပိုင်ဆိုင်မှု',
    'networth.accountBalances': 'အကောင့်လက်ကျန်များ',
    'networth.otherAssets': 'အခြားပိုင်ဆိုင်မှုများ',
    'networth.debtsRemaining': 'ကျန်ရှိသော ကြွေးမြီ',
    'networth.newAsset': 'ပိုင်ဆိုင်မှုအသစ်',
    'networth.namePlaceholder': 'ဥပမာ - KBZ စုငွေ',
    'networth.valuePlaceholder': 'တန်ဖိုး (ကျပ်)',
    'networth.weightPlaceholder': 'အလေးချိန် (ကျပ်သား)',
    'networth.addAsset': 'ပိုင်ဆိုင်မှု ထည့်မည်',
    'networth.none': 'ပိုင်ဆိုင်မှု မထည့်ရသေးပါ။',

    // Health score
    'health.title': 'ငွေကြေးကျန်းမာရေး',
    'health.savingsRate': 'စုဆောင်းငွေ နှုန်း',
    'health.incomeStability': 'ဝင်ငွေ တည်ငြိမ်မှု',
    'health.budgetAdherence': 'ဘတ်ဂျက် လိုက်နာမှု',
    'health.stable': 'တည်ငြိမ်သည်',

    // QR share
    'qr.shareTitle': 'ဆက်တင် မျှဝေမည်',
    'qr.importTitle': 'ဆက်တင် ထည့်သွင်းမည်',
    'qr.shareDesc': 'တဲ့ဂ်၊ အကောင့်နှင့် ဘတ်ဂျက်ကန့်သတ်ချက်များကိုသာ မျှဝေမည် — ငွေစာရင်းမှတ်တမ်းများ မပါဝင်ပါ။ ဒေတာအပြည့်အစုံအတွက် Backup ကို သုံးပါ။',
    'qr.tooLarge': 'QR ကုဒ်အတွက် ဒေတာများလွန်းသည် — အောက်ပါစာသားကို ကူးယူပါ။',
    'qr.copyAsText': 'စာသားအဖြစ် ကူးယူမည်',
    'qr.copied': 'ကူးယူပြီးပါပြီ!',
    'qr.importDesc': 'အခြားစက်၏ "ဆက်တင် မျှဝေမည်" မျက်နှာပြင်မှ ကူးယူထားသော စာသားကို ကူးထည့်ပါ။ ၎င်းသည် သင့်ငွေစာရင်းများကို မထိခိုက်စေဘဲ တဲ့ဂ်၊ အကောင့်နှင့် ဘတ်ဂျက်ကန့်သတ်ချက်များကို ထည့်သွင်းပေးပါမည်။',
    'qr.importPlaceholder': 'ဆက်တင်ကုဒ်ကို ဤနေရာတွင် ကူးထည့်ပါ…',
    'qr.import': 'ထည့်သွင်းမည်',
  },
};
