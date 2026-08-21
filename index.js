// Minimal progressive enhancement. Everything works with JS disabled.

// Current year in the footer.
var y = document.getElementById('year');
if (y) { y.textContent = new Date().getFullYear(); }

// A single quiet fade-in as sections enter view.
var items = document.querySelectorAll('.reveal');
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduce || !('IntersectionObserver' in window)) {
  items.forEach(function (el) { el.classList.add('is-visible'); });
} else {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  items.forEach(function (el) { io.observe(el); });
}

// Scroll-spy: highlight the nav link for the section currently in view.
var navLinks = document.querySelectorAll('.site-nav a');
var sections = [];
navLinks.forEach(function (link) {
  var id = link.getAttribute('href').slice(1);
  var sec = document.getElementById(id);
  if (sec) { sections.push({ link: link, sec: sec }); }
});

if (sections.length && 'IntersectionObserver' in window) {
  var setActive = function (id) {
    sections.forEach(function (s) {
      s.link.classList.toggle('active', s.sec.id === id);
    });
  };
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { setActive(entry.target.id); }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(function (s) { spy.observe(s.sec); });
}

// Gallery: filter tiles by category.
var galFilters = document.querySelectorAll('.gal-filter');
var galFigs = document.querySelectorAll('.gal-fig');
galFilters.forEach(function (btn) {
  btn.addEventListener('click', function () {
    var cat = btn.getAttribute('data-filter');
    galFilters.forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    galFigs.forEach(function (fig) {
      fig.hidden = !(cat === 'all' || fig.getAttribute('data-cat') === cat);
    });
  });
});

// Lightbox: click a gallery photo to view it large.
var lb = document.getElementById('lightbox');
if (lb) {
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbClose = document.getElementById('lbClose');
  var lastFocus = null;

  var openLightbox = function (img, caption) {
    lastFocus = document.activeElement;
    lbImg.setAttribute('src', img.getAttribute('src'));
    lbImg.setAttribute('alt', img.getAttribute('alt') || '');
    lbCap.textContent = caption || '';
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-open');
    lbClose.focus();
  };
  var closeLightbox = function () {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-open');
    lbImg.setAttribute('src', '');
    if (lastFocus) { lastFocus.focus(); }
  };

  document.querySelectorAll('.gal-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      var figcap = btn.closest('.gal-fig').querySelector('figcaption');
      openLightbox(img, figcap ? figcap.textContent : '');
    });
  });
  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) { if (e.target === lb) { closeLightbox(); } });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) { closeLightbox(); }
  });
}

// Copy email to clipboard, with brief feedback.
var copyBtn = document.getElementById('copyEmail');
if (copyBtn && navigator.clipboard) {
  copyBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(copyBtn.getAttribute('data-copy')).then(function () {
      copyBtn.textContent = 'Copied';
      copyBtn.classList.add('copied');
      setTimeout(function () {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 1600);
    }).catch(function () {});
  });
} else if (copyBtn) {
  copyBtn.hidden = true;
}
