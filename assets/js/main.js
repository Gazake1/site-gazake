document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Notification helper (toast)
  function ensureNotifContainer() {
    let c = document.getElementById('gb-notifications');
    if (!c) {
      c = document.createElement('div');
      c.id = 'gb-notifications';
      document.body.appendChild(c);
    }
    return c;
  }

  function showNotification(message, type = 'info', timeout = 4000) {
    const container = ensureNotifContainer();
    const n = document.createElement('div');
    n.className = `gb-notif gb-notif-${type}`;
    n.innerHTML = `<div class="gb-notif-body">${message}</div><button class="gb-notif-close">✕</button>`;
    container.appendChild(n);
    const remove = () => n.classList.add('gb-notif-hide');
    n.querySelector('.gb-notif-close').addEventListener('click', () => remove());
    // auto remove
    setTimeout(() => remove(), timeout);
    // remove from DOM after animation
    n.addEventListener('transitionend', () => { if (n.parentNode) n.parentNode.removeChild(n); });
  }

  async function getMe() {
    try {
      const r = await fetch('/api/me');
      return await r.json();
    } catch (e) { return { user: null }; }
  }

  async function doLogout() {
    await fetch('/api/logout', { method: 'POST' });
    location.href = 'login.html';
  }

  // Se estiver na home, verifica sessão no servidor
  (async () => {
    const path = location.pathname;
    const file = path.substring(path.lastIndexOf('/') + 1);
    const me = await getMe();
    if ((file === '' || file === 'index.html') && !me.user) {
      location.href = 'login.html';
      return;
    }

    const nav = document.querySelector('header nav');
    if (nav) {
      if (me.user) {
        nav.innerHTML = `<a href="index.html">Home</a><a href="#" id="logoutBtn" class="btn">Sair (${me.user.email})</a>`;
        const btn = document.getElementById('logoutBtn');
        if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); doLogout(); });
      }
    }
  })();

  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const pass = loginForm.password.value.trim();
      if (!email || !pass) { showNotification('Preencha email e senha.', 'error'); return; }
      const res = await fetch('/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const body = await res.json();
      if (!res.ok) return showNotification(body.error || 'Erro no login', 'error');
      location.href = 'index.html';
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = signupForm.name.value.trim();
      const email = signupForm.email.value.trim();
      const pass = signupForm.password.value.trim();
      const confirm = signupForm.confirm.value.trim();
      if (!name || !email || !pass || !confirm) { showNotification('Preencha todos os campos.', 'error'); return; }
      if (pass !== confirm) { showNotification('As senhas não coincidem.', 'error'); return; }
      const res = await fetch('/api/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      });
      const body = await res.json();
      if (!res.ok) return showNotification(body.error || 'Erro no cadastro', 'error');
      showNotification('Conta criada com sucesso. Faça login.', 'success');
      location.href = 'login.html';
    });
  }
});
