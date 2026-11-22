/* =========================================================
   초록을잇다 — interactions
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var docEl = document.documentElement;

  /* ── 1. 로드 상태 ───────────────────────────── */
  window.addEventListener('load', function () {
    document.body.classList.add('is-ready');
  }, { once: true });
  // 스크립트가 늦게 실행되어도 안전하게
  if (document.readyState === 'complete') document.body.classList.add('is-ready');

  /* ── 2. 헤더 · 진행바 ───────────────────────── */
  var header = document.getElementById('header');
  var progress = document.getElementById('progress');
  var hero = document.querySelector('.hero');
  var heroMedia = document.querySelector('.hero__media');
  var heroInner = document.querySelector('.hero__inner');
  var featureBg = document.querySelector('.feature__bg');
  var feature = document.querySelector('.feature');

  var scrollTicking = false;

  function onScrollFrame() {
    var y = window.pageYOffset || docEl.scrollTop;

    if (header) header.classList.toggle('is-scrolled', y > 40);

    if (y < 140 && navLinks) {
      navLinks.forEach(function (a) { a.classList.remove('is-active'); });
    }

    if (progress) {
      var max = docEl.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }

    // 히어로 패럴랙스
    if (!reduced && hero && heroMedia && heroInner) {
      var h = hero.offsetHeight || window.innerHeight;
      if (y < h * 1.3) {
        heroMedia.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
        heroInner.style.transform = 'translate3d(0,' + (-y * 0.05).toFixed(1) + 'px,0)';
        heroInner.style.opacity = Math.max(0, 1 - y / (h * 0.78)).toFixed(3);
      }
    }

    // 현장 비주얼 패럴랙스
    if (!reduced && feature && featureBg) {
      var r = feature.getBoundingClientRect();
      if (r.bottom > -200 && r.top < window.innerHeight + 200) {
        var p = (r.top + r.height / 2 - window.innerHeight / 2) / (window.innerHeight + r.height);
        featureBg.style.transform = 'translate3d(0,' + (p * -90).toFixed(1) + 'px,0)';
      }
    }
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(onScrollFrame);
    }
  }, { passive: true });
  onScrollFrame();

  /* ── 3. 모바일 메뉴 ─────────────────────────── */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');

  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (burger) burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    if (mobileMenu) mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('menu-open'));
    });
  }
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });

  /* ── 4. 문장 단어 분할 ──────────────────────── */
  function splitWords(el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) {
              frag.appendChild(document.createTextNode(' '));
            } else {
              var s = document.createElement('span');
              s.className = 'word';
              s.textContent = p;
              frag.appendChild(s);
            }
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'SPAN') {
          walk(n);
        }
      });
    };
    walk(el);
    var words = el.querySelectorAll('.word');
    Array.prototype.forEach.call(words, function (w, i) {
      w.style.setProperty('--i', i);
    });
  }

  document.querySelectorAll('.split').forEach(splitWords);

  /* ── 5. 등장 애니메이션 ─────────────────────── */
  var revealTargets = document.querySelectorAll('.reveal, .split');

  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var d = el.getAttribute('data-delay');
        if (d) el.style.setProperty('--d', d);
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── 6. 섹션 내비게이션 표시 ────────────────── */
  var navLinks = document.querySelectorAll('.nav a');
  var sections = ['about', 'services', 'books', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ── 7. 히어로 슬라이드 (11장 · 끊김 없는 크로스페이드) ──
     전환 중에는 이전 장을 완전히 불투명한 채로 아래에 두고(z-index 2)
     새 장만 위에서(z-index 3) 2.05s 동안 opacity 0→1 로 올린다.
     두 장이 동시에 반투명해지지 않으므로 중간 프레임이 어두워지지 않고,
     이전 장은 is-leaving 인 동안 켄번스 애니메이션이 그대로 이어져
     scale 이 원위치로 튀지 않는다. */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero__slide'));
  var FADE = 2050;   // styles.css .hero__slide transition 길이와 동일
  var HOLD = 5500;   // 한 장을 보여주는 시간
  var current = 0;
  var leaveTimer = null;

  function slideImg(fig) { return fig ? fig.querySelector('img') : null; }

  function slideReady(fig) {
    var img = slideImg(fig);
    return !!(img && img.complete && img.naturalWidth > 0);
  }

  function restartKenburns(fig) {
    var img = slideImg(fig);
    if (!img) return;
    img.style.animation = 'none';
    void img.offsetWidth;      // 리플로우로 애니메이션 초기화를 확정
    img.style.animation = '';
  }

  function activate(i) {
    var prev = slides[current];
    var next = slides[i];
    if (!next || next === prev) return;

    // 나가는 장: 페이드가 끝날 때까지 불투명 유지 (켄번스도 계속)
    prev.classList.remove('is-active', 'is-done');
    prev.classList.add('is-leaving');

    // 들어오는 장: 위에서 서서히 올라온다
    next.classList.remove('is-leaving', 'is-done');
    restartKenburns(next);
    next.classList.add('is-active');

    current = i;

    window.clearTimeout(leaveTimer);
    leaveTimer = window.setTimeout(function () {
      prev.classList.remove('is-leaving');
      prev.classList.add('is-done');
    }, FADE + 90);
  }

  /* 백그라운드 순차 프리로드 — 1번은 preload 로 즉시, 2~11번은 load 이후 한 장씩 */
  function preloadHero() {
    var i = 1;
    function step() {
      if (i >= slides.length) return;
      var img = slideImg(slides[i]);
      var src = img && img.getAttribute('data-src');
      if (!src) { i += 1; step(); return; }
      var done = function () {
        img.removeAttribute('data-src');
        i += 1;
        window.setTimeout(step, 80);
      };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
      img.src = src;
    }
    step();
  }

  if (slides.length > 1) {
    if (document.readyState === 'complete') {
      window.setTimeout(preloadHero, 300);
    } else {
      window.addEventListener('load', function () { window.setTimeout(preloadHero, 300); }, { once: true });
    }

    if (!reduced) {
      window.setInterval(function () {
        if (document.hidden) return;
        var next = (current + 1) % slides.length;
        // 다음 장이 아직 로드되지 않았다면 이번 차례는 건너뛰어 빈 화면이 보이지 않게 한다
        if (!slideReady(slides[next])) return;
        activate(next);
      }, HOLD);
    }
  }

  /* ── 8. 캔버스 모션 (부유하는 입자) ─────────── */
  var canvas = document.getElementById('heroCanvas');
  if (canvas && !reduced) {
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1;
    var parts = [];
    var pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
    var t0 = performance.now();
    var lastTime = 0;
    var visible = true;
    var rafId = null;

    function seed() {
      var count = Math.max(28, Math.min(90, Math.round((w * h) / 20000)));
      parts = [];
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2.1 + 0.5,
          sp: (Math.random() * 0.32 + 0.08) / 3,
          amp: Math.random() * 1.4 + 0.3,
          phase: Math.random() * Math.PI * 2,
          freq: (Math.random() * 0.6 + 0.2) / 3,
          alpha: Math.random() * 0.45 + 0.12,
          big: Math.random() > 0.86
        });
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function draw(now) {
      var t = (now - t0) / 1000;
      /* 60fps(16.667ms) 기준으로 환산 — 120Hz 기기에서도 속도가 같도록 */
      var dtScale = lastTime ? Math.min((now - lastTime) / 16.667, 3) : 1;
      lastTime = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      pointerX += (targetX - pointerX) * 0.05;
      pointerY += (targetY - pointerY) * 0.05;

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.sp * dtScale;
        if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }

        var x = p.x + Math.sin(t * p.freq + p.phase) * p.amp * 10 + pointerX * (p.big ? 26 : 14);
        var y = p.y + pointerY * (p.big ? 18 : 10);
        var r = p.big ? p.r * 3.4 : p.r;

        var g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
        g.addColorStop(0, 'rgba(190,240,215,' + p.alpha + ')');
        g.addColorStop(0.45, 'rgba(120,205,175,' + p.alpha * 0.42 + ')');
        g.addColorStop(1, 'rgba(90,180,150,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      rafId = window.requestAnimationFrame(draw);
    }

    function start() {
      if (rafId === null && visible) rafId = window.requestAnimationFrame(draw);
    }
    function stop() {
      if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
    }

    resize();
    start();

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(resize, 180);
    });

    window.addEventListener('pointermove', function (e) {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    if ('IntersectionObserver' in window && hero) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
  }

  /* ── 9. 주요 실적 더보기 아코디언 ──────────── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-acc]'), function (acc) {
    var btn = acc.querySelector('.acc__btn');
    var panel = acc.querySelector('.acc__panel');
    if (!btn || !panel) return;

    var label = btn.querySelector('.acc__label');
    var more = btn.getAttribute('data-more') || '주요 실적 더보기';
    var less = btn.getAttribute('data-less') || '접기';

    function setOpen(open) {
      acc.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? less : more;
    }

    setOpen(false);
    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });
  });

  /* ── 10. 내부 링크 부드러운 이동 ─────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = (header ? header.offsetHeight : 0) + 10;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });
})();
