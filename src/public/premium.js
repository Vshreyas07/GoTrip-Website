/* ══════════════════════════════════════════════════════════
  GoTrip — premium.js
   ══════════════════════════════════════════════════════════ */

function forEachNode(list, cb) {
  if (!list || typeof cb !== 'function') return;
  for (var i = 0; i < list.length; i++) cb(list[i], i);
}

function getStorageItemSafe(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function setStorageItemSafe(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

/* ── 0. Mobile Lite Mode ───────────────────────────────── */
(function initMobileLiteMode() {
  var isCoarse = false;
  try {
    isCoarse = !!(window.matchMedia && window.matchMedia('(max-width: 768px), (pointer: coarse)').matches);
  } catch (e) {
    isCoarse = window.innerWidth <= 768;
  }
  if (isCoarse) {
    document.documentElement.classList.add('mobile-lite');
  }
})();

/* ── 1. Loading Screen ─────────────────────────────────── */
(function initLoadingScreen() {
  const screen = document.getElementById('loadingScreen');
  if (!screen) return;
  // Hide after images / DOM ready
  function hideLoader() {
    screen.classList.add('hidden');
    forEachNode(document.querySelectorAll('.dest-card-skeleton'), function (s) {
      s.classList.add('loaded');
    });
  }
  const isMobileLite = document.documentElement.classList.contains('mobile-lite');
  const loaderDelay = isMobileLite ? 120 : 400;
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, loaderDelay);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, loaderDelay));
    setTimeout(hideLoader, isMobileLite ? 1200 : 2800); // hard cap
  }
})();

/* ── 2. Dark Mode ──────────────────────────────────────── */
(function initDarkMode() {
  const btn = document.getElementById('darkToggle');
  const iconEl = document.getElementById('darkToggleIcon');
  const html = document.documentElement;

  const stored = getStorageItemSafe('gotrip-theme');
  if (stored) html.setAttribute('data-theme', stored);

  function apply(theme) {
    html.setAttribute('data-theme', theme);
    setStorageItemSafe('gotrip-theme', theme);
    if (iconEl) iconEl.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }

  apply(html.getAttribute('data-theme') || 'light');

  if (btn) {
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      apply(current === 'dark' ? 'light' : 'dark');
    });
  }
})();

/* ── 3. Page Transition (disabled — instant navigation) ── */
(function initPageTransitions() {
  // bfcache restore: reset any stale exit class
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      document.body.classList.remove('page-exit');
      const tabs = document.querySelectorAll('.rtab');
      tabs.forEach(t => t.classList.remove('active'));
      const allTab = document.querySelector('.rtab[data-region="all"]');
      if (allTab) allTab.classList.add('active');
      document.querySelectorAll('.dest-card.hidden').forEach(c => c.classList.remove('hidden'));
    }
  });
})();

/* ── 4. Typewriter Effect ──────────────────────────────── */
(function initTypewriter() {
  const el = document.getElementById('typewriterText');
  const cursor = document.getElementById('typewriterCursor');
  if (!el) return;

  const words = [
    'Mountains', 'Beaches', 'Heritage', 'Forests',
    'Deserts', 'Backwaters', 'Hill Stations', 'Temples'
  ];
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.substring(0, ci + 1);
      ci++;
      if (ci === word.length) {
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
    } else {
      el.textContent = word.substring(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
      }
    }
    setTimeout(tick, deleting ? 65 : 110);
  }
  setTimeout(tick, 800);
})();

/* ── 5. Hero Glassmorphism Search ──────────────────────── */
(function initHeroSearch() {
  const input   = document.getElementById('heroSearchInput');
  const btn     = document.getElementById('heroSearchBtn');
  const dropdown = document.getElementById('heroSearchDropdown');
  if (!input || !dropdown) return;

  // Build destination list from cards
  function getDestinations() {
    const cards = document.querySelectorAll('.flip-card[data-name]');
    return Array.from(cards).map(c => {
      // Images are CSS background-image on .dest-img div, not <img> tags
      const destImgEl = c.querySelector('.dest-img');
      let img = '';
      if (destImgEl) {
        const bg = destImgEl.style.backgroundImage || getComputedStyle(destImgEl).backgroundImage;
        const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
        if (match) img = match[1];
      }
      return {
        id:     c.dataset.id,
        name:   c.dataset.name,
        region: (function () {
          const badge = c.querySelector('.dest-region-badge');
          return badge ? badge.textContent : '';
        })(),
        img
      };
    });
  }

  function renderDropdown(query) {
    const dests = getDestinations();
    const q = query.toLowerCase().trim();
    const filtered = q ? dests.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q)
    ) : dests.slice(0, 8);

    dropdown.innerHTML = '';
    if (filtered.length === 0) {
      dropdown.innerHTML = '<div class="hsd-empty">No destinations found</div>';
    } else {
      filtered.forEach(d => {
        const item = document.createElement('div');
        item.className = 'hsd-item';
        item.innerHTML = `
          <img class="hsd-item-img" src="${d.img}" alt="${d.name}">
          <div>
            <div class="hsd-item-name">${d.name}</div>
            <div class="hsd-item-region">${d.region}</div>
          </div>`;
        item.addEventListener('mousedown', e => {
          e.preventDefault();
          window.location.href = '/destination/' + encodeURIComponent(d.id);
        });
        dropdown.appendChild(item);
      });
    }
    dropdown.classList.add('active');
  }

  input.addEventListener('input', () => renderDropdown(input.value));
  input.addEventListener('focus', () => renderDropdown(input.value));
  input.addEventListener('blur', () => {
    setTimeout(() => dropdown.classList.remove('active'), 180);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) {
        // scroll to dest section, filter cards
        const section = document.querySelector('.dest-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
        // trigger filtering in home.js if filterBySearch exists
        if (typeof filterBySearch === 'function') filterBySearch(q);
      }
    }
  });
  if (btn) {
    btn.addEventListener('click', () => {
      const q = input.value.trim();
      if (!q) {
        const section = document.querySelector('.dest-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (typeof filterBySearch === 'function') filterBySearch(q);
      const section = document.querySelector('.dest-section');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
  }
})();

/* ── 6. Wishlist (localStorage) ────────────────────────── */
window.getWishlist = function() {
  try {
    return JSON.parse(getStorageItemSafe('gotrip-wishlist') || '[]');
  } catch (e) {
    return [];
  }
};
window.saveWishlist = function(list) {
  setStorageItemSafe('gotrip-wishlist', JSON.stringify(list));
};

window.toggleWishlist = function(btn, evt) {
  if (evt) { evt.preventDefault(); evt.stopPropagation(); }
  const id      = btn.dataset.id;
  const name    = btn.dataset.name;
  const img     = btn.dataset.img;
  const tagline = btn.dataset.tagline || '';

  let list = getWishlist();
  const idx = list.findIndex(i => i.id === id);
  if (idx === -1) {
    list.push({ id, name, img, tagline });
    btn.textContent = '♥';
    btn.setAttribute('aria-label', 'Remove from saved trips');
    btn.classList.add('wishlisted', 'pop');
    setTimeout(() => btn.classList.remove('pop'), 400);
    showToast('\u2665 ' + name + ' saved to My Trips!');
  } else {
    list.splice(idx, 1);
    btn.textContent = '♡';
    btn.setAttribute('aria-label', 'Save to wishlist');
    btn.classList.remove('wishlisted');
    showToast(name + ' removed from My Trips');
  }
  saveWishlist(list);
  renderWishlist();
  updateWishlistBadge();
};

window.renderWishlist = function() {
  const grid    = document.getElementById('wishlistGrid');
  const empty   = document.getElementById('wishlistEmpty');
  const subtitle = document.getElementById('wishlistSubtitle');
  const section = document.getElementById('wishlist-section');
  if (!grid) return;

  const list = getWishlist();
  // Remove old wishlist item cards (keep empty placeholder)
  grid.querySelectorAll('.wishlist-item-card').forEach(c => c.remove());

  if (list.length === 0) {
    if (section) section.classList.add('empty');
    if (empty) empty.classList.add('visible');
    if (subtitle) subtitle.textContent = 'Save destinations by clicking the heart on any card';
    return;
  }
  if (section) section.classList.remove('empty');
  if (empty) empty.classList.remove('visible');
  if (subtitle) subtitle.textContent = `${list.length} destination${list.length > 1 ? 's' : ''} saved`;

  list.forEach(item => {
    const card = document.createElement('a');
    card.className = 'wishlist-item-card';
    card.href = '/destination/' + encodeURIComponent(item.id);
    card.innerHTML = `
      <img class="wishlist-item-img" src="${item.img}" alt="${item.name}" loading="lazy">
      <div class="wishlist-item-info">
        <div class="wishlist-item-name">${item.name}</div>
        <div class="wishlist-item-tagline">${item.tagline}</div>
      </div>
      <button class="wishlist-remove" title="Remove" onclick="removeWishlistItem(event,'${item.id}')">✕</button>`;
    grid.insertBefore(card, grid.lastElementChild);
  });
};

window.removeWishlistItem = function(e, id) {
  e.preventDefault(); e.stopPropagation();
  let list = getWishlist();
  list = list.filter(i => i.id !== id);
  saveWishlist(list);
  renderWishlist();
  updateWishlistBadge();
  // un-fill card wishlist btn
  const btn = document.querySelector(`.wishlist-btn[data-id="${id}"]`);
  if (btn) { btn.textContent = '♡'; btn.classList.remove('wishlisted'); }
};

window.updateWishlistBadge = function() {
  const badge = document.getElementById('wishlistCountBadge');
  if (badge) {
    const count = getWishlist().length;
    badge.textContent = count;
    badge.classList.toggle('has-items', count > 0);
  }
  // Update mobile bottom nav badge
  const mbnBadge = document.getElementById('mbnWishlistBadge');
  const mbnBtn   = document.getElementById('mbnWishlistBtn');
  const mbnHeart = mbnBtn && mbnBtn.querySelector('.mbn-heart-icon');
  if (mbnBadge && mbnBtn) {
    const count = getWishlist().length;
    mbnBadge.textContent = count > 0 ? count : '';
    mbnBadge.classList.toggle('visible', count > 0);
    mbnBtn.classList.toggle('has-items', count > 0);
    if (mbnHeart) mbnHeart.textContent = count > 0 ? '♥' : '♡';
  }
};

(function initWishlist() {
  // Mark already-saved buttons and set correct aria-label
  const list = getWishlist();
  list.forEach(item => {
    const btn = document.querySelector(`.wishlist-btn[data-id="${item.id}"]`);
    if (btn) {
      btn.textContent = '♥';
      btn.setAttribute('aria-label', 'Remove from saved trips');
      btn.classList.add('wishlisted');
    }
  });
  renderWishlist();
  updateWishlistBadge();

  // Scroll to wishlist section from nav badge (desktop)
  const navBtn = document.getElementById('wishlistNavBtn');
  if (navBtn) {
    navBtn.addEventListener('click', e => {
      e.preventDefault();
      const sec = document.getElementById('wishlist-section');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Scroll to wishlist section from mobile bottom nav
  const mbnBtn = document.getElementById('mbnWishlistBtn');
  if (mbnBtn) {
    mbnBtn.addEventListener('click', e => {
      e.preventDefault();
      const sec = document.getElementById('wishlist-section');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }
})();

/* ── 7. Reviews Carousel ───────────────────────────────── */
(function initReviewsCarousel() {
  const track   = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewPrev');
  const nextBtn = document.getElementById('reviewNext');
  if (!track) return;

  let current = 0;
  const cards = Array.from(track.querySelectorAll('.review-card'));
  let perView = getPerView();

  function getPerView() {
    return window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3;
  }

  function maxIndex() { return Math.max(0, cards.length - perView); }

  function go(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    const cardW = cards[0].getBoundingClientRect().width + 24;
    track.style.transform = `translateX(-${current * cardW}px)`;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => go(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => go(current + 1));

  // Auto-advance
  let autoTimer = setInterval(() => go(current + 1 > maxIndex() ? 0 : current + 1), 5000);
  [prevBtn, nextBtn].forEach(b => b && b.addEventListener('click', () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => go(current + 1 > maxIndex() ? 0 : current + 1), 5000);
  }));

  // Touch / swipe
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) go(dx < 0 ? current + 1 : current - 1);
  });

  window.addEventListener('resize', () => { perView = getPerView(); go(current); });
})();

/* ── 8. Stats Counter Animation ────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target || el.textContent.replace(/[^0-9]/g, ''), 10);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString() + suffix;
        if (current >= target) clearInterval(timer);
      }, 25);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ── 9. Mobile swipe for destination cards ─────────────── */
(function initMobileCardSwipe() {
  if (window.innerWidth > 768) return;
  const grid = document.querySelector('.dest-grid');
  if (!grid) return;

  let startX = 0, scrollLeft = 0;
  grid.addEventListener('touchstart', e => {
    startX = e.touches[0].pageX - grid.offsetLeft;
    scrollLeft = grid.scrollLeft;
  }, { passive: true });
  grid.addEventListener('touchmove', e => {
    const x = e.touches[0].pageX - grid.offsetLeft;
    grid.scrollLeft = scrollLeft - (x - startX);
  }, { passive: true });
})();

/* ── 10. Wishlist section scroll-reveal ────────────────── */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.review-card');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.replace('reveal-hidden', 'reveal-visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => {
    el.classList.add('reveal-hidden');
    observer.observe(el);
  });
})();

/* ── 11. Prevent flip on wishlist click (event delegation) ── */
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.wishlist-btn');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  toggleWishlist(btn, e);
}, true); // capture phase so it fires before the anchor's click

/* ── 12. Toast / Snackbar feedback ────────────────────── */
(function initToast() {
  // Create toast container once
  const toast = document.createElement('div');
  toast.id = 'gotrip-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
})();

window.showToast = function(message) {
  const toast = document.getElementById('gotrip-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('toast-hide');
  toast.classList.add('toast-show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.replace('toast-show', 'toast-hide');
  }, 2800);
};

/* ── 13. Flip card aria-labels ─────────────────────────── */
(function initFlipCardAria() {
  forEachNode(document.querySelectorAll('.flip-card'), function (card) {
    const name = card.dataset.name || 'destination';
    card.setAttribute('aria-label', `${name} — hover to see details, click to explore`);
  });
})();

/* ── 14. Animated live visitor counter ─────────────────── */
(function initVisitorCounter() {
  const el = document.getElementById('visitorCount');
  if (!el) return;

  // Parse starting value from existing text (e.g. "2,847")
  let base = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 2847;

  function formatNum(n) {
    return n.toLocaleString('en-IN');
  }

  el.textContent = formatNum(base);

  // Gently increment by 1–3 every 8–15 seconds to feel organic
  function bump() {
    base += Math.floor(Math.random() * 3) + 1;
    el.textContent = formatNum(base);
    // Flash highlight so user notices
    el.classList.add('counter-bump');
    setTimeout(() => el.classList.remove('counter-bump'), 600);
    setTimeout(bump, 8000 + Math.random() * 7000);
  }
  setTimeout(bump, 8000 + Math.random() * 7000);
})();

/* ── 15. Back to Top Button ────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function toggle() {
    if (window.scrollY > 600) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── 16. Navbar shrink on scroll ───────────────────────── */
(function initNavShrink() {
  const nav = document.querySelector('.cinema-nav');
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > 60) {
      nav.style.padding = '14px 40px';
      nav.style.background = 'rgba(0,0,0,.55)';
      nav.style.backdropFilter = 'blur(12px) saturate(1.6)';
      nav.style.webkitBackdropFilter = 'blur(12px) saturate(1.6)';
    } else {
      nav.style.padding = '';
      nav.style.background = '';
      nav.style.backdropFilter = '';
      nav.style.webkitBackdropFilter = '';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();
