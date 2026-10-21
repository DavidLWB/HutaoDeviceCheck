/* Hutao Hardware Book - interface */
(function () {
  'use strict';

  var E = window.DeviceLensEnv;
  var R = window.DeviceLensReport;
  var VIEW = document.body && document.body.dataset.view === 'mobile' ? 'mobile' : 'desktop';
  var OTHER_PAGE = VIEW === 'mobile' ? 'desktop.html' : 'mobile.html';
  var appRoot = document.getElementById('app');

  if (!E || !R) {
    if (appRoot) {
      appRoot.innerHTML = '<div class="boot-fallback"><div class="boot-card"><div><p>界面组件未能加载。</p><noscript>请启用 JavaScript 后重试。</noscript></div></div></div>';
    }
    return;
  }

  var SECTIONS = [
    { id: 'overview', label: '概览', en: 'Overview', icon: 'overview', desc: '关键硬件、显示与运行环境一览。' },
    { id: 'system', label: '系统与硬件', en: 'System & Hardware', icon: 'system', desc: '操作系统、处理器、内存、电源与输入能力。' },
    { id: 'display', label: '屏幕显示', en: 'Display', icon: 'display', desc: '分辨率、色域、HDR、刷新率与目视测试。' },
    { id: 'graphics', label: '图形性能', en: 'Graphics', icon: 'graphics', desc: 'GPU 型号、渲染后端与 WebGL / WebGPU 能力。' },
    { id: 'browser', label: '浏览器内核', en: 'Browser & Engine', icon: 'browser', desc: '浏览器版本、渲染内核、语言与浏览器偏好。' },
    { id: 'network', label: '网络与存储', en: 'Network & Storage', icon: 'network', desc: '连接状态、公网 IP 查询、存储配额与页面运行环境。' },
    { id: 'media', label: '媒体与输入', en: 'Media & Input', icon: 'media', desc: '摄像头、音频、媒体解码与传感器接口。' },
    { id: 'features', label: '特性支持', en: 'Capabilities', icon: 'features', desc: '当前浏览器与设备开放的 Web API。' },
    { id: 'raw', label: '原始数据', en: 'Raw Data', icon: 'code', desc: '完整报告的原始 JSON 数据，便于进一步排查。' }
  ];

  var ICONS = {
    overview: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.7"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.7"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.7"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.7"/>',
    system: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9.5 3.5v3.5M14.5 3.5v3.5M9.5 17v3.5M14.5 17v3.5M3.5 9.5H7M3.5 14.5H7M17 9.5h3.5M17 14.5h3.5"/>',
    display: '<rect x="2.8" y="4.2" width="18.4" height="12.6" rx="2"/><path d="M8.5 20.5h7M12 16.8v3.7"/>',
    graphics: '<path d="m12 3.2 8.3 4.5L12 12.2 3.7 7.7 12 3.2Z"/><path d="m3.7 12 8.3 4.5 8.3-4.5"/><path d="m3.7 16.2 8.3 4.5 8.3-4.5"/>',
    browser: '<circle cx="12" cy="12" r="8.6"/><path d="M3.6 12h16.8M12 3.4c2.2 2.3 3.4 5.2 3.4 8.6s-1.2 6.3-3.4 8.6c-2.2-2.3-3.4-5.2-3.4-8.6S9.8 5.7 12 3.4Z"/>',
    network: '<path d="M3.2 8.7a13 13 0 0 1 17.6 0"/><path d="M6.5 12.2a8.2 8.2 0 0 1 11 0"/><path d="M9.7 15.7a3.8 3.8 0 0 1 4.6 0"/><circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none"/>',
    media: '<path d="M4 14.5v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13.3" width="4.2" height="7" rx="2.1"/><rect x="16.8" y="13.3" width="4.2" height="7" rx="2.1"/>',
    features: '<path d="m12 3 1.6 4.6L18 9.2l-4.4 1.6L12 15.4l-1.6-4.6L6 9.2l4.4-1.6L12 3Z"/><path d="m18.4 15 .8 2.2 2.3.8-2.3.8-.8 2.2-.8-2.2-2.3-.8 2.3-.8.8-2.2Z"/>',
    code: '<path d="m8.2 7.6-4.5 4.4 4.5 4.4M15.8 7.6l4.5 4.4-4.5 4.4M13.6 4.8l-3.2 14.4"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>',
    import: '<path d="M12 3v11M8 10l4 4 4-4"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    export: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.1"/><path d="M20 5v6h-6"/>',
    back: '<path d="m9 6-6 6 6 6M3 12h18"/>',
    check: '<path d="m5 12 4.2 4.2L19 6.4"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    minus: '<path d="M6 12h12"/>',
    info: '<circle cx="12" cy="12" r="8.8"/><path d="M12 11v5.2M12 7.8v.2"/>',
    lock: '<rect x="4.5" y="10" width="15" height="10.5" rx="2.3"/><path d="M8 10V7.2a4 4 0 0 1 8 0V10"/>',
    warning: '<path d="M12 3.7 21 20H3L12 3.7Z"/><path d="M12 9v4.5M12 17v.2"/>',
    file: '<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h5"/><path d="M9 12h6M9 16h4"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    phone: '<rect x="6.7" y="2.5" width="10.6" height="19" rx="2.6"/><path d="M10.4 5.5h3.2"/>',
    desktop: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    theme: '<path d="M12 3.2v2.1M12 18.7v2.1M3.2 12h2.1M18.7 12h2.1M5.8 5.8l1.5 1.5M16.7 16.7l1.5 1.5M18.2 5.8l-1.5 1.5M7.3 16.7l-1.5 1.5"/><circle cx="12" cy="12" r="4.1"/>',
    moon: '<path d="M20.2 14.2A8.6 8.6 0 0 1 9.8 3.8a8.7 8.7 0 1 0 10.4 10.4Z"/>',
    clock: '<circle cx="12" cy="12" r="8.7"/><path d="M12 7v5.3l3.4 2"/>',
    activity: '<path d="M3 12h4l2.2-6.4L14.5 19 17 12h4"/>',
    shield: '<path d="M12 3 20 6v5.6c0 4.6-3.3 7.7-8 9.4-4.7-1.7-8-4.8-8-9.4V6l8-3Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>'
  };

  function icon(name, className) {
    return '<svg class="icon' + (className ? ' ' + className : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.info) + '</svg>';
  }

  function brandMark() {
    return '<span class="brand-mark" aria-hidden="true"><img src="assets/logo.png" alt=""></span>';
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isUnavailableValue(value) {
    var text = value === null || value === undefined ? '' : String(value).trim();
    if (!text || text === '—' || text === '未公开' || text === '未知' || text === '状态未知') return true;
    if (/^浏览器未(公开|提供)/.test(text)) return true;
    if (/^此浏览器不提供/.test(text)) return true;
    return text === '不可用或未公开';
  }

  function getInitialSection() {
    var hash = '';
    try { hash = decodeURIComponent(location.hash.replace(/^#/, '')); } catch (error) { hash = ''; }
    for (var i = 0; i < SECTIONS.length; i += 1) {
      if (SECTIONS[i].id === hash) return hash;
    }
    return 'overview';
  }

  function getSection(id) {
    for (var i = 0; i < SECTIONS.length; i += 1) {
      if (SECTIONS[i].id === id) return SECTIONS[i];
    }
    return SECTIONS[0];
  }

  function isSectionId(id) {
    return SECTIONS.some(function (section) { return section.id === id; });
  }

  var state = {
    env: null,
    localReport: null,
    report: null,
    source: 'local',
    importedFileName: '',
    section: getInitialSection(),
    loading: true,
    remeasuring: false,
    requestingScreen: false,
    requestingMedia: false,
    requestingAllPermissions: false,
    permissionsAutoAttempted: false,
    toastTimer: null
  };

  function sourcePillMarkup() {
    return '<span class="source-pill" id="source-pill"><span class="dot"></span><span id="source-pill-text">正在读取…</span></span>';
  }

  function desktopNavMarkup() {
    return SECTIONS.map(function (section) {
      var active = state.section === section.id;
      return '<button type="button" class="nav-item' + (active ? ' is-active' : '') + '" data-section="' + section.id + '"' +
        ' aria-label="' + escapeHtml(section.label) + '" title="' + escapeHtml(section.label) + '"' +
        (active ? ' aria-current="page"' : '') + (state.report ? '' : ' disabled') + '>' +
        icon(section.icon) + '<span class="nav-label">' + escapeHtml(section.label) + '</span></button>';
    }).join('');
  }

  function mobileNavMarkup() {
    var tabs = SECTIONS.map(function (section) {
      var active = state.section === section.id;
      return '<button type="button" class="mobile-tab' + (active ? ' is-active' : '') + '" data-section="' + section.id + '"' +
        ' aria-label="' + escapeHtml(section.label) + '" title="' + escapeHtml(section.label) + '"' +
        (active ? ' aria-current="page"' : '') + (state.report ? '' : ' disabled') + '>' +
        icon(section.icon) + '<span>' + escapeHtml(section.label) + '</span></button>';
    }).join('');
    return tabs + '<a class="mobile-tab mobile-tab-about" href="about.html" aria-label="关于' + E.APP.name + '" title="关于' + E.APP.name + '">' +
      icon('info') + '<span>关于</span></a>';
  }

  function themeToggleMarkup(mode) {
    var moon = '<span class="theme-glyph theme-glyph-moon">' + icon('moon') + '</span>';
    var sun = '<span class="theme-glyph theme-glyph-sun">' + icon('theme') + '</span>';
    if (mode === 'mobile') {
      return '<button type="button" class="mobile-command theme-toggle" data-theme-toggle aria-label="切换主题" title="切换亮色或暗色主题">' +
        moon + sun + '<span>主题</span></button>';
    }
    return '<button type="button" class="icon-btn theme-toggle" data-theme-toggle aria-label="切换主题" title="切换亮色或暗色主题">' +
      moon + sun + '</button>';
  }

  function footerMarkup() {
    return '<div class="footer-inner">' +
      '<span>' + E.APP.name + ' v' + E.APP.version + ' · ' + E.APP.tagline + '</span>' +
      '<a href="about.html">' + icon('info') + '关于' + E.APP.name + '</a>' +
      '</div>';
  }

  function globalMarkup() {
    return '<input type="file" id="import-input" accept=".json,application/json" hidden>' +
      '<dialog class="dialog" id="message-dialog" aria-labelledby="dialog-title">' +
      '<div class="dialog-inner">' +
      '<div class="dialog-head"><div class="dialog-icon">' + icon('warning') + '</div>' +
      '<div><h2 id="dialog-title">无法继续</h2><p id="dialog-body"></p></div></div>' +
      '<div class="dialog-actions"><button type="button" class="btn btn-primary" data-action="close-dialog">好</button></div>' +
      '</div></dialog>' +
      '<div class="toast" id="toast" role="status" aria-live="polite"><span class="toast-icon">' + icon('check') + '</span><span id="toast-text"></span></div>';
  }

  function desktopShell() {
    return '<div class="desktop-shell">' +
      '<aside class="side-nav">' +
      '<a class="brand" href="index.html" aria-label="' + E.APP.name + '，返回自动识别">' +
      brandMark() + '<span class="brand-copy"><span class="brand-name">' + E.APP.name + '</span><span class="brand-sub">' + E.APP.tagline + '</span></span></a>' +
      '<a class="side-switch" href="' + OTHER_PAGE + '" aria-label="切换到手机端和平板检测">' +
      '<span class="side-switch-icon">' + icon('phone') + '</span>' +
      '<span class="side-switch-copy"><strong>手机 / 平板检测</strong><small>Android · iOS · HarmonyOS</small></span>' +
      icon('chevron') +
      '</a>' +
      '<div class="nav-caption">检测项目</div>' +
      '<nav class="side-nav-list" id="side-nav" aria-label="设备信息分类">' + desktopNavMarkup() + '</nav>' +
      '<div class="side-nav-bottom">' +
      '<div class="side-companion" data-live2d-slot></div>' +
      '<div class="side-nav-footer">' +
      '<a class="side-foot-link" href="about.html" aria-label="关于' + E.APP.name + '" title="关于' + E.APP.name + '">' + icon('info') + '<span>关于' + E.APP.name + '</span></a>' +
      '<div class="side-foot-row"><span>' + E.APP.name + ' v' + E.APP.version + '</span></div>' +
      '</div>' +
      '</div>' +
      '</aside>' +
      '<div class="main-pane">' +
      '<header class="app-topbar">' +
      '<div class="topbar-left">' + sourcePillMarkup() +
      '<span class="crumb" id="topbar-crumb" aria-live="polite"><strong>概览</strong></span>' +
      '</div>' +
      '<div class="top-actions">' +
      '<button type="button" class="btn" data-action="copy-summary" disabled>' + icon('copy') + '<span>复制摘要</span></button>' +
      '<button type="button" class="btn" data-action="import" disabled>' + icon('import') + '<span>导入报告</span></button>' +
      themeToggleMarkup('desktop') +
      '<span class="divider"></span>' +
      '<button type="button" class="btn btn-primary" data-action="export" disabled>' + icon('export') + '<span>导出报告</span></button>' +
      '</div>' +
      '</header>' +
      '<main class="page-content" id="main-content" tabindex="-1" aria-busy="true"></main>' +
      '<footer class="page-footer">' + footerMarkup() + '</footer>' +
      '</div></div>' + globalMarkup();
  }

  function mobileShell() {
    return '<div class="mobile-shell">' +
      '<div class="mobile-chrome">' +
      '<header class="mobile-topbar">' +
      '<a class="brand" href="index.html" aria-label="' + E.APP.name + '，返回自动识别">' + brandMark() +
      '<span class="brand-copy"><span class="brand-name">' + E.APP.name + '</span>' +
      '<span class="mobile-source-line" id="mobile-source-line"><span class="dot"></span><span id="mobile-source-text">' + E.APP.tagline + '</span></span>' +
      '</span></a>' +
      '<div class="mobile-commands">' +
      '<button type="button" class="mobile-command" data-action="copy-summary" title="复制设备摘要" aria-label="复制设备摘要" disabled>' + icon('copy') + '<span>复制</span></button>' +
      '<button type="button" class="mobile-command" data-action="import" title="导入设备报告" aria-label="导入设备报告" disabled>' + icon('import') + '<span>导入</span></button>' +
      '<button type="button" class="mobile-command" data-action="export" title="导出设备报告" aria-label="导出设备报告" disabled>' + icon('export') + '<span>导出</span></button>' +
      themeToggleMarkup('mobile') +
      '<a class="mobile-switch" href="' + OTHER_PAGE + '" title="切换到电脑端检测" aria-label="切换到电脑端检测">' + icon('desktop') + '<span>电脑端</span></a>' +
      '</div>' +
      '</header>' +
      '<div class="mobile-tabs-wrap"><nav class="mobile-tabs" id="mobile-nav" aria-label="设备信息分类">' + mobileNavMarkup() + '</nav></div>' +
      '</div>' +
      '<main class="mobile-main" id="main-content" tabindex="-1" aria-busy="true"></main>' +
      '<footer class="mobile-page-footer">' + footerMarkup() + '</footer>' +
      globalMarkup() +
      '</div>';
  }

  function skeletonMarkup() {
    return '<div class="skeleton-shell" aria-label="正在读取设备信息">' +
      '<div class="skeleton-hero"><div class="skeleton-hero-inner">' +
      '<div class="skeleton-line w-30"></div><div class="skeleton-line w-70"></div>' +
      '<div class="skeleton-line w-50"></div><div class="skeleton-line w-90"></div>' +
      '<div class="skeleton-note"><span class="spinner" aria-hidden="true"></span>正在读取设备信息并采样刷新率，约需 1 秒…</div>' +
      '</div></div>' +
      '<div class="skeleton-grid"><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div>' +
      '<div class="skeleton-group-grid"><div class="skeleton-group"></div><div class="skeleton-group"></div></div>' +
      '</div>';
  }

  function getMain() {
    return document.getElementById('main-content');
  }

  function getSourceLabel() {
    if (state.loading) return '正在读取…';
    if (!state.report) return '读取受限';
    if (state.source === 'import') return '导入报告';
    return '本机设备';
  }

  function updateChrome() {
    var pill = document.getElementById('source-pill');
    var pillText = document.getElementById('source-pill-text');
    var mobileLine = document.getElementById('mobile-source-line');
    var mobileText = document.getElementById('mobile-source-text');
    var label = getSourceLabel();
    if (pill) pill.classList.toggle('is-imported', state.source === 'import' && Boolean(state.report));
    if (pillText) pillText.textContent = label;
    if (mobileLine) mobileLine.classList.toggle('is-imported', state.source === 'import' && Boolean(state.report));
    if (mobileText) {
      if (state.loading) mobileText.textContent = '正在读取…';
      else if (!state.report) mobileText.textContent = '读取受限';
      else if (state.source === 'import') mobileText.textContent = '导入报告 · 非本机';
      else mobileText.textContent = E.APP.tagline;
    }

    var section = getSection(state.section);
    var crumb = document.getElementById('topbar-crumb');
    if (crumb) {
      crumb.innerHTML = '<strong>' + escapeHtml(state.loading ? '设备检测' : section.label) + '</strong>';
    }

    var canRead = Boolean(state.report) && !state.loading;
    document.querySelectorAll('[data-action="copy-summary"], [data-action="export"]').forEach(function (button) {
      button.disabled = !canRead;
    });
    document.querySelectorAll('[data-action="import"]').forEach(function (button) {
      button.disabled = state.loading;
    });
    document.querySelectorAll('[data-section]').forEach(function (button) {
      button.disabled = state.loading || !state.report;
    });

    var baseTitle = VIEW === 'mobile' ? '手机端设备检测 · ' + E.APP.name : '电脑端设备检测 · ' + E.APP.name;
    if (state.source === 'import' && state.report && state.report.summary) {
      document.title = (state.report.summary.model || state.report.summary.os || '设备') + ' · 导入报告 · ' + E.APP.name;
    } else {
      document.title = baseTitle;
    }
  }

  function refreshNavigation(scrollTab) {
    var active = null;
    document.querySelectorAll('[data-section]').forEach(function (button) {
      var isActive = button.getAttribute('data-section') === state.section;
      button.classList.toggle('is-active', isActive);
      if (isActive) {
        button.setAttribute('aria-current', 'page');
        active = button;
      } else {
        button.removeAttribute('aria-current');
      }
    });
    if (active && VIEW === 'mobile') {
      var scroller = document.getElementById('mobile-nav');
      if (scroller) {
        var left = active.offsetLeft - (scroller.clientWidth - active.offsetWidth) / 2;
        try {
          scroller.scrollTo({ left: Math.max(0, left), behavior: scrollTab === false ? 'auto' : 'smooth' });
        } catch (error) {
          scroller.scrollLeft = Math.max(0, left);
        }
      }
    }
  }

  function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    var iconBox = toast.querySelector('.toast-icon');
    var text = document.getElementById('toast-text');
    if (iconBox) iconBox.innerHTML = icon(type === 'error' ? 'warning' : 'check');
    if (text) text.textContent = message;
    toast.classList.toggle('is-error', type === 'error');
    toast.classList.add('is-visible');
    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
      state.toastTimer = null;
    }, type === 'error' ? 3800 : 2800);
  }

  function showDialog(title, message) {
    var dialog = document.getElementById('message-dialog');
    var heading = document.getElementById('dialog-title');
    var body = document.getElementById('dialog-body');
    if (!dialog) {
      window.alert(title + '\n\n' + message);
      return;
    }
    if (heading) heading.textContent = title;
    if (body) body.textContent = message;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      window.alert(title + '\n\n' + message);
    }
  }

  function closeDialog() {
    var dialog = document.getElementById('message-dialog');
    if (dialog && dialog.open && typeof dialog.close === 'function') dialog.close();
  }

  function selectSection(id, options) {
    var opts = options || {};
    if (!isSectionId(id) || (!state.report && id !== state.section)) return;
    state.section = id;
    try { history.replaceState(null, '', '#' + id); } catch (error) {}
    renderContent({ animate: true });
    updateChrome();
    refreshNavigation();
    if (opts.scroll !== false) {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  function renderLoadingView() {
    var main = getMain();
    if (!main) return;
    main.setAttribute('aria-busy', 'true');
    main.innerHTML = skeletonMarkup();
  }

  function renderErrorView() {
    var main = getMain();
    if (!main) return;
    main.setAttribute('aria-busy', 'false');
    main.innerHTML = '<section aria-labelledby="error-title">' +
      '<div class="section-head"><div class="section-title-wrap"><div class="eyebrow"><span class="dot"></span>DETECTION FAILED</div>' +
      '<h1 id="error-title">未能完成设备检测</h1><p>浏览器在读取设备信息时遇到了问题。你仍然可以导入其他设备之前导出的报告。</p></div></div>' +
      '<div class="error-card">' +
      '<div class="error-icon">' + icon('warning') + '</div>' +
      '<div class="error-copy"><h2>读取受限</h2><p>请确认浏览器未禁用 JavaScript 与必要权限，然后重新检测。若问题持续出现，可尝试刷新页面或更换浏览器。</p></div>' +
      '<div class="error-actions"><button type="button" class="btn btn-primary" data-action="retry">' + icon('refresh') + '重新检测</button>' +
      '<button type="button" class="btn" data-action="import">' + icon('import') + '导入报告</button></div>' +
      '</div></section>';
  }

  async function startDetection() {
    state.loading = true;
    state.report = null;
    state.source = 'local';
    state.importedFileName = '';
    state.permissionAutoAttempted = false;
    updateChrome();
    refreshNavigation(false);
    renderLoadingView();
    try {
      var env = await E.collectEnvironment();
      state.env = env;
      state.localReport = R.buildReport(env);
      state.report = state.localReport;
      state.loading = false;
      updateChrome();
      refreshNavigation(false);
      renderContent({ animate: true });
      maybeAutoRequestPermissions();
    } catch (error) {
      state.loading = false;
      state.report = null;
      updateChrome();
      refreshNavigation(false);
      renderErrorView();
      if (window.console && console.error) console.error('Hutao Hardware Book detection failed:', error);
    }
  }

  function readFileText(file) {
    if (typeof file.text === 'function') return file.text();
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(new Error('文件读取失败。')); };
      reader.readAsText(file, 'utf-8');
    });
  }

  function validateImportedReport(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('文件内容不是有效的设备报告对象。');
    }
    var acceptedSchemas = [E.APP.schema].concat(E.APP.legacySchemas || []);
    if (acceptedSchemas.indexOf(data.schema) === -1) {
      throw new Error('该文件不是' + E.APP.name + '生成的报告，或报告格式不受支持。');
    }
    if (Number(data.schemaVersion) !== E.APP.schemaVersion) {
      throw new Error('该报告的数据版本与当前页面不兼容，请使用相同版本的' + E.APP.name + '生成报告。');
    }
    if (!data.summary || typeof data.summary !== 'object' || Array.isArray(data.summary)) {
      throw new Error('报告缺少设备摘要（summary）数据。');
    }
    if (!data.sections || typeof data.sections !== 'object' || Array.isArray(data.sections)) {
      throw new Error('报告缺少分类数据（sections）。');
    }
    if (!data.meta || typeof data.meta !== 'object') {
      data.meta = {
        app: E.APP.name,
        appVersion: '未知',
        detectedAt: new Date().toISOString(),
        pageView: data.summary.pageLabel === '电脑端检测' ? 'desktop' : 'mobile'
      };
    }
    return data;
  }

  async function handleImportFile(file) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showDialog('文件过大', '设备报告文件应小于 4 MB。请确认选择的是' + E.APP.name + '导出的 JSON 报告。');
      return;
    }
    try {
      var text = await readFileText(file);
      var parsed;
      try {
        parsed = JSON.parse(text.replace(/^\uFEFF/, ''));
      } catch (error) {
        throw new Error('无法解析 JSON 文件，请确认文件内容完整且未被修改。');
      }
      var report = validateImportedReport(parsed);
      state.report = report;
      state.source = 'import';
      state.importedFileName = file.name || '设备报告.json';
      state.section = 'overview';
      try { history.replaceState(null, '', '#overview'); } catch (error) {}
      updateChrome();
      refreshNavigation(false);
      renderContent({ animate: true });
      window.scrollTo({ top: 0, behavior: 'auto' });
      showToast('已导入 ' + (file.name || '设备报告') + '，正在查看导入数据。');
    } catch (error) {
      showDialog('无法导入报告', error && error.message ? error.message : '读取文件时出现未知错误。');
    }
  }

  function returnToLocal() {
    if (!state.localReport) return;
    state.report = state.localReport;
    state.source = 'local';
    state.importedFileName = '';
    updateChrome();
    refreshNavigation(false);
    renderContent({ animate: true });
    showToast('已返回本机设备信息。');
  }

  function buildFileName(report) {
    var summary = report.summary || {};
    var meta = report.meta || {};
    var name = String(summary.model || 'device')
      .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 36) || 'device';
    var now = new Date();
    var date = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
    var time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    var page = meta.pageView === 'mobile' ? 'mobile' : 'desktop';
    return 'hutao-hardware-book_' + page + '_' + name + '_' + date + '-' + time + '.json';
  }

  function exportReport() {
    if (!state.report) return;
    try {
      var payload = JSON.parse(JSON.stringify(state.report));
      payload.meta = payload.meta || {};
      payload.meta.exportedAt = new Date().toISOString();
      payload.meta.exportedFrom = state.source === 'import' ? 'imported-copy' : 'live-detection';
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = buildFileName(payload);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2500);
      showToast('报告已导出为 JSON 文件。');
    } catch (error) {
      showToast('导出失败，请稍后重试。', 'error');
      if (window.console && console.error) console.error(error);
    }
  }

  function buildSummaryText(report) {
    var summary = report.summary || {};
    var meta = report.meta || {};
    var lines = [E.APP.name + ' · 设备报告摘要'];
    function available(value) {
      return value && !isUnavailableValue(value) ? String(value) : '';
    }
    function line(label, parts) {
      var values = parts.map(available).filter(Boolean);
      if (values.length) lines.push(label + '：' + values.join(' · '));
    }
    if (summary.model) lines.push('设备型号：' + summary.model);
    line('类型', [summary.formFactorLabel, summary.pageLabel || E.viewLabel(meta.pageView)]);
    line('系统', [summary.os, summary.architecture]);
    line('处理器与内存', [summary.cpu, summary.memory]);
    line('屏幕', [getEstimatedPhysicalScreen(summary) || summary.screen, summary.refreshRate, summary.hdr]);
    var gpuText = available(summary.gpu);
    line('GPU', [gpuText ? gpuText + (summary.gpuVendor ? '（' + summary.gpuVendor + '）' : '') : '']);
    line('浏览器', [summary.browser, summary.engine]);
    line('网络', [summary.network]);
    lines.push('检测时间：' + E.formatDateTime(meta.detectedAt));
    if (state.source === 'import') lines.push('来源：导入的设备报告（' + (state.importedFileName || '本地文件') + '）');
    lines.push('由' + E.APP.name + '在浏览器中生成');
    return lines.join('\n');
  }

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    area.style.top = '0';
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, area.value.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
    area.remove();
    return ok;
  }

  async function copyText(text, successMessage) {
    var copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (error) {
        copied = fallbackCopy(text);
      }
    } else {
      copied = fallbackCopy(text);
    }
    if (copied) showToast(successMessage);
    else showToast('复制失败，请手动选择文本。', 'error');
  }

  function copySummary() {
    if (!state.report) return;
    copyText(buildSummaryText(state.report), '设备摘要已复制到剪贴板。');
  }

  function copyRawReport() {
    if (!state.report) return;
    try {
      copyText(JSON.stringify(state.report, null, 2), '完整报告 JSON 已复制。');
    } catch (error) {
      showToast('复制失败，请手动选择 JSON 文本。', 'error');
    }
  }

  async function remeasureRefresh(button) {
    if (!state.env || state.remeasuring || state.source !== 'local') return;
    state.remeasuring = true;
    if (button) {
      button.classList.add('is-busy');
      button.disabled = true;
      button.innerHTML = '<span class="spinner" aria-hidden="true"></span>测量中…';
    }
    var success = false;
    var failureMessage = '未能测出刷新率，请保持页面在前台后重试。';
    try {
      var measurement = await E.readRefreshRate(1100);
      if (measurement && measurement.hz) {
        success = true;
        state.env.refreshMeasurement = measurement;
        state.env.collectedAt = new Date().toISOString();
        state.localReport = R.buildReport(state.env);
      } else if (measurement && measurement.reason === 'hidden') {
        failureMessage = '页面在后台，无法测量刷新率。请返回前台后重试。';
      }
    } catch (error) {
      failureMessage = '刷新率测量失败，请稍后重试。';
    }
    state.remeasuring = false;
    if (state.source === 'local') {
      if (success) state.report = state.localReport;
      renderContent({ animate: success });
    }
    if (success) {
      showToast('刷新率已更新：' + E.formatRefresh(state.env.refreshMeasurement.hz) + ' Hz。');
    } else {
      showToast(failureMessage, 'error');
    }
  }

  function permissionErrorDetails(error, scope) {
    if (error && error.name === 'NotAllowedError') {
      return {
        title: '权限不足',
        message: scope === 'screen'
          ? '屏幕详情权限被拒绝，未能读取多显示器信息。基础屏幕信息仍然可用，可在浏览器站点设置中恢复权限后重试。'
          : '摄像头或麦克风权限被拒绝，未能读取设备名称。其他检测项不受影响，可在浏览器站点设置中恢复权限后重试。'
      };
    }
    if (error && error.name === 'NotFoundError') {
      return { title: '未找到设备', message: '浏览器未找到可用的摄像头或麦克风，无法读取设备名称。' };
    }
    if (error && error.name === 'NotReadableError') {
      return { title: '设备不可用', message: '摄像头或麦克风可能正被其他应用占用，或系统拒绝了访问。请关闭占用设备的应用后重试。' };
    }
    if (error && error.name === 'NotSupportedError') {
      return { title: '无法获取更多信息', message: error.message || '当前浏览器不支持该权限或接口。' };
    }
    return {
      title: scope === 'screen' ? '无法读取屏幕详情' : '无法读取设备名称',
      message: '浏览器未能完成授权或读取操作，请稍后重试。基础检测数据仍然可用。'
    };
  }

  async function refreshPermissions() {
    try {
      state.env.permissions = await E.queryPermissions();
    } catch (error) {}
  }

  async function requestScreenPermission(button) {
    if (!state.env || state.source !== 'local' || state.requestingScreen || state.requestingAllPermissions) return;
    state.requestingScreen = true;
    if (button) {
      button.classList.add('is-busy');
      button.disabled = true;
      button.innerHTML = '<span class="spinner" aria-hidden="true"></span>等待授权…';
    }
    var success = false;
    var failure = null;
    try {
      state.env.screenDetails = await E.requestScreenDetails();
      state.env.screenDetailsError = '';
      success = true;
    } catch (error) {
      failure = permissionErrorDetails(error, 'screen');
      state.env.screenDetailsError = failure.message;
    }
    await refreshPermissions();
    if (success) {
      if (!state.env.permissions) state.env.permissions = {};
      state.env.permissions['window-management'] = 'granted';
    } else if (failure && failure.title === '权限不足' && state.env.permissions) {
      state.env.permissions['window-management'] = 'denied';
    }
    state.env.permissionsUpdatedAt = new Date().toISOString();
    state.requestingScreen = false;
    state.localReport = R.buildReport(state.env);
    if (state.source === 'local') {
      state.report = state.localReport;
      renderContent({ animate: true });
    }
    if (success) {
      showToast('详细屏幕信息已更新。');
    } else if (failure) {
      showDialog(failure.title, failure.message);
    }
  }

  async function requestMediaPermission(button) {
    if (!state.env || state.source !== 'local' || state.requestingMedia || state.requestingAllPermissions) return;
    state.requestingMedia = true;
    if (button) {
      button.classList.add('is-busy');
      button.disabled = true;
      button.innerHTML = '<span class="spinner" aria-hidden="true"></span>等待授权…';
    }
    var success = false;
    var failure = null;
    try {
      var result = await E.requestMediaDeviceAccess();
      state.env.mediaDevices = result.devices || state.env.mediaDevices;
      state.env.mediaPermissionError = '';
      success = true;
    } catch (error) {
      failure = permissionErrorDetails(error, 'media');
      state.env.mediaPermissionError = failure.message;
    }
    await refreshPermissions();
    if (!success && failure && failure.title === '权限不足' && state.env.permissions) {
      if (state.env.permissions.camera !== 'granted') state.env.permissions.camera = 'denied';
      if (state.env.permissions.microphone !== 'granted') state.env.permissions.microphone = 'denied';
    }
    state.env.permissionsUpdatedAt = new Date().toISOString();
    state.requestingMedia = false;
    state.localReport = R.buildReport(state.env);
    if (state.source === 'local') {
      state.report = state.localReport;
      renderContent({ animate: true });
    }
    if (success) {
      showToast('媒体设备信息已更新。');
    } else if (failure) {
      showDialog(failure.title, failure.message);
    }
  }

  function permissionStatusText(status) {
    if (status === 'denied') return '已拒绝';
    if (status === 'granted') return '已授权但未取得信息';
    if (status === 'unsupported') return '浏览器未提供状态';
    return '未授权';
  }

  function mediaPermissionState(camera, microphone) {
    var states = [camera, microphone].filter(function (value) {
      return value && value !== 'unsupported';
    });
    if (!states.length) return 'unsupported';
    if (states.indexOf('denied') !== -1) {
      return states.every(function (value) { return value === 'denied'; }) ? 'denied' : 'partial';
    }
    if (states.indexOf('granted') !== -1) return 'granted';
    return 'prompt';
  }

  function mediaPermissionStatusText(status) {
    if (status === 'denied') return '已拒绝';
    if (status === 'partial') return '部分被拒绝';
    if (status === 'granted') return '已授权但未取得设备名称';
    if (status === 'unsupported') return '浏览器未提供状态';
    return '未授权';
  }

  function getPermissionNeeds() {
    var needs = { screen: false, media: false, screenDenied: false, mediaDenied: false, items: [] };
    if (!state.env || state.source !== 'local') return needs;
    var permissions = state.env.permissions || {};
    if (permissions.screenDetailsSupported && !state.env.screenDetails) {
      var screenState = permissions['window-management'] || 'prompt';
      needs.screen = true;
      needs.screenDenied = screenState === 'denied';
      needs.items.push({ label: '多屏详情', status: permissionStatusText(screenState) });
    }
    var devices = state.env.mediaDevices;
    var counts = devices && devices.counts ? devices.counts : {};
    var hasInput = (counts.videoinput || 0) + (counts.audioinput || 0) > 0;
    if (permissions.mediaCaptureSupported && !(devices && devices.labelled) && hasInput) {
      var mediaState = mediaPermissionState(permissions.camera, permissions.microphone);
      needs.media = true;
      needs.mediaDenied = mediaState === 'denied' || mediaState === 'partial';
      needs.items.push({ label: '摄像头 / 麦克风设备名称', status: mediaPermissionStatusText(mediaState) });
    }
    return needs;
  }

  function permissionCalloutMarkup() {
    var needs = getPermissionNeeds();
    if (!needs.items.length) return '';
    var missing = needs.items.map(function (item) {
      return item.label + '（' + item.status + '）';
    }).join('、');
    var busy = state.requestingAllPermissions || state.requestingScreen || state.requestingMedia;
    var denied = needs.screenDenied || needs.mediaDenied;
    var hasError = Boolean(state.env.screenDetailsError || state.env.mediaPermissionError);
    var title = '补全设备信息';
    var description = '仍需获取：' + missing + '。授权后可补全当前报告。';
    if (busy) {
      title = '正在请求浏览器权限';
      description = '请在权限窗口中确认：' + missing + '。';
    } else if (denied) {
      title = '权限不足';
      description = '未获取：' + missing + '。可在浏览器站点设置中恢复权限后重试。';
    } else if (hasError) {
      title = '权限请求未完成';
      description = '未获取：' + missing + '。点击按钮可再次请求。';
    }
    var button = '<button type="button" class="btn btn-primary" data-action="request-all-permissions"' + (busy ? ' disabled' : '') + '>' +
      (busy ? '<span class="spinner" aria-hidden="true"></span>等待授权…' : (denied || hasError ? '重试权限' : '请求权限')) +
      '</button>';
    return '<div class="permission-callout" aria-live="polite">' +
      '<span class="permission-callout-icon">' + icon('shield') + '</span>' +
      '<div class="permission-callout-copy"><strong>' + escapeHtml(title) + '</strong><span>' + escapeHtml(description) + '</span></div>' +
      button + '</div>';
  }

  function maybeAutoRequestPermissions() {
    if (!state.env || state.source !== 'local' || state.permissionsAutoAttempted) return;
    var needs = getPermissionNeeds();
    if (!needs.screen && !needs.media) return;
    if (document.visibilityState !== 'visible') {
      document.addEventListener('visibilitychange', function onVisible() {
        if (document.visibilityState !== 'visible') return;
        document.removeEventListener('visibilitychange', onVisible);
        maybeAutoRequestPermissions();
      });
      return;
    }
    state.permissionsAutoAttempted = true;
    var permissions = state.env.permissions || {};
    var wantScreen = needs.screen && permissions['window-management'] !== 'denied';
    var bothMediaGranted = permissions.camera === 'granted' && permissions.microphone === 'granted';
    var bothMediaDenied = permissions.camera === 'denied' && permissions.microphone === 'denied';
    var wantMedia = needs.media && !bothMediaDenied && !bothMediaGranted;
    if (!wantScreen && !wantMedia) return;
    try {
      if (sessionStorage.getItem('device-lens-permissions-auto') === '1') return;
      sessionStorage.setItem('device-lens-permissions-auto', '1');
    } catch (error) {}
    window.setTimeout(function () {
      if (!state.env || state.source !== 'local') return;
      if (state.requestingAllPermissions || state.requestingScreen || state.requestingMedia) return;
      requestAllPermissions(true, { screen: wantScreen, media: wantMedia });
    }, 800);
  }

  async function requestAllPermissions(automatic, targets) {
    if (!state.env || state.source !== 'local' || state.requestingAllPermissions || state.requestingScreen || state.requestingMedia) return;
    var needs = getPermissionNeeds();
    var wantScreen = targets && typeof targets.screen === 'boolean' ? targets.screen : needs.screen;
    var wantMedia = targets && typeof targets.media === 'boolean' ? targets.media : needs.media;
    if (!wantScreen && !wantMedia) return;
    state.requestingAllPermissions = true;
    state.requestingScreen = wantScreen;
    state.requestingMedia = wantMedia;
    var screenResult = wantScreen
      ? E.requestScreenDetails().then(function (value) { return { ok: true, value: value }; }).catch(function (error) { return { ok: false, error: error }; })
      : null;
    var mediaResult = wantMedia
      ? E.requestMediaDeviceAccess().then(function (value) { return { ok: true, value: value }; }).catch(function (error) { return { ok: false, error: error }; })
      : null;
    renderContent();
    var screenOutcome = screenResult ? await screenResult : null;
    var mediaOutcome = mediaResult ? await mediaResult : null;
    if (screenOutcome) {
      if (screenOutcome.ok) {
        state.env.screenDetails = screenOutcome.value;
        state.env.screenDetailsError = '';
      }
    }
    if (mediaOutcome) {
      if (mediaOutcome.ok) {
        state.env.mediaDevices = mediaOutcome.value.devices || state.env.mediaDevices;
        state.env.mediaPermissionError = '';
      }
    }
    await refreshPermissions();
    var failures = [];
    if (screenOutcome && !screenOutcome.ok) {
      var screenFailure = permissionErrorDetails(screenOutcome.error, 'screen');
      if (automatic && screenFailure.title === '权限不足' && state.env.permissions && state.env.permissions['window-management'] === 'prompt') {
        screenFailure = {
          title: '需要手动授权',
          message: '浏览器未自动打开屏幕权限窗口，请点击“请求权限”后重试。'
        };
      }
      state.env.screenDetailsError = screenFailure.message;
      failures.push(screenFailure);
    }
    if (mediaOutcome && !mediaOutcome.ok) {
      var mediaFailure = permissionErrorDetails(mediaOutcome.error, 'media');
      var pausedMedia = state.env.permissions && (state.env.permissions.camera === 'prompt' || state.env.permissions.microphone === 'prompt');
      if (automatic && mediaFailure.title === '权限不足' && pausedMedia) {
        mediaFailure = {
          title: '需要手动授权',
          message: '浏览器未自动打开媒体权限窗口，请点击“请求权限”后重试。'
        };
      }
      state.env.mediaPermissionError = mediaFailure.message;
      failures.push(mediaFailure);
    }
    if (screenOutcome && screenOutcome.ok && state.env.permissions) {
      state.env.permissions['window-management'] = 'granted';
    }
    state.env.permissionsUpdatedAt = new Date().toISOString();
    state.requestingAllPermissions = false;
    state.requestingScreen = false;
    state.requestingMedia = false;
    state.localReport = R.buildReport(state.env);
    if (state.source !== 'local') return;
    state.report = state.localReport;
    renderContent({ animate: true });
    var missing = [];
    if (screenOutcome && !screenOutcome.ok) missing.push('多屏详情');
    if (mediaOutcome && !mediaOutcome.ok) missing.push('摄像头 / 麦克风设备名称');
    var missingText = missing.length ? ' 未获取：' + missing.join('、') + '。' : '';
    if (automatic) {
      if (failures.length) {
        var deniedFailure = failures.some(function (entry) { return entry.title === '权限不足'; });
        showToast(deniedFailure ? '权限不足，未获取：' + missing.join('、') + '。' : '部分权限未完成，未获取：' + missing.join('、') + '。', 'error');
      }
    } else if (failures.length) {
      var dialogTitle = failures.some(function (entry) { return entry.title === '权限不足'; }) ? '权限不足' : '未能补全设备信息';
      showDialog(dialogTitle, failures.map(function (entry) { return entry.message; }).join(' ') + missingText);
    } else {
      showToast('屏幕与媒体信息已更新。');
    }
  }

  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    var networkLookup = target.closest('[data-network-lookup]');
    if (networkLookup) {
      var lookupButton = target.closest('[data-network-lookup-action]');
      if (lookupButton) {
        event.preventDefault();
        lookupPublicIp(networkLookup, lookupButton);
        return;
      }
    }

    var displayContainer = target.closest('[data-display-tests]');
    if (displayContainer) {
      var displayTab = target.closest('[data-display-tab]');
      if (displayTab) {
        switchDisplayTest(displayContainer, displayTab.getAttribute('data-display-tab'));
        return;
      }
      var displayControl = target.closest('[data-display-action]');
      if (displayControl) {
        var displayAction = displayControl.getAttribute('data-display-action');
        if (displayAction === 'redetect') {
          refreshDisplayTest(displayContainer);
          showToast('已重新读取当前显示能力。');
        } else if (displayAction === 'fullscreen') {
          toggleDisplayTestFullscreen(displayContainer);
        } else if (displayAction === 'hdr-toggle') {
          toggleHdrInspire(displayContainer);
        }
        return;
      }
    }

    var sectionButton = target.closest('[data-section]');
    if (sectionButton) {
      event.preventDefault();
      if (sectionButton.disabled) return;
      selectSection(sectionButton.getAttribute('data-section'));
      return;
    }

    var actionButton = target.closest('[data-action]');
    if (!actionButton) return;
    var action = actionButton.getAttribute('data-action');
    if (action === 'import') {
      var input = document.getElementById('import-input');
      if (input && !actionButton.disabled) input.click();
    } else if (action === 'export') {
      exportReport();
    } else if (action === 'copy-summary') {
      copySummary();
    } else if (action === 'copy-raw') {
      copyRawReport();
    } else if (action === 'back-local') {
      returnToLocal();
    } else if (action === 'remeasure') {
      remeasureRefresh(actionButton);
    } else if (action === 'request-screen') {
      requestScreenPermission(actionButton);
    } else if (action === 'request-media') {
      requestMediaPermission(actionButton);
    } else if (action === 'request-all-permissions') {
      requestAllPermissions(false);
    } else if (action === 'retry') {
      startDetection();
    } else if (action === 'close-dialog') {
      closeDialog();
    }
  });

  function bindImportInput() {
    var importInput = document.getElementById('import-input');
    if (!importInput) return;
    importInput.addEventListener('change', function () {
      var file = importInput.files && importInput.files[0];
      handleImportFile(file);
      importInput.value = '';
    });
  }

  window.addEventListener('hashchange', function () {
    var id = '';
    try { id = decodeURIComponent(location.hash.replace(/^#/, '')); } catch (error) {}
    if (!isSectionId(id)) return;
    if (id === state.section) return;
    state.section = id;
    if (state.report) {
      renderContent({ animate: true });
      updateChrome();
      refreshNavigation();
    }
  });

  function init() {
    if (!appRoot) return;
    appRoot.innerHTML = VIEW === 'mobile' ? mobileShell() : desktopShell();
    bindImportInput();
    updateChrome();
    startDetection();
  }

  function renderContent(options) {
    var opts = options || {};
    var main = getMain();
    if (!main || !state.report) return;
    var report = state.report;
    var definition = getSection(state.section);
    var body = '';
    if (state.section === 'overview') {
      body = renderOverview(report);
    } else if (state.section === 'raw') {
      body = renderRawSection(report, definition);
    } else {
      body = renderStandardSection(report, definition);
    }
    main.setAttribute('aria-busy', 'false');
    main.innerHTML = renderImportBanner() + body;
    if (opts.animate) {
      main.classList.remove('is-entering');
      void main.offsetWidth;
      main.classList.add('is-entering');
    }
  }

  function renderImportBanner() {
    if (state.source !== 'import' || !state.report) return '';
    var meta = state.report.meta || {};
    var timestamp = E.formatDateTime(meta.detectedAt);
    return '<div class="import-banner" role="status">' +
      '<span class="import-banner-icon">' + icon('file') + '</span>' +
      '<div class="import-banner-copy"><strong>正在查看导入的设备报告</strong>' +
      '<span>' + escapeHtml(state.importedFileName || '本地报告') + ' · 检测于 ' + escapeHtml(timestamp) + '</span></div>' +
      (state.localReport ? '<button type="button" class="btn btn-small" data-action="back-local">' + icon('back') + '返回本机</button>' : '') +
      '</div>';
  }

  function safeValue(value) {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  }

  function renderSummaryCard(card) {
    var value = safeValue(card.value);
    var hint = card.hint ? String(card.hint) : '';
    var iconMarkup = card.osFamily
      ? summaryOsBadge(card.osFamily)
      : '<span class="summary-icon">' + icon(card.icon) + '</span>';
    return '<article class="summary-card">' +
      '<div class="summary-top">' + iconMarkup + '<span>' + escapeHtml(card.label) + '</span></div>' +
      '<div class="summary-value" title="' + escapeHtml(value) + '">' + escapeHtml(value) + '</div>' +
      '<div class="summary-hint" title="' + escapeHtml(hint) + '">' + escapeHtml(hint) + '</div>' +
      '</article>';
  }

  function permissionActionLabel(scope) {
    if (scope === 'screen') {
      if (state.requestingScreen) return '<span class="spinner" aria-hidden="true"></span>等待授权…';
      if (state.env && state.env.screenDetails) return icon('display') + '刷新多屏详情';
      if (state.env && state.env.permissions && state.env.permissions['window-management'] === 'denied') return icon('shield') + '重试屏幕授权';
      return icon('shield') + '读取多屏详情';
    }
    if (state.requestingMedia) return '<span class="spinner" aria-hidden="true"></span>等待授权…';
    var devices = state.env && state.env.mediaDevices;
    if (devices && devices.labels && devices.labels.length) return icon('media') + '刷新设备名称';
    if (state.env && state.env.permissions && state.env.permissions.camera === 'denied' && state.env.permissions.microphone === 'denied') {
      return icon('shield') + '重试设备授权';
    }
    return icon('shield') + '读取设备名称';
  }

  function getEstimatedPhysicalScreen(summary) {
    if (!summary) return '';
    if (summary.screenPhysical) return summary.screenPhysical;
    var estimate = E.estimatePhysicalResolution(summary.width, summary.height, summary.dpr);
    return estimate ? estimate.width + ' × ' + estimate.height : '';
  }

  function renderStandardSection(report, definition) {
    var data = report.sections && report.sections[definition.id];
    var groups = data && Array.isArray(data.groups) ? data.groups : [];
    if (definition.id === 'display') {
      var estimatedPhysical = getEstimatedPhysicalScreen(report.summary);
      if (estimatedPhysical) {
        groups = groups.map(function (groupData) {
          if (!groupData || !Array.isArray(groupData.items)) return groupData;
          var items = groupData.items.map(function (itemData) {
            if (itemData && itemData.label === '物理像素（估算）') {
              return Object.assign({}, itemData, {
                value: estimatedPhysical,
                note: '由逻辑分辨率 × DPR 估算，半分像素按偶数像素取整；不一定等于面板原生分辨率。'
              });
            }
            return itemData;
          });
          return Object.assign({}, groupData, { items: items });
        });
      }
    }
    var actionButtons = [];
    if (state.source === 'local' && state.env) {
      var permissions = state.env.permissions || {};
      var mediaDevices = state.env.mediaDevices;
      var inputCounts = mediaDevices && mediaDevices.counts || {};
      var hasMediaInput = (inputCounts.videoinput || 0) + (inputCounts.audioinput || 0) > 0;
      if (definition.id === 'display') {
        if (permissions.screenDetailsSupported && !state.env.screenDetails) {
          actionButtons.push('<button type="button" class="btn btn-small" data-action="request-screen" title="浏览器会请求读取多显示器详情的权限"' +
            (state.requestingScreen || state.requestingAllPermissions ? ' disabled' : '') + '>' + permissionActionLabel('screen') + '</button>');
        }
        actionButtons.push('<button type="button" class="btn btn-small" data-action="remeasure"' + (state.remeasuring ? ' disabled' : '') + '>' +
          (state.remeasuring ? '<span class="spinner" aria-hidden="true"></span>测量中…' : icon('refresh') + '重新测量刷新率') +
          '</button>');
      } else if (definition.id === 'media' && permissions.mediaCaptureSupported && hasMediaInput && !(mediaDevices && mediaDevices.labelled)) {
        actionButtons.push('<button type="button" class="btn btn-small" data-action="request-media" title="授权后可读取摄像头与麦克风设备名称"' +
          (state.requestingMedia || state.requestingAllPermissions ? ' disabled' : '') + '>' + permissionActionLabel('media') + '</button>');
      }
    }
    var actions = actionButtons.length ? '<div class="section-actions">' + actionButtons.join('') + '</div>' : '';
    var renderedGroups = groups.map(renderGroup).filter(Boolean);
    var groupsHtml = '';
    if (renderedGroups.length) {
      groupsHtml = '<div class="group-grid' + (renderedGroups.length === 1 ? ' is-single' : '') + '">' +
        renderedGroups.join('') + '</div>';
    } else {
      groupsHtml = '<div class="settings-card"><div class="card-empty">此分类暂无可用数据。</div></div>';
    }
    var extra = '';
    if (definition.id === 'display') extra = displayTestMarkup();
    else if (definition.id === 'network') extra = networkIpMarkup();
    return '<section aria-labelledby="section-title">' +
      '<div class="section-head"><div class="section-title-wrap">' +
      '<div class="eyebrow"><span class="dot"></span>' + escapeHtml(definition.en) + '</div>' +
      '<h1 id="section-title">' + escapeHtml(definition.label) + '</h1>' +
      '<p>' + escapeHtml(definition.desc) + '</p></div>' +
      actions +
      '</div>' + groupsHtml + extra +
      (data && data.note ? '<div class="section-note">' + icon('info') + '<span>' + escapeHtml(data.note) + '</span></div>' : '') +
      '</section>';
  }

  function displayTestMedia(query) {
    try {
      return typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : null;
    } catch (error) {
      return null;
    }
  }

  function readDisplayTestState() {
    var rangeHigh = displayTestMedia('(dynamic-range: high)');
    var videoRangeHigh = displayTestMedia('(video-dynamic-range: high)');
    var hdrKnown = rangeHigh !== null || videoRangeHigh !== null;
    var hdr = rangeHigh === true || videoRangeHigh === true;
    var gamut = 'sRGB';
    if (displayTestMedia('(color-gamut: rec2020)')) gamut = 'Rec.2020';
    else if (displayTestMedia('(color-gamut: p3)')) gamut = 'Display-P3';
    var screen = window.screen || {};
    var physical = E.estimatePhysicalResolution(screen.width, screen.height, window.devicePixelRatio || 1);
    return {
      hdr: hdr,
      hdrLabel: hdr ? '已检测到 HDR' : hdrKnown ? '未检测到 HDR' : '浏览器未报告',
      hdrShort: hdr ? '可用' : hdrKnown ? '不可用' : '未报告',
      hdrCopy: hdr
        ? '浏览器报告 HDR 可用。点击“激发测试”，观察白色面板中的图案是否出现高于 SDR 白的高光。'
        : '浏览器未报告 HDR 能力；SDR 屏幕通常只能看到白色光晕，可检查系统 HDR 开关、显示器模式与连接线。',
      gamut: gamut,
      colorDepth: screen.colorDepth ? screen.colorDepth + ' 位' : '未公开',
      resolution: physical ? physical.width + ' × ' + physical.height : '未公开',
      scale: (window.devicePixelRatio || 1) + '×'
    };
  }

  function displayTestSwatches(colors, p3) {
    return '<div class="gamut-swatches">' + colors.map(function (color) {
      var style = p3
        ? 'background-color:' + color.srgb + ';background-color:' + color.p3
        : 'background-color:' + color.srgb;
      return '<span style="' + style + '" title="' + escapeHtml(color.name) + '"></span>';
    }).join('') + '</div>';
  }

  function displayTestMarkup() {
    var view = readDisplayTestState();
    var p3Colors = [
      { name: '红', p3: 'color(display-p3 1 0 0)', srgb: '#ff0000' },
      { name: '绿', p3: 'color(display-p3 0 1 0)', srgb: '#00ff00' },
      { name: '蓝', p3: 'color(display-p3 0 0 1)', srgb: '#0000ff' },
      { name: '橙', p3: 'color(display-p3 1 0.5 0)', srgb: '#ff8000' },
      { name: '青', p3: 'color(display-p3 0 1 1)', srgb: '#00ffff' },
      { name: '品红', p3: 'color(display-p3 1 0 1)', srgb: '#ff00ff' }
    ];
    var toneSteps = [];
    for (var i = 0; i < 16; i += 1) {
      var level = Math.round(i / 15 * 255);
      toneSteps.push('<span style="background-color:rgb(' + level + ',' + level + ',' + level + ')" title="' + Math.round(i / 15 * 100) + '%"></span>');
    }
    return '<div class="display-tests" data-display-tests aria-labelledby="display-tests-title">' +
      '<div class="display-tests-top">' +
      '<div class="block-heading"><h2 id="display-tests-title">显示器目视测试</h2><span>当前屏幕 · 浏览器报告能力</span></div>' +
      '<div class="display-test-toolbar">' +
      '<div class="display-test-tabs" role="tablist" aria-label="显示器测试模式">' +
      '<button type="button" class="is-active" id="display-tab-detect" role="tab" aria-selected="true" aria-controls="display-pane-detect" data-display-tab="detect">HDR 检测</button>' +
      '<button type="button" id="display-tab-range" role="tab" aria-selected="false" aria-controls="display-pane-range" data-display-tab="range">动态范围</button>' +
      '<button type="button" id="display-tab-gamut" role="tab" aria-selected="false" aria-controls="display-pane-gamut" data-display-tab="gamut">宽色域验证</button>' +
      '</div>' +
      '<button type="button" class="display-test-tool" data-display-action="redetect">' + icon('refresh') + '重新检测</button>' +
      '<button type="button" class="display-test-tool" data-display-action="fullscreen">' + icon('display') + '全屏</button>' +
      '</div>' +
      '</div>' +
      '<div class="display-test-stage">' +
      '<div class="display-test-pane is-active" id="display-pane-detect" role="tabpanel" aria-labelledby="display-tab-detect" data-display-pane="detect">' +
      '<div class="hdr-inspire" data-hdr-stage>' +
      '<div class="hdr-inspire-top">' +
      '<span class="hdr-test-status' + (view.hdr ? ' is-on' : '') + '" data-display-hdr-status>' + escapeHtml(view.hdrLabel) + '</span>' +
      '<div class="hdr-inspire-actions">' +
      '<span class="hdr-inspire-state" data-display-hdr-state>等待测试指令…</span>' +
      '<button type="button" class="btn btn-small btn-primary" data-display-action="hdr-toggle">激发测试</button>' +
      '</div>' +
      '</div>' +
      '<div class="hdr-inspire-card" role="img" aria-label="HDR 激发测试图案">' +
      '<span class="hdr-inspire-logo" aria-hidden="true"></span>' +
      '</div>' +
      '<p class="hdr-inspire-note" data-display-hdr-copy>' + escapeHtml(view.hdrCopy) + '</p>' +
      '</div>' +
      '</div>' +
      '<div class="display-test-pane" id="display-pane-range" role="tabpanel" aria-labelledby="display-tab-range" data-display-pane="range" hidden>' +
      '<div class="range-test" role="img" aria-label="16 级灰阶亮度阶梯，从黑色到白色">' +
      '<div class="range-steps">' + toneSteps.join('') + '</div>' +
      '<div class="range-scale"><span>0 · 黑</span><span>16 级亮度阶梯</span><span>100 · 白</span></div>' +
      '</div>' +
      '</div>' +
      '<div class="display-test-pane" id="display-pane-gamut" role="tabpanel" aria-labelledby="display-tab-gamut" data-display-pane="gamut" hidden>' +
      '<div class="gamut-test" role="img" aria-label="sRGB 与 Display-P3 六种颜色对比">' +
      '<div class="gamut-row"><span class="gamut-row-label">sRGB</span>' + displayTestSwatches(p3Colors, false) + '</div>' +
      '<div class="gamut-row"><span class="gamut-row-label">Display-P3</span>' + displayTestSwatches(p3Colors, true) + '</div>' +
      '<div class="gamut-names"><span>红</span><span>绿</span><span>蓝</span><span>橙</span><span>青</span><span>品红</span></div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="display-test-readout" aria-live="polite">' +
      '<span>HDR <strong data-display-readout="hdr">' + escapeHtml(view.hdrShort) + '</strong></span>' +
      '<span>色域 <strong data-display-readout="gamut">' + escapeHtml(view.gamut) + '</strong></span>' +
      '<span>色深 <strong data-display-readout="depth">' + escapeHtml(view.colorDepth) + '</strong></span>' +
      '<span>分辨率（估算） <strong data-display-readout="resolution">' + escapeHtml(view.resolution) + '</strong></span>' +
      '<span>缩放 <strong data-display-readout="scale">' + escapeHtml(view.scale) + '</strong></span>' +
      '</div>' +
      '<p class="display-test-hint">HDR 图案使用本地 HDR AVIF 图像与 SVG 蒙版：支持 HDR 的屏幕会显示高于 SDR 白的高光，SDR 屏幕可能只看到白色光晕。亮度阶梯与色块用于目视参考，不能替代专业测量。</p>' +
      '</div>';
  }

  function switchDisplayTest(container, mode) {
    container.querySelectorAll('[data-display-tab]').forEach(function (tab) {
      var active = tab.getAttribute('data-display-tab') === mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    container.querySelectorAll('[data-display-pane]').forEach(function (pane) {
      var active = pane.getAttribute('data-display-pane') === mode;
      pane.classList.toggle('is-active', active);
      pane.hidden = !active;
    });
  }

  function toggleHdrInspire(container) {
    var stage = container.querySelector('[data-hdr-stage]');
    if (!stage) return;
    var active = stage.classList.toggle('is-ignited');
    var button = container.querySelector('[data-display-action="hdr-toggle"]');
    if (button) button.textContent = active ? '停止测试' : '激发测试';
    var state = container.querySelector('[data-display-hdr-state]');
    if (state) state.textContent = active ? 'HDR 激发中…' : '等待测试指令…';
  }

  function refreshDisplayTest(container) {
    var view = readDisplayTestState();
    var readouts = {
      hdr: view.hdrShort,
      gamut: view.gamut,
      depth: view.colorDepth,
      resolution: view.resolution,
      scale: view.scale
    };
    container.querySelectorAll('[data-display-readout]').forEach(function (node) {
      var key = node.getAttribute('data-display-readout');
      if (readouts[key]) node.textContent = readouts[key];
    });
    var status = container.querySelector('[data-display-hdr-status]');
    if (status) {
      status.textContent = view.hdrLabel;
      status.classList.toggle('is-on', view.hdr);
    }
    var copy = container.querySelector('[data-display-hdr-copy]');
    if (copy) copy.textContent = view.hdrCopy;
  }

  function toggleDisplayTestFullscreen(container) {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(function () {});
      return;
    }
    if (!container.requestFullscreen) {
      showToast('当前浏览器不支持全屏显示。', 'error');
      return;
    }
    container.requestFullscreen().catch(function () {
      showToast('无法进入全屏，请检查浏览器设置。', 'error');
    });
  }

  function networkIpMarkup() {
    var imported = state.source === 'import';
    return '<div class="network-ip" data-network-lookup aria-labelledby="network-ip-title">' +
      '<div class="block-heading"><h2 id="network-ip-title">公网 IP 与归属地</h2><span>当前浏览器 · 第三方查询</span></div>' +
      '<div class="settings-card network-ip-card">' +
      '<div class="network-ip-head"><div><strong>公网出口信息</strong><span>点击查询会向第三方 IP 接口 ipwho.is 发送当前网络请求，不包含设备报告。</span></div>' +
      '<button type="button" class="btn btn-small" data-network-lookup-action>' + icon('network') + '查询公网 IP</button></div>' +
      '<div class="network-ip-result" data-network-result hidden></div>' +
      '<p class="network-ip-note">' + (imported
        ? '当前查看的是导入报告，此项查询属于当前浏览器，不代表报告中的设备。'
        : '查询结果只用于当前浏览器会话，不写入报告。') +
      ' IP 归属地为 IP 数据库的近似结果，不代表精确位置。</p>' +
      '</div></div>';
  }

  function networkIpText(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  function renderNetworkIpResult(container, data) {
    var ip = networkIpText(data.ip);
    var rows = [];
    if (ip) rows.push(['公网 IP', ip]);
    var location = [data.city, data.region, data.country].map(networkIpText).filter(Boolean).join(' · ');
    if (location) rows.push(['IP 归属地', location]);
    var connection = data.connection || {};
    var isp = networkIpText(connection.isp || connection.org || data.isp || data.org);
    if (isp) rows.push(['运营商 / 机构', isp]);
    var asn = networkIpText(connection.asn || data.asn || data.as);
    if (asn) {
      if (!/^as/i.test(asn)) asn = 'AS' + asn;
      rows.push(['ASN', asn]);
    }
    var type = networkIpText(data.type || (ip.indexOf(':') !== -1 ? 'IPv6' : ip ? 'IPv4' : ''));
    if (type) rows.push(['地址类型', type]);
    var timezone = data.timezone && data.timezone.id ? networkIpText(data.timezone.id) : networkIpText(data.timezone);
    if (timezone) rows.push(['IP 时区', timezone]);
    if (!rows.length) throw new Error('接口未返回可显示的字段。');
    var result = container.querySelector('[data-network-result]');
    if (!result) return;
    result.innerHTML = '<dl class="network-ip-grid">' + rows.map(function (row) {
      return '<div class="network-ip-item"><dt>' + escapeHtml(row[0]) + '</dt><dd>' + escapeHtml(row[1]) + '</dd></div>';
    }).join('') + '</dl>' +
      '<div class="network-ip-source">来源：<a href="https://ipwho.is" target="_blank" rel="noopener noreferrer">ipwho.is</a> · 查询于 ' + escapeHtml(E.formatDateTime(new Date())) + '</div>';
  }

  function lookupPublicIp(container, button) {
    if (!container || !button) return;
    var result = container.querySelector('[data-network-result]');
    if (!result) return;
    if (typeof window.fetch !== 'function') {
      result.hidden = false;
      result.innerHTML = '<div class="network-ip-error">' + icon('warning') + '<span>当前浏览器不支持网络查询。</span></div>';
      return;
    }
    button.disabled = true;
    button.innerHTML = '<span class="spinner" aria-hidden="true"></span>查询中…';
    result.hidden = false;
    result.innerHTML = '<div class="network-ip-loading">正在向第三方接口查询，请稍候…</div>';
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = window.setTimeout(function () {
      if (controller) controller.abort();
    }, 9000);
    function finish() {
      window.clearTimeout(timer);
      button.disabled = false;
    }
    window.fetch('https://ipwho.is/', {
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined
    }).then(function (response) {
      if (!response.ok) throw new Error('接口返回 HTTP ' + response.status);
      return response.json();
    }).then(function (data) {
      if (!data || data.success === false || !networkIpText(data.ip)) {
        throw new Error(data && data.message ? String(data.message) : '接口未返回有效数据。');
      }
      renderNetworkIpResult(container, data);
      button.innerHTML = icon('refresh') + '重新查询';
      finish();
    }).catch(function (error) {
      var message = error && error.name === 'AbortError'
        ? '查询超时，请稍后重试。'
        : error && error.message ? error.message : '网络请求失败。';
      result.innerHTML = '<div class="network-ip-error">' + icon('warning') + '<span>查询失败：' + escapeHtml(message) + '</span></div>';
      button.innerHTML = icon('refresh') + '重试查询';
      finish();
      if (window.console && console.warn) console.warn('[IP lookup]', error);
    });
  }

  function renderGroup(groupData) {
    var allItems = groupData && Array.isArray(groupData.items) ? groupData.items : [];
    var isChips = groupData && groupData.layout === 'chips';
    var items = isChips ? allItems : allItems.filter(function (entry) {
      return entry && !isUnavailableValue(entry.value);
    });
    if (!items.length) return '';
    var supportedCount = items.filter(function (entry) {
      return entry && (entry.supported === true || entry.tone === 'ok');
    }).length;
    var headCount = isChips ? '<span class="group-count">支持 ' + supportedCount + ' / ' + items.length + '</span>' : '';
    var content = '';
    if (isChips) {
      content = '<div class="cap-grid">' + items.map(function (entry) {
        var supported = entry && (entry.supported === true || entry.tone === 'ok');
        var label = entry && entry.label ? entry.label : '未命名能力';
        var value = entry && entry.value ? entry.value : (supported ? '支持' : '不支持');
        return '<div class="cap-item' + (supported ? '' : ' is-off') + '" title="' + escapeHtml(label + '：' + value) + '">' +
          '<span class="cap-mark">' + icon(supported ? 'check' : 'minus') + '</span>' +
          '<span class="cap-label">' + escapeHtml(label) + '</span></div>';
      }).join('') + '</div>';
    } else {
      content = '<dl class="info-list">' + items.map(renderInfoRow).join('') + '</dl>';
    }
    return '<section class="info-group' + (groupData && groupData.wide ? ' is-wide' : '') + '">' +
      '<div class="group-head"><h2>' + escapeHtml(groupData && groupData.title || '详细信息') + '</h2>' + headCount + '</div>' +
      '<div class="settings-card">' + content +
      (groupData && groupData.note ? '<div class="group-foot">' + icon('info') + '<span>' + escapeHtml(groupData.note) + '</span></div>' : '') +
      '</div></section>';
  }

  function renderInfoRow(entry) {
    var itemData = entry || {};
    var tone = ['ok', 'warn', 'bad', 'muted'].indexOf(itemData.tone) !== -1 ? itemData.tone : '';
    var value = safeValue(itemData.value);
    var valueHtml = tone ? '<span class="value-tone is-' + tone + '">' + escapeHtml(value) + '</span>' : escapeHtml(value);
    if (itemData.note) valueHtml += '<small>' + escapeHtml(itemData.note) + '</small>';
    return '<div class="setting-row' + (itemData.wide ? ' is-wide' : '') + '">' +
      '<dt class="setting-label">' + escapeHtml(itemData.label || '—') + '</dt>' +
      '<dd class="setting-value' + (itemData.mono ? ' is-mono' : '') + '">' + valueHtml + '</dd></div>';
  }

  function renderRawSection(report, definition) {
    var meta = report.meta || {};
    var json;
    try {
      json = JSON.stringify(report, null, 2);
    } catch (error) {
      json = '无法序列化报告数据。';
    }
    return '<section aria-labelledby="section-title">' +
      '<div class="section-head"><div class="section-title-wrap">' +
      '<div class="eyebrow"><span class="dot"></span>' + escapeHtml(definition.en) + '</div>' +
      '<h1 id="section-title">' + escapeHtml(definition.label) + '</h1>' +
      '<p>' + escapeHtml(definition.desc) + '</p></div>' +
      '<div class="section-actions"><button type="button" class="btn btn-small" data-action="copy-raw">' + icon('copy') + '复制 JSON</button></div>' +
      '</div>' +
      '<div class="raw-card">' +
      '<div class="raw-meta"><div class="raw-meta-text"><strong>完整设备报告</strong> · ' +
      escapeHtml(report.schema || E.APP.schema) + ' v' + escapeHtml(report.schemaVersion || E.APP.schemaVersion) +
      ' · 检测于 ' + escapeHtml(E.formatDateTime(meta.detectedAt)) +
      (meta.exportedAt ? ' · 导出于 ' + escapeHtml(E.formatDateTime(meta.exportedAt)) : '') +
      '</div></div>' +
      '<pre class="raw-code" tabindex="0" aria-label="报告 JSON">' + escapeHtml(json) + '</pre>' +
      '</div>' +
      '</section>';
  }

  var OS_LOGOS = {
    windows: '<img class="os-logo-img" src="assets/os/windows.svg" alt="">',
    apple: '<img class="os-logo-img" src="assets/os/apple.svg" alt="">',
    android: '<img class="os-logo-img" src="assets/os/android.svg" alt="">',
    harmony: '<img class="os-logo-img" src="assets/os/harmonyos.svg" alt="">',
    linux: '<img class="os-logo-img" src="assets/os/linux.svg" alt="">',
    chromeos: '<img class="os-logo-img" src="assets/os/chromeos.svg" alt="">',
    unknown: '<img class="os-logo-img" src="assets/os/generic.svg" alt="">'
  };

  function osVisual(familyOrKey) {
    var value = String(familyOrKey || '').toLowerCase();
    var key = 'unknown';
    if (/windows/.test(value)) key = 'windows';
    else if (/ipados|ios|macos|mac os|macintosh/.test(value)) key = 'apple';
    else if (/android/.test(value)) key = 'android';
    else if (/harmony/.test(value)) key = 'harmony';
    else if (/chromeos|chrome os|cros/.test(value)) key = 'chromeos';
    else if (/linux/.test(value)) key = 'linux';
    var labels = {
      windows: 'Windows',
      apple: /ipados/.test(value) ? 'iPadOS' : /ios/.test(value) ? 'iOS' : 'macOS',
      android: 'Android',
      harmony: 'HarmonyOS',
      linux: 'Linux',
      chromeos: 'ChromeOS',
      unknown: 'System'
    };
    return { key: key, label: labels[key], logo: OS_LOGOS[key] };
  }

  function osFamilyFromSummary(summary) {
    if (summary && summary.osFamily) return summary.osFamily;
    var os = String(summary && summary.os || '');
    if (/Windows/i.test(os)) return 'Windows';
    if (/iPadOS/i.test(os)) return 'iPadOS';
    if (/iOS/i.test(os)) return 'iOS';
    if (/macOS|Mac OS/i.test(os)) return 'macOS';
    if (/Android/i.test(os)) return 'Android';
    if (/HarmonyOS/i.test(os)) return 'HarmonyOS';
    if (/ChromeOS/i.test(os)) return 'ChromeOS';
    if (/Linux/i.test(os)) return 'Linux';
    return 'Unknown';
  }

  function summaryOsBadge(osFamily) {
    var visual = osVisual(osFamily);
    return '<span class="summary-icon summary-os-icon os-' + visual.key + '">' + visual.logo + '</span>';
  }

  function renderHeroArt(osFamily) {
    var visual = osVisual(osFamily);
    return '<div class="hero-art hero-os-art" aria-hidden="true">' +
      '<div class="os-emblem os-' + visual.key + '">' +
      '<div class="os-tile">' + visual.logo + '</div>' +
      '<div class="os-caption">' + escapeHtml(visual.label) + '</div>' +
      '</div></div>';
  }

  function renderHeroDetail() {
    var parts = [];
    for (var i = 0; i < arguments.length; i += 1) {
      var value = arguments[i];
      if (value && !isUnavailableValue(value)) parts.push(String(value));
    }
    if (!parts.length) return '';
    return '<strong>' + escapeHtml(parts[0]) + '</strong>' +
      (parts.length > 1 ? ' · ' + escapeHtml(parts.slice(1).join(' · ')) : '');
  }

  function renderOverview(report) {
    var summary = report.summary || {};
    var meta = report.meta || {};
    var imported = state.source === 'import';
    var osFamily = osFamilyFromSummary(summary);
    var deviceModel = summary.model || meta.deviceModel || '';
    var os = summary.os || '未知系统';
    var displayName = deviceModel || summary.os || '设备概览';
    var formFactor = summary.formFactorLabel || (meta.formFactorLabel || '');
    var pageLabel = summary.pageLabel || E.viewLabel(meta.pageView);
    var browserName = summary.browser || summary.browserName || '';
    var logicalScreen = summary.screen || '浏览器未公开';
    var physicalScreen = getEstimatedPhysicalScreen(summary);
    var screen = physicalScreen || logicalScreen;
    var screenHintParts = [];
    if (physicalScreen) screenHintParts.push('物理估算');
    if (summary.dpr) screenHintParts.push('DPR ' + summary.dpr + '×');
    if (physicalScreen && physicalScreen !== logicalScreen) screenHintParts.push('逻辑 ' + logicalScreen);
    var screenHint = screenHintParts.join(' · ') || pageLabel;
    var refresh = summary.refreshRate || '未测出';
    var hdr = summary.hdr || 'HDR 未知';
    var gamut = summary.colorGamut || '未知色域';
    var engine = summary.engine || '未知内核';
    var architecture = summary.architecture || '架构未公开';
    var cpu = summary.cpu || '浏览器未公开';
    var memory = summary.memory || '浏览器未公开';
    var gpu = summary.gpu || '浏览器未公开';
    var gpuVendor = summary.gpuVendor || '';
    var network = summary.network || '浏览器未公开';
    var battery = summary.battery || '浏览器未公开';
    var sourceTitle = imported ? '导入报告' : '本机设备 · 本次检测';
    var fileLabel = imported && state.importedFileName
      ? '<span class="file-label">· ' + escapeHtml(state.importedFileName) + '</span>' : '';
    var stampTime = E.formatDateTime(meta.detectedAt);
    var summaryCards = [
      {
        osFamily: osFamily,
        icon: 'system',
        label: '操作系统',
        value: os,
        hint: !isUnavailableValue(architecture) ? architecture : formFactor
      },
      {
        icon: 'display',
        label: '屏幕分辨率',
        value: screen,
        hint: screenHint
      },
      {
        icon: 'activity',
        label: '刷新率',
        value: refresh,
        hint: [hdr, gamut].filter(function (value) { return value && !isUnavailableValue(value) && value !== 'HDR 未知' && value !== '未知色域'; }).join(' · ')
      },
      {
        icon: 'graphics',
        label: '图形处理器',
        value: gpu,
        hint: gpuVendor ? gpuVendor : '图形适配器'
      },
      {
        icon: 'system',
        label: '处理器 / 内存',
        value: cpu,
        hint: !isUnavailableValue(memory) ? '内存 ' + memory : ''
      },
      {
        icon: 'browser',
        label: '浏览器内核',
        value: engine,
        hint: browserName || ''
      }
    ].filter(function (card) { return !isUnavailableValue(card.value); });
    var assistRows = [
      ['系统', [os, architecture].filter(function (value) { return value && !isUnavailableValue(value); }).join(' · ')],
      ['处理器', [cpu, memory].filter(function (value) { return value && !isUnavailableValue(value); }).join(' / ')],
      ['屏幕', screen],
      ['显示', [refresh, hdr].filter(function (value) { return value && !isUnavailableValue(value) && value !== 'HDR 未知'; }).join(' · ')],
      ['GPU', [gpu, gpuVendor].filter(function (value) { return value && !isUnavailableValue(value); }).join(' · ')],
      ['浏览器', [browserName, engine].filter(function (value) { return value && !isUnavailableValue(value); }).join(' · ')],
      ['网络', network],
      ['电池', battery]
    ].filter(function (row) { return !isUnavailableValue(row[1]); });
    var detailsNote = imported
      ? '当前显示的是文件中保存的检测结果，不会重新读取本机设备。'
      : '页面在打开时完成一次检测；屏幕与媒体设备详情会在浏览器允许时自动补充。';
    var heroChips = [];
    if (!isUnavailableValue(screen)) {
      heroChips.push('<span class="hero-chip"' + (physicalScreen ? ' title="物理像素估算"' : '') + '>' + icon('display') + '<span>' + escapeHtml(screen + ' · DPR ' + (summary.dpr || '—')) + '</span></span>');
    }
    var refreshLine = [refresh, hdr].filter(function (value) { return value && !isUnavailableValue(value) && value !== 'HDR 未知'; }).join(' · ');
    if (refreshLine) {
      heroChips.push('<span class="hero-chip">' + icon('activity') + '<span>' + escapeHtml(refreshLine) + '</span></span>');
    }
    if (!isUnavailableValue(engine)) {
      heroChips.push('<span class="hero-chip">' + icon('browser') + '<span>' + escapeHtml(engine + ' 内核') + '</span></span>');
    }
    var detailFields = '';
    if (deviceModel) {
      detailFields += '<div><dt>设备型号</dt><dd>' + escapeHtml(deviceModel) + '</dd></div>';
    }
    detailFields += '<div><dt>检测时间</dt><dd>' + escapeHtml(stampTime) + '</dd></div>' +
      '<div><dt>报告格式</dt><dd>' + escapeHtml(report.schema || E.APP.schema) + ' v' + escapeHtml(report.schemaVersion || E.APP.schemaVersion) + '</dd></div>';
    return '<section aria-labelledby="hero-title">' +
      '<div class="hero">' +
      '<div class="hero-copy">' +
      '<div class="hero-eyebrow' + (imported ? ' is-imported' : '') + '"><span class="dot"></span><span>' +
      escapeHtml(sourceTitle) + '</span>' + fileLabel + '</div>' +
      '<h1 id="hero-title">' + escapeHtml(displayName) + '</h1>' +
      '<p class="hero-device-line">' + renderHeroDetail(deviceModel ? os : '', formFactor, browserName) + '</p>' +
      '<div class="hero-chips">' + heroChips.join('') + '</div>' +
      '<div class="hero-stamp">' + icon('clock') + '<span>' + escapeHtml((imported ? '报告检测于 ' : '检测于 ') + stampTime) + ' · ' + escapeHtml(pageLabel) + '</span></div>' +
      '</div>' +
      renderHeroArt(osFamily) +
      '</div>' +
      permissionCalloutMarkup() +
      '<div class="block-heading"><h2>关键规格</h2><span>共 ' + SECTIONS.length + ' 个检测分类</span></div>' +
      '<div class="summary-grid">' + summaryCards.map(renderSummaryCard).join('') + '</div>' +
      '<div class="assist-panel">' +
      '<div class="assist-copy"><h2>远程协助摘要</h2>' +
      '<p>把这份摘要发给协助方，或导出完整报告让对方导入，快速核对系统、显示和图形配置。</p>' +
      '<dl class="assist-list">' + assistRows.map(function (row) {
        return '<div class="assist-item"><dt>' + escapeHtml(row[0]) + '</dt><dd title="' + escapeHtml(safeValue(row[1])) + '">' + escapeHtml(safeValue(row[1])) + '</dd></div>';
      }).join('') + '</dl></div>' +
      '<div class="assist-actions">' +
      '<button type="button" class="btn btn-primary" data-action="copy-summary">' + icon('copy') + '复制设备摘要</button>' +
      (imported ? '<button type="button" class="btn" data-action="back-local">' + icon('back') + '返回本机检测</button>' : '<button type="button" class="btn" data-action="import">' + icon('import') + '导入其他设备报告</button>') +
      '<button type="button" class="btn" data-action="export">' + icon('export') + '导出完整报告</button>' +
      '<div class="assist-note">' + icon('info') + '<span>协助方可打开同一页面，通过“导入报告”查看这份数据的全部分类与原始字段。</span></div>' +
      '<div class="assist-meta"><span>' + escapeHtml(report.schema || E.APP.schema) + ' v' + escapeHtml(report.schemaVersion || E.APP.schemaVersion) + '</span><span>' + escapeHtml(pageLabel) + '</span>' +
      (imported ? '<span>来源：导出的报告文件</span>' : '<span>来源：本次检测</span>') + '</div>' +
      '</div></div>' +
      '<div class="report-details">' +
      '<div class="report-details-head"><div><span class="eyebrow"><span class="dot"></span>REPORT</span><h2>报告详情</h2><p>' + escapeHtml(detailsNote) + '</p></div>' +
      '<a class="report-about-link" href="about.html">' + icon('info') + '关于' + E.APP.name + '</a></div>' +
      '<dl class="report-details-grid">' + detailFields + '</dl></div>' +
      '</section>';
  }

  /* INIT */

  init();
})();
