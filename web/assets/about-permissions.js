/* Hutao Hardware Book - About page permission controls */
(function () {
  'use strict';

  var E = window.DeviceLensEnv;
  if (!E) return;
  var busy = false;

  function element(key, attribute) {
    return document.querySelector('[' + attribute + '="' + key + '"]');
  }

  function setBadge(key, text, tone) {
    var badge = element(key, 'data-permission-status');
    if (!badge) return;
    badge.textContent = text;
    badge.className = 'permission-badge' + (tone ? ' is-' + tone : '');
  }

  function setMessage(key, text, tone) {
    var message = element(key, 'data-permission-message');
    if (!message) return;
    message.textContent = text || '';
    message.className = 'about-permission-message' + (tone ? ' is-' + tone : '');
  }

  function setButton(key, label, hidden) {
    var button = element(key, 'data-permission-request');
    if (!button) return;
    button.hidden = Boolean(hidden);
    if (!hidden) {
      button.disabled = busy;
      button.textContent = label || '申请权限';
    }
  }

  function screenState(permissions) {
    if (!permissions.screenDetailsSupported) {
      return { label: '浏览器不支持', tone: 'muted', hide: true };
    }
    var status = permissions['window-management'] || 'unsupported';
    if (status === 'granted') return { label: '已授权', tone: 'ok', hide: true };
    if (status === 'denied') return { label: '已拒绝', tone: 'bad', button: '重新申请' };
    if (status === 'unsupported') return { label: '浏览器未提供状态', tone: 'muted', button: '申请权限' };
    return { label: '未授权', tone: 'warn', button: '申请权限' };
  }

  function mediaState(permissions) {
    if (!permissions.mediaCaptureSupported) {
      return { label: '浏览器不支持', tone: 'muted', hide: true };
    }
    var statuses = [permissions.camera, permissions.microphone].filter(function (value) {
      return value && value !== 'unsupported';
    });
    if (!statuses.length) return { label: '浏览器未提供状态', tone: 'muted', button: '申请权限' };
    var granted = statuses.filter(function (value) { return value === 'granted'; }).length;
    var denied = statuses.filter(function (value) { return value === 'denied'; }).length;
    if (granted === 2) return { label: '已授权', tone: 'ok', hide: true };
    if (denied) return { label: granted ? '部分授权 · 部分拒绝' : '已拒绝', tone: 'bad', button: '重新申请' };
    if (granted) return { label: '部分授权', tone: 'warn', button: '申请权限' };
    return { label: '未授权', tone: 'warn', button: '申请权限' };
  }

  async function refresh() {
    try {
      var permissions = await E.queryPermissions();
      var screen = screenState(permissions);
      setBadge('screen', screen.label, screen.tone);
      setButton('screen', screen.button, screen.hide);
      var media = mediaState(permissions);
      setBadge('media', media.label, media.tone);
      setButton('media', media.button, media.hide);
    } catch (error) {
      setBadge('screen', '状态未知', 'muted');
      setBadge('media', '状态未知', 'muted');
    }
  }

  async function requestPermission(key, button) {
    if (busy) return;
    busy = true;
    setMessage(key, '', '');
    button.disabled = true;
    button.textContent = '等待授权…';
    try {
      if (key === 'screen') await E.requestScreenDetails();
      else await E.requestMediaDeviceAccess();
      setMessage(key, '授权已更新，重新打开检测页后读取对应信息。', 'is-ok');
    } catch (error) {
      setMessage(key, error && error.message ? error.message : '未能完成授权，请检查浏览器站点设置。', 'is-error');
    } finally {
      busy = false;
      await refresh();
    }
  }

  document.addEventListener('click', function (event) {
    var button = event.target instanceof Element ? event.target.closest('[data-permission-request]') : null;
    if (!button) return;
    event.preventDefault();
    requestPermission(button.getAttribute('data-permission-request'), button);
  });

  refresh();
})();
