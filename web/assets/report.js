/* Hutao Hardware Book - report builder */
(function () {
  'use strict';

  var E = window.DeviceLensEnv;
  if (!E) throw new Error('DeviceLensEnv is unavailable');

  function clean(value) {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  }

  function item(label, value, options) {
    var opts = options || {};
    var result = {
      label: label,
      value: clean(value)
    };
    if (opts.note) result.note = opts.note;
    if (opts.mono) result.mono = true;
    if (opts.wide) result.wide = true;
    if (opts.tone) result.tone = opts.tone;
    return result;
  }

  function stateItem(label, condition, trueText, falseText, options) {
    var opts = options || {};
    var merged = Object.assign({}, opts, {
      tone: condition === null || condition === undefined ? 'muted' : condition ? (opts.trueTone || 'ok') : (opts.falseTone || 'muted')
    });
    return item(label, condition === null || condition === undefined ? '浏览器未公开' : condition ? trueText : falseText, merged);
  }

  function group(title, items, options) {
    var opts = options || {};
    var result = { title: title, items: items };
    if (opts.note) result.note = opts.note;
    if (opts.layout) result.layout = opts.layout;
    if (opts.wide) result.wide = true;
    return result;
  }

  function isUnavailable(value) {
    var text = value === null || value === undefined ? '' : String(value).trim();
    if (!text || text === '—' || text === '未公开' || text === '未知' || text === '状态未知') return true;
    if (/^浏览器未(公开|提供)/.test(text)) return true;
    if (/^此浏览器不提供/.test(text)) return true;
    return text === '不可用或未公开';
  }

  function pruneSections(sections) {
    Object.keys(sections).forEach(function (key) {
      var section = sections[key];
      if (!section || !Array.isArray(section.groups)) return;
      section.groups = section.groups.map(function (entry) {
        var items = (entry.items || []).filter(function (value) {
          if (!value) return false;
          return entry.layout === 'chips' || !isUnavailable(value.value);
        });
        return Object.assign({}, entry, { items: items });
      }).filter(function (entry) {
        return entry.items.length > 0;
      });
    });
    return sections;
  }

  function orientationLabel(type, angle) {
    var labels = {
      'portrait-primary': '纵向',
      'portrait-secondary': '纵向（倒置）',
      'landscape-primary': '横向',
      'landscape-secondary': '横向（翻转）'
    };
    var label = labels[type] || (type ? type : '浏览器未公开');
    if (typeof angle === 'number') label += ' · ' + angle + '°';
    return label;
  }

  function displayModeLabel(mode) {
    var labels = {
      browser: '浏览器标签页',
      standalone: '独立应用（PWA）',
      'minimal-ui': '精简窗口',
      fullscreen: '全屏',
      'picture-in-picture': '画中画'
    };
    return labels[mode] || clean(mode);
  }

  function contrastLabel(value) {
    return { more: '更高对比度', less: '更低对比度', custom: '自定义对比度', 'no-preference': '系统默认' }[value] || clean(value);
  }

  function pointerLabel(value) {
    return { coarse: '粗指针（手指）', fine: '精细指针（鼠标 / 触控板）', none: '无指针输入' }[value] || '浏览器未公开';
  }

  function hoverLabel(value) {
    return { hover: '支持悬停', none: '不支持悬停' }[value] || '浏览器未公开';
  }

  function networkTypeLabel(value) {
    return {
      wifi: 'Wi-Fi',
      cellular: '蜂窝网络',
      ethernet: '以太网',
      bluetooth: '蓝牙网络',
      wimax: 'WiMAX',
      none: '无网络',
      other: '其他网络',
      unknown: '未知网络'
    }[value] || '';
  }

  function formatColorCount(bits) {
    if (typeof bits !== 'number' || !Number.isFinite(bits) || bits <= 0) return '';
    var count = Math.pow(2, bits);
    if (count >= 100000000) return '约 ' + (count / 100000000).toFixed(1).replace(/\.0$/, '') + ' 亿色';
    if (count >= 10000) return '约 ' + Math.round(count / 10000) + ' 万色';
    return count + ' 色';
  }

  function getRefreshState(env) {
    var measurement = env.refreshMeasurement || {};
    if (typeof measurement.hz === 'number') {
      return {
        hz: measurement.hz,
        label: E.formatRefresh(measurement.hz) + ' Hz',
        note: 'requestAnimationFrame 实测 · ' + measurement.frames + ' 帧 / ' + measurement.durationMs + ' ms',
        tone: 'ok'
      };
    }
    var note = '未能在当前页面完成采样，请保持页面在前台并重新测量。';
    if (measurement.reason === 'hidden') note = '页面处于后台，浏览器暂停了动画帧调度；返回前台后请重新测量。';
    if (measurement.reason === 'unsupported') note = '当前浏览器不提供 requestAnimationFrame。';
    return { hz: null, label: '未测出', note: note, tone: 'warn' };
  }

  function getHdrState(env) {
    var known = env.display.dynamicRangeHigh !== null || env.display.videoDynamicRangeHigh !== null;
    var enabled = env.display.dynamicRangeHigh === true || env.display.videoDynamicRangeHigh === true;
    return {
      known: known,
      enabled: enabled,
      label: enabled ? 'HDR 可用' : known ? '未检测到 HDR' : 'HDR 未知',
      tone: enabled ? 'ok' : 'muted'
    };
  }

  function getNetworkSummary(env) {
    if (typeof env.online === 'boolean') return env.online ? '在线' : '离线';
    return '';
  }

  function getDeviceMemoryText(env) {
    var memory = env.hardware.deviceMemory;
    return typeof memory === 'number' ? '约 ' + memory + ' GB' : '浏览器未公开';
  }

  function getBatteryText(env) {
    var battery = env.battery;
    if (!battery || typeof battery.level !== 'number') return '浏览器未公开';
    var percent = Math.round(battery.level * 100);
    return percent + '% · ' + (battery.charging ? '充电中' : '电池供电');
  }

  function getGpuText(env) {
    return env.webgl.gpuName || E.shortGpuName(env.webgl.renderer || env.webgl.maskedRenderer || '', env.webgl.vendor || env.webgl.maskedVendor || '');
  }

  function buildSummary(env) {
    var refresh = getRefreshState(env);
    var hdr = getHdrState(env);
    var gpu = getGpuText(env);
    var width = env.screen.width;
    var height = env.screen.height;
    var physicalScreen = E.estimatePhysicalResolution(width, height, env.screen.dpr);
    var cores = env.hardware.cores;
    var routeMatches = env.expectedView === env.view;
    return {
      model: env.deviceModel || '',
      formFactor: env.formFactor,
      formFactorLabel: env.formFactorLabel,
      pageLabel: E.viewLabel(env.view),
      autoMatched: routeMatches,
      detectionNote: routeMatches ? '自动识别结果与当前页面一致。' : '当前为手动选择的页面，设备实际类型以概览为准。',
      os: env.os.display,
      osFamily: env.os.family,
      osVersion: env.os.version,
      architecture: env.arch.label,
      browser: env.browser.display,
      browserName: env.browser.name,
      browserVersion: env.browser.version,
      engine: env.browser.engine,
      engineVersion: env.browser.engineVersion,
      screen: width && height ? width + ' × ' + height : '浏览器未公开',
      screenPhysical: physicalScreen ? physicalScreen.width + ' × ' + physicalScreen.height : '',
      width: width,
      height: height,
      dpr: env.screen.dpr,
      refreshRate: refresh.label,
      refreshHz: refresh.hz,
      hdr: hdr.label,
      hdrEnabled: hdr.enabled,
      colorGamut: env.display.colorGamut === 'browser 未公开' ? '浏览器未公开' : env.display.colorGamut,
      cpu: cores ? cores + ' 线程' : '浏览器未公开',
      cpuCores: cores,
      memory: getDeviceMemoryText(env),
      gpu: gpu,
      gpuVendor: env.webgl.gpuVendor || '浏览器未公开',
      network: getNetworkSummary(env),
      battery: getBatteryText(env),
      displayMode: env.display.displayMode,
      locale: env.locale.language,
      timeZone: env.locale.timeZone
    };
  }

  function buildSystemSection(env) {
    var touch = env.hardware.maxTouchPoints;
    var pads = env.hardware.gamepads.connected.length;
    var routeNote = env.expectedView === env.view
      ? '自动识别结果与当前页面一致。'
      : '当前页面由手动切换，设备实际类型为' + env.formFactorLabel + '。';
    var battery = env.battery;
    var batteryItems;
    if (battery) {
      var batteryLevel = typeof battery.level === 'number' ? Math.round(battery.level * 100) + '%' : null;
      var chargeState = battery.charging
        ? (battery.level === 1 ? '已充满（已连接电源）' : '正在充电')
        : '使用电池供电';
      batteryItems = [
        item('电池电量', batteryLevel, { tone: battery.charging ? 'ok' : undefined }),
        item('充电状态', chargeState),
        item('充满所需时间', battery.chargingTime === 0 ? '已充满' : E.formatDuration(battery.chargingTime)),
        item('预计续航时间', E.formatDuration(battery.dischargingTime))
      ];
    } else {
      batteryItems = [
        item('电池信息', '此浏览器不提供', {
          tone: 'muted',
          note: 'Battery Status API 在 Firefox、Safari 及部分 WebView 中不可用，这不会影响其他检测项。'
        })
      ];
    }
    return {
      groups: [
        group('设备与系统', [
          env.deviceModel ? item('设备型号', env.deviceModel, {
            mono: true,
            note: '来源：User-Agent Client Hints 或设备 UA。'
          }) : null,
          item('设备类型', env.formFactorLabel, { note: routeNote }),
          item('操作系统', env.os.family),
          item('系统版本', env.os.version || '浏览器未公开', { note: env.os.note }),
          item('平台标识', env.hardware.platform || '浏览器未公开'),
          item('运行模式', displayModeLabel(env.displayMode))
        ].filter(Boolean)),
        group('处理器与内存', [
          item('逻辑处理器', env.hardware.cores ? env.hardware.cores + ' 个线程' : '浏览器未公开', {
            note: '来源 navigator.hardwareConcurrency，通常代表逻辑核心数。'
          }),
          item('设备内存', getDeviceMemoryText(env), {
            note: 'navigator.deviceMemory 为浏览器提供的近似值，可能按 2 的幂取整。'
          }),
          item('系统架构', env.arch.label, { note: env.arch.note }),
          item('JS 堆上限', env.hardware.jsHeapLimit ? E.formatBytes(env.hardware.jsHeapLimit) : '浏览器未公开', {
            note: env.hardware.jsHeapUsed ? '当前已用约 ' + E.formatBytes(env.hardware.jsHeapUsed) + '（快照值）。' : ''
          })
        ]),
        group('电池与电源', batteryItems, {
          note: battery ? '电池数据由当前浏览器、系统电源策略共同决定，数值可能为估算值或短暂过期。' : ''
        }),
        group('输入与交互', [
          item('触控能力', touch > 0 ? '支持 · 最多 ' + touch + ' 点' : '不支持', {
            tone: touch > 0 ? 'ok' : 'muted'
          }),
          item('主指针类型', pointerLabel(env.display.pointer)),
          item('悬停能力', hoverLabel(env.display.hover)),
          item('振动反馈', env.sensors && typeof navigator.vibrate === 'function' ? 'API 可用' : '不可用'),
          item('游戏手柄', pads > 0 ? '已连接 ' + pads + ' 个' : env.hardware.gamepads.supported ? '未检测到已连接设备' : '浏览器未公开'),
          item('方向传感器', 'DeviceOrientationEvent' in window ? 'API 可用' : '不可用', {
            note: '实际读数通常需要 HTTPS 与用户授权。'
          }),
          item('运动传感器', 'DeviceMotionEvent' in window ? 'API 可用' : '不可用', {
            note: '实际读数通常需要 HTTPS 与用户授权。'
          })
        ])
      ]
    };
  }

  function buildDisplaySection(env) {
    var screen = env.screen;
    var display = env.display;
    var screenDetails = env.screenDetails || null;
    var screenList = screenDetails && Array.isArray(screenDetails.screens) ? screenDetails.screens : [];
    var refresh = getRefreshState(env);
    var resolution = screen.width && screen.height ? screen.width + ' × ' + screen.height : '浏览器未公开';
    var physicalEstimate = E.estimatePhysicalResolution(screen.width, screen.height, screen.dpr);
    var physical = physicalEstimate
      ? physicalEstimate.width + ' × ' + physicalEstimate.height
      : '浏览器未公开';
    var dynamicRange = display.dynamicRangeHigh === null ? '浏览器未公开' : display.dynamicRangeHigh ? 'HDR（high）' : '标准（standard）';
    var videoDynamicRange = display.videoDynamicRangeHigh === null ? '浏览器未公开' : display.videoDynamicRangeHigh ? 'HDR（high）' : '标准（standard）';
    var hdr = getHdrState(env);
    var screenItems = [];
    if (screenList.length) {
      screenList.forEach(function (entry, index) {
        var details = [];
        if (entry.width && entry.height) details.push(entry.width + ' × ' + entry.height + ' CSS px');
        if (entry.devicePixelRatio) details.push('DPR ' + entry.devicePixelRatio + '×');
        if (entry.isPrimary) details.push('主屏幕');
        if (entry.isInternal === true) details.push('内置屏幕');
        if (entry.isInternal === false) details.push('外接屏幕');
        if (screenDetails && screenDetails.currentIndex === index) details.push('当前窗口所在屏幕');
        screenItems.push(item(entry.label || ('显示器 ' + (index + 1)), details.join(' · ') || '显示器', {
          wide: true
        }));
      });
    }
    var groups = [
      group('分辨率与布局', [
        item('逻辑分辨率', resolution, {
          note: env.screen.screenFallback
            ? '浏览器未提供物理屏幕尺寸，已回退到检测时的视口尺寸。'
            : 'CSS 像素，浏览器布局使用的屏幕尺寸。'
        }),
        item('物理像素（估算）', physical, {
          note: '由逻辑分辨率 × DPR 估算，半分像素按偶数像素取整；不一定等于面板原生分辨率。'
        }),
        item('可用屏幕区域', screen.availWidth && screen.availHeight ? screen.availWidth + ' × ' + screen.availHeight : '浏览器未公开', {
          note: '扣除系统任务栏或状态栏后的可用 CSS 像素。'
        }),
        item('浏览器视口', screen.viewportWidth + ' × ' + screen.viewportHeight, { note: '检测时网页可用的 CSS 像素区域。' }),
        item('设备像素比', screen.dpr + '×', { note: 'DPR = 物理像素 / CSS 像素。' }),
        item('屏幕方向', orientationLabel(screen.orientationType, screen.orientationAngle)),
        item('扩展屏幕', screen.isExtended === null ? '浏览器未公开' : screen.isExtended ? '是，连接有多个显示器' : '否，单显示器或未检测到扩展屏')
      ])
    ];
    if (screenItems.length) {
      groups.push(group('显示器', screenItems));
    }
    groups.push(
      group('HDR 与色彩', [
        item('页面动态范围', dynamicRange, { tone: display.dynamicRangeHigh ? 'ok' : 'muted' }),
        item('视频动态范围', videoDynamicRange, { tone: display.videoDynamicRangeHigh ? 'ok' : 'muted' }),
        item('检测结论', hdr.label, { tone: hdr.tone }),
        item('屏幕色域', display.colorGamut === 'browser 未公开' ? '浏览器未公开' : display.colorGamut),
        item('浏览器色深', screen.colorDepth ? screen.colorDepth + ' 位 · ' + formatColorCount(screen.colorDepth) : '浏览器未公开')
      ], {
        note: 'HDR 与色域由浏览器 CSS 媒体查询检测。'
      }),
      group('刷新率与动态', [
        item('刷新率（实测）', refresh.label, { note: refresh.note, tone: refresh.tone }),
        item('减少动态效果', display.reducedMotion === null ? '浏览器未公开' : display.reducedMotion ? '已启用' : '未启用'),
        item('减少透明效果', display.reducedTransparency === null ? '浏览器未公开' : display.reducedTransparency ? '已启用' : '未启用'),
        item('减少数据用量', display.reducedData === null ? '浏览器未公开' : display.reducedData ? '已启用' : '未启用')
      ], {
        note: '刷新率通过 requestAnimationFrame 帧间隔估算。'
      })
    );
    return {
      groups: groups.concat([
        group('系统外观偏好', [
          item('系统主题偏好', display.dark === null ? '浏览器未公开' : display.dark ? '深色' : '浅色'),
          item('对比度偏好', contrastLabel(display.contrast)),
          item('强制颜色模式', display.forcedColors === null ? '浏览器未公开' : display.forcedColors ? '已启用' : '未启用'),
          item('显示模式', displayModeLabel(display.displayMode)),
          item('指针与悬停', pointerLabel(display.pointer) + ' · ' + hoverLabel(display.hover))
        ])
      ])
    };
  }

  function buildGraphicsSection(env) {
    var webgl = env.webgl;
    var webgpu = env.webgpu;
    var groups = [];
    var gpuItems = [];
    if (webgl.gpuName) gpuItems.push(item('GPU 型号', webgl.gpuName));
    if (webgl.gpuVendor) gpuItems.push(item('GPU 厂商', webgl.gpuVendor));
    if (webgl.backend && webgl.backend !== '浏览器未公开') gpuItems.push(item('渲染后端', webgl.backend));
    if (webgl.supported) gpuItems.push(item('渲染模式', webgl.software ? '软件渲染' : '硬件加速', {
      tone: webgl.software ? 'warn' : undefined
    }));
    if (gpuItems.length) groups.push(group('图形适配器', gpuItems));

    if (webgl.supported) {
      var glItems = [
        item('WebGL 2', webgl.supportedWebgl2 ? '支持' : '不支持', { tone: webgl.supportedWebgl2 ? 'ok' : 'muted' })
      ];
      if (webgl.version) glItems.push(item('WebGL 版本', webgl.version));
      if (webgl.shadingLanguageVersion) glItems.push(item('着色器语言', webgl.shadingLanguageVersion));
      if (webgl.antialias !== null) glItems.push(item('抗锯齿', webgl.antialias ? '已启用' : '未启用'));
      if (webgl.maxTextureSize) glItems.push(item('最大纹理尺寸', webgl.maxTextureSize + ' px'));
      if (webgl.maxRenderbufferSize) glItems.push(item('最大渲染缓冲', webgl.maxRenderbufferSize + ' px'));
      if (Array.isArray(webgl.maxViewport) && webgl.maxViewport.length) glItems.push(item('最大视口尺寸', webgl.maxViewport.join(' × ') + ' px'));
      if (webgl.maxAnisotropy) glItems.push(item('各向异性过滤', webgl.maxAnisotropy + '×'));
      groups.push(group('WebGL 能力', glItems));
    }

    if (webgpu.supported && webgpu.adapter) {
      var webgpuItems = [];
      var adapterInfo = webgpu.info
        ? [webgpu.info.vendor, webgpu.info.architecture, webgpu.info.device, webgpu.info.description]
          .filter(Boolean).join(' · ')
        : '';
      if (adapterInfo) webgpuItems.push(item('GPU 适配器', adapterInfo, { wide: true }));
      if (webgpu.features && webgpu.features.length) {
        webgpuItems.push(item('WebGPU 特性', webgpu.features.length + ' 项 · ' + webgpu.features.slice(0, 5).join('、') + (webgpu.features.length > 5 ? '…' : ''), { wide: true }));
      }
      if (webgpu.limits && webgpu.limits.maxTextureDimension2D) {
        webgpuItems.push(item('最大纹理维度', webgpu.limits.maxTextureDimension2D + ' px'));
      }
      if (webgpuItems.length) groups.push(group('WebGPU', webgpuItems));
    }
    return { groups: groups };
  }

  function buildBrowserSection(env) {
    var browser = env.browser;
    var brands = E.formatUaBrands(
      env.uaHints && env.uaHints.fullVersionList && env.uaHints.fullVersionList.length
        ? env.uaHints.fullVersionList
        : env.uaHints && env.uaHints.brands
    );
    var privacy = env.privacy;
    var dntLabel = privacy.doNotTrack === null ? '未公开' : privacy.doNotTrack === '1' ? '已请求不跟踪' : privacy.doNotTrack === '0' ? '未启用' : privacy.doNotTrack;
    var securityLabel = privacy.secureContext ? '是，安全上下文' : '否，非安全上下文';
    var storage = env.storage || {};
    return {
      groups: [
        group('浏览器', [
          item('浏览器名称', browser.name),
          item('浏览器版本', browser.version || '浏览器未公开'),
          item('渲染内核', browser.engine, { tone: browser.engine === '未知内核' ? 'muted' : 'ok' }),
          item('内核版本', browser.engineVersion || '浏览器未公开'),
          item('navigator.vendor', browser.vendor || '浏览器未公开'),
          item('UA-CH 品牌', brands || '此浏览器不提供', { wide: true }),
          item('客户端提示 API', browser.uaHintsSupported ? '支持' : '不支持', { tone: browser.uaHintsSupported ? 'ok' : 'muted' })
        ], {
          note: browser.note || '浏览器可能精简或冻结 User-Agent，UA-CH 品牌信息可作为补充。'
        }),
        group('语言与区域', [
          item('主要语言', env.locale.language || '浏览器未公开'),
          item('首选语言', env.locale.languages && env.locale.languages.length ? env.locale.languages.join('、') : '浏览器未公开', { wide: true }),
          item('时区', env.locale.timeZone || '浏览器未公开'),
          item('UTC 偏移', env.locale.utcOffset || '浏览器未公开'),
          item('区域格式', [env.locale.calendar, env.locale.numberingSystem, env.locale.hourCycle].filter(Boolean).join(' · ') || '浏览器未公开'),
          item('本地时间', env.locale.localTime, { mono: true })
        ]),
        group('浏览器环境与偏好', [
          stateItem('Cookie', privacy.cookieEnabled, '已启用', '已禁用'),
          item('Do Not Track', dntLabel),
          stateItem('全局隐私控制 GPC', privacy.globalPrivacyControl, '已启用', '未启用'),
          stateItem('PDF 查看器', privacy.pdfViewerEnabled, '可用', '不可用'),
          item('WebDriver', privacy.webdriver === null ? '浏览器未公开' : privacy.webdriver ? '是（可能为自动化环境）' : '否'),
          item('安全上下文', securityLabel, { tone: privacy.secureContext ? 'ok' : 'warn' }),
          stateItem('本地存储可用', storage.localStorage, '可用', '受限'),
          item('页面协议', safeLocation('protocol') || '浏览器未公开')
        ], {
          note: 'Do Not Track 与 GPC 仅表达浏览器偏好，网站是否遵守取决于网站自身。'
        }),
        group('原始 User-Agent', [
          item('User Agent', env.ua || '—', { wide: true, mono: true })
        ], {
          wide: true,
          note: 'User-Agent 可能被冻结、精简或伪装，适合用于辅助判断，不建议单独作为设备识别依据。'
        })
      ]
    };
  }

  function safeLocation(key) {
    try { return location[key]; } catch (error) { return ''; }
  }

  function buildNetworkSection(env) {
    var connection = env.connection || { type: '', saveData: null };
    var storage = env.storage || {};
    var estimate = storage.estimate || null;
    var quota = estimate && typeof estimate.quota === 'number' ? estimate.quota : null;
    var usage = estimate && typeof estimate.usage === 'number' ? estimate.usage : null;
    var usagePercent = quota && usage !== null ? (usage / quota * 100).toFixed(usage / quota * 100 < 1 ? 2 : 1) + '%' : '';
    return {
      groups: [
        group('网络连接', [
          stateItem('联网状态', env.online, '在线', '离线', { trueTone: 'ok', falseTone: 'warn' }),
          item('网络类型', networkTypeLabel(connection.type) || '浏览器未公开'),
          item('省流量模式', connection.saveData === null || connection.saveData === undefined ? '浏览器未公开' : connection.saveData ? '已启用' : '未启用')
        ], {
          note: '联网状态由浏览器根据网络接口报告，不代表互联网一定可达；网络类型与省流量模式仅在浏览器提供时显示。'
        }),
        group('存储配额', [
          item('可用存储配额', quota !== null ? E.formatBytes(quota) : '浏览器未公开', {
            note: '浏览器根据磁盘空间与隐私策略给出的配额估算。'
          }),
          item('已用存储', usage !== null ? E.formatBytes(usage) + (usagePercent ? ' · ' + usagePercent : '') : '浏览器未公开'),
          item('持久化存储', storage.persisted === null || storage.persisted === undefined ? '浏览器未公开' : storage.persisted ? '已授予' : '未授予'),
          item('Storage API', storage.supported ? '可用' : '不可用', { tone: storage.supported ? 'ok' : 'muted' })
        ], {
          note: '配额不代表磁盘剩余空间；无痕模式、站点数据清理策略会影响结果。'
        }),
        group('浏览器存储', [
          stateItem('Local Storage', storage.localStorage, '可用', '受限'),
          stateItem('Session Storage', storage.sessionStorage, '可用', '受限'),
          stateItem('IndexedDB', storage.indexedDB, '可用', '不可用'),
          stateItem('Cache Storage', storage.caches, '可用', '不可用')
        ], {
          note: '部分浏览器在无痕模式或禁用站点数据时会限制本地存储。'
        }),
        group('页面环境', [
          item('页面协议', safeLocation('protocol') || '浏览器未公开', { mono: true }),
          item('主机名', safeLocation('hostname') || '本地文件', { mono: true }),
          item('安全上下文', env.privacy.secureContext ? '安全（HTTPS / localhost）' : '非安全', { tone: env.privacy.secureContext ? 'ok' : 'warn' }),
          item('Cookie', env.privacy.cookieEnabled === null ? '浏览器未公开' : env.privacy.cookieEnabled ? '已启用' : '已禁用')
        ])
      ]
    };
  }

  function mediaSupportItem(entry) {
    var map = {
      supported: { label: '支持', tone: 'ok' },
      maybe: { label: '可能支持', tone: 'warn' },
      unsupported: { label: '不支持', tone: 'muted' }
    };
    var state = map[entry.support] || map.unsupported;
    return item(entry.label, state.label, { tone: state.tone, note: entry.type });
  }

  function buildMediaSection(env) {
    var devices = env.mediaDevices;
    var audio = env.audio;
    var groups = [];
    var deviceItems = [];
    if (devices) {
      deviceItems.push(item('摄像头', devices.counts.videoinput + ' 个'));
      deviceItems.push(item('麦克风', devices.counts.audioinput + ' 个'));
      deviceItems.push(item('音频输出', devices.counts.audiooutput + ' 个'));
      if (devices.labels && devices.labels.length) {
        var kindLabels = { videoinput: '摄像头', audioinput: '麦克风', audiooutput: '音频输出' };
        deviceItems.push(item('设备名称', devices.labels.map(function (entry) {
          return (kindLabels[entry.kind] || entry.kind) + '：' + entry.label;
        }).join(' · '), { wide: true }));
      }
    }
    if (deviceItems.length) {
      groups.push(group('媒体设备', deviceItems, { note: '来自浏览器媒体设备枚举。' }));
    }
    if (audio) {
      groups.push(group('音频输出', [
        item('采样率', audio.sampleRate ? audio.sampleRate + ' Hz' : '浏览器未公开'),
        item('最大声道数', audio.maxChannelCount !== null ? String(audio.maxChannelCount) : '浏览器未公开'),
        item('基础延迟', audio.baseLatency !== null ? Math.round(audio.baseLatency * 1000 * 100) / 100 + ' ms' : '浏览器未公开'),
        item('音频上下文', audio.state === 'running' ? '运行中' : audio.state === 'suspended' ? '已挂起（需用户交互）' : clean(audio.state))
      ], { note: '来自短时创建的 Web Audio 音频上下文。' }));
    }
    groups.push(group('媒体格式支持', env.mediaFormats.video.concat(env.mediaFormats.audio).map(mediaSupportItem), {
      note: '“可能支持”来自 canPlayType 的模糊判断。'
    }));
    groups.push(group('传感器 API', (env.sensors || []).map(function (entry) {
      return {
        label: entry.label,
        value: entry.supported ? '支持' : '不支持',
        supported: Boolean(entry.supported),
        tone: entry.supported ? 'ok' : 'muted'
      };
    }), {
      layout: 'chips',
      note: 'API 支持情况来自当前浏览器。'
    }));
    return { groups: groups };
  }

  function buildFeaturesSection(env) {
    var groups = (env.features || []).map(function (entry) {
      return group(entry.title, entry.items.map(function (feature) {
        return {
          label: feature.label,
          value: feature.supported ? '支持' : '不支持',
          supported: Boolean(feature.supported),
          tone: feature.supported ? 'ok' : 'muted'
        };
      }), { layout: 'chips' });
    });
    return {
      groups: groups,
      note: '支持状态表示当前页面是否提供相应 Web API；实际功能还取决设备硬件、操作系统、权限和浏览器策略。'
    };
  }

  function buildReport(env) {
    var sections = {
      system: buildSystemSection(env),
      display: buildDisplaySection(env),
      graphics: buildGraphicsSection(env),
      browser: buildBrowserSection(env),
      network: buildNetworkSection(env),
      media: buildMediaSection(env),
      features: buildFeaturesSection(env)
    };
    pruneSections(sections);
    var report = {
      schema: E.APP.schema,
      schemaVersion: E.APP.schemaVersion,
      meta: {
        app: E.APP.name,
        appEn: E.APP.nameEn,
        appVersion: E.APP.version,
        detectedAt: env.collectedAt || new Date().toISOString(),
        pageView: env.view,
        pageLabel: E.viewLabel(env.view),
        formFactor: env.formFactor,
        formFactorLabel: env.formFactorLabel,
        deviceModel: env.deviceModel,
        expectedView: env.expectedView,
        locale: env.locale.language,
        timeZone: env.locale.timeZone,
        userAgent: env.ua
      },
      summary: buildSummary(env),
      sections: sections,
      raw: {
        collectedAt: env.collectedAt,
        detection: {
          formFactor: env.formFactor,
          formFactorLabel: env.formFactorLabel,
          pageView: env.view,
          expectedView: env.expectedView,
          deviceModel: env.deviceModel
        },
        os: env.os,
        browser: env.browser,
        architecture: env.arch,
        navigator: {
          userAgent: env.ua,
          platform: env.hardware.platform,
          vendor: env.browser.vendor,
          language: env.locale.language,
          languages: env.locale.languages,
          hardwareConcurrency: env.hardware.cores,
          deviceMemory: env.hardware.deviceMemory,
          maxTouchPoints: env.hardware.maxTouchPoints,
          cookieEnabled: env.privacy.cookieEnabled,
          doNotTrack: env.privacy.doNotTrack,
          globalPrivacyControl: env.privacy.globalPrivacyControl,
          pdfViewerEnabled: env.privacy.pdfViewerEnabled,
          webdriver: env.privacy.webdriver,
          userAgentData: env.uaHints
        },
        screen: env.screen,
        displayMedia: env.display,
        webgl: env.webgl,
        webgpu: env.webgpu,
        battery: env.battery,
        connection: Object.assign({ online: env.online }, env.connection),
        storage: env.storage,
        mediaDevices: env.mediaDevices,
        audio: env.audio,
        mediaFormats: env.mediaFormats,
        features: env.features,
        sensors: env.sensors,
        locale: env.locale,
        privacy: env.privacy,
        permissions: env.permissions,
        screenDetails: env.screenDetails,
        permissionErrors: {
          screen: env.screenDetailsError || '',
          media: env.mediaPermissionError || ''
        },
        permissionsUpdatedAt: env.permissionsUpdatedAt || null,
        refresh: env.refreshMeasurement,
        page: {
          protocol: safeLocation('protocol'),
          hostname: safeLocation('hostname'),
          displayMode: env.displayMode,
          secureContext: env.privacy.secureContext
        }
      }
    };
    return report;
  }

  window.DeviceLensReport = {
    buildReport: buildReport,
    buildSummary: buildSummary,
    displayModeLabel: displayModeLabel,
    getRefreshState: getRefreshState
  };
})();
