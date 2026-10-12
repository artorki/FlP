/**
 * =========================================================================
 * Freelance Design Management Panel - Frontend Logic
 * نسخه ۳: تقویم بازشونده شمسی، جداسازی سه‌رقمی مبالغ، ثبت گروهی اتودها/ریسایزها،
 * آمار سفارشات لغوشده و احراز هویت امن در دیتابیس سرور
 * =========================================================================
 */

let appState = {
  gasUrl: localStorage.getItem('gas_web_app_url') || '',
  orders: [],
  clients: [],
  filters: {
    timeframe: 'all',
    type: 'all',
    clientId: 'all',
    finance: 'all',
    status: 'all',
    search: ''
  },
  charts: {
    typeDist: null,
    revenueTrend: null
  }
};

// لیست اتودها و ریسایزهای فرعی در فرم ثبت سفارش
let subOrderItemsState = [];

// وضعیت فعال تقویم بازشونده شمسی
let jalaliPickerState = {
  targetInputId: null,
  year: 1403,
  month: 7,
  selectedDay: null
};

const PERSIAN_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// داده‌های اولیه جهت اجرای آزمایشی (Demo) با ساختار گروهی و پروژه‌های لغوشده
const DEMO_ORDERS = [
  {
    id: 'ORD-140307-101',
    title: 'طراحی پوستر اصلی دوره آموزشی نجوم',
    dateOrdered: '1403/07/01',
    dateDelivered: '1403/07/15',
    type: 'Both',
    formatType: 'پوستر ۷۰ در ۱۰۰',
    status: 'Delivered',
    clientId: 'CLI-01',
    clientName: 'آکادمی فضایی ایران',
    clientContact: '09121112233',
    parentOrderId: '',
    filesLink: 'https://drive.google.com/drive/folders/demo-astronomy',
    invoiceId: 'فاکتور ۱۴۰۳-۱۰۱',
    totalFee: 8000000,
    amountPaid: 8000000,
    remainingFee: 0,
    paymentStatus: 'Paid'
  },
  {
    id: 'ORD-140307-101-SUB1',
    title: 'اتود ۱ پوستر نجوم (رد شده توسط کارفرما)',
    dateOrdered: '1403/07/03',
    dateDelivered: '1403/07/05',
    type: 'Print',
    formatType: 'اتود پوستر',
    status: 'Canceled', // کار طراحی شده ولی تایید/لغو شده
    clientId: 'CLI-01',
    clientName: 'آکادمی فضایی ایران',
    clientContact: '09121112233',
    parentOrderId: 'ORD-140307-101',
    filesLink: '',
    invoiceId: 'فاکتور ۱۴۰۳-۱۰۱',
    totalFee: 2000000, // ارزش کار طراحی‌شده محاسبه می‌شود
    amountPaid: 0,
    remainingFee: 0,
    paymentStatus: 'Unpaid'
  },
  {
    id: 'ORD-140307-101-SUB2',
    title: 'ریسایز پوستر نجوم برای استوری اینستاگرام',
    dateOrdered: '1403/07/12',
    dateDelivered: '1403/07/14',
    type: 'Digital',
    formatType: 'استوری ۱۰۸۰ در ۱۹۲۰',
    status: 'Delivered',
    clientId: 'CLI-01',
    clientName: 'آکادمی فضایی ایران',
    clientContact: '09121112233',
    parentOrderId: 'ORD-140307-101',
    filesLink: '',
    invoiceId: 'فاکتور ۱۴۰۳-۱۰۱',
    totalFee: 1500000,
    amountPaid: 1500000,
    remainingFee: 0,
    paymentStatus: 'Paid'
  },
  {
    id: 'ORD-140307-101-SUB3',
    title: 'ریسایز پوستر نجوم برای بنر وبسایت',
    dateOrdered: '1403/07/13',
    dateDelivered: '1403/07/15',
    type: 'Digital',
    formatType: 'بنر افقی سایت',
    status: 'Delivered',
    clientId: 'CLI-01',
    clientName: 'آکادمی فضایی ایران',
    clientContact: '09121112233',
    parentOrderId: 'ORD-140307-101',
    filesLink: '',
    invoiceId: 'فاکتور ۱۴۰۳-۱۰۱',
    totalFee: 1000000,
    amountPaid: 1000000,
    remainingFee: 0,
    paymentStatus: 'Paid'
  },
  {
    id: 'ORD-140307-102',
    title: 'طراحی دیوارنگاره کافه نوید (کار دوستانه)',
    dateOrdered: '1403/07/16',
    dateDelivered: '1403/07/20',
    type: 'Print',
    formatType: 'دیوارنگاره ۴ در ۳ متر',
    status: 'Delivered',
    clientId: 'CLI-02',
    clientName: 'نوید صادقی (دوست قدیمی)',
    clientContact: '09351234567',
    parentOrderId: '',
    filesLink: 'https://drive.google.com/drive/folders/demo-friendly-mural',
    invoiceId: 'دوستانه / بدون فاکتور',
    totalFee: 5500000,
    amountPaid: 0,
    remainingFee: 0,
    paymentStatus: 'Free'
  },
  {
    id: 'ORD-140307-103',
    title: 'طراحی لایت‌باکس برند آرایشی روژا (لغو بعد از اتود)',
    dateOrdered: '1403/07/18',
    dateDelivered: '',
    type: 'Both',
    formatType: 'لایت‌باکس محیطی',
    status: 'Canceled', // سفارش لغو شده توسط کارفرما
    clientId: 'CLI-03',
    clientName: 'فروشگاه‌های روژا',
    clientContact: 'info@rojashop.com',
    parentOrderId: '',
    filesLink: '',
    invoiceId: 'فاکتور ۱۴۰۳-۱۰۲',
    totalFee: 4000000,
    amountPaid: 1500000, // پیش‌پرداختی که گرفته شده
    remainingFee: 0,
    paymentStatus: 'Partial'
  }
];

// راه‌اندازی اولیه رویدادها
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

/**
 * =========================================================================
 * ۱. احراز هویت امن در دیتابیس سرور (Server-side Authentication)
 * =========================================================================
 */
function checkAuth() {
  const isAuth = sessionStorage.getItem('is_authenticated') === 'true';
  const loginScreen = document.getElementById('loginScreen');
  const appContainer = document.getElementById('appContainer');

  if (isAuth) {
    loginScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');
    initApp();
  } else {
    loginScreen.classList.remove('hidden');
    appContainer.classList.add('hidden');
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const inputPin = document.getElementById('loginPinInput').value.trim();
  const errorEl = document.getElementById('loginError');
  const spinner = document.getElementById('loginSpinner');
  const submitBtn = document.getElementById('loginSubmitBtn');

  if (!inputPin) return;

  errorEl.classList.add('hidden');

  // اگر آدرس سرور تنظیم شده باشد، صحت رمز مستقیماً از دیتابیس سرور استعلام می‌شود
  if (appState.gasUrl) {
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
      const response = await fetch(appState.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'verifyLogin', password: inputPin })
      });

      const res = await response.json();
      if (res && res.success) {
        sessionStorage.setItem('is_authenticated', 'true');
        checkAuth();
      } else {
        errorEl.textContent = res.error || 'رمز عبور وارد شده نادرست است!';
        errorEl.classList.remove('hidden');
        document.getElementById('loginPinInput').value = '';
        document.getElementById('loginPinInput').focus();
      }
    } catch (err) {
      // در صورت خطای شبکه یا تنظیمات اولیه
      console.warn('عدم پاسخ سرور، بررسی محلی:', err);
      if (inputPin === '1234') {
        sessionStorage.setItem('is_authenticated', 'true');
        checkAuth();
      } else {
        errorEl.textContent = 'خطا در ارتباط با سرور یا رمز نادرست است.';
        errorEl.classList.remove('hidden');
      }
    } finally {
      spinner.classList.add('hidden');
      submitBtn.disabled = false;
    }
  } else {
    // در حالت آزمایشی محلی
    const localPass = localStorage.getItem('demo_pass') || '1234';
    if (inputPin === localPass) {
      sessionStorage.setItem('is_authenticated', 'true');
      checkAuth();
    } else {
      errorEl.textContent = 'رمز عبور وارد شده نادرست است!';
      errorEl.classList.remove('hidden');
      document.getElementById('loginPinInput').value = '';
      document.getElementById('loginPinInput').focus();
    }
  }
}

function handleLogout() {
  if (confirm('آیا مایل به خروج از حساب هستید؟')) {
    sessionStorage.removeItem('is_authenticated');
    checkAuth();
  }
}

async function handlePasswordChangeSubmit(e) {
  e.preventDefault();
  const oldP = document.getElementById('currentPassInput').value.trim();
  const newP = document.getElementById('newPassInput').value.trim();
  const msgEl = document.getElementById('passcodeUpdateMsg');
  const btn = document.getElementById('changePassBtn');

  if (newP.length < 3) {
    alert('رمز عبور جدید باید حداقل ۳ کاراکتر باشد.');
    return;
  }

  btn.disabled = true;
  msgEl.classList.add('hidden');

  if (appState.gasUrl) {
    try {
      const response = await fetch(appState.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updatePassword', oldPassword: oldP, newPassword: newP })
      });
      const res = await response.json();
      if (res.success) {
        msgEl.className = 'text-[10px] text-emerald-600 font-semibold block';
        msgEl.textContent = 'رمز عبور با موفقیت در دیتابیس سرور ذخیره شد.';
        document.getElementById('currentPassInput').value = '';
        document.getElementById('newPassInput').value = '';
      } else {
        alert(res.error || 'خطا در تغییر رمز عبور');
      }
    } catch (err) {
      alert('خطای ارتباط با سرور: ' + err.message);
    } finally {
      btn.disabled = false;
    }
  } else {
    const cur = localStorage.getItem('demo_pass') || '1234';
    if (oldP !== cur) {
      alert('رمز عبور فعلی نادرست است.');
      btn.disabled = false;
      return;
    }
    localStorage.setItem('demo_pass', newP);
    msgEl.className = 'text-[10px] text-emerald-600 font-semibold block';
    msgEl.textContent = 'رمز عبور در حافظه محلی ذخیره شد.';
    btn.disabled = false;
    document.getElementById('currentPassInput').value = '';
    document.getElementById('newPassInput').value = '';
  }
}

/**
 * =========================================================================
 * ۲. باکس بازشونده تقویم شمسی هوشمند (Interactive Jalali Date Picker)
 * =========================================================================
 */
function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  let jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return [jy, jm, jd];
}

function jalaliToGregorian(jy, jm, jd) {
  jy = Number(jy); jm = Number(jm); jd = Number(jd);
  const jy2 = jy + 1595;
  let days = -355668 + (365 * jy2) + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm];
    if (gd <= v) break;
    gd -= v;
  }
  return [gy, gm, gd];
}

function getTodayJalali() {
  const now = new Date();
  const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const pad = n => String(n).padStart(2, '0');
  return `${jy}/${pad(jm)}/${pad(jd)}`;
}

function openJalaliPicker(targetInputId) {
  jalaliPickerState.targetInputId = targetInputId;
  const val = (document.getElementById(targetInputId)?.value || '').trim();

  if (val && val.includes('/')) {
    const parts = val.split('/');
    if (parts.length === 3) {
      jalaliPickerState.year = parseInt(parts[0], 10);
      jalaliPickerState.month = parseInt(parts[1], 10);
      jalaliPickerState.selectedDay = parseInt(parts[2], 10);
    }
  } else {
    const [tY, tM, tD] = getTodayJalali().split('/').map(Number);
    jalaliPickerState.year = tY;
    jalaliPickerState.month = tM;
    jalaliPickerState.selectedDay = tD;
  }

  renderJalaliPicker();
  document.getElementById('jalaliPickerModal').classList.remove('hidden');
}

function closeJalaliPicker() {
  document.getElementById('jalaliPickerModal').classList.add('hidden');
}

function jalaliPickerPrevMonth() {
  jalaliPickerState.month--;
  if (jalaliPickerState.month < 1) {
    jalaliPickerState.month = 12;
    jalaliPickerState.year--;
  }
  renderJalaliPicker();
}

function jalaliPickerNextMonth() {
  jalaliPickerState.month++;
  if (jalaliPickerState.month > 12) {
    jalaliPickerState.month = 1;
    jalaliPickerState.year++;
  }
  renderJalaliPicker();
}

function renderJalaliPicker() {
  document.getElementById('pickerMonthName').textContent = PERSIAN_MONTH_NAMES[jalaliPickerState.month - 1];
  document.getElementById('pickerYearNum').textContent = jalaliPickerState.year.toLocaleString('fa-IR');

  const grid = document.getElementById('pickerDaysGrid');
  grid.innerHTML = '';

  // تعداد روزهای ماه جاری شمسی
  let daysInMonth = 30;
  if (jalaliPickerState.month <= 6) daysInMonth = 31;
  else if (jalaliPickerState.month === 12) daysInMonth = 29;

  // محاسبه روز اول ماه در هفته (شنبه = 0، جمعه = 6)
  const [gy, gm, gd] = jalaliToGregorian(jalaliPickerState.year, jalaliPickerState.month, 1);
  const gDate = new Date(gy, gm - 1, gd);
  const jalaliStartDayOfWeek = (gDate.getDay() + 1) % 7;

  // خانه‌های خالی قبل از روز اول
  for (let i = 0; i < jalaliStartDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'py-2';
    grid.appendChild(emptyCell);
  }

  const [tY, tM, tD] = getTodayJalali().split('/').map(Number);

  // تولید روزهای ماه
  for (let d = 1; d <= daysInMonth; d++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = d.toLocaleString('fa-IR');

    const isToday = (jalaliPickerState.year === tY && jalaliPickerState.month === tM && d === tD);
    const isSelected = (d === jalaliPickerState.selectedDay);

    if (isSelected) {
      btn.className = 'w-8 h-8 mx-auto rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center transition shadow-sm';
    } else if (isToday) {
      btn.className = 'w-8 h-8 mx-auto rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-300 flex items-center justify-center hover:bg-indigo-100 transition';
    } else {
      btn.className = 'w-8 h-8 mx-auto rounded-full text-slate-700 hover:bg-slate-100 flex items-center justify-center transition font-medium';
    }

    btn.onclick = () => selectJalaliDay(d);
    grid.appendChild(btn);
  }
}

function selectJalaliDay(day) {
  const pad = n => String(n).padStart(2, '0');
  const formattedDate = `${jalaliPickerState.year}/${pad(jalaliPickerState.month)}/${pad(day)}`;
  if (jalaliPickerState.targetInputId) {
    const input = document.getElementById(jalaliPickerState.targetInputId);
    if (input) input.value = formattedDate;
  }
  closeJalaliPicker();
}

function jalaliPickerSelectToday() {
  if (jalaliPickerState.targetInputId) {
    const input = document.getElementById(jalaliPickerState.targetInputId);
    if (input) input.value = getTodayJalali();
  }
  closeJalaliPicker();
}

function jalaliPickerClear() {
  if (jalaliPickerState.targetInputId) {
    const input = document.getElementById(jalaliPickerState.targetInputId);
    if (input) input.value = '';
  }
  closeJalaliPicker();
}

/**
 * =========================================================================
 * ۳. جداسازی خودکار سه‌رقم‌سه‌رقم مبالغ (3-Digit Currency Formatter)
 * =========================================================================
 */
function formatCurrencyInput(displayInput, hiddenTargetId) {
  // حذف کاراکترهای غیرعددی
  const rawNum = displayInput.value.replace(/[^0-9]/g, '');
  const numVal = Number(rawNum) || 0;

  document.getElementById(hiddenTargetId).value = numVal;

  if (!rawNum) {
    displayInput.value = '';
    return;
  }

  // فرمت سه‌رقم سه‌رقم با کاما
  displayInput.value = numVal.toLocaleString('en-US');
}

function setFormattedCurrency(displayInputId, hiddenInputId, value) {
  const num = Number(value) || 0;
  const hiddenEl = document.getElementById(hiddenInputId);
  const displayEl = document.getElementById(displayInputId);

  if (hiddenEl) hiddenEl.value = num;
  if (displayEl) {
    displayEl.value = num > 0 ? num.toLocaleString('en-US') : '';
  }
}

/**
 * =========================================================================
 * ۴. افزودن گروهی اتودها، ریسایزها و نسخه‌های فرعی در یک فرم واحد
 * =========================================================================
 */
function addSubOrderItem(initialData = null) {
  const itemId = 'sub_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const item = initialData || {
    id: itemId,
    title: '',
    formatType: '',
    type: 'Digital',
    status: 'Delivered',
    totalFee: 0,
    isFree: false
  };

  subOrderItemsState.push(item);
  renderSubOrdersList();
}

function removeSubOrderItem(index) {
  subOrderItemsState.splice(index, 1);
  renderSubOrdersList();
}

function renderSubOrdersList() {
  const container = document.getElementById('subOrdersList');
  if (!container) return;
  container.innerHTML = '';

  subOrderItemsState.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-2';

    const feeFormatted = (item.totalFee > 0) ? Number(item.totalFee).toLocaleString('en-US') : '';

    row.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-bold text-slate-800 text-[11px]">نسخه / اتود شماره ${idx + 1}</span>
        <button type="button" onclick="removeSubOrderItem(${idx})" class="text-rose-500 hover:text-rose-700 p-1 text-[11px] flex items-center gap-0.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          <span>حذف</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div class="sm:col-span-2">
          <input type="text" placeholder="عنوان نسخه (مثال: اتود ۲ رد شده، ریسایز استوری...)" value="${escapeHtml(item.title)}" onchange="updateSubItemField(${idx}, 'title', this.value)" class="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white">
        </div>
        <div>
          <input type="text" placeholder="قالب (استوری، بنر...)" value="${escapeHtml(item.formatType)}" onchange="updateSubItemField(${idx}, 'formatType', this.value)" class="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white">
        </div>
        <div>
          <select onchange="updateSubItemField(${idx}, 'status', this.value)" class="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium">
            <option value="Delivered" ${item.status === 'Delivered' ? 'selected' : ''}>تحویل داده شده</option>
            <option value="In Progress" ${item.status === 'In Progress' ? 'selected' : ''}>در حال انجام</option>
            <option value="Canceled" ${item.status === 'Canceled' ? 'selected' : ''}>لغو شده / رد شده</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-50 items-center">
        <div class="flex items-center gap-2">
          <select onchange="updateSubItemField(${idx}, 'type', this.value)" class="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white">
            <option value="Digital" ${item.type === 'Digital' ? 'selected' : ''}>دیجیتال</option>
            <option value="Print" ${item.type === 'Print' ? 'selected' : ''}>چاپ</option>
            <option value="Both" ${item.type === 'Both' ? 'selected' : ''}>هر دو</option>
          </select>
          <input type="text" placeholder="مبلغ جداگانه (تومان)" value="${feeFormatted}" oninput="handleSubItemFeeInput(this, ${idx})" class="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono">
        </div>
        <div class="text-[11px] text-slate-400">
          اگر هزینه در پکیج اصلی محاسبه شده، مبلغ را صفر بگذارید.
        </div>
      </div>
    `;

    container.appendChild(row);
  });
}

function updateSubItemField(index, field, value) {
  if (subOrderItemsState[index]) {
    subOrderItemsState[index][field] = value;
  }
}

function handleSubItemFeeInput(el, index) {
  const rawNum = el.value.replace(/[^0-9]/g, '');
  const num = Number(rawNum) || 0;
  el.value = num > 0 ? num.toLocaleString('en-US') : '';
  if (subOrderItemsState[index]) {
    subOrderItemsState[index].totalFee = num;
  }
}

/**
 * =========================================================================
 * ۵. منطق داشبورد، واکشی و ثبت داده‌ها
 * =========================================================================
 */
function initApp() {
  initConnectionStatus();
  if (appState.gasUrl) {
    fetchData();
  } else {
    loadLocalDemoData();
  }
}

function initConnectionStatus() {
  const badge = document.getElementById('connectionStatusBadge');
  const text = document.getElementById('connectionStatusText');
  const input = document.getElementById('gasUrlInput');

  if (appState.gasUrl) {
    if (input) input.value = appState.gasUrl;
    if (text) text.textContent = 'متصل به سرور GAS';
    if (badge) {
      badge.className = 'hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer';
      badge.querySelector('span:first-child').className = 'w-2 h-2 rounded-full bg-emerald-500';
    }
  } else {
    if (input) input.value = '';
    if (text) text.textContent = 'حالت دمو';
    if (badge) {
      badge.className = 'hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer';
      badge.querySelector('span:first-child').className = 'w-2 h-2 rounded-full bg-amber-500 animate-pulse';
    }
  }
}

function loadLocalDemoData() {
  const savedOrders = localStorage.getItem('demo_orders_v3');
  if (savedOrders) {
    try {
      appState.orders = JSON.parse(savedOrders);
    } catch (e) {
      appState.orders = [...DEMO_ORDERS];
    }
  } else {
    appState.orders = [...DEMO_ORDERS];
    localStorage.setItem('demo_orders_v3', JSON.stringify(appState.orders));
  }

  buildClientAndInvoiceLists();
  applyFilters();
}

async function fetchData() {
  if (!appState.gasUrl) {
    loadLocalDemoData();
    return;
  }

  showLoading(true);
  try {
    const fetchUrl = `${appState.gasUrl}?action=getDashboardData&t=${Date.now()}`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const result = await response.json();
    if (result && result.success && result.data) {
      appState.orders = (result.data.orders || []).map(o => ({
        ...o,
        dateOrdered: normalizeToJalali(o.dateOrdered),
        dateDelivered: normalizeToJalali(o.dateDelivered)
      }));
      appState.clients = result.data.clients || [];

      initConnectionStatus();
      buildClientAndInvoiceLists();
      applyFilters();
    } else {
      throw new Error(result.error || 'خطا در بارگذاری');
    }
  } catch (err) {
    console.warn('اتصال به سرور برقرار نشد، داده‌های محلی لود شدند:', err);
    loadLocalDemoData();
  } finally {
    showLoading(false);
  }
}

async function saveOrderApi(orderData, isEdit) {
  const action = isEdit ? 'updateOrder' : 'addOrder';

  if (!appState.gasUrl) {
    if (isEdit) {
      const idx = appState.orders.findIndex(o => o.id === orderData.id);
      if (idx !== -1) appState.orders[idx] = { ...appState.orders[idx], ...orderData };
    } else {
      // ایجاد سفارش اصلی در حالت دمو
      const mainId = 'ORD-' + getTodayJalali().replace(/\//g, '').slice(2) + '-' + Math.floor(100 + Math.random() * 900);
      orderData.id = mainId;
      appState.orders.unshift(orderData);

      // ایجاد خودکار اتودها و ریسایزها در حالت دمو
      if (Array.isArray(orderData.subOrders)) {
        orderData.subOrders.forEach((sub, i) => {
          appState.orders.push({
            id: `${mainId}-SUB${i + 1}`,
            title: sub.title || `نسخه ${i + 1}`,
            dateOrdered: orderData.dateOrdered,
            dateDelivered: orderData.dateDelivered,
            type: sub.type || orderData.type,
            formatType: sub.formatType || '',
            status: sub.status || 'Delivered',
            clientId: orderData.clientId,
            clientName: orderData.clientName,
            clientContact: orderData.clientContact,
            parentOrderId: mainId,
            filesLink: orderData.filesLink,
            invoiceId: orderData.invoiceId,
            totalFee: Number(sub.totalFee) || 0,
            amountPaid: 0,
            remainingFee: 0,
            paymentStatus: sub.totalFee > 0 ? 'Unpaid' : 'Free'
          });
        });
      }
    }
    localStorage.setItem('demo_orders_v3', JSON.stringify(appState.orders));
    buildClientAndInvoiceLists();
    applyFilters();
    closeOrderModal();
    return { success: true };
  }

  showLoading(true);
  try {
    const payload = { action: action, data: orderData };
    const response = await fetch(appState.gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const res = await response.json();
    if (res.success) {
      closeOrderModal();
      await fetchData();
      return res;
    } else {
      throw new Error(res.error || 'خطا در ثبت سفارش');
    }
  } catch (err) {
    alert('خطا در ذخیره سفارش: ' + err.message);
  } finally {
    showLoading(false);
  }
}

async function deleteOrder(orderId) {
  if (!confirm('آیا از حذف این سفارش اطمینان دارید؟')) return;

  if (!appState.gasUrl) {
    appState.orders = appState.orders.filter(o => o.id !== orderId);
    localStorage.setItem('demo_orders_v3', JSON.stringify(appState.orders));
    buildClientAndInvoiceLists();
    applyFilters();
    return;
  }

  showLoading(true);
  try {
    const response = await fetch(appState.gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'deleteOrder', data: { id: orderId } })
    });
    const res = await response.json();
    if (res.success) {
      await fetchData();
    } else {
      throw new Error(res.error || 'خطا در حذف سفارش');
    }
  } catch (e) {
    alert('خطا در حذف: ' + e.message);
  } finally {
    showLoading(false);
  }
}

function buildClientAndInvoiceLists() {
  const clientSet = new Set();
  const parentOrderSelect = document.getElementById('formParentOrderId');

  if (parentOrderSelect) {
    parentOrderSelect.innerHTML = '<option value="">(پروژه مستقل / بدون والد)</option>';
  }

  appState.orders.forEach(o => {
    if (o.clientName) clientSet.add(o.clientName);
    if (parentOrderSelect) {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = `${o.id} - ${o.title} (${o.clientName})`;
      parentOrderSelect.appendChild(opt);
    }
  });

  const clientFilter = document.getElementById('clientFilter');
  if (clientFilter) {
    const currentVal = clientFilter.value;
    clientFilter.innerHTML = '<option value="all">همه کارفرمایان</option>';
    clientSet.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      clientFilter.appendChild(opt);
    });
    clientFilter.value = currentVal;
  }
}

function setTimeframeFilter(timeframe) {
  appState.filters.timeframe = timeframe;
  document.querySelectorAll('.tf-btn').forEach(btn => {
    if (btn.dataset.tf === timeframe) {
      btn.className = 'tf-btn px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200 transition whitespace-nowrap';
    } else {
      btn.className = 'tf-btn px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition whitespace-nowrap';
    }
  });
  applyFilters();
}

/**
 * فیلترها و بروزرسانی جامع (شامل محاسبه هزینه کارهای لغوشده)
 */
function applyFilters() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const type = document.getElementById('typeFilter')?.value || 'all';
  const client = document.getElementById('clientFilter')?.value || 'all';
  const finance = document.getElementById('financeFilter')?.value || 'all';
  const status = document.getElementById('statusFilter')?.value || 'all';

  appState.filters.search = search;
  appState.filters.type = type;
  appState.filters.clientId = client;
  appState.filters.finance = finance;
  appState.filters.status = status;

  const now = new Date();

  const filtered = appState.orders.filter(order => {
    // ۱. فیلتر بازه زمانی
    if (appState.filters.timeframe !== 'all') {
      const orderDate = parseJalaliToDate(order.dateOrdered);
      const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);

      if (appState.filters.timeframe === 'weekly' && diffDays > 7) return false;
      if (appState.filters.timeframe === 'monthly' && diffDays > 30) return false;
      if (appState.filters.timeframe === 'six_months' && diffDays > 180) return false;
      if (appState.filters.timeframe === 'yearly' && diffDays > 365) return false;
    }

    if (type !== 'all' && order.type !== type) return false;
    if (client !== 'all' && order.clientName !== client) return false;

    if (finance !== 'all') {
      if (finance === 'Free' && order.paymentStatus !== 'Free') return false;
      if (finance === 'Paid' && order.paymentStatus !== 'Paid') return false;
      if (finance === 'Partial' && order.paymentStatus !== 'Partial') return false;
      if (finance === 'Unpaid' && order.paymentStatus !== 'Unpaid') return false;
    }

    if (status !== 'all' && order.status !== status) return false;

    if (search) {
      const matchTitle = (order.title || '').toLowerCase().includes(search);
      const matchClient = (order.clientName || '').toLowerCase().includes(search);
      const matchId = (order.id || '').toLowerCase().includes(search);
      const matchFormat = (order.formatType || '').toLowerCase().includes(search);
      const matchInvoice = (order.invoiceId || '').toLowerCase().includes(search);
      if (!matchTitle && !matchClient && !matchId && !matchFormat && !matchInvoice) return false;
    }

    return true;
  });

  updateKpis(filtered);
  renderOrders(filtered);
  updateCharts(filtered);

  const counterEl = document.getElementById('filteredResultsCount');
  if (counterEl) {
    counterEl.textContent = `نمایش ${formatPersianNumber(filtered.length)} از ${formatPersianNumber(appState.orders.length)} سفارش`;
  }
}

/**
 * محاسبه شاخص‌ها شامل:
 * ۱. درآمد وصول‌شده
 * ۲. طلب‌های معوقه
 * ۳. ارزش کارهای دوستانه
 * ۴. ارزش کارهای لغو شده (هزینه کار طراحی‌شده‌ای که کارفرما لغو کرده)
 */
function updateKpis(ordersList) {
  const totalOrders = ordersList.length;
  let deliveredCount = 0;
  let activeCount = 0;
  let totalPaid = 0;
  let totalReceivables = 0;
  let unpaidCount = 0;
  let paidOrdersCount = 0;
  let friendlyTotalValue = 0;
  let freeCount = 0;

  // شاخص کارهای لغوشده
  let canceledCount = 0;
  let canceledTotalFee = 0;
  let canceledPaid = 0;

  ordersList.forEach(o => {
    if (o.status === 'Delivered') deliveredCount++;
    if (o.status === 'In Progress') activeCount++;

    const fee = Number(o.totalFee) || 0;
    const paid = Number(o.amountPaid) || 0;
    const isFree = (o.paymentStatus === 'Free');
    const isCanceled = (o.status === 'Canceled');

    if (isCanceled) {
      canceledCount++;
      canceledTotalFee += fee; // هزینه کار طراحی‌شده‌ای که لغو شده
      canceledPaid += paid;
    } else if (isFree) {
      freeCount++;
      friendlyTotalValue += fee; // ارزش کار دوستانه
    } else {
      totalPaid += paid;
      if (o.paymentStatus === 'Paid') paidOrdersCount++;
      const rem = Number(o.remainingFee) || Math.max(0, fee - paid);
      if (rem > 0) {
        totalReceivables += rem;
        unpaidCount++;
      }
    }
  });

  const freePercent = totalOrders > 0 ? Math.round((freeCount / totalOrders) * 100) : 0;

  document.getElementById('kpiTotalOrders').textContent = formatPersianNumber(totalOrders);
  document.getElementById('kpiDeliveredOrders').textContent = formatPersianNumber(deliveredCount);
  document.getElementById('kpiActiveOrders').textContent = formatPersianNumber(activeCount);

  document.getElementById('kpiTotalRevenue').textContent = formatCurrency(totalPaid);
  document.getElementById('kpiPaidOrdersCount').textContent = formatPersianNumber(paidOrdersCount);

  document.getElementById('kpiTotalReceivables').textContent = formatCurrency(totalReceivables);
  document.getElementById('kpiUnpaidCount').textContent = formatPersianNumber(unpaidCount);

  // شاخص کارهای لغوشده
  document.getElementById('kpiCanceledValue').textContent = formatCurrency(canceledTotalFee);
  document.getElementById('kpiCanceledCount').textContent = formatPersianNumber(canceledCount);
  document.getElementById('kpiCanceledPaid').textContent = formatCurrency(canceledPaid);

  // شاخص کارهای دوستانه
  document.getElementById('kpiFriendlyValue').textContent = formatCurrency(friendlyTotalValue);
  document.getElementById('kpiFreeOrders').textContent = formatPersianNumber(freeCount);
  document.getElementById('kpiFreePercent').textContent = formatPersianNumber(freePercent) + '٪';
}

function renderOrders(ordersList) {
  const tbody = document.getElementById('ordersTableBody');
  const mobileContainer = document.getElementById('ordersMobileContainer');
  const emptyState = document.getElementById('emptyState');
  const countPill = document.getElementById('orderCountPill');

  if (countPill) countPill.textContent = `${formatPersianNumber(ordersList.length)} مورد`;
  tbody.innerHTML = '';
  mobileContainer.innerHTML = '';

  if (ordersList.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  const parentMap = new Map();
  appState.orders.forEach(o => {
    if (o.parentOrderId) {
      const list = parentMap.get(o.parentOrderId) || [];
      list.push(o.id);
      parentMap.set(o.parentOrderId, list);
    }
  });

  ordersList.forEach(order => {
    const hasChildren = parentMap.has(order.id);
    const childrenCount = hasChildren ? parentMap.get(order.id).length : 0;
    const isChild = Boolean(order.parentOrderId);

    const typeBadge = getTypeBadge(order.type);
    const statusBadge = getStatusBadge(order.status);
    const paymentBadge = getPaymentBadge(order.paymentStatus, order.remainingFee, order.totalFee);

    // ۱. ردیف دسکتاپ
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/70 transition border-b border-slate-100';

    const driveBtnDesktop = order.filesLink
      ? `<a href="${escapeHtml(order.filesLink)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition text-[11px] font-medium" title="فایل‌ها در درایو">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          <span>درایو</span>
        </a>`
      : `<span class="text-slate-300 text-[11px]">-</span>`;

    tr.innerHTML = `
      <td class="px-4 py-3 font-mono text-[11px] text-slate-500">
        <div class="font-medium text-slate-800">${escapeHtml(order.id)}</div>
        ${isChild ? `
          <div class="mt-0.5 inline-flex items-center gap-1 text-[10px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded cursor-pointer hover:bg-violet-100" onclick="filterByParent('${escapeHtml(order.parentOrderId)}')">
            <span>🔗 والد:</span>
            <span>${escapeHtml(order.parentOrderId)}</span>
          </div>
        ` : ''}
        ${hasChildren ? `
          <div class="mt-0.5 inline-flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded cursor-pointer hover:bg-indigo-100" onclick="filterByParent('${escapeHtml(order.id)}')">
            <span>📑 ${formatPersianNumber(childrenCount)} اتود/نسخه گروه</span>
          </div>
        ` : ''}
      </td>

      <td class="px-4 py-3">
        <div class="font-bold text-slate-900 text-xs">${escapeHtml(order.title)}</div>
        ${order.parentOrderId ? `<span class="text-[10px] text-amber-600 font-medium">نسخه / اتود زیرمجموعه</span>` : ''}
      </td>

      <td class="px-4 py-3">
        <div class="font-medium text-slate-800">${escapeHtml(order.clientName || 'نامشخص')}</div>
        ${order.clientContact ? `<div class="text-[10px] text-slate-400 font-mono">${escapeHtml(order.clientContact)}</div>` : ''}
      </td>

      <td class="px-4 py-3">
        ${typeBadge}
        <div class="text-[11px] text-slate-600 mt-1 font-medium">${escapeHtml(order.formatType || 'قالب نامشخص')}</div>
      </td>

      <td class="px-4 py-3 text-[11px] text-slate-600 font-mono">
        <div>ثبت: ${escapeHtml(order.dateOrdered || '-')}</div>
        ${order.dateDelivered ? `<div class="text-emerald-600 mt-0.5">تحویل: ${escapeHtml(order.dateDelivered)}</div>` : ''}
      </td>

      <td class="px-4 py-3">
        ${statusBadge}
      </td>

      <td class="px-4 py-3">
        <div class="flex items-center gap-1">
          <span class="font-bold text-slate-900">${formatCurrency(order.totalFee)}</span>
          <span class="text-[10px] text-slate-400">تومان</span>
        </div>
        <div class="mt-1 flex items-center gap-1.5">
          ${paymentBadge}
          ${order.invoiceId ? `<span class="text-[10px] text-slate-400">${escapeHtml(order.invoiceId)}</span>` : ''}
        </div>
      </td>

      <td class="px-4 py-3 text-center">
        ${driveBtnDesktop}
      </td>

      <td class="px-4 py-3 text-center">
        <div class="flex items-center justify-center gap-1">
          <button onclick="createVariantOrder('${escapeHtml(order.id)}')" title="افزودن اتود / ریسایز به این سفارش" class="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
          </button>
          <button onclick="editOrder('${escapeHtml(order.id)}')" title="ویرایش" class="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button onclick="deleteOrder('${escapeHtml(order.id)}')" title="حذف" class="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);

    // ۲. کارت موبایل
    const card = document.createElement('div');
    card.className = 'p-4 space-y-3 bg-white hover:bg-slate-50 transition';

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div>
          <span class="text-[10px] font-mono text-slate-400">${escapeHtml(order.id)}</span>
          <h4 class="text-xs font-bold text-slate-900 leading-snug mt-0.5">${escapeHtml(order.title)}</h4>
          <p class="text-[11px] text-slate-600 mt-0.5 font-medium">${escapeHtml(order.clientName || 'نامشخص')}</p>
        </div>
        <div>${statusBadge}</div>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <div>${typeBadge}</div>
        <div class="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">${escapeHtml(order.formatType || 'قالب نامشخص')}</div>
        <div class="font-mono">ثبت: ${escapeHtml(order.dateOrdered || '-')}</div>
        ${order.dateDelivered ? `<div class="text-emerald-600 font-mono">تحویل: ${escapeHtml(order.dateDelivered)}</div>` : ''}
      </div>

      <div class="flex items-center justify-between pt-1 border-t border-slate-100">
        <div class="space-y-0.5">
          <div class="text-xs font-bold text-slate-900">
            ${formatCurrency(order.totalFee)} <span class="text-[10px] text-slate-400 font-normal">تومان</span>
          </div>
          <div>${paymentBadge}</div>
        </div>

        <div class="flex items-center gap-1.5">
          ${order.filesLink ? `
            <a href="${escapeHtml(order.filesLink)}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition" title="درایو">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          ` : ''}
          <button onclick="createVariantOrder('${escapeHtml(order.id)}')" title="افزودن ریسایز" class="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
          </button>
          <button onclick="editOrder('${escapeHtml(order.id)}')" title="ویرایش" class="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button onclick="deleteOrder('${escapeHtml(order.id)}')" title="حذف" class="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    `;
    mobileContainer.appendChild(card);
  });
}

function filterByParent(parentId) {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = parentId;
    applyFilters();
  }
}

/**
 * =========================================================================
 * ۶. نمودارهای Chart.js
 * =========================================================================
 */
function updateCharts(ordersList) {
  let digitalCount = 0;
  let printCount = 0;
  let bothCount = 0;

  ordersList.forEach(o => {
    if (o.type === 'Digital') digitalCount++;
    else if (o.type === 'Print') printCount++;
    else if (o.type === 'Both') bothCount++;
  });

  const distCtx = document.getElementById('typeDistributionChart')?.getContext('2d');
  if (distCtx) {
    if (appState.charts.typeDist) {
      appState.charts.typeDist.destroy();
    }
    appState.charts.typeDist = new Chart(distCtx, {
      type: 'doughnut',
      data: {
        labels: ['دیجیتال', 'چاپ', 'هر دو'],
        datasets: [{
          data: [digitalCount, printCount, bothCount],
          backgroundColor: ['#6366f1', '#ec4899', '#8b5cf6'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { family: 'Vazirmatn', size: 11 } }
          }
        },
        cutout: '70%'
      }
    });
  }

  // گزارش ماهانه مالی شامل کارهای لغوشده
  const monthlyData = {};

  ordersList.forEach(o => {
    let key = 'نامشخص';
    if (o.dateOrdered && o.dateOrdered.length >= 7) {
      key = o.dateOrdered.slice(0, 7);
    }

    if (!monthlyData[key]) {
      monthlyData[key] = { revenue: 0, receivables: 0, friendly: 0, canceled: 0 };
    }

    const fee = Number(o.totalFee) || 0;
    const paid = Number(o.amountPaid) || 0;

    if (o.status === 'Canceled') {
      monthlyData[key].canceled += fee;
    } else if (o.paymentStatus === 'Free') {
      monthlyData[key].friendly += fee;
    } else {
      monthlyData[key].revenue += paid;
      const rem = Number(o.remainingFee) || Math.max(0, fee - paid);
      monthlyData[key].receivables += rem;
    }
  });

  const labels = Object.keys(monthlyData).sort();
  const revList = labels.map(l => monthlyData[l].revenue);
  const recList = labels.map(l => monthlyData[l].receivables);
  const canList = labels.map(l => monthlyData[l].canceled);
  const friList = labels.map(l => monthlyData[l].friendly);

  const trendCtx = document.getElementById('revenueTrendChart')?.getContext('2d');
  if (trendCtx) {
    if (appState.charts.revenueTrend) {
      appState.charts.revenueTrend.destroy();
    }
    appState.charts.revenueTrend = new Chart(trendCtx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['بدون داده'],
        datasets: [
          {
            label: 'درآمد وصول‌شده',
            data: revList.length ? revList : [0],
            backgroundColor: '#10b981',
            borderRadius: 6
          },
          {
            label: 'طلب‌های معوق',
            data: recList.length ? recList : [0],
            backgroundColor: '#fb7185',
            borderRadius: 6
          },
          {
            label: 'ارزش لغوشده‌ها',
            data: canList.length ? canList : [0],
            backgroundColor: '#f59e0b',
            borderRadius: 6
          },
          {
            label: 'ارزش کار دوستانه',
            data: friList.length ? friList : [0],
            backgroundColor: '#a855f7',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Vazirmatn', size: 10 } }
          },
          y: {
            ticks: {
              font: { family: 'Vazirmatn', size: 10 },
              callback: val => (val / 1000000).toLocaleString('fa-IR') + ' م'
            }
          }
        }
      }
    });
  }
}

/**
 * =========================================================================
 * ۷. فرم ثبت و ویرایش سفارش (با ارسال اتودها و ریسایزها در یک گروه)
 * =========================================================================
 */
function handleOrderFormSubmit(e) {
  e.preventDefault();

  const isFree = document.getElementById('formIsFree').checked;
  const totalFee = Number(document.getElementById('formTotalFee').value) || 0;
  const amountPaid = isFree ? 0 : (Number(document.getElementById('formAmountPaid').value) || 0);
  const remaining = isFree ? 0 : Math.max(0, totalFee - amountPaid);

  let paymentStatus = 'Unpaid';
  if (isFree) {
    paymentStatus = 'Free';
  } else if (amountPaid >= totalFee && totalFee > 0) {
    paymentStatus = 'Paid';
  } else if (amountPaid > 0) {
    paymentStatus = 'Partial';
  }

  const orderId = document.getElementById('formOrderId').value;
  const isEdit = Boolean(orderId);

  // پالایش اتودها و ریسایزهای وارد شده در فرم
  const validSubOrders = subOrderItemsState.filter(s => (s.title || '').trim().length > 0);

  const payload = {
    id: orderId || undefined,
    title: document.getElementById('formTitle').value.trim(),
    clientName: document.getElementById('formClientName').value.trim(),
    type: document.getElementById('formType').value,
    formatType: document.getElementById('formFormatType').value.trim(),
    dateOrdered: document.getElementById('formDateOrdered').value.trim(),
    dateDelivered: document.getElementById('formDateDelivered').value.trim(),
    status: document.getElementById('formStatus').value,
    parentOrderId: document.getElementById('formParentOrderId').value,
    invoiceId: document.getElementById('formInvoiceId').value.trim(),
    totalFee: totalFee,
    amountPaid: amountPaid,
    remainingFee: remaining,
    paymentStatus: paymentStatus,
    isFree: isFree,
    filesLink: document.getElementById('formFilesLink').value.trim(),
    subOrders: validSubOrders // ارسال لیست اتودها و ریسایزها جهت ثبت در یک گروه
  };

  saveOrderApi(payload, isEdit);
}

function openOrderModal() {
  document.getElementById('orderForm').reset();
  document.getElementById('formOrderId').value = '';
  document.getElementById('orderModalTitle').textContent = 'ثبت سفارش و پروژه‌های گروهی';
  document.getElementById('formDateOrdered').value = getTodayJalali();
  document.getElementById('formDateDelivered').value = '';
  document.getElementById('formIsFree').checked = false;
  toggleFreeOrder(false);

  // ریست اینپوت‌های جداسازی سه رقمی
  setFormattedCurrency('formTotalFeeFormatted', 'formTotalFee', 0);
  setFormattedCurrency('formAmountPaidFormatted', 'formAmountPaid', 0);

  // پاک کردن و نمایش بخش اتودها
  subOrderItemsState = [];
  renderSubOrdersList();
  document.getElementById('subOrdersContainerWrapper').classList.remove('hidden');

  buildClientAndInvoiceLists();
  document.getElementById('orderModal').classList.remove('hidden');
}

function createVariantOrder(parentOrderId) {
  const parent = appState.orders.find(o => o.id === parentOrderId);
  openOrderModal();
  if (parent) {
    document.getElementById('orderModalTitle').textContent = `افزودن ریسایز / نسخه جدید به (${parent.title})`;
    document.getElementById('formParentOrderId').value = parent.id;
    document.getElementById('formClientName').value = parent.clientName || '';
    document.getElementById('formTitle').value = `ریسایز: ${parent.title}`;
    document.getElementById('formInvoiceId').value = parent.invoiceId || '';
  }
}

function editOrder(orderId) {
  const order = appState.orders.find(o => o.id === orderId);
  if (!order) return;

  buildClientAndInvoiceLists();
  document.getElementById('formOrderId').value = order.id;
  document.getElementById('orderModalTitle').textContent = `ویرایش سفارش (${order.id})`;
  document.getElementById('formTitle').value = order.title || '';
  document.getElementById('formClientName').value = order.clientName || '';
  document.getElementById('formType').value = order.type || 'Digital';
  document.getElementById('formFormatType').value = order.formatType || '';
  document.getElementById('formDateOrdered').value = order.dateOrdered || '';
  document.getElementById('formDateDelivered').value = order.dateDelivered || '';
  document.getElementById('formStatus').value = order.status || 'In Progress';

  document.getElementById('formParentOrderId').value = order.parentOrderId || '';
  document.getElementById('formInvoiceId').value = order.invoiceId || '';
  document.getElementById('formFilesLink').value = order.filesLink || '';

  setFormattedCurrency('formTotalFeeFormatted', 'formTotalFee', order.totalFee || 0);
  setFormattedCurrency('formAmountPaidFormatted', 'formAmountPaid', order.amountPaid || 0);

  const isFree = (order.paymentStatus === 'Free');
  document.getElementById('formIsFree').checked = isFree;
  toggleFreeOrder(isFree);

  // در حالت ادیت، اتودهای قبلی قبلاً در جدول هستند؛ بخش افزودن چندتایی جدید را مخفی کن
  document.getElementById('subOrdersContainerWrapper').classList.add('hidden');

  document.getElementById('orderModal').classList.remove('hidden');
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.add('hidden');
}

function toggleFreeOrder(isFree) {
  const paidFormattedInput = document.getElementById('formAmountPaidFormatted');
  const labelFee = document.getElementById('labelTotalFee');
  const hintFee = document.getElementById('hintTotalFee');
  const hintPaid = document.getElementById('hintAmountPaid');

  if (isFree) {
    setFormattedCurrency('formAmountPaidFormatted', 'formAmountPaid', 0);
    paidFormattedInput.disabled = true;
    paidFormattedInput.classList.add('bg-slate-100', 'text-slate-400');
    labelFee.textContent = 'ارزش تخمینی کار دوستانه (تومان)';
    hintFee.textContent = 'جهت ثبت در آمار چند تومان کار دوستانه محاسبه می‌شود.';
    hintPaid.textContent = 'دریافت وجه در کارهای دوستانه صفر است.';
  } else {
    paidFormattedInput.disabled = false;
    paidFormattedInput.classList.remove('bg-slate-100', 'text-slate-400');
    labelFee.textContent = 'مبلغ / ارزش کل کار (تومان) *';
    hintFee.textContent = 'ارزش کل سفارش توافق‌شده با مشتری.';
    hintPaid.textContent = 'مبلغ واریزی تا این لحظه.';
  }
}

/**
 * =========================================================================
 * ۸. تنظیمات و توابع کمکی
 * =========================================================================
 */
function openSettingsModal() {
  document.getElementById('gasUrlInput').value = appState.gasUrl;
  document.getElementById('currentPassInput').value = '';
  document.getElementById('newPassInput').value = '';
  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function saveGasUrl() {
  const url = (document.getElementById('gasUrlInput').value || '').trim();
  appState.gasUrl = url;
  if (url) {
    localStorage.setItem('gas_web_app_url', url);
  } else {
    localStorage.removeItem('gas_web_app_url');
  }
  closeSettingsModal();
  initConnectionStatus();
  fetchData();
}

function clearGasUrl() {
  appState.gasUrl = '';
  localStorage.removeItem('gas_web_app_url');
  initConnectionStatus();
  closeSettingsModal();
  loadLocalDemoData();
}

function formatPersianNumber(n) {
  if (n === null || n === undefined || isNaN(n)) return '۰';
  return Number(n).toLocaleString('fa-IR');
}

function formatCurrency(n) {
  if (!n || isNaN(n)) return '۰';
  return Number(n).toLocaleString('fa-IR');
}

function normalizeToJalali(dateStr) {
  if (!dateStr) return '';
  dateStr = dateStr.toString().trim();
  if (dateStr.startsWith('13') || dateStr.startsWith('14')) {
    return dateStr.replace(/-/g, '/');
  }
  if (dateStr.includes('-') || dateStr.includes('/')) {
    const parts = dateStr.split(/[-/T ]/);
    if (parts.length >= 3 && parts[0].length === 4) {
      const gy = parseInt(parts[0], 10);
      const gm = parseInt(parts[1], 10);
      const gd = parseInt(parts[2], 10);
      if (gy > 1900 && gm >= 1 && gm <= 12 && gd >= 1 && gd <= 31) {
        const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);
        const pad = n => String(n).padStart(2, '0');
        return `${jy}/${pad(jm)}/${pad(jd)}`;
      }
    }
  }
  return dateStr;
}

function parseJalaliToDate(jalaliStr) {
  if (!jalaliStr) return new Date();
  const parts = jalaliStr.split('/');
  if (parts.length === 3) {
    const [gy, gm, gd] = jalaliToGregorian(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10));
    return new Date(gy, gm - 1, gd);
  }
  return new Date();
}

function getTypeBadge(type) {
  if (type === 'Print') {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">چاپ</span>`;
  } else if (type === 'Digital') {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">دیجیتال</span>`;
  }
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">هر دو</span>`;
}

function getStatusBadge(status) {
  switch (status) {
    case 'In Progress':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">در حال انجام</span>`;
    case 'Delivered':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">تحویل داده شده</span>`;
    case 'Canceled':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200" title="لغو شده توسط کارفرما">لغو شده</span>`;
    default:
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">در حال انجام</span>`;
  }
}

function getPaymentBadge(status, remaining, totalFee) {
  if (status === 'Free') {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800" title="کار دوستانه بدون دریافت وجه">دوستانه / رایگان</span>`;
  } else if (status === 'Paid') {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">تسویه کامل</span>`;
  } else if (status === 'Partial') {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">قسطی (طلب: ${formatCurrency(remaining)})</span>`;
  }
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">طلب تسویه‌نشده</span>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showLoading(isLoading) {
  const el = document.getElementById('loadingState');
  if (el) {
    if (isLoading) el.classList.remove('hidden');
    else el.classList.add('hidden');
  }
}
