(function () {
  // Caption labels matching slide order
  var captions = [
    'Taj Mahal, Agra',
    'India Gate, Delhi',
    'Baga Beach, Goa',
    'Backwaters, Kerala',
    'Rohtang Pass, Manali',
    'Leh, Ladakh'
  ];

  var totalSlides = captions.length;
  var slideDuration = 6000;
  var current = 0;

  var captionEl = document.querySelector('.caption-text');
  var dots = document.querySelectorAll('.dot');

  function update(index) {
    if (captionEl) {
      captionEl.style.opacity = '0';
      setTimeout(function () {
        captionEl.textContent = captions[index];
        captionEl.style.opacity = '1';
      }, 300);
    }
    if (dots && dots.length) {
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('active', i === index);
      }
    }
  }

  setInterval(function () {
    current = (current + 1) % totalSlides;
    update(current);
  }, slideDuration);

  // ── Region filter tabs ─────────────────────────────
  var tabs = document.querySelectorAll('.rtab');
  var cards = document.querySelectorAll('.dest-card');
  var grid  = document.getElementById('dest-grid');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var region = tab.getAttribute('data-region');

      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      var visibleCount = 0;
      cards.forEach(function (card) {
        var cardRegion = card.getAttribute('data-region');
        var show = (region === 'all' || cardRegion === region);
        if (show) {
          card.classList.remove('hidden');
          card.style.animationDelay = (visibleCount * 0.05) + 's';
          card.style.animation = 'none';
          // Trigger reflow so animation restarts
          void card.offsetWidth;
          card.style.animation = 'fadeSlideUp .45s ease forwards';
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      // Update section subtitle
      var subtitle = document.querySelector('.dest-header p');
      if (subtitle) {
        var labels = {
          'all':   '45 handpicked destinations across India',
          'North': '9 iconic destinations in North India',
          'West':  '10 vibrant destinations in West India',
          'East':  '10 beautiful destinations in East India',
          'South': '16 stunning destinations in South India',
        };
        subtitle.textContent = labels[region] || labels['all'];
      }
    });
  });

  // ── Hero search filter ────────────────────────────────
  window.filterBySearch = function(query) {
    var q = query.toLowerCase().trim();
    // Reset region tabs to 'all'
    tabs.forEach(function(t) { t.classList.remove('active'); });
    var allTab = document.querySelector('.rtab[data-region="all"]');
    if (allTab) allTab.classList.add('active');

    var visibleCount = 0;
    cards.forEach(function(card) {
      var name = (card.getAttribute('data-name') || '').toLowerCase();
      var region = (card.getAttribute('data-region') || '').toLowerCase();
      var show = !q || name.includes(q) || region.includes(q);
      if (show) {
        card.classList.remove('hidden');
        card.style.animationDelay = (visibleCount * 0.05) + 's';
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = 'fadeSlideUp .45s ease forwards';
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    var subtitle = document.querySelector('.dest-header p');
    if (subtitle) {
      subtitle.textContent = q
        ? visibleCount + ' destination' + (visibleCount !== 1 ? 's' : '') + ' matching "' + query + '"'
        : '45 handpicked destinations across India';
    }
  };

  // Scroll reveal
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.dest-card, .why-card').forEach(function (card) {
      card.style.animationPlayState = 'paused';
      observer.observe(card);
    });
  }

  // ── Destination card shimmer on hover (no tilt — flip cards use 3D internally) ───
  // We add a travelling light-ray shimmer instead, which looks premium
  // without conflicting with the CSS flip transform.
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.dest-card').forEach(function (card) {
      var inner = card.querySelector('.flip-front');
      if (!inner) return;
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width)  * 100;
        var y = ((e.clientY - rect.top)  / rect.height) * 100;
        inner.style.setProperty('--shine-x', x + '%');
        inner.style.setProperty('--shine-y', y + '%');
      });
      card.addEventListener('mouseleave', function () {
        inner.style.removeProperty('--shine-x');
        inner.style.removeProperty('--shine-y');
      });
    });
  }

  // ── Animated visitor counter ──────────────────────────
  var vcEl = document.getElementById('visitorCount');
  if (vcEl && 'IntersectionObserver' in window) {
    var vcObserver = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      vcObserver.disconnect();
      var start  = 2600;
      var end    = 2847;
      var dur    = 1800;
      var step   = dur / (end - start);
      var cur    = start;
      var t = setInterval(function () {
        cur++;
        vcEl.textContent = cur.toLocaleString('en-IN');
        if (cur >= end) clearInterval(t);
      }, step);
    }, { threshold: 0.5 });
    vcObserver.observe(vcEl);
  }

  // ── Why-card scroll reveal with stagger ───────────────
  if ('IntersectionObserver' in window) {
    var whyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('why-card--visible');
          whyObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.why-card').forEach(function (c, i) {
      c.style.transitionDelay = (i * 0.08) + 's';
      whyObs.observe(c);
    });
  }
})();
