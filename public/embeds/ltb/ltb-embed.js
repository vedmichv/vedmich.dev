/* Shared motion control for the latency / throughput / bandwidth embeds.
   Animation runs only while the embed is on screen, the tab is visible and the viewer has not
   pressed the pause button. CSS animations follow the .ltb-paused class on <html>; scripts
   subscribe with LTB.onRun(fn). Without JavaScript the CSS animations simply loop, and
   prefers-reduced-motion switches them off in CSS. */
(function () {
  var root = document.documentElement;
  var btn = document.querySelector('[data-motion-toggle]');
  var userPaused = false, offscreen = false, hidden = document.hidden;
  var subs = [];

  function running() { return !(userPaused || offscreen || hidden); }
  function apply() {
    var run = running();
    root.classList.toggle('ltb-paused', !run);
    for (var i = 0; i < subs.length; i++) subs[i](run);
  }

  window.LTB = {
    running: running,
    onRun: function (fn) { subs.push(fn); fn(running()); }
  };

  if (btn) {
    btn.addEventListener('click', function () {
      userPaused = !userPaused;
      btn.textContent = userPaused ? btn.getAttribute('data-play') : btn.getAttribute('data-pause');
      apply();
    });
  }
  document.addEventListener('visibilitychange', function () { hidden = document.hidden; apply(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      offscreen = !entries[entries.length - 1].isIntersecting;
      apply();
    }).observe(document.body);
  }
})();
