/**
 * =========================================================================
 * Freelance Design Management Panel - Frontend Logic
 * =========================================================================
 */

// داده‌های اولیه و وضعیت برنامه
let appState = {
  gasUrl: localStorage.getItem('gas_web_app_url') || '',
  orders: [],
  clients: [],
  invoices: [],
  filters: {
    timeframe: 'all',
    type: 'all',
    clientId: 'all',
    finance: 'all',
    invoiceId: 'all',
    search: ''
  },
  charts: {
    typeDist: null,
    revenueTrend: null
  }
};

// داده‌های پیش‌فرض برای حالت دمو (نمایش فوری قبل از اتصال به GAS)
const DEMO_ORDERS = [
  {
    id: 'ORD-20261001-101',
    title: 'طراحی هویت بصری و لوگوی استارتاپ رایان',
    dateOrdered: '2026-09-15',
    dateDeadline: '2026-10-01',
    dateDelivered: '2026-09-30',
    type: 'Both',
    formatSize: 'Vector AI, SVG, Guide PDF',
    status: 'Delivered',
    workHours: 24,
    clientId: 'CLI-01',
    clientName: 'شرکت فناوران رایان',
    clientContact: '09121112233',
    parentOrderId: '',
    filesLink: 'https://drive.google.com/drive/folders/demo-brand-identity',
    invoiceId: 'INV-1403-101',
    totalFee: 15000000,
    amountPaid: 15000000,
    remainingFee: 0,
    paymentStatus: 'Paid'
  },
  {
    id: 'ORD-20261003-102',
    title: 'پوستر نمایشگاه بین‌المللی تکنولوژی',
    dateOrdered: '2026-09-20',
    dateDeadline: '2026-09-28',
    dateDelivered: '2026-09-27',
    type: 'Print',
    formatSize: '70x100 cm (300 DPI)',
    status: 'Completed',
    workHours: 8.5,
    clientId: 'CLI-02',
    clientName: 'سازمان توسعه فناوری',
    clientContact: 'info@tech-org.ir',
    parentOrderId: '',
    filesLink: 'https://drive.google.com/drive/folders/demo-poster-print',
    invoiceId: 'INV-1403-102',
    totalFee: 4500000,
    amountPaid: 2000000,
    remainingFee: 2500000,
    paymentStatus: 'Partial'
  },
  {
    id: 'ORD-20261005-103',
    title: 'ریسایز پوستر نمایشگاه برای استوری و پست اینستاگرام',
    dateOrdered: '2026-09-28',
    dateDeadline: '2026-09-30',
    dateDelivered: '2026-09-29',
    type: 'Digital',
    formatSize: '1080x1920 & 1080x1080',
    status: 'Delivered',
    workHours: 2,
    clientId: 'CLI-02',
    clientName: 'سازمان توسعه فناوری',
    clientContact: 'info@tech-org.ir',
    parentOrderId: 'ORD-20261003-102',
    filesLink: 'https://drive.google.com/drive/folders/demo-poster-resize',
    invoiceId: 'INV-1403-102',
    totalFee: 1000000,
    amountPaid: 0,
    remainingFee: 1000000,
    paymentStatus: 'Unpaid'
  },
  {
    id: 'ORD-20261008-104',
    title: 'طراحی بنر همایش خیریه کودکان امید (دوستانه)',
    dateOrdered: '2026-10-02',
    dateDeadline: '2026-10-05',
    dateDelivered: '2026-10-04',
    type: 'Print',
    formatSize: '3x2 متر بیلبورد',
    status: 'Delivered',
    workHours: 4,
    clientId: 'CLI-03',
    clientName: 'خیریه امید فردا',
    clientContact: 'omid@charity.org',
    parentOrderId: '',
    filesLink: 'https://drive.google.com/drive/folders/demo-charity-banner',
    invoiceId: 'INV-FREE-01',
    totalFee: 0,
    amountPaid: 0,
    remainingFee: 0,
    paymentStatus: 'Free'
  },
  {
    id: 'ORD-20261010-105',
    title: 'طراحی رابط کاربری UI صفحه لندینگ',
    dateOrdered: '2026-10-07',
    dateDeadline: '2026-10-18',
    dateDelivered: '',
    type: 'Digital',
    formatSize: 'Figma 1440px',
    status: 'In Progress',
    workHours: 12,
    clientId: 'CLI-01',
    clientName: 'شرکت فناوران رایان',
    clientContact: '09121112233',
    parentOrderId: 'ORD-20261001-101',
    filesLink: 'https://figma.com/file/demo',
    invoiceId: 'INV-1403-103',
    totalFee: 8000000,
    amountPaid: 4000000,
    remainingFee: 4000000,
    paymentStatus: 'Partial'
  }
];

// راه‌اندازی اولیه برنامه
document.addEventListener('DOMContentLoaded', () => {
  initConnectionStatus();
  initFormDates();

  // اگر URL ذخیره شده باشد، از سرور واکشی کن؛ در غیر اینصورت داده‌های دمو را بارگذاری کن
  if (appState.gasUrl) {
    fetchData();
  } else {
    loadLocalDemoData();
  }
});

/**
 * مدیریت وضعیت اتصال به GAS
 */
function initConnectionStatus() {
  const badge = document.getElementById('connectionStatusBadge');
  const text = document.getElementById('connectionStatusText');
  const input = document.getElementById('gasUrlInput');

  if (appState.gasUrl) {
    input.value = appState.gasUrl;
    text.textContent = 'متصل به سرور GAS';
    badge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer';
    badge.querySelector('span:first-child').className = 'w-2 h-2 rounded-full bg-emerald-500';
  } else {
    input.value = '';
    text.textContent = 'حالت دمو (حافظه لوکال)';
    badge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer';
    badge.querySelector('span:first-child').className = 'w-2 h-2 rounded-full bg-amber-500 animate-pulse';
  }
}

/**
 * تاریخ پیش‌فرض فرم (امروز)
 */
function initFormDates() {
  const today = new Date().toISOString().split('T')[0];
  const dateOrdered = document.getElementById('formDateOrdered');
  if (dateOrdered) dateOrdered.value = today;
}

/**
 * بارگذاری داده‌های دمو در صورت عدم تنظیم GAS URL
 */
function loadLocalDemoData() {
  const savedOrders = localStorage.getItem('demo_orders');
  if (savedOrders) {
    try {
      appState.orders = JSON.parse(savedOrders);
    } catch (e) {
      appState.orders = [...DEMO_ORDERS];
    }
  } else {
    appState.orders = [...DEMO_ORDERS];
    localStorage.setItem('demo_orders', JSON.stringify(appState.orders));
  }

  buildClientAndInvoiceLists();
  applyFilters();
}

/**
 * واکشی اطلاعات از Google Apps Script
 */
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
      appState.orders = result.data.orders || [];
      appState.clients = result.data.clients || [];
      appState.invoices = result.data.invoices || [];
      
      initConnectionStatus();
      buildClientAndInvoiceLists();
      applyFilters();
    } else {
      throw new Error(result.error || 'خطا در واکشی داده‌ها از سرور');
    }
  } catch (err) {
    console.warn('امکان اتصال به GAS وجود ندارد. استفاده از حافظه محلی:', err);
    alert('اتصال به سرور برقرار نشد؛ از داده‌های محلی استفاده می‌شود.\nجزئیات: ' + err.message);
    loadLocalDemoData();
  } finally {
    showLoading(false);
  }
}

/**
 * ارسال سفارش جدید یا ویرایش به سرور
 */
async function saveOrderApi(orderData, isEdit) {
  const action = isEdit ? 'updateOrder' : 'addOrder';

  if (!appState.gasUrl) {
    // حالت لوکال / دمو
    if (isEdit) {
      const idx = appState.orders.findIndex(o => o.id === orderData.id);
      if (idx !== -1) appState.orders[idx] = { ...appState.orders[idx], ...orderData };
    } else {
      orderData.id = 'ORD-' + new Date().toISOString().replace(/\D/g, '').slice(0, 8) + '-' + Math.floor(100 + Math.random() * 900);
      appState.orders.unshift(orderData);
    }
    localStorage.setItem('demo_orders', JSON.stringify(appState.orders));
    buildClientAndInvoiceLists();
    applyFilters();
    closeOrderModal();
    return { success: true };
  }

  // ارسال به Google Apps Script با Content-Type: text/plain جهت دور زدن محدودیت CORS preflight
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
      throw new Error(res.error || 'خطا در ثبت سفارش روی سرور');
    }
  } catch (err) {
    console.error('خطای ارتباط با GAS:', err);
    alert('خطا در ارتباط با سرور: ' + err.message);
  } finally {
    showLoading(false);
  }
}

/**
 * حذف سفارش
 */
async function deleteOrder(orderId) {
  if (!confirm('آیا از حذف این سفارش اطمینان دارید؟')) return;

  if (!appState.gasUrl) {
    appState.orders = appState.orders.filter(o => o.id !== orderId);
    localStorage.setItem('demo_orders', JSON.stringify(appState.orders));
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

/**
 * ایجاد لیست منحصر‌به‌فرد مشتریان و فاکتورها در فیلترها و فرم
 */
function buildClientAndInvoiceLists() {
  const clientSet = new Map();
  const invoiceSet = new Set();
  const parentOrderSelect = document.getElementById('formParentOrderId');

  if (parentOrderSelect) {
    parentOrderSelect.innerHTML = '<option value="">(پروژه مستقل / بدون والد)</option>';
  }

  appState.orders.forEach(o => {
    if (o.clientName) {
      clientSet.set(o.clientId || o.clientName, o.clientName);
    }
    if (o.invoiceId) {
      invoiceSet.add(o.invoiceId);
    }
    if (parentOrderSelect) {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = `${o.id} - ${o.title} (${o.clientName})`;
      parentOrderSelect.appendChild(opt);
    }
  });

  // پر کردن دراپ‌داون فیلتر مشتریان
  const clientFilter = document.getElementById('clientFilter');
  if (clientFilter) {
    const currentVal = clientFilter.value;
    clientFilter.innerHTML = '<option value="all">همه مشتریان</option>';
    clientSet.forEach((name, id) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      clientFilter.appendChild(opt);
    });
    clientFilter.value = currentVal;
  }

  // پر کردن دراپ‌داون فیلتر فاکتورها
  const invoiceFilter = document.getElementById('invoiceFilter');
  if (invoiceFilter) {
    const currentVal = invoiceFilter.value;
    invoiceFilter.innerHTML = '<option value="all">همه فاکتورها</option>';
    invoiceSet.forEach(inv => {
      const opt = document.createElement('option');
      opt.value = inv;
      opt.textContent = inv;
      invoiceFilter.appendChild(opt);
    });
    invoiceFilter.value = currentVal;
  }
}

/**
 * تنظیم فیلتر بازه زمانی (هفتگی، ماهانه، شش‌ماهه، سالانه)
 */
function setTimeframeFilter(timeframe) {
  appState.filters.timeframe = timeframe;
  document.querySelectorAll('.tf-btn').forEach(btn => {
    if (btn.dataset.tf === timeframe) {
      btn.className = 'tf-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200 transition';
    } else {
      btn.className = 'tf-btn px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition';
    }
  });
  applyFilters();
}

/**
 * اعمال کلیه فیلترها و بروزرسانی جدول، آمار و نمودارها
 */
function applyFilters() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const type = document.getElementById('typeFilter')?.value || 'all';
  const client = document.getElementById('clientFilter')?.value || 'all';
  const finance = document.getElementById('financeFilter')?.value || 'all';
  const invoice = document.getElementById('invoiceFilter')?.value || 'all';

  appState.filters.search = search;
  appState.filters.type = type;
  appState.filters.clientId = client;
  appState.filters.finance = finance;
  appState.filters.invoiceId = invoice;

  const now = new Date();

  const filtered = appState.orders.filter(order => {
    // ۱. فیلتر بازه زمانی
    if (appState.filters.timeframe !== 'all') {
      const orderDate = new Date(order.dateOrdered);
      if (isNaN(orderDate.getTime())) return true;
      const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);

      if (appState.filters.timeframe === 'weekly' && diffDays > 7) return false;
      if (appState.filters.timeframe === 'monthly' && diffDays > 30) return false;
      if (appState.filters.timeframe === 'six_months' && diffDays > 180) return false;
      if (appState.filters.timeframe === 'yearly' && diffDays > 365) return false;
    }

    // ۲. فیلتر نوع (Digital / Print / Both)
    if (type !== 'all' && order.type !== type) return false;

    // ۳. فیلتر مشتری
    if (client !== 'all' && order.clientName !== client) return false;

    // ۴. فیلتر وضعیت مالی
    if (finance !== 'all') {
      if (finance === 'Free' && order.paymentStatus !== 'Free') return false;
      if (finance === 'Paid' && order.paymentStatus !== 'Paid') return false;
      if (finance === 'Partial' && order.paymentStatus !== 'Partial') return false;
      if (finance === 'Unpaid' && order.paymentStatus !== 'Unpaid') return false;
    }

    // ۵. فیلتر فاکتور
    if (invoice !== 'all' && order.invoiceId !== invoice) return false;

    // ۶. جستجوی متنی
    if (search) {
      const matchTitle = (order.title || '').toLowerCase().includes(search);
      const matchClient = (order.clientName || '').toLowerCase().includes(search);
      const matchId = (order.id || '').toLowerCase().includes(search);
      const matchInvoice = (order.invoiceId || '').toLowerCase().includes(search);
      if (!matchTitle && !matchClient && !matchId && !matchInvoice) return false;
    }

    return true;
  });

  updateKpis(filtered);
  renderOrdersTable(filtered);
  updateCharts(filtered);

  // بروزرسانی شمارنده تعداد فیلترشده
  const counterEl = document.getElementById('filteredResultsCount');
  if (counterEl) {
    counterEl.textContent = `نمایش ${formatPersianNumber(filtered.length)} از ${formatPersianNumber(appState.orders.length)} سفارش`;
  }
}

/**
 * محاسبه و بروزرسانی کارت‌های آماری (KPIs)
 */
function updateKpis(ordersList) {
  const totalOrders = ordersList.length;
  let completedCount = 0;
  let activeCount = 0;
  let totalHours = 0;
  let totalGross = 0;
  let totalPaid = 0;
  let totalReceivables = 0;
  let unpaidCount = 0;
  let freeCount = 0;

  ordersList.forEach(o => {
    if (o.status === 'Completed' || o.status === 'Delivered') completedCount++;
    if (o.status === 'In Progress' || o.status === 'Review') activeCount++;

    totalHours += Number(o.workHours) || 0;
    const fee = Number(o.totalFee) || 0;
    const paid = Number(o.amountPaid) || 0;
    const rem = Number(o.remainingFee) || Math.max(0, fee - paid);

    totalGross += fee;
    totalPaid += paid;
    if (rem > 0 && o.paymentStatus !== 'Free') {
      totalReceivables += rem;
      unpaidCount++;
    }

    if (o.paymentStatus === 'Free' || fee === 0) {
      freeCount++;
    }
  });

  const avgHours = totalOrders > 0 ? (totalHours / totalOrders).toFixed(1) : '۰';
  const freePercent = totalOrders > 0 ? Math.round((freeCount / totalOrders) * 100) : 0;

  // مقداردهی به المان‌های DOM
  document.getElementById('kpiTotalOrders').textContent = formatPersianNumber(totalOrders);
  document.getElementById('kpiCompletedOrders').textContent = formatPersianNumber(completedCount);
  document.getElementById('kpiActiveOrders').textContent = formatPersianNumber(activeCount);

  document.getElementById('kpiWorkHours').textContent = formatPersianNumber(totalHours);
  document.getElementById('kpiAvgHours').textContent = formatPersianNumber(avgHours);

  document.getElementById('kpiTotalRevenue').textContent = formatCurrency(totalPaid);
  document.getElementById('kpiGrossRevenue').textContent = formatCurrency(totalGross) + ' ت';

  document.getElementById('kpiTotalReceivables').textContent = formatCurrency(totalReceivables);
  document.getElementById('kpiUnpaidCount').textContent = formatPersianNumber(unpaidCount);

  document.getElementById('kpiFreeOrders').textContent = formatPersianNumber(freeCount);
  document.getElementById('kpiFreePercent').textContent = formatPersianNumber(freePercent) + '٪';
}

/**
 * رندر جدول سفارشات
 */
function renderOrdersTable(ordersList) {
  const tbody = document.getElementById('ordersTableBody');
  const emptyState = document.getElementById('emptyState');
  const countPill = document.getElementById('orderCountPill');

  if (countPill) countPill.textContent = `${formatPersianNumber(ordersList.length)} مورد`;
  tbody.innerHTML = '';

  if (ordersList.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  // نقشه والدین برای بررسی فرزندان
  const parentMap = new Map();
  appState.orders.forEach(o => {
    if (o.parentOrderId) {
      const list = parentMap.get(o.parentOrderId) || [];
      list.push(o.id);
      parentMap.set(o.parentOrderId, list);
    }
  });

  ordersList.forEach(order => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/70 transition border-b border-slate-100';

    // وضعیت رابطه والد/فرزند
    const hasChildren = parentMap.has(order.id);
    const childrenCount = hasChildren ? parentMap.get(order.id).length : 0;
    const isChild = Boolean(order.parentOrderId);

    // برچسب نوع و ابعاد
    const typeBadge = getTypeBadge(order.type);
    const statusBadge = getStatusBadge(order.status);
    const paymentBadge = getPaymentBadge(order.paymentStatus, order.remainingFee);

    // آیکون درایو
    const driveBtn = order.filesLink
      ? `<a href="${escapeHtml(order.filesLink)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition text-[11px] font-medium" title="مشاهده فایل‌ها در گوگل درایو">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          <span>درایو</span>
        </a>`
      : `<span class="text-slate-300 text-[11px]">ندارد</span>`;

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
            <span>📑 ${formatPersianNumber(childrenCount)} نسخه وابسته</span>
          </div>
        ` : ''}
      </td>

      <td class="px-4 py-3">
        <div class="font-bold text-slate-900 text-xs">${escapeHtml(order.title)}</div>
        ${order.parentOrderId ? `<span class="text-[10px] text-amber-600 font-medium">نسخه ریسایز / اصلاحیه</span>` : ''}
      </td>

      <td class="px-4 py-3">
        <div class="font-medium text-slate-800">${escapeHtml(order.clientName || 'نامشخص')}</div>
        ${order.clientContact ? `<div class="text-[10px] text-slate-400 font-mono">${escapeHtml(order.clientContact)}</div>` : ''}
      </td>

      <td class="px-4 py-3">
        ${typeBadge}
        <div class="text-[11px] text-slate-500 mt-1 font-mono">${escapeHtml(order.formatSize || 'قطع نامشخص')}</div>
      </td>

      <td class="px-4 py-3 text-[11px] text-slate-600">
        <div>ثبت: ${formatPersianDate(order.dateOrdered)}</div>
        ${order.dateDelivered ? `<div class="text-emerald-600 mt-0.5">تحویل: ${formatPersianDate(order.dateDelivered)}</div>` : (order.dateDeadline ? `<div class="text-amber-600 mt-0.5">مهلت: ${formatPersianDate(order.dateDeadline)}</div>` : '')}
      </td>

      <td class="px-4 py-3">
        ${statusBadge}
      </td>

      <td class="px-4 py-3 font-semibold text-slate-700">
        ${formatPersianNumber(order.workHours)} ساعت
      </td>

      <td class="px-4 py-3">
        <div class="flex items-center gap-1">
          <span class="font-bold text-slate-900">${formatCurrency(order.totalFee)}</span>
          <span class="text-[10px] text-slate-400">تومان</span>
        </div>
        <div class="mt-1 flex items-center gap-1.5">
          ${paymentBadge}
          ${order.invoiceId ? `<span class="text-[10px] text-slate-400 font-mono">${escapeHtml(order.invoiceId)}</span>` : ''}
        </div>
      </td>

      <td class="px-4 py-3 text-center">
        ${driveBtn}
      </td>

      <td class="px-4 py-3 text-center">
        <div class="flex items-center justify-center gap-1.5">
          <!-- دکمه افزودن نسخه وابسته / ریسایز -->
          <button onclick="createVariantOrder('${escapeHtml(order.id)}')" title="ایجاد ریسایز / نسخه وابسته به این سفارش" class="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
          </button>

          <!-- دکمه ویرایش -->
          <button onclick="editOrder('${escapeHtml(order.id)}')" title="ویرایش سفارش" class="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>

          <!-- دکمه حذف -->
          <button onclick="deleteOrder('${escapeHtml(order.id)}')" title="حذف سفارش" class="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/**
 * فیلتر سریع بر اساس سفارش والد
 */
function filterByParent(parentId) {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = parentId;
    applyFilters();
  }
}

/**
 * بروزرسانی نمودارهای Chart.js
 */
function updateCharts(ordersList) {
  // ۱. نمودار توزیع سهم دیجیتال / چاپ / هردو
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
            labels: { font: { family: 'Vazirmatn' } }
          }
        },
        cutout: '68%'
      }
    });
  }

  // ۲. نمودار میله‌ای مالی: درآمد وصول‌شده در برابر طلب‌ها به تفکیک ماه‌ها
  const monthlyRevenue = {};
  const monthlyReceivables = {};

  ordersList.forEach(o => {
    const monthKey = (o.dateOrdered || '').slice(0, 7) || 'نامشخص';
    if (!monthlyRevenue[monthKey]) {
      monthlyRevenue[monthKey] = 0;
      monthlyReceivables[monthKey] = 0;
    }
    monthlyRevenue[monthKey] += Number(o.amountPaid) || 0;
    const rem = Number(o.remainingFee) || Math.max(0, (Number(o.totalFee) || 0) - (Number(o.amountPaid) || 0));
    if (o.paymentStatus !== 'Free') {
      monthlyReceivables[monthKey] += rem;
    }
  });

  const labels = Object.keys(monthlyRevenue).sort();
  const revData = labels.map(l => monthlyRevenue[l]);
  const recData = labels.map(l => monthlyReceivables[l]);

  const trendCtx = document.getElementById('revenueTrendChart')?.getContext('2d');
  if (trendCtx) {
    if (appState.charts.revenueTrend) {
      appState.charts.revenueTrend.destroy();
    }
    appState.charts.revenueTrend = new Chart(trendCtx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['داده‌ای موجود نیست'],
        datasets: [
          {
            label: 'درآمد وصول‌شده',
            data: revData.length ? revData : [0],
            backgroundColor: '#10b981',
            borderRadius: 6
          },
          {
            label: 'طلب‌های معوق',
            data: recData.length ? recData : [0],
            backgroundColor: '#fb7185',
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
            ticks: { font: { family: 'Vazirmatn' } }
          },
          y: {
            ticks: {
              font: { family: 'Vazirmatn' },
              callback: val => (val / 1000000).toLocaleString('fa-IR') + ' م'
            }
          }
        }
      }
    });
  }
}

/**
 * مدیریت فرم سفارش (ثبت یا ویرایش)
 */
function handleOrderFormSubmit(e) {
  e.preventDefault();

  const isFree = document.getElementById('formIsFree').checked;
  const totalFee = isFree ? 0 : (Number(document.getElementById('formTotalFee').value) || 0);
  const amountPaid = isFree ? 0 : (Number(document.getElementById('formAmountPaid').value) || 0);
  const remaining = Math.max(0, totalFee - amountPaid);

  let paymentStatus = 'Unpaid';
  if (isFree || totalFee === 0) {
    paymentStatus = 'Free';
  } else if (amountPaid >= totalFee && totalFee > 0) {
    paymentStatus = 'Paid';
  } else if (amountPaid > 0) {
    paymentStatus = 'Partial';
  }

  const orderId = document.getElementById('formOrderId').value;
  const isEdit = Boolean(orderId);

  const payload = {
    id: orderId || undefined,
    title: document.getElementById('formTitle').value.trim(),
    clientName: document.getElementById('formClientName').value.trim(),
    clientContact: document.getElementById('formClientContact').value.trim(),
    type: document.getElementById('formType').value,
    formatSize: document.getElementById('formFormatSize').value.trim(),
    dateOrdered: document.getElementById('formDateOrdered').value,
    dateDeadline: document.getElementById('formDateDeadline').value,
    dateDelivered: document.getElementById('formDateDelivered').value,
    status: document.getElementById('formStatus').value,
    workHours: Number(document.getElementById('formWorkHours').value) || 0,
    parentOrderId: document.getElementById('formParentOrderId').value,
    invoiceId: document.getElementById('formInvoiceId').value.trim(),
    totalFee: totalFee,
    amountPaid: amountPaid,
    remainingFee: remaining,
    paymentStatus: paymentStatus,
    filesLink: document.getElementById('formFilesLink').value.trim()
  };

  saveOrderApi(payload, isEdit);
}

/**
 * باز کردن مودال برای سفارش جدید
 */
function openOrderModal() {
  document.getElementById('orderForm').reset();
  document.getElementById('formOrderId').value = '';
  document.getElementById('orderModalTitle').textContent = 'ثبت سفارش جدید';
  document.getElementById('formDateOrdered').value = new Date().toISOString().split('T')[0];
  document.getElementById('formIsFree').checked = false;
  toggleFreeOrder(false);
  buildClientAndInvoiceLists();
  document.getElementById('orderModal').classList.remove('hidden');
}

/**
 * باز کردن مودال جهت ایجاد نسخه وابسته / ریسایز
 */
function createVariantOrder(parentOrderId) {
  const parent = appState.orders.find(o => o.id === parentOrderId);
  openOrderModal();
  if (parent) {
    document.getElementById('orderModalTitle').textContent = `افزودن ریسایز / نسخه وابسته به (${parent.title})`;
    document.getElementById('formParentOrderId').value = parent.id;
    document.getElementById('formClientName').value = parent.clientName || '';
    document.getElementById('formClientContact').value = parent.clientContact || '';
    document.getElementById('formTitle').value = `ریسایز: ${parent.title}`;
    document.getElementById('formInvoiceId').value = parent.invoiceId || '';
  }
}

/**
 * باز کردن مودال برای ویرایش سفارش موجود
 */
function editOrder(orderId) {
  const order = appState.orders.find(o => o.id === orderId);
  if (!order) return;

  buildClientAndInvoiceLists();
  document.getElementById('formOrderId').value = order.id;
  document.getElementById('orderModalTitle').textContent = `ویرایش سفارش (${order.id})`;
  document.getElementById('formTitle').value = order.title || '';
  document.getElementById('formClientName').value = order.clientName || '';
  document.getElementById('formClientContact').value = order.clientContact || '';
  document.getElementById('formType').value = order.type || 'Digital';
  document.getElementById('formFormatSize').value = order.formatSize || '';
  document.getElementById('formDateOrdered').value = order.dateOrdered || '';
  document.getElementById('formDateDeadline').value = order.dateDeadline || '';
  document.getElementById('formDateDelivered').value = order.dateDelivered || '';
  document.getElementById('formStatus').value = order.status || 'In Progress';
  document.getElementById('formWorkHours').value = order.workHours || 0;
  document.getElementById('formParentOrderId').value = order.parentOrderId || '';
  document.getElementById('formInvoiceId').value = order.invoiceId || '';
  document.getElementById('formTotalFee').value = order.totalFee || 0;
  document.getElementById('formAmountPaid').value = order.amountPaid || 0;
  document.getElementById('formFilesLink').value = order.filesLink || '';

  const isFree = order.paymentStatus === 'Free' || (Number(order.totalFee) === 0);
  document.getElementById('formIsFree').checked = isFree;
  toggleFreeOrder(isFree);

  document.getElementById('orderModal').classList.remove('hidden');
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.add('hidden');
}

/**
 * فعال/غیرفعال کردن حالت رایگان در فرم
 */
function toggleFreeOrder(isFree) {
  const container = document.getElementById('financeInputsContainer');
  const feeInput = document.getElementById('formTotalFee');
  const paidInput = document.getElementById('formAmountPaid');

  if (isFree) {
    feeInput.value = 0;
    paidInput.value = 0;
    feeInput.disabled = true;
    paidInput.disabled = true;
    container.classList.add('opacity-50');
  } else {
    feeInput.disabled = false;
    paidInput.disabled = false;
    container.classList.remove('opacity-50');
  }
}

/**
 * مودال تنظیمات URL گوگل اپس اسکریپت
 */
function openSettingsModal() {
  document.getElementById('gasUrlInput').value = appState.gasUrl;
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

/**
 * توابع کمکی تبدیل و فرمت‌بندی
 */
function formatPersianNumber(n) {
  if (n === null || n === undefined || isNaN(n)) return '۰';
  return Number(n).toLocaleString('fa-IR');
}

function formatCurrency(n) {
  if (!n || isNaN(n)) return '۰';
  return Number(n).toLocaleString('fa-IR');
}

function formatPersianDate(dateStr) {
  if (!dateStr) return '-';
  return dateStr;
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
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">در حال طراحی</span>`;
    case 'Review':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">بازبینی کارفرما</span>`;
    case 'Completed':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200">تکمیل‌شده</span>`;
    case 'Delivered':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">تحویل داده‌شده</span>`;
    case 'Canceled':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">لغوشده</span>`;
    default:
      return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">${status || 'نامشخص'}</span>`;
  }
}

function getPaymentBadge(status, remaining) {
  if (status === 'Free') {
    return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">رایگان</span>`;
  } else if (status === 'Paid') {
    return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">تسویه کامل</span>`;
  } else if (status === 'Partial') {
    return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">قسطی (طلب: ${formatCurrency(remaining)})</span>`;
  }
  return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">طلب تسویه‌نشده</span>`;
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
