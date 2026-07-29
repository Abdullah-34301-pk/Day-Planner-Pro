const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

function handleRoute() {
  const hash = window.location.hash.slice(1) || '/dashboard';
  const pageMap = {
    '/dashboard': 'dashboard',
    '/add': 'add',
    '/plans': 'plans',
    '/insights': 'insights',
    '/timer': 'timer',
    '/data': 'data'
  };
  const pageName = pageMap[hash] || 'dashboard';

  navButtons.forEach((btn) => {
    const isActive = btn.dataset.page === pageName;
    btn.classList.toggle('active', isActive);
    if (isActive) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  pages.forEach((el) => {
    el.classList.toggle('active', el.id === `page-${pageName}`);
  });

  window.scrollTo(0, 0);
  renderPage(pageName);
  requestAnimationFrame(() => initRevealObserver());
}

function navigate(hash) {
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  } else {
    handleRoute();
  }
}

function getActivePage() {
  const active = document.querySelector('.page.active');
  return active ? active.id.replace('page-', '') : 'dashboard';
}

function renderActivePage() {
  renderPage(getActivePage());
}

function renderPage(page) {
  if (page === 'dashboard') {
    renderDashboardPage();
  } else if (page === 'plans') {
    renderTable();
    renderCalendar();
    renderBoard();
  } else if (page === 'insights') {
    renderInsightsPage();
  } else if (page === 'timer') {
    renderTimerControls();
    renderTimerDisplay();
  }
}

function initRevealObserver() {
  const revealTargets = document.querySelectorAll('.page.active .reveal');
  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealTargets.forEach((target) => observer.observe(target));
}

navButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    navigate(button.getAttribute('href'));
  });
});

window.addEventListener('hashchange', handleRoute);