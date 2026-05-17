/* ════════════════════════════════════════════════════════════════════
   main.js — navigation, theme, filters, animations
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── SPA-style hash routing ───────────────────────────────────────── */
  const routes      = document.querySelectorAll('.route');
  const navLinks    = document.querySelectorAll('.main-nav a[data-route]');
  const validRoutes = Array.from(routes).map(r => r.dataset.route);

  function go(route, push = true) {
    if (!validRoutes.includes(route)) route = 'about';

    routes.forEach(r => r.classList.toggle('active', r.dataset.route === route));
    navLinks.forEach(a => a.classList.toggle('active', a.dataset.route === route));

    // Update hash without re-triggering the listener
    if (push && location.hash.slice(1) !== route) {
      history.pushState({ route }, '', '#' + route);
    }

    // Scroll the main panel to top on route change
    document.querySelector('.main')?.scrollTo?.({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Lazy-init globe when entering its section
    if (route === 'globe' && window.initGlobe) window.initGlobe();

    // Count-up stats when entering globe section
    if (route === 'globe') runCountUps();

    // Close mobile menu after navigation
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelector('.menu-toggle')?.classList.remove('open');
  }

  // Wire navigation clicks
  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      go(a.dataset.route);
    });
  });

  // Back/forward
  window.addEventListener('popstate', () => {
    go(location.hash.slice(1) || 'about', false);
  });

  // Initial route from URL hash
  document.addEventListener('DOMContentLoaded', () => {
    const initial = location.hash.slice(1) || 'about';
    go(initial, false);
  });


  /* ── Theme toggle ─────────────────────────────────────────────────── */
  const themeBtn = document.querySelector('.theme-toggle');
  const stored   = localStorage.getItem('theme');
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.dataset.theme = 'dark';
  }
  themeBtn?.addEventListener('click', () => {
    const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = next;
    localStorage.setItem('theme', next);
    // Tell the globe to recolor itself
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
  });


  /* ── Mobile menu toggle ───────────────────────────────────────────── */
  const menuBtn = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  menuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    menuBtn.classList.toggle('open');
  });

  // Tap outside sidebar to close on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 980) return;
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
      sidebar.classList.remove('open');
      menuBtn.classList.remove('open');
    }
  });


  /* ── "Older news" disclosure ──────────────────────────────────────── */
  document.querySelector('.toggle-more')?.addEventListener('click', function () {
    const target = document.querySelectorAll(this.dataset.target);
    const expanded = this.classList.toggle('expanded');
    target.forEach(el => el.classList.toggle('shown', expanded));
  });


  /* ── Publication filters ──────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter');
  const pubs       = document.querySelectorAll('.pub');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;

      pubs.forEach(p => {
        const tags = (p.dataset.tags || '').split(/\s+/);
        const show = f === 'all' || tags.includes(f);
        p.classList.toggle('hidden', !show);
      });
    });
  });


  /* ── Number count-up for the globe stats ──────────────────────────── */
  let countersRan = false;
  function runCountUps() {
    if (countersRan) return;
    countersRan = true;

    document.querySelectorAll('[data-counter]').forEach(el => {
      const target = parseInt(el.dataset.counter, 10);
      const dur    = 1400;
      const start  = performance.now();

      function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        const val = Math.floor(target * eased);
        el.textContent = val.toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(tick);
    });
  }


  /* ── IntersectionObserver: staggered reveal of items in view ──────── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = `routeIn 600ms ${i * 70}ms var(--ease) both`;
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.research-card, .highlight, .pub, .project-tile, .news-list li')
      .forEach(el => io.observe(el));
  }


  /* ── Keyboard niceties: arrow keys cycle routes ───────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, button')) return;
    const i = validRoutes.indexOf(location.hash.slice(1) || 'about');
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(validRoutes[(i + 1) % validRoutes.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(validRoutes[(i - 1 + validRoutes.length) % validRoutes.length]);
    }
  });
})();
