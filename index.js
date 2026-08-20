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
