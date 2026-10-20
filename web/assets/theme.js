(function () {
  'use strict';
  var KEY = 'device-lens-theme';
  var root = document.documentElement;
  var media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function readPreference() {
    try {
      var value = sessionStorage.getItem(KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function systemTheme() {
    return media && media.matches ? 'dark' : 'light';
  }

  function updateMeta(theme) {
    var meta = document.getElementById('theme-color-meta');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#202020' : '#f3f2f1');
  }

  function updateButtons(theme) {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i += 1) {
      var label = theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题';
      buttons[i].setAttribute('aria-label', label);
      buttons[i].setAttribute('title', label);
    }
  }

  function apply(theme, persist) {
    root.setAttribute('data-theme', theme);
    updateMeta(theme);
    updateButtons(theme);
    if (persist) {
      try { sessionStorage.setItem(KEY, theme); } catch (error) {}
    }
  }

  apply(readPreference() || systemTheme(), false);

  function toggleTheme() {
    apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  }

  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element ? event.target.closest('[data-theme-toggle]') : null;
    if (!target) return;
    event.preventDefault();
    toggleTheme();
  });

  document.addEventListener('DOMContentLoaded', function () {
    updateButtons(root.getAttribute('data-theme') || systemTheme());
  });

  if (media) {
    var onSystemThemeChange = function (event) {
      if (!readPreference()) apply(event.matches ? 'dark' : 'light', false);
    };
    if (typeof media.addEventListener === 'function') media.addEventListener('change', onSystemThemeChange);
    else if (typeof media.addListener === 'function') media.addListener(onSystemThemeChange);
  }

  window.DeviceLensTheme = {
    get: function () { return root.getAttribute('data-theme') || systemTheme(); },
    toggle: toggleTheme
  };
})();
