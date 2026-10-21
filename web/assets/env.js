/* Hutao Hardware Book - environment collection */
(function () {
  'use strict';

  var APP = Object.freeze({
    name: '胡堂主的硬件簿',
    nameEn: 'Hutao Hardware Book',
    tagline: '快捷查看你的设备信息',
    version: '1.7.0',
    schema: 'hutao-hardware-book.report',
    legacySchemas: Object.freeze(['hutao-detective.report', 'device-lens.report']),
    schemaVersion: 1
  });

  var VIEW = document.body && document.body.dataset.view === 'mobile' ? 'mobile' : 'desktop';

  function safeCall(fn, fallback) {
    try {
      var value = fn();
      return value === undefined || value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function settle(fn, fallback, timeout) {
    return new Promise(function (resolve) {
      var finished = false;
      var timer = setTimeout(function () { finish(fallback); }, timeout || 1600);
      function finish(value) {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        resolve(value === undefined || value === null ? fallback : value);
      }
      try {
        Promise.resolve(fn()).then(finish).catch(function () { finish(fallback); });
      } catch (error) {
        finish(fallback);
      }
    });
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function toDate(value) {
    var date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDateTime(value) {
    var date = toDate(value);
    if (!date) return '—';
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
      ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  function formatBytes(bytes) {
    if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return '—';
    if (bytes < 1024) return bytes + ' B';
    var units = ['KB', 'MB', 'GB', 'TB', 'PB'];
    var value = bytes / 1024;
    var unit = units[0];
    for (var i = 0; i < units.length; i += 1) {
      unit = units[i];
      if (value < 1024 || i === units.length - 1) break;
      value /= 1024;
    }
    var digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
    return value.toFixed(digits).replace(/\.0+$/, '') + ' ' + unit;
  }

  function formatRefresh(rate) {
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) return '';
    var known = [24, 30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 180, 240, 360, 480, 540];
    var display = 0;
    for (var i = 0; i < known.length; i += 1) {
      if (Math.abs(rate - known[i]) <= Math.max(0.8, known[i] * 0.012)) {
        display = known[i];
        break;
      }
    }
    if (!display) {
      var rounded = Math.round(rate * 10) / 10;
      return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    }
    return String(display);
  }

  function formatDuration(seconds) {
    if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) return '—';
    if (seconds < 60) return Math.round(seconds) + ' 秒';
    var minutes = Math.round(seconds / 60);
    if (minutes < 60) return minutes + ' 分钟';
    var hours = Math.floor(minutes / 60);
    var rest = minutes % 60;
    return hours + ' 小时' + (rest ? ' ' + rest + ' 分钟' : '');
  }

  function approximatePhysicalPixels(value) {
    if (!Number.isFinite(value) || value <= 0) return null;
    var lower = Math.floor(value);
    var upper = Math.ceil(value);
    if (lower === upper) return lower;
    var lowerDistance = value - lower;
    var upperDistance = upper - value;
    if (lowerDistance < upperDistance - 1e-9) return lower;
    if (upperDistance < lowerDistance - 1e-9) return upper;
    // CSS 屏幕尺寸取整后再乘 DPR 会产生半分像素误差；恰好对半时优先偶数面板。
    return lower % 2 === 0 ? lower : upper;
  }

  function estimatePhysicalResolution(width, height, dpr) {
    var w = Number(width);
    var h = Number(height);
    var ratio = Number(dpr);
    if (!Number.isFinite(w) || !Number.isFinite(h) || !Number.isFinite(ratio) || w <= 0 || h <= 0 || ratio <= 0) return null;
    var physicalWidth = approximatePhysicalPixels(w * ratio);
    var physicalHeight = approximatePhysicalPixels(h * ratio);
    return physicalWidth && physicalHeight ? { width: physicalWidth, height: physicalHeight } : null;
  }

  function readMediaQuery(query) {
    if (typeof window.matchMedia !== 'function') return null;
    try {
      return window.matchMedia(query).matches;
    } catch (error) {
      return null;
    }
  }

  function containsAny(text, patterns) {
    for (var i = 0; i < patterns.length; i += 1) {
      if (patterns[i].test(text)) return true;
    }
    return false;
  }

  function getUaHintsBrands(list) {
    if (!Array.isArray(list)) return [];
    return list.map(function (entry) {
      return {
        brand: String(entry && entry.brand || ''),
        version: String(entry && entry.version || '')
      };
    }).filter(function (entry) { return entry.brand; });
  }

  function filterBrandsForDisplay(brands) {
    if (!Array.isArray(brands)) return [];
    return brands.filter(function (entry) {
      return entry && entry.brand && !/not.?_?a.?_?brand/i.test(entry.brand);
    });
  }

  async function readUaHints() {
    var uaData = navigator.userAgentData;
    if (!uaData) {
      return { supported: false, brands: [], mobile: null };
    }
    var base = {
      supported: true,
      brands: getUaHintsBrands(uaData.brands),
      mobile: typeof uaData.mobile === 'boolean' ? uaData.mobile : null
    };
    if (typeof uaData.getHighEntropyValues !== 'function') return base;
    try {
      var data = await uaData.getHighEntropyValues([
        'architecture', 'bitness', 'brands', 'formFactors', 'fullVersionList',
        'model', 'platformVersion', 'uaFullVersion', 'wow64'
      ]);
      return Object.assign({}, base, data, {
        brands: getUaHintsBrands(data.brands && data.brands.length ? data.brands : uaData.brands),
        fullVersionList: getUaHintsBrands(data.fullVersionList || [])
      });
    } catch (error) {
      return base;
    }
  }

  function detectOS(ua, uaHints) {
    var platformVersion = uaHints && uaHints.platformVersion ? String(uaHints.platformVersion) : '';
    var platform = navigator.platform || '';
    var isIPadOS = /iPad/.test(ua) || (/Macintosh/.test(ua) && platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var result = { family: '未知系统', version: '', display: '未知系统', note: '' };

    if (isIPadOS) {
      var ipadVersion = ua.match(/OS (\d+[_\d]*) like Mac OS X/i);
      return {
        family: 'iPadOS',
        version: ipadVersion ? ipadVersion[1].replace(/_/g, '.') : '',
        display: 'iPadOS' + (ipadVersion ? ' ' + ipadVersion[1].replace(/_/g, '.') : ''),
        note: ipadVersion ? '' : 'iPadOS 以桌面模式 UA 运行，系统版本由浏览器隐藏。'
      };
    }

    if (/iPhone|iPod/.test(ua)) {
      var iosVersion = ua.match(/OS (\d+[_\d]*) like Mac OS X/i);
      var version = iosVersion ? iosVersion[1].replace(/_/g, '.') : '';
      return {
        family: 'iOS',
        version: version,
        display: 'iOS' + (version ? ' ' + version : ''),
        note: ''
      };
    }

    if (/HarmonyOS\s*NEXT/i.test(ua)) {
      return { family: 'HarmonyOS', version: 'NEXT', display: 'HarmonyOS NEXT', note: '' };
    }
    if (/HarmonyOS|OpenHarmony/i.test(ua)) {
      var harmonyMatch = ua.match(/(?:HarmonyOS|OpenHarmony)\s*([\d.]+)?/i);
      var harmonyVersion = harmonyMatch && harmonyMatch[1] ? harmonyMatch[1] : '';
      var harmonyFamily = /OpenHarmony/i.test(ua) && !/HarmonyOS/i.test(ua) ? 'OpenHarmony' : 'HarmonyOS';
      return {
        family: harmonyFamily,
        version: harmonyVersion,
        display: harmonyFamily + (harmonyVersion ? ' ' + harmonyVersion : ''),
        note: ''
      };
    }

    if (/Windows Phone/i.test(ua)) {
      var wpVersion = ua.match(/Windows Phone(?: OS)? ([\d.]+)/i);
      return {
        family: 'Windows Phone',
        version: wpVersion ? wpVersion[1] : '',
        display: 'Windows Phone' + (wpVersion ? ' ' + wpVersion[1] : ''),
        note: ''
      };
    }

    if (/Android/i.test(ua) || /Android/i.test((uaHints && uaHints.platform) || '')) {
      var androidMatch = ua.match(/Android\s+([\d.]+)/i);
      var androidUaVersion = androidMatch ? androidMatch[1] : '';
      var reducedUa = /Android 10;\s*K[);]/i.test(ua) || /Android 10;\s*K\b/i.test(ua);
      var androidVersion = '';
      var androidNote = '';

      if (platformVersion) {
        var androidParts = platformVersion.split('.').map(function (part) { return parseInt(part, 10); });
        if (Number.isFinite(androidParts[0]) && androidParts[0] > 0) {
          androidVersion = String(androidParts[0]);
          if (Number.isFinite(androidParts[1]) && androidParts[1] > 0) {
            androidVersion += '.' + androidParts[1];
          }
          androidNote = '版本来自 User-Agent Client Hints。';
        }
      }
      if (!androidVersion && androidUaVersion && !reducedUa) {
        androidVersion = androidUaVersion;
        androidNote = '版本来自 User-Agent，浏览器可能对 UA 进行简化。';
      }
      if (!androidVersion && reducedUa) {
        androidNote = '浏览器使用简化 UA（Android 10），未提供真实系统版本。';
      }

      return {
        family: 'Android',
        version: androidVersion,
        display: 'Android' + (androidVersion ? ' ' + androidVersion : ''),
        note: androidNote
      };
    }

    if (/Windows NT/i.test(ua)) {
      var major = parseInt(platformVersion.split('.')[0], 10);
      var winVersion = '';
      var winNote = '';
      if (platformVersion && Number.isFinite(major)) {
        winVersion = major >= 13 ? '11' : '10';
      } else {
        var nt = ua.match(/Windows NT ([\d.]+)/i);
        var ntVersion = nt ? nt[1] : '';
        if (ntVersion === '6.3') winVersion = '8.1';
        else if (ntVersion === '6.2') winVersion = '8';
        else if (ntVersion === '6.1') winVersion = '7';
        else if (ntVersion === '10.0') {
          winVersion = '10 / 11';
          winNote = '用户代理只提供 Windows NT 10.0，无法区分 Windows 10 与 Windows 11。';
        } else if (ntVersion) {
          winVersion = ntVersion;
        }
      }
      return {
        family: 'Windows',
        version: winVersion,
        display: 'Windows' + (winVersion ? ' ' + winVersion : ''),
        note: winNote
      };
    }

    if (/CrOS/i.test(ua)) {
      var crosMatch = ua.match(/CrOS\s+\S+\s+([\d.]+)/i);
      var crosVersion = crosMatch ? crosMatch[1] : '';
      return {
        family: 'ChromeOS',
        version: crosVersion,
        display: 'ChromeOS' + (crosVersion ? ' ' + crosVersion : ''),
        note: ''
      };
    }

    if (/Macintosh|Mac OS X/i.test(ua)) {
      var macVersion = platformVersion || '';
      if (!macVersion) {
        var macUa = ua.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/i);
        if (macUa && !/^10[_.]15/.test(macUa[1])) {
          macVersion = macUa[1].replace(/_/g, '.');
        }
      }
      return {
        family: 'macOS',
        version: macVersion,
        display: 'macOS' + (macVersion ? ' ' + macVersion : ''),
        note: macVersion ? '' : '浏览器仅提供兼容 UA，实际 macOS 版本未公开。'
      };
    }

    if (/Linux|X11/i.test(ua)) {
      return { family: 'Linux', version: '', display: 'Linux', note: '未获取到发行版信息，浏览器通常不公开此项。' };
    }

    return result;
  }

  function isIOSBrowser(osFamily) {
    return osFamily === 'iOS' || osFamily === 'iPadOS';
  }

  function detectBrowser(ua, uaHints, os) {
    var ios = isIOSBrowser(os.family);
    var name = '';
    var version = '';

    function matchRule(rule) {
      if (rule.test.test(ua)) {
        name = rule.name;
        var versionMatch = rule.version.exec(ua);
        version = versionMatch ? versionMatch[1] : '';
        return true;
      }
      return false;
    }

    var rules = [
      { name: '微信内置浏览器', test: /MicroMessenger/i, version: /MicroMessenger\/([\d.]+)/i },
      { name: 'QQ 浏览器', test: /MQQBrowser/i, version: /MQQBrowser\/([\d.]+)/i },
      { name: '华为浏览器', test: /HuaweiBrowser/i, version: /HuaweiBrowser\/([\d.]+)/i },
      { name: '三星浏览器', test: /SamsungBrowser/i, version: /SamsungBrowser\/([\d.]+)/i },
      { name: 'UC 浏览器', test: /UCBrowser|UBrowser/i, version: /(?:UCBrowser|UBrowser)\/([\d.]+)/i },
      { name: '夸克浏览器', test: /Quark/i, version: /Quark\/([\d.]+)/i },
      { name: '小米浏览器', test: /MiuiBrowser/i, version: /MiuiBrowser\/([\d.]+)/i },
      { name: 'OPPO 浏览器', test: /HeyTapBrowser/i, version: /HeyTapBrowser\/([\d.]+)/i },
      { name: 'vivo 浏览器', test: /VivoBrowser/i, version: /VivoBrowser\/([\d.]+)/i },
      { name: 'DuckDuckGo', test: /DuckDuckGo/i, version: /DuckDuckGo\/([\d.]+)/i },
      { name: 'Vivaldi', test: /Vivaldi/i, version: /Vivaldi\/([\d.]+)/i },
      { name: 'Yandex Browser', test: /YaBrowser/i, version: /YaBrowser\/([\d.]+)/i },
      { name: 'Android WebView', test: /(?:;\s*wv[);])|(?:Version\/4\.0.*Chrome\/)/i, version: /Version\/([\d.]+)/i },
      { name: 'Microsoft Edge', test: /EdgiOS\//i, version: /EdgiOS\/([\d.]+)/i },
      { name: 'Microsoft Edge', test: /EdgA?\//i, version: /EdgA?\/([\d.]+)/i },
      { name: 'Opera', test: /OPiOS\//i, version: /OPiOS\/([\d.]+)/i },
      { name: 'Opera', test: /OPR\//i, version: /OPR\/([\d.]+)/i },
      { name: 'Opera Mini', test: /Opera Mini/i, version: /Version\/([\d.]+)/i },
      { name: 'Firefox', test: /FxiOS\//i, version: /FxiOS\/([\d.]+)/i },
      { name: 'Firefox', test: /Firefox\//i, version: /Firefox\/([\d.]+)/i },
      { name: 'Chrome', test: /CriOS\//i, version: /CriOS\/([\d.]+)/i },
      { name: 'Chrome', test: /Chrome\//i, version: /Chrome\/([\d.]+)/i },
      { name: 'Chromium', test: /Chromium\//i, version: /Chromium\/([\d.]+)/i },
      { name: 'Safari', test: /Safari\//i, version: /Version\/([\d.]+)/i }
    ];

    for (var i = 0; i < rules.length; i += 1) {
      if (matchRule(rules[i])) break;
    }

    var brands = filterBrandsForDisplay(uaHints && (uaHints.fullVersionList && uaHints.fullVersionList.length ? uaHints.fullVersionList : uaHints.brands));
    var brandNames = brands.map(function (entry) { return (entry.brand || '').toLowerCase(); });
    var brandBrowser = '';
    if (brandNames.some(function (item) { return item.indexOf('brave') !== -1; })) brandBrowser = 'Brave';
    else if (brandNames.some(function (item) { return item.indexOf('opera') !== -1; })) brandBrowser = 'Opera';
    else if (brandNames.some(function (item) { return item.indexOf('edge') !== -1; })) brandBrowser = 'Microsoft Edge';
    else if (brandNames.some(function (item) { return item.indexOf('vivaldi') !== -1; })) brandBrowser = 'Vivaldi';
    if (brandBrowser && (name === 'Chrome' || name === 'Chromium' || !name)) {
      name = brandBrowser;
    }

    var engine = '未知内核';
    var engineVersion = '';
    if (ios) {
      engine = 'WebKit';
      var appleWebKit = ua.match(/AppleWebKit\/([\d.]+)/i);
      engineVersion = appleWebKit ? appleWebKit[1] : '';
    } else if (name === 'Firefox') {
      engine = 'Gecko';
      var firefox = ua.match(/Firefox\/([\d.]+)/i);
      engineVersion = firefox ? firefox[1] : '';
    } else if (/AppleWebKit\//i.test(ua) && /(?:Chrome|Chromium|CriOS|Edg|OPR|SamsungBrowser|Vivaldi|YaBrowser|HuaweiBrowser|Quark|UCBrowser|UBrowser|MiuiBrowser|MQQBrowser|wv)\//i.test(ua)) {
      engine = 'Blink';
      var chromeVersion = ua.match(/(?:Chrome|Chromium)\/([\d.]+)/i);
      engineVersion = chromeVersion ? chromeVersion[1] : version;
    } else if (/AppleWebKit\//i.test(ua)) {
      engine = 'WebKit';
      var webkitVersion = ua.match(/AppleWebKit\/([\d.]+)/i);
      engineVersion = webkitVersion ? webkitVersion[1] : '';
    } else if (/Gecko\/\d+/i.test(ua)) {
      engine = 'Gecko';
      var geckoVersion = ua.match(/Gecko\/([\d.]+)/i);
      engineVersion = geckoVersion ? geckoVersion[1] : '';
    }

    if (engine === 'Blink' && name === 'Android WebView') {
      var chromeWebViewVersion = ua.match(/Chrome\/([\d.]+)/i);
      if (chromeWebViewVersion) engineVersion = chromeWebViewVersion[1];
    }

    if (!name) name = '未知浏览器';
    return {
      name: name,
      version: version,
      display: name + (version ? ' ' + version : ''),
      engine: engine,
      engineVersion: engineVersion,
      vendor: safeCall(function () { return navigator.vendor || ''; }, ''),
      brands: brands,
      uaHintsSupported: Boolean(uaHints && uaHints.supported),
      note: ios ? '在 iOS / iPadOS 上，所有浏览器均使用系统 WebKit 渲染内核。' : ''
    };
  }

  function detectArchitecture(ua, uaHints, os, webgl) {
    var arch = uaHints && uaHints.architecture ? String(uaHints.architecture) : '';
    var bitness = uaHints && uaHints.bitness ? String(uaHints.bitness) : '';
    if (arch) {
      var archLabel = arch === 'x86' ? 'x86' : arch === 'arm' ? 'ARM' : arch;
      if (bitness) archLabel += '（' + bitness + ' 位）';
      return { label: archLabel, note: '来源：User-Agent Client Hints' };
    }
    if (/arm64|aarch64/i.test(ua)) return { label: 'ARM64', note: '来源：User-Agent' };
    if (os.family === 'iOS' || os.family === 'iPadOS') return { label: 'ARM64', note: 'Apple 移动设备架构推断' };
    if (/Win64|WOW64|x64/i.test(ua)) return { label: 'x86（64 位）', note: '来源：User-Agent 兼容标识' };
    if (/Win32/i.test(ua)) return { label: 'x86（32 位）', note: '来源：User-Agent 兼容标识' };
    var renderer = webgl && (webgl.renderer || webgl.maskedRenderer) || '';
    if (/Apple\s+M\d/i.test(renderer)) return { label: 'Apple Silicon（ARM64）', note: '根据 GPU 标识推断' };
    return { label: '浏览器未公开', note: '浏览器出于隐私或兼容性隐藏了处理器架构。' };
  }

  function extractDeviceModel(ua, uaHints) {
    var model = uaHints && uaHints.model ? String(uaHints.model).trim() : '';
    if (model && !/^(k|mobile|tablet|unknown|generic)$/i.test(model)) return model;
    var match = ua.match(/Android[^;]*;\s*([^;)]+?)(?:\s+Build\/|\))/i);
    if (match) {
      var uaModel = match[1].trim().replace(/\s+Build$/i, '');
      if (uaModel && !/^(k|mobile|tablet|wv)$/i.test(uaModel)) return uaModel;
    }
    return '';
  }

  function detectFormFactor(ua, uaHints, os) {
    var formFactors = Array.isArray(uaHints && uaHints.formFactors)
      ? uaHints.formFactors.map(function (item) { return String(item).toLowerCase(); })
      : [];
    var shortSide = Math.min(window.screen.width || 0, window.screen.height || 0);
    var isIpad = /iPad/.test(ua) || os.family === 'iPadOS' || (/Macintosh/.test(ua) && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIpad) return 'tablet';
    if (os.family === 'iOS' || /iPhone|iPod/.test(ua)) return 'phone';
    if (formFactors.indexOf('tablet') !== -1) return 'tablet';
    if (formFactors.indexOf('mobile') !== -1) return shortSide >= 600 ? 'tablet' : 'phone';
    if (/Tablet|PlayBook|Kindle|Silk/i.test(ua)) return 'tablet';
    if (/Android|HarmonyOS|OpenHarmony|Windows Phone|BlackBerry|Opera Mini|Opera Mobi/i.test(ua) || os.family === 'Android') {
      return shortSide >= 600 ? 'tablet' : 'phone';
    }
    var desktopOS = /Windows NT|Macintosh|X11|CrOS/i.test(ua) || ['Windows', 'macOS', 'Linux', 'ChromeOS'].indexOf(os.family) !== -1;
    if (!desktopOS && navigator.maxTouchPoints > 0 && /Mobile/i.test(ua)) {
      return shortSide >= 600 ? 'tablet' : 'phone';
    }
    return 'desktop';
  }

  function formFactorLabel(value) {
    if (value === 'phone') return '手机';
    if (value === 'tablet') return '平板';
    return '电脑';
  }

  function viewLabel(view) {
    return view === 'mobile' ? '手机 / 平板检测' : '电脑端检测';
  }

  function readRefreshRate(duration) {
    return new Promise(function (resolve) {
      if (typeof window.requestAnimationFrame !== 'function') {
        resolve({ hz: null, frames: 0, durationMs: 0, reason: 'unsupported' });
        return;
      }
      if (document.visibilityState === 'hidden') {
        resolve({ hz: null, frames: 0, durationMs: 0, reason: 'hidden' });
        return;
      }
      var frameTimes = [];
      var start = 0;
      var finished = false;
      var timeout = setTimeout(function () { finish('interrupted'); }, (duration || 1100) + 700);

      function finish(reason) {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        if (frameTimes.length < 6) {
          resolve({ hz: null, frames: frameTimes.length, durationMs: 0, reason: reason || 'insufficient' });
          return;
        }
        var intervals = [];
        for (var i = 1; i < frameTimes.length; i += 1) {
          var delta = frameTimes[i] - frameTimes[i - 1];
          if (delta >= 1 && delta <= 1000) intervals.push(delta);
        }
        intervals.sort(function (a, b) { return a - b; });
        if (intervals.length < 5) {
          resolve({ hz: null, frames: frameTimes.length, durationMs: 0, reason: 'insufficient' });
          return;
        }
        var median = intervals[Math.floor(intervals.length / 2)];
        var hz = Math.round((1000 / median) * 100) / 100;
        if (!Number.isFinite(hz) || hz < 10 || hz > 540) {
          resolve({ hz: null, frames: frameTimes.length, durationMs: 0, reason: 'invalid' });
          return;
        }
        resolve({
          hz: hz,
          frames: frameTimes.length,
          durationMs: Math.round(frameTimes[frameTimes.length - 1] - frameTimes[0]),
          reason: reason || 'measured'
        });
      }

      function tick(now) {
        if (finished) return;
        if (!start) start = now;
        frameTimes.push(now);
        if (now - start >= (duration || 1100)) {
          finish('measured');
        } else {
          window.requestAnimationFrame(tick);
        }
      }
      window.requestAnimationFrame(tick);
    });
  }

  function readWebGL() {
    var empty = {
      supported: false,
      supportedWebgl2: false,
      vendor: '',
      renderer: '',
      maskedVendor: '',
      maskedRenderer: '',
      version: '',
      shadingLanguageVersion: '',
      backend: '浏览器未公开',
      software: false,
      gpuName: '',
      gpuVendor: '',
      gpuRaw: '',
      antialias: null,
      maxTextureSize: null,
      maxRenderbufferSize: null,
      maxViewport: null,
      maxAnisotropy: null
    };
    try {
      var webgl2Canvas = document.createElement('canvas');
      var gl2 = webgl2Canvas.getContext('webgl2');
      var canvas = document.createElement('canvas');
      var gl = gl2 || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return empty;
      var debug = gl.getExtension('WEBGL_debug_renderer_info');
      var aniso = gl.getExtension('EXT_texture_filter_anisotropic') ||
        gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
        gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
      var attrs = gl.getContextAttributes ? gl.getContextAttributes() : {};
      var result = {
        supported: true,
        supportedWebgl2: Boolean(gl2),
        vendor: debug ? safeCall(function () { return gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) || ''; }, '') : '',
        renderer: debug ? safeCall(function () { return gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) || ''; }, '') : '',
        maskedVendor: safeCall(function () { return gl.getParameter(gl.VENDOR) || ''; }, ''),
        maskedRenderer: safeCall(function () { return gl.getParameter(gl.RENDERER) || ''; }, ''),
        version: safeCall(function () { return gl.getParameter(gl.VERSION) || ''; }, ''),
        shadingLanguageVersion: safeCall(function () { return gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || ''; }, ''),
        backend: '浏览器未公开',
        software: false,
        antialias: typeof attrs.antialias === 'boolean' ? attrs.antialias : null,
        maxTextureSize: safeCall(function () { return gl.getParameter(gl.MAX_TEXTURE_SIZE); }, null),
        maxRenderbufferSize: safeCall(function () { return gl.getParameter(gl.MAX_RENDERBUFFER_SIZE); }, null),
        maxViewport: safeCall(function () { return Array.from(gl.getParameter(gl.MAX_VIEWPORT_DIMS) || []); }, null),
        maxAnisotropy: aniso ? safeCall(function () { return gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT); }, null) : null
      };
      var renderer = result.renderer || result.maskedRenderer || '';
      var gpuInfo = parseGpuInfo(renderer, result.vendor || result.maskedVendor);
      result.backend = gpuInfo.backend;
      result.software = gpuInfo.software;
      result.gpuName = gpuInfo.name || '';
      result.gpuVendor = gpuInfo.vendor || '';
      result.gpuRaw = gpuInfo.raw || renderer;
      safeCall(function () {
        var lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      });
      if (gl2 && gl2 !== gl) {
        safeCall(function () { var lose2 = gl2.getExtension('WEBGL_lose_context'); if (lose2) lose2.loseContext(); });
      }
      return result;
    } catch (error) {
      return empty;
    }
  }

  function detectGraphicsBackend(renderer) {
    if (/Direct3D\s*12|D3D12/i.test(renderer)) return 'Direct3D 12';
    if (/Direct3D\s*11|D3D11/i.test(renderer)) return 'Direct3D 11';
    if (/Metal/i.test(renderer)) return 'Metal';
    if (/Vulkan/i.test(renderer)) return 'Vulkan';
    if (/OpenGL/i.test(renderer)) return 'OpenGL';
    if (/ANGLE/i.test(renderer)) return 'ANGLE';
    return '浏览器未公开';
  }

  function parseGpuInfo(renderer, vendor) {
    var raw = String(renderer || '').trim();
    var name = parseGpuName(raw);
    var software = /SwiftShader|llvmpipe|software rasterizer|Microsoft Basic Render/i.test(raw);
    if (!name && software) name = '软件光栅化器';
    return {
      name: name,
      vendor: inferGpuVendor(vendor, name, raw),
      raw: raw,
      backend: detectGraphicsBackend(raw),
      software: software
    };
  }

  function parseGpuName(renderer) {
    var text = String(renderer || '').trim();
    if (!text) return '';
    if (/^(WebKit WebGL|WebGL|Mozilla|Generic Renderer)$/i.test(text)) return '';
    if (/SwiftShader/i.test(text)) return 'SwiftShader 软件渲染器';
    var candidate = text;
    var angle = text.match(/^ANGLE\s*\(([\s\S]*)\)\s*$/i);
    if (angle) {
      var pieces = angle[1].split(/\s*,\s*/).map(function (part) { return part.trim(); }).filter(function (part) {
        return part && !/^(D3D\d+|Direct3D\d*|OpenGL|Vulkan|Metal|Unspecified Version)$/i.test(part);
      });
      pieces.sort(function (a, b) { return b.length - a.length; });
      candidate = pieces[0] || text;
    } else {
      var parts = text.split(/\s*,\s*/).map(function (part) { return part.trim(); }).filter(function (part) {
        return part && !/^Unspecified Version$/i.test(part);
      });
      parts.sort(function (a, b) { return b.length - a.length; });
      candidate = parts[0] || text;
    }
    candidate = candidate
      .replace(/^ANGLE\s+Metal Renderer:\s*/i, '')
      .replace(/^ANGLE\s*Renderer:\s*/i, '')
      .replace(/^ANGLE\s*/i, '')
      .replace(/\s+(?:Direct3D\d*|D3D\d+|OpenGL(?:\s+Engine)?|Vulkan|Metal)\b[\s\S]*$/i, '')
      .replace(/\s+(?:vs|ps)_\d+_\d+[\s\S]*$/i, '')
      .replace(/\s*\(0x[0-9a-f]+\)/gi, '')
      .replace(/^Direct3D\d*\s*,\s*/i, '')
      .replace(/\s*\((?:R|TM)\)\s*/gi, ' ')
      .replace(/[®™]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!candidate || /^(WebKit WebGL|WebGL|Mozilla|Generic Renderer)$/i.test(candidate)) return '';
    return candidate;
  }

  function inferGpuVendor(rawVendor, name, renderer) {
    var corpus = [name, rawVendor, renderer].filter(Boolean).join(' ');
    var brands = [
      [/NVIDIA|GeForce/i, 'NVIDIA'],
      [/AMD|Radeon/i, 'AMD'],
      [/Intel/i, 'Intel'],
      [/Apple/i, 'Apple'],
      [/Qualcomm|Adreno/i, 'Qualcomm'],
      [/ARM|Mali/i, 'ARM'],
      [/Imagination|PowerVR/i, 'Imagination'],
      [/Microsoft/i, 'Microsoft'],
      [/Google|SwiftShader/i, 'Google']
    ];
    for (var i = 0; i < brands.length; i += 1) {
      if (brands[i][0].test(corpus)) return brands[i][1];
    }
    var cleaned = String(rawVendor || '')
      .replace(/^Google Inc\.\s*\((.*)\)$/i, '$1')
      .replace(/^Google Inc\.?$/i, '')
      .replace(/^WebKit$/i, '')
      .trim();
    return cleaned;
  }

  function shortGpuName(renderer, vendor) {
    var info = parseGpuInfo(renderer, vendor);
    return info.name || '浏览器未公开';
  }

  async function snapshotWebGpuAdapter(adapter, source) {
    var info = adapter.info || null;
    if (!info && typeof adapter.requestAdapterInfo === 'function') {
      try { info = await adapter.requestAdapterInfo(); } catch (error) { info = null; }
    }
    var features = [];
    try { features = Array.from(adapter.features || []); } catch (error) { features = []; }
    var limits = null;
    try {
      limits = {
        maxTextureDimension2D: adapter.limits.maxTextureDimension2D,
        maxBufferSize: adapter.limits.maxBufferSize,
        maxComputeWorkgroupStorageSize: adapter.limits.maxComputeWorkgroupStorageSize
      };
    } catch (error) {
      limits = null;
    }
    return {
      source: source,
      info: info ? {
        vendor: info.vendor || '',
        architecture: info.architecture || '',
        device: info.device || '',
        description: info.description || ''
      } : null,
      features: features,
      limits: limits
    };
  }

  async function readWebGPU() {
    if (!navigator.gpu) return { supported: false, adapter: null, info: null, features: [], limits: null };
    try {
      var adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return { supported: true, adapter: false, info: null, features: [], limits: null };
      var snapshot = await snapshotWebGpuAdapter(adapter, 'default');
      return {
        supported: true,
        adapter: true,
        info: snapshot.info,
        features: snapshot.features,
        limits: snapshot.limits
      };
    } catch (error) {
      return { supported: true, adapter: false, info: null, features: [], limits: null };
    }
  }

  async function readBattery() {
    if (typeof navigator.getBattery !== 'function') return null;
    var battery = await navigator.getBattery();
    return {
      level: typeof battery.level === 'number' ? battery.level : null,
      charging: typeof battery.charging === 'boolean' ? battery.charging : null,
      chargingTime: typeof battery.chargingTime === 'number' ? battery.chargingTime : null,
      dischargingTime: typeof battery.dischargingTime === 'number' ? battery.dischargingTime : null
    };
  }

  async function readStorage() {
    var result = {
      supported: Boolean(navigator.storage),
      estimate: null,
      persisted: null,
      localStorage: true,
      sessionStorage: true,
      indexedDB: 'indexedDB' in window,
      caches: 'caches' in window
    };
    try {
      localStorage.setItem('__device_lens_probe__', '1');
      localStorage.removeItem('__device_lens_probe__');
    } catch (error) {
      result.localStorage = false;
    }
    try {
      sessionStorage.setItem('__device_lens_probe__', '1');
      sessionStorage.removeItem('__device_lens_probe__');
    } catch (error) {
      result.sessionStorage = false;
    }
    if (navigator.storage && typeof navigator.storage.estimate === 'function') {
      try { result.estimate = await navigator.storage.estimate(); } catch (error) { result.estimate = null; }
    }
    if (navigator.storage && typeof navigator.storage.persisted === 'function') {
      try { result.persisted = await navigator.storage.persisted(); } catch (error) { result.persisted = null; }
    }
    return result;
  }

  function readConnection() {
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return { type: '', saveData: null };
    return {
      type: connection.type || '',
      saveData: typeof connection.saveData === 'boolean' ? connection.saveData : null
    };
  }

  async function readMediaDevices() {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.enumerateDevices !== 'function') return null;
    var devices = await navigator.mediaDevices.enumerateDevices();
    return {
      available: true,
      counts: {
        videoinput: devices.filter(function (d) { return d.kind === 'videoinput'; }).length,
        audioinput: devices.filter(function (d) { return d.kind === 'audioinput'; }).length,
        audiooutput: devices.filter(function (d) { return d.kind === 'audiooutput'; }).length
      },
      labelled: devices.some(function (d) { return Boolean(d.label); }),
      labels: devices.filter(function (d) { return Boolean(d.label); }).map(function (d) {
        return { kind: d.kind, label: d.label };
      })
    };
  }

  function permissionError(message, name) {
    var error = new Error(message);
    error.name = name || 'NotSupportedError';
    return error;
  }

  async function queryPermissions() {
    var result = {
      camera: 'unsupported',
      microphone: 'unsupported',
      'window-management': 'unsupported',
      mediaCaptureSupported: Boolean(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function'),
      screenDetailsSupported: typeof window.getScreenDetails === 'function',
      secureContext: Boolean(window.isSecureContext)
    };
    if (!navigator.permissions || typeof navigator.permissions.query !== 'function') return result;
    await Promise.all(['camera', 'microphone', 'window-management'].map(async function (name) {
      try {
        var status = await navigator.permissions.query({ name: name });
        result[name] = status.state;
      } catch (error) {
        result[name] = 'unsupported';
      }
    }));
    return result;
  }

  function snapshotScreen(screenObject, index) {
    return {
      index: index,
      label: safeCall(function () { return screenObject.label || ''; }, ''),
      isPrimary: safeCall(function () { return Boolean(screenObject.isPrimary); }, false),
      isInternal: safeCall(function () { return typeof screenObject.isInternal === 'boolean' ? screenObject.isInternal : null; }, null),
      width: safeCall(function () { return screenObject.width || null; }, null),
      height: safeCall(function () { return screenObject.height || null; }, null),
      availWidth: safeCall(function () { return screenObject.availWidth || null; }, null),
      availHeight: safeCall(function () { return screenObject.availHeight || null; }, null),
      colorDepth: safeCall(function () { return screenObject.colorDepth || null; }, null),
      pixelDepth: safeCall(function () { return screenObject.pixelDepth || null; }, null),
      devicePixelRatio: safeCall(function () { return screenObject.devicePixelRatio || null; }, null),
      orientationType: safeCall(function () {
        return screenObject.orientation && screenObject.orientation.type ? screenObject.orientation.type : '';
      }, ''),
      left: safeCall(function () { return typeof screenObject.left === 'number' ? screenObject.left : null; }, null),
      top: safeCall(function () { return typeof screenObject.top === 'number' ? screenObject.top : null; }, null)
    };
  }

  async function requestScreenDetails() {
    if (!window.isSecureContext) {
      throw permissionError('详细屏幕信息只能在 HTTPS 或 localhost 安全上下文中读取。', 'NotSupportedError');
    }
    if (typeof window.getScreenDetails !== 'function') {
      throw permissionError('当前浏览器不支持 Window Management 权限，无法读取多显示器详情。', 'NotSupportedError');
    }
    var details = await window.getScreenDetails();
    var screenList = Array.from(details.screens || []);
    var currentScreen = details.currentScreen;
    var currentIndex = screenList.indexOf(currentScreen);
    return {
      supported: true,
      screens: screenList.map(snapshotScreen),
      currentIndex: currentIndex,
      collectedAt: new Date().toISOString()
    };
  }

  async function requestMediaDeviceAccess() {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      throw permissionError('当前浏览器或页面环境不提供媒体设备权限接口。', 'NotSupportedError');
    }
    if (!window.isSecureContext) {
      throw permissionError('媒体设备名称只能在 HTTPS 或 localhost 安全上下文中读取。', 'NotSupportedError');
    }
    var stream = null;
    var constraints = {};
    try {
      var existing = await navigator.mediaDevices.enumerateDevices();
      var hasAudio = existing.some(function (device) { return device.kind === 'audioinput'; });
      var hasVideo = existing.some(function (device) { return device.kind === 'videoinput'; });
      if (hasAudio) constraints.audio = true;
      if (hasVideo) constraints.video = true;
      if (!constraints.audio && !constraints.video) {
        constraints.audio = true;
        constraints.video = true;
      }
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } finally {
      if (stream) stream.getTracks().forEach(function (track) { try { track.stop(); } catch (error) {} });
    }
    var devices = await readMediaDevices();
    return {
      constraints: Object.keys(constraints),
      devices: devices
    };
  }

  function readAudio() {
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    var context = null;
    try {
      context = new AudioContextClass();
      var value = {
        sampleRate: context.sampleRate || null,
        maxChannelCount: context.destination && typeof context.destination.maxChannelCount === 'number'
          ? context.destination.maxChannelCount : null,
        state: context.state || '',
        baseLatency: typeof context.baseLatency === 'number' ? context.baseLatency : null
      };
      if (typeof context.close === 'function') context.close().catch(function () {});
      return value;
    } catch (error) {
      if (context && typeof context.close === 'function') {
        try { context.close(); } catch (closeError) {}
      }
      return null;
    }
  }

  function readMediaFormats() {
    var video = document.createElement('video');
    var audio = document.createElement('audio');
    function test(element, type) {
      try {
        var result = element.canPlayType(type);
        return result === 'probably' ? 'supported' : result === 'maybe' ? 'maybe' : 'unsupported';
      } catch (error) {
        return 'unsupported';
      }
    }
    return {
      video: [
        { label: 'H.264 / AVC', type: 'video/mp4; codecs="avc1.42E01E"', support: test(video, 'video/mp4; codecs="avc1.42E01E"') },
        { label: 'H.265 / HEVC', type: 'video/mp4; codecs="hvc1.1.6.L93.B0"', support: test(video, 'video/mp4; codecs="hvc1.1.6.L93.B0"') },
        { label: 'AV1', type: 'video/mp4; codecs="av01.0.05M.08"', support: test(video, 'video/mp4; codecs="av01.0.05M.08"') },
        { label: 'VP9', type: 'video/webm; codecs="vp9"', support: test(video, 'video/webm; codecs="vp9"') },
        { label: 'MP4 容器', type: 'video/mp4', support: test(video, 'video/mp4') },
        { label: 'WebM 容器', type: 'video/webm', support: test(video, 'video/webm') }
      ],
      audio: [
        { label: 'AAC', type: 'audio/mp4; codecs="mp4a.40.2"', support: test(audio, 'audio/mp4; codecs="mp4a.40.2"') },
        { label: 'Opus', type: 'audio/webm; codecs="opus"', support: test(audio, 'audio/webm; codecs="opus"') },
        { label: 'FLAC', type: 'audio/flac', support: test(audio, 'audio/flac') },
        { label: 'MP3', type: 'audio/mpeg', support: test(audio, 'audio/mpeg') }
      ]
    };
  }

  function readFeatureGroups(webgl) {
    function item(label, supported) {
      return { label: label, supported: Boolean(supported) };
    }
    return [
      {
        title: '平台与应用',
        items: [
          item('Service Worker', 'serviceWorker' in navigator),
          item('WebAssembly', typeof WebAssembly === 'object'),
          item('Web Workers', typeof Worker !== 'undefined'),
          item('IndexedDB', 'indexedDB' in window),
          item('Web Share', typeof navigator.share === 'function'),
          item('File System Access', 'showOpenFilePicker' in window),
          item('Clipboard API', Boolean(navigator.clipboard)),
          item('WebAuthn / Passkeys', typeof window.PublicKeyCredential !== 'undefined'),
          item('Notifications', 'Notification' in window),
          item('Payment Request', 'PaymentRequest' in window)
        ]
      },
      {
        title: '图形与媒体',
        items: [
          item('WebGL 2', webgl && webgl.supportedWebgl2),
          item('WebGPU', Boolean(navigator.gpu)),
          item('WebRTC', typeof window.RTCPeerConnection !== 'undefined'),
          item('Media Source', 'MediaSource' in window),
          item('MediaRecorder', 'MediaRecorder' in window),
          item('Encrypted Media', 'requestMediaKeySystemAccess' in navigator),
          item('WebXR', 'xr' in navigator),
          item('Picture-in-Picture', Boolean(document.pictureInPictureEnabled)),
          item('Web Speech', 'speechSynthesis' in window || 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
        ]
      },
      {
        title: '外设与系统',
        items: [
          item('Web Bluetooth', 'bluetooth' in navigator),
          item('Web USB', 'usb' in navigator),
          item('Web Serial', 'serial' in navigator),
          item('Web NFC', 'NDEFReader' in window),
          item('Web HID', 'hid' in navigator),
          item('Gamepad API', typeof navigator.getGamepads === 'function'),
          item('Vibration', typeof navigator.vibrate === 'function'),
          item('Wake Lock', 'wakeLock' in navigator),
          item('Orientation Lock', Boolean(screen.orientation && typeof screen.orientation.lock === 'function')),
          item('Geolocation', 'geolocation' in navigator),
          item('Contact Picker', 'contacts' in navigator)
        ]
      }
    ];
  }

  function readSensors() {
    return [
      { label: '设备方向', supported: 'DeviceOrientationEvent' in window },
      { label: '设备运动', supported: 'DeviceMotionEvent' in window },
      { label: '加速度计', supported: 'Accelerometer' in window },
      { label: '陀螺仪', supported: 'Gyroscope' in window },
      { label: '磁力计', supported: 'Magnetometer' in window },
      { label: '环境光', supported: 'AmbientLightSensor' in window },
      { label: '距离传感器', supported: 'ProximitySensor' in window }
    ];
  }

  function readGamepads() {
    if (typeof navigator.getGamepads !== 'function') return { supported: false, connected: [] };
    var pads = [];
    try {
      pads = Array.from(navigator.getGamepads()).filter(Boolean).map(function (pad) {
        return { id: pad.id, connected: pad.connected, mapping: pad.mapping };
      });
    } catch (error) {
      pads = [];
    }
    return { supported: true, connected: pads };
  }

  function readScreen() {
    var orientationType = '';
    var orientationAngle = null;
    if (screen.orientation) {
      orientationType = screen.orientation.type || '';
      orientationAngle = typeof screen.orientation.angle === 'number' ? screen.orientation.angle : null;
    } else if (typeof window.orientation === 'number') {
      orientationAngle = window.orientation;
      orientationType = Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
    }
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    var width = screen.width || viewportWidth || null;
    var height = screen.height || viewportHeight || null;
    return {
      width: width,
      height: height,
      availWidth: screen.availWidth || width,
      availHeight: screen.availHeight || height,
      colorDepth: screen.colorDepth || null,
      pixelDepth: screen.pixelDepth || null,
      dpr: window.devicePixelRatio || 1,
      orientationType: orientationType,
      orientationAngle: orientationAngle,
      isExtended: typeof screen.isExtended === 'boolean' ? screen.isExtended : null,
      viewportWidth: viewportWidth,
      viewportHeight: viewportHeight,
      outerWidth: window.outerWidth || null,
      outerHeight: window.outerHeight || null,
      screenFallback: !(screen.width && screen.height)
    };
  }

  function readDisplayMedia() {
    var colorSchemeDark = readMediaQuery('(prefers-color-scheme: dark)');
    var contrastMore = readMediaQuery('(prefers-contrast: more)');
    var contrastLess = readMediaQuery('(prefers-contrast: less)');
    var contrastCustom = readMediaQuery('(prefers-contrast: custom)');
    var displayModes = ['browser', 'standalone', 'minimal-ui', 'fullscreen', 'picture-in-picture'];
    var displayMode = 'browser';
    for (var i = 0; i < displayModes.length; i += 1) {
      if (readMediaQuery('(display-mode: ' + displayModes[i] + ')')) {
        displayMode = displayModes[i];
        break;
      }
    }
    var gamut = 'browser 未公开';
    if (readMediaQuery('(color-gamut: rec2020)')) gamut = 'Rec.2020';
    else if (readMediaQuery('(color-gamut: p3)')) gamut = 'Display-P3';
    else if (readMediaQuery('(color-gamut: srgb)')) gamut = 'sRGB';
    return {
      dark: colorSchemeDark,
      colorScheme: colorSchemeDark === null ? 'browser 未公开' : colorSchemeDark ? 'dark' : 'light',
      contrast: contrastMore ? 'more' : contrastLess ? 'less' : contrastCustom ? 'custom' : 'no-preference',
      reducedMotion: readMediaQuery('(prefers-reduced-motion: reduce)'),
      reducedTransparency: readMediaQuery('(prefers-reduced-transparency: reduce)'),
      reducedData: readMediaQuery('(prefers-reduced-data: reduce)'),
      forcedColors: readMediaQuery('(forced-colors: active)'),
      displayMode: displayMode,
      pointer: readMediaQuery('(pointer: coarse)') ? 'coarse' : readMediaQuery('(pointer: fine)') ? 'fine' : 'none',
      anyPointer: readMediaQuery('(any-pointer: coarse)') ? 'coarse' : readMediaQuery('(any-pointer: fine)') ? 'fine' : 'none',
      hover: readMediaQuery('(hover: hover)') ? 'hover' : readMediaQuery('(hover: none)') ? 'none' : 'unknown',
      anyHover: readMediaQuery('(any-hover: hover)') ? 'hover' : readMediaQuery('(any-hover: none)') ? 'none' : 'unknown',
      dynamicRangeHigh: readMediaQuery('(dynamic-range: high)'),
      videoDynamicRangeHigh: readMediaQuery('(video-dynamic-range: high)'),
      colorGamut: gamut,
      colorGamutP3: readMediaQuery('(color-gamut: p3)'),
      colorGamutRec2020: readMediaQuery('(color-gamut: rec2020)')
    };
  }

  function readLocale() {
    var options = {};
    try { options = Intl.DateTimeFormat().resolvedOptions(); } catch (error) {}
    var offset = -new Date().getTimezoneOffset();
    var sign = offset >= 0 ? '+' : '-';
    var absolute = Math.abs(offset);
    var utcOffset = 'UTC' + sign + pad(Math.floor(absolute / 60)) + ':' + pad(absolute % 60);
    return {
      language: navigator.language || '',
      languages: Array.isArray(navigator.languages) ? navigator.languages.slice() : [],
      timeZone: options.timeZone || '',
      utcOffset: utcOffset,
      calendar: options.calendar || '',
      numberingSystem: options.numberingSystem || '',
      hourCycle: options.hourCycle || '',
      localTime: formatDateTime(new Date())
    };
  }

  function readHardware() {
    var memory = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null;
    var heapLimit = null;
    var heapUsed = null;
    if (window.performance && performance.memory) {
      heapLimit = typeof performance.memory.jsHeapSizeLimit === 'number' ? performance.memory.jsHeapSizeLimit : null;
      heapUsed = typeof performance.memory.usedJSHeapSize === 'number' ? performance.memory.usedJSHeapSize : null;
    }
    return {
      cores: typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null,
      deviceMemory: memory,
      jsHeapLimit: heapLimit,
      jsHeapUsed: heapUsed,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      platform: navigator.platform || '',
      gamepads: readGamepads()
    };
  }

  function readBrowserPrivacy() {
    var dnt = navigator.doNotTrack;
    if (dnt === undefined) dnt = window.doNotTrack;
    if (dnt === undefined) dnt = navigator.msDoNotTrack;
    return {
      cookieEnabled: typeof navigator.cookieEnabled === 'boolean' ? navigator.cookieEnabled : null,
      doNotTrack: dnt === undefined || dnt === null ? null : String(dnt),
      globalPrivacyControl: typeof navigator.globalPrivacyControl === 'boolean' ? navigator.globalPrivacyControl : null,
      pdfViewerEnabled: typeof navigator.pdfViewerEnabled === 'boolean' ? navigator.pdfViewerEnabled : null,
      webdriver: typeof navigator.webdriver === 'boolean' ? navigator.webdriver : null,
      secureContext: Boolean(window.isSecureContext),
      userAgentDataSupported: Boolean(navigator.userAgentData),
      standalone: typeof navigator.standalone === 'boolean' ? navigator.standalone : null
    };
  }

  async function collectEnvironment() {
    var ua = navigator.userAgent || '';
    var refreshPromise = readRefreshRate();
    var asyncValues = await Promise.all([
      settle(readUaHints, { supported: false, brands: [], mobile: null }, 1800),
      settle(readBattery, null, 1500),
      settle(readStorage, null, 1500),
      settle(readMediaDevices, null, 1500),
      settle(readWebGPU, { supported: false, adapter: null, info: null, features: [], limits: null }, 2400),
      settle(queryPermissions, {
        camera: 'unsupported',
        microphone: 'unsupported',
        'window-management': 'unsupported',
        mediaCaptureSupported: Boolean(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function'),
        screenDetailsSupported: typeof window.getScreenDetails === 'function',
        secureContext: Boolean(window.isSecureContext)
      }, 1400),
      refreshPromise
    ]);
    var uaHints = asyncValues[0];
    var battery = asyncValues[1];
    var storage = asyncValues[2];
    var mediaDevices = asyncValues[3];
    var webgpu = asyncValues[4];
    var permissions = asyncValues[5];
    var refreshMeasurement = asyncValues[6];
    var screenDetails = null;
    if (permissions && permissions.screenDetailsSupported && permissions['window-management'] === 'granted') {
      screenDetails = await settle(requestScreenDetails, null, 1400);
    }
    var webgl = readWebGL();
    var os = detectOS(ua, uaHints);
    var browser = detectBrowser(ua, uaHints, os);
    var formFactor = detectFormFactor(ua, uaHints, os);
    var arch = detectArchitecture(ua, uaHints, os, webgl);
    var deviceModel = extractDeviceModel(ua, uaHints);
    var screenInfo = readScreen();
    var displayMedia = readDisplayMedia();
    var hardware = readHardware();
    var locale = readLocale();
    var featureGroups = readFeatureGroups(webgl);
    var sensors = readSensors();
    var displayState = displayMedia.displayMode;

    return {
      ua: ua,
      uaHints: uaHints,
      os: os,
      browser: browser,
      formFactor: formFactor,
      formFactorLabel: formFactorLabel(formFactor),
      deviceModel: deviceModel,
      arch: arch,
      view: VIEW,
      expectedView: formFactor === 'desktop' ? 'desktop' : 'mobile',
      refreshMeasurement: refreshMeasurement,
      webgl: webgl,
      webgpu: webgpu,
      battery: battery,
      storage: storage,
      mediaDevices: mediaDevices,
      mediaFormats: readMediaFormats(),
      audio: readAudio(),
      connection: readConnection(),
      screen: screenInfo,
      display: displayMedia,
      hardware: hardware,
      locale: locale,
      privacy: readBrowserPrivacy(),
      permissions: permissions,
      screenDetails: screenDetails,
      screenDetailsError: '',
      mediaPermissionError: '',
      features: featureGroups,
      sensors: sensors,
      displayMode: displayState,
      online: typeof navigator.onLine === 'boolean' ? navigator.onLine : null,
      collectedAt: new Date().toISOString(),
      app: APP
    };
  }

  window.DeviceLensEnv = {
    APP: APP,
    collectEnvironment: collectEnvironment,
    queryPermissions: queryPermissions,
    requestScreenDetails: requestScreenDetails,
    requestMediaDeviceAccess: requestMediaDeviceAccess,
    readRefreshRate: readRefreshRate,
    parseGpuInfo: parseGpuInfo,
    formatBytes: formatBytes,
    formatDateTime: formatDateTime,
    formatRefresh: formatRefresh,
    formatDuration: formatDuration,
    estimatePhysicalResolution: estimatePhysicalResolution,
    shortGpuName: shortGpuName,
    formFactorLabel: formFactorLabel,
    viewLabel: viewLabel,
    formatUaBrands: function (brands) {
      return filterBrandsForDisplay(brands).map(function (entry) {
        return entry.brand + (entry.version ? ' ' + entry.version : '');
      }).join('、');
    }
  };
})();
