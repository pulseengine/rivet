// Standalone SVG-viewer toolbar handlers for the STATIC HTML export.
//
// In `rivet serve` these live in serve/js.rs and are delivered inline; the
// static export reuses the serve dashboard's HTML (which renders the
// `.svg-viewer-toolbar` buttons) but did not ship the handlers, so the
// zoom-fit / fullscreen / popout buttons were dead in exported pages
// (REQ-105). This file is bundled into the export's `_assets/` and
// referenced from every page so the buttons work offline.
//
// Kept in sync with serve/js.rs by hand; the handlers are small and stable.
(function () {
  window.svgFullscreen = function (btn) {
    var viewer = btn.closest('.svg-viewer');
    if (!viewer) return;
    viewer.classList.toggle('fullscreen');
    var isFS = viewer.classList.contains('fullscreen');
    btn.textContent = isFS ? '✕' : '⛶';
    btn.title = isFS ? 'Exit fullscreen' : 'Fullscreen';
  };

  window.svgPopout = function (btn) {
    var viewer = btn.closest('.svg-viewer');
    if (!viewer) return;
    var svg = viewer.querySelector('svg');
    if (!svg) return;
    var popup = window.open('', '_blank', 'width=1200,height=800');
    if (!popup) return;
    var doc = popup.document;
    doc.open();
    var style = doc.createElement('style');
    style.textContent =
      'body{margin:0;background:#fafbfc;display:flex;align-items:center;justify-content:center;min-height:100vh} svg{max-width:95vw;max-height:95vh}';
    doc.head.appendChild(style);
    doc.title = 'Rivet Graph';
    doc.body.appendChild(svg.cloneNode(true));
    doc.close();
  };

  window.svgZoomFit = function (btn) {
    var viewer = btn.closest('.svg-viewer');
    if (!viewer) return;
    var container = viewer.querySelector('.graph-container');
    var svg = viewer.querySelector('svg');
    if (!svg) return;
    if (container) {
      var fitBtn = container.querySelector('.zoom-fit');
      if (fitBtn) {
        fitBtn.click();
        return;
      }
    }
    var bbox = svg.getBBox();
    var pad = 40;
    svg.setAttribute(
      'viewBox',
      bbox.x - pad + ' ' + (bbox.y - pad) + ' ' + (bbox.width + pad * 2) + ' ' + (bbox.height + pad * 2)
    );
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.svg-viewer.fullscreen').forEach(function (v) {
        v.classList.remove('fullscreen');
        var btn = v.querySelector('.svg-viewer-toolbar button[title="Exit fullscreen"]');
        if (btn) {
          btn.textContent = '⛶';
          btn.title = 'Fullscreen';
        }
      });
    }
  });
})();
