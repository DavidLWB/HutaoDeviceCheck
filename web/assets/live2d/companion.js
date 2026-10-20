/* Hutao Hardware Book - local Live2D companion */
(function () {
  'use strict';

  if (window.__hutaoLive2DLoaded) return;
  window.__hutaoLive2DLoaded = true;

  var MODEL_URL = 'assets/live2d/hutao/hutao.model3.json';
  var container = null;
  var app = null;
  var model = null;
  var ready = false;
  var docked = false;
  var reduceMotion = false;
  var pointer = { x: 0, y: 0, active: false };
  var hasMouse = false;
  var isCompact = false;

  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  } catch (error) {
    reduceMotion = false;
  }

  function isSupported() {
    return Boolean(window.PIXI && window.PIXI.live2d && window.PIXI.live2d.Live2DModel && window.PIXI.Application);
  }

  function removeCompanion() {
    if (container && container.parentNode) container.parentNode.removeChild(container);
    container = null;
    app = null;
    model = null;
    ready = false;
  }

  function fitModel() {
    if (!model || !app) return;
    var width = container.clientWidth;
    var height = container.clientHeight;
    if (!width || !height) return;

    app.renderer.resize(width, height);
    model.scale.set(1);
    var baseWidth = model.width || 1;
    var baseHeight = model.height || 1;
    var scale = Math.min(width / baseWidth, height / baseHeight) * 0.995;
    model.scale.set(scale);
    model.anchor.set(0.5, 1);
    model.x = width * 0.5;
    model.y = height;
    app.renderer.render(app.stage);
  }

  function focusPointer(clientX, clientY) {
    if (!ready || !model || !app) return;
    var rect = app.view.getBoundingClientRect();
    model.focus(clientX - rect.left, clientY - rect.top);
  }

  function idleFocus(now) {
    if (!ready || !model || !app) return;
    var rect = app.view.getBoundingClientRect();
    var t = now / 1000;
    var x = rect.left + rect.width * (0.5 + Math.sin(t * 0.16) * 0.9);
    var y = rect.top + rect.height * (0.34 + Math.sin(t * 0.1 + 1.3) * 0.32);
    focusPointer(x, y);
  }

  function tick() {
    if (!ready) return;
    if (hasMouse && pointer.active) {
      focusPointer(pointer.x, pointer.y);
    } else {
      idleFocus(performance.now());
    }
  }

  function onPointerMove(event) {
    if (event.pointerType === 'mouse') hasMouse = true;
    if (event.pointerType === 'touch' && !event.isPrimary) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }

  function onPointerDown(event) {
    onPointerMove(event);
  }

  function onResize() {
    isCompact = !docked && window.innerWidth <= 560;
    if (app) app.ticker.maxFPS = isCompact ? 30 : 60;
    fitModel();
  }

  function onVisibilityChange() {
    if (!app || reduceMotion) return;
    if (document.hidden) {
      app.stop();
    } else {
      app.start();
    }
  }

  function resolveHost() {
    var slot = document.querySelector('[data-live2d-slot]');
    var mobileView = document.body.dataset.view === 'mobile';
    if (slot) {
      return window.innerWidth > 920 && window.innerHeight > 700
        ? { host: slot, docked: true }
        : null;
    }
    return mobileView || window.innerWidth <= 920
      ? { host: document.body, docked: false }
      : null;
  }

  function init() {
    if (!isSupported()) return;
    var placement = resolveHost();
    if (!placement) return;
    docked = placement.docked;

    try {
      container = document.createElement('div');
      container.className = 'live2d-companion' + (docked ? ' is-docked' : '');
      container.setAttribute('aria-hidden', 'true');
      placement.host.appendChild(container);

      isCompact = !docked && window.innerWidth <= 560;
      app = new window.PIXI.Application({
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        sharedTicker: true,
        resolution: Math.min(window.devicePixelRatio || 1, isCompact ? 1.5 : 2),
        powerPreference: 'high-performance'
      });
      app.view.className = 'live2d-canvas';
      app.ticker.maxFPS = isCompact ? 30 : 60;
      app.ticker.speed = 0.6;
      container.appendChild(app.view);

      window.PIXI.live2d.Live2DModel.registerTicker(window.PIXI.Ticker);

      window.PIXI.live2d.Live2DModel.from(MODEL_URL, {
        autoInteract: false,
        autoUpdate: !reduceMotion
      }).then(function (loaded) {
        if (!container || !app) {
          loaded.destroy();
          return;
        }
        model = loaded;
        model.anchor.set(0.5, 1);
        app.stage.addChild(model);
        ready = true;
        fitModel();
        if (!reduceMotion) app.ticker.add(tick);
        container.classList.add('is-ready');
      }).catch(function (error) {
        if (window.console && console.warn) console.warn('[Live2D] 模型未能加载：', error);
        removeCompanion();
      });

      window.addEventListener('resize', onResize, { passive: true });
      window.addEventListener('orientationchange', onResize, { passive: true });
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerdown', onPointerDown, { passive: true });
      document.addEventListener('visibilitychange', onVisibilityChange);
    } catch (error) {
      if (window.console && console.warn) console.warn('[Live2D] 无法启动：', error);
      removeCompanion();
    }
  }

  function scheduleInit() {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(init, { timeout: 1600 });
    } else {
      window.setTimeout(init, 500);
    }
  }

  if (document.readyState === 'complete') {
    scheduleInit();
  } else {
    window.addEventListener('load', scheduleInit, { once: true });
  }
})();
