// etch interactive SVG viewer — pan, zoom, selection, group highlight
(function() {
  const container = document.getElementById('container');
  const svg = container.querySelector('svg');
  if (!svg) return;

  // Parse initial viewBox
  const vb = svg.getAttribute('viewBox').split(' ').map(Number);
  let [vx, vy, vw, vh] = vb;
  const origVw = vw, origVh = vh;

  // State
  let isPanning = false;
  let panStart = { x: 0, y: 0 };
  let scale = 1;

  // --- Pan ---
  svg.addEventListener('mousedown', e => {
    if (e.target.closest('.node')) return; // don't pan when clicking nodes
    isPanning = true;
    panStart = { x: e.clientX, y: e.clientY };
    svg.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!isPanning) return;
    const dx = (e.clientX - panStart.x) * (vw / svg.clientWidth);
    const dy = (e.clientY - panStart.y) * (vh / svg.clientHeight);
    vx -= dx;
    vy -= dy;
    panStart = { x: e.clientX, y: e.clientY };
    updateViewBox();
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
    svg.style.cursor = 'grab';
  });

  // --- Zoom (wheel) ---
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;

    // Zoom around cursor position
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    const newVw = vw * zoomFactor;
    const newVh = vh * zoomFactor;

    vx += (vw - newVw) * mx;
    vy += (vh - newVh) * my;
    vw = newVw;
    vh = newVh;
    scale = origVw / vw;

    updateViewBox();
    updateSemanticZoom();
  }, { passive: false });

  // --- Selection ---
  svg.addEventListener('click', e => {
    const nodeEl = e.target.closest('.node');
    if (!nodeEl) {
      if (!e.ctrlKey && !e.metaKey) {
        svg.querySelectorAll('.node.selected').forEach(n => n.classList.remove('selected'));
      }
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      nodeEl.classList.toggle('selected');
    } else {
      svg.querySelectorAll('.node.selected').forEach(n => n.classList.remove('selected'));
      nodeEl.classList.add('selected');
    }

    // If it's a container, highlight children
    if (nodeEl.classList.contains('container')) {
      const containerId = nodeEl.getAttribute('data-id');
      if (containerId) {
        // Emit event for integration
        svg.dispatchEvent(new CustomEvent('etch-container-select', {
          detail: { id: containerId }
        }));
      }
    }

    // Emit selection event
    const selected = Array.from(svg.querySelectorAll('.node.selected'))
      .map(n => n.getAttribute('data-id'))
      .filter(Boolean);
    svg.dispatchEvent(new CustomEvent('etch-select', {
      detail: { ids: selected }
    }));
  });

  // --- URL highlight parameter ---
  const params = new URLSearchParams(window.location.search);
  const highlightId = params.get('highlight');
  if (highlightId) {
    const node = svg.querySelector(`.node[data-id="${CSS.escape(highlightId)}"]`);
    if (node) {
      node.classList.add('selected');
      // Pan to highlighted node
      const rect = node.querySelector('rect');
      if (rect) {
        const nx = parseFloat(rect.getAttribute('x'));
        const ny = parseFloat(rect.getAttribute('y'));
        vx = nx - vw / 4;
        vy = ny - vh / 4;
        updateViewBox();
      }
    }
  }

  // --- Semantic zoom ---
  function updateSemanticZoom() {
    svg.classList.toggle('zoom-low', scale < 0.5);
    svg.classList.toggle('zoom-overview', scale < 0.25);
  }

  function updateViewBox() {
    svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`);
  }
})();
