/* Django POST forms: browser sends standard POST with CSRF token. */
(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = {
    login: document.querySelector('#panel-login'),
    register: document.querySelector('#panel-register')
  };

  function showTab(name, focus = false) {
    if (!panels[name]) return;
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    for (const [key, panel] of Object.entries(panels)) {
      panel.hidden = key !== name;
    }
    // Preserve browser back/forward without reloading the page.
    const url = new URL(window.location.href);
    if (name === 'register') url.searchParams.set('tab', 'register');
    else url.searchParams.delete('tab');
    if (window.location.protocol !== 'file:') {
      window.history.replaceState(null, '', url);
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
    tab.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = tabs[(index + step + tabs.length) % tabs.length];
      showTab(next.dataset.tab, true);
    });
  });

  document.querySelectorAll('[data-show-tab]').forEach((button) => {
    button.addEventListener('click', () => showTab(button.dataset.showTab));
  });

  document.querySelectorAll('[data-toggle-password]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(visible));
      button.setAttribute('aria-label', visible ? 'Скрыть пароль' : 'Показать пароль');
      button.title = visible ? 'Скрыть пароль' : 'Показать пароль';
    });
  });

  const password = document.getElementById('register-password');
  const confirmation = document.getElementById('register-confirm');
  function validateMatch() {
    if (!password || !confirmation) return;
    confirmation.setCustomValidity(
      confirmation.value && password.value !== confirmation.value
        ? 'Пароли не совпадают.' : ''
    );
  }
  password?.addEventListener('input', validateMatch);
  confirmation?.addEventListener('input', validateMatch);

  document.querySelector('#register-form')?.addEventListener('submit', (event) => {
    validateMatch();
    if (!event.currentTarget.reportValidity()) event.preventDefault();
    // Valid form submits naturally to Django using method="post".
  });

  document.querySelector('[data-forgot-password]')?.addEventListener('click', () => {
    // Add Django PasswordResetView URL when password recovery is configured.
    alert('Восстановление пароля будет подключено позже.');
  });

  const requested = new URLSearchParams(window.location.search).get('tab');
  const defaultTab = document.body.dataset.initialTab === 'register' ? 'register' : 'login';
  showTab(requested === 'register' ? 'register' : defaultTab);
})();