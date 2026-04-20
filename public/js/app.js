const API_BASE = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('portfolio_token');
  const username = localStorage.getItem('portfolio_username');

  if (token && username) {
    showPortfolio(username);
  } else {
    showLogin();
  }

  setupTabs();
  setupLoginForm();
  setupSignupForm();
  setupLogout();
});

function showLogin() {
  document.getElementById('loginForm').closest('.container').classList.remove('hidden');
  document.getElementById('portfolioPage').classList.add('hidden');
  document.querySelector('.container').classList.remove('hidden');
}

function showPortfolio(user) {
  document.getElementById('userDisplay').textContent = `@${user}`;
  document.querySelector('.container').classList.add('hidden');
  document.getElementById('portfolioPage').classList.remove('hidden');
}

function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (tab.dataset.tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        clearMessages();
      } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        clearMessages();
      }
    });
  });
}

function setupLoginForm() {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('portfolio_token', data.token);
        localStorage.setItem('portfolio_username', data.username);
        showPortfolio(data.username);
      } else {
        errorEl.textContent = data.message || 'Login failed';
      }
    } catch (err) {
      errorEl.textContent = 'Connection error. Please try again.';
    }
  });
}

function setupSignupForm() {
  const form = document.getElementById('signupForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirm').value;
    const errorEl = document.getElementById('signupError');
    const successEl = document.getElementById('signupSuccess');

    if (password !== confirmPassword) {
      errorEl.textContent = 'Passwords do not match';
      return;
    }

    if (password.length < 4) {
      errorEl.textContent = 'Password must be at least 4 characters';
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        successEl.textContent = 'Account created! Please sign in.';
        document.querySelector('.tab[data-tab="login"]').click();
        document.getElementById('loginUsername').value = username;
      } else {
        errorEl.textContent = data.message || 'Registration failed';
      }
    } catch (err) {
      errorEl.textContent = 'Connection error. Please try again.';
    }
  });
}

function setupLogout() {
  const btn = document.getElementById('logoutBtn');

  btn.addEventListener('click', () => {
    localStorage.removeItem('portfolio_token');
    localStorage.removeItem('portfolio_username');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    showLogin();
  });
}

function clearMessages() {
  document.getElementById('loginError').textContent = '';
  document.getElementById('signupError').textContent = '';
  document.getElementById('signupSuccess').textContent = '';
}