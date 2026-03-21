// Auto-extracted from serve.rs

/// Bundled font faces (Latin subset) — no Google Fonts CDN needed.
pub(crate) const FONTS_CSS: &str = include_str!("../../assets/fonts.css");

pub(crate) const CSS: &str = r#"
/* ── Reset & base ─────────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:     #f5f5f7;
  --surface:#fff;
  --sidebar:#0f0f13;
  --sidebar-hover:#1c1c24;
  --sidebar-text:#9898a6;
  --sidebar-active:#fff;
  --text:   #1d1d1f;
  --text-secondary:#6e6e73;
  --border: #e5e5ea;
  --accent: #3a86ff;
  --accent-hover:#2568d6;
  --radius: 10px;
  --radius-sm:6px;
  --shadow: 0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
  --shadow-md:0 4px 12px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04);
  --mono: 'JetBrains Mono','Fira Code','SF Mono',Menlo,monospace;
  --font: 'Atkinson Hyperlegible',system-ui,-apple-system,sans-serif;
  --transition:180ms ease;
}
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
body{font-family:var(--font);color:var(--text);background:var(--bg);line-height:1.6;font-size:15px}

/* ── Links ────────────────────────────────────────────────────── */
a{color:var(--accent);text-decoration:none;transition:color var(--transition)}
a:hover{color:var(--accent-hover)}
a:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:3px}

/* ── Screen-reader-only utility (accessibility) ──────────────── */
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;
  overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

/* ── Skip-to-content link (accessibility) ────────────────────── */
.skip-link{position:absolute;top:-100%;left:1rem;z-index:10000;
  padding:.5rem 1rem;background:var(--accent);color:#fff;font-weight:600;
  border-radius:0 0 var(--radius-sm) var(--radius-sm);font-size:.875rem;
  text-decoration:none;transition:top .15s ease}
.skip-link:focus{top:0}

/* ── Shell layout ─────────────────────────────────────────────── */
.shell{display:flex;min-height:100vh}
.content-area{display:flex;flex-direction:column;flex:1;min-width:0}

/* ── Sidebar navigation ──────────────────────────────────────── */
nav{width:232px;background:var(--sidebar);color:var(--sidebar-text);
    padding:1.75rem 1rem;flex-shrink:0;display:flex;flex-direction:column;
    position:sticky;top:0;height:100vh;overflow-y:auto;
    border-right:1px solid rgba(255,255,255,.06)}
nav h1{font-size:1.05rem;font-weight:700;color:var(--sidebar-active);
       margin-bottom:2rem;letter-spacing:.04em;padding:0 .75rem;
       display:flex;align-items:center;gap:.5rem}
nav h1::before{content:'';display:inline-block;width:8px;height:8px;
               border-radius:50%;background:var(--accent);flex-shrink:0}
nav ul{list-style:none;display:flex;flex-direction:column;gap:2px}
nav li{margin:0}
nav a{display:flex;align-items:center;gap:.5rem;padding:.5rem .75rem;border-radius:var(--radius-sm);
      color:var(--sidebar-text);font-size:.875rem;font-weight:500;
      transition:all var(--transition)}
nav a:hover{background:var(--sidebar-hover);color:var(--sidebar-active);text-decoration:none}
nav a.active{background:rgba(58,134,255,.08);color:var(--sidebar-active);border-left:2px solid var(--accent);padding-left:calc(.75rem - 2px)}
nav a:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}

/* ── Main content ─────────────────────────────────────────────── */
main{flex:1;padding:2.5rem 3rem;max-width:1400px;min-width:0;overflow-y:auto}
main.htmx-swapping{opacity:.4;transition:opacity 150ms ease-out}
main.htmx-settling{opacity:1;transition:opacity 200ms ease-in}

/* ── Loading bar ──────────────────────────────────────────────── */
#loading-bar{position:fixed;top:0;left:0;width:0;height:2px;background:var(--accent);
             z-index:9999;transition:none;pointer-events:none}
#loading-bar.active{width:85%;transition:width 8s cubic-bezier(.1,.05,.1,1)}
#loading-bar.done{width:100%;transition:width 100ms ease;opacity:0;transition:width 100ms ease,opacity 300ms ease 100ms}

/* ── Typography ───────────────────────────────────────────────── */
h2{font-size:1.4rem;font-weight:700;margin-bottom:1.25rem;color:var(--text);letter-spacing:-.01em;padding-bottom:.75rem;border-bottom:1px solid var(--border)}
h3{font-size:1.05rem;font-weight:600;margin:1.5rem 0 .75rem;color:var(--text)}
code,pre{font-family:var(--mono);font-size:.85em}
pre{background:#f1f1f3;padding:1rem;border-radius:var(--radius-sm);overflow-x:auto}

/* ── Tables ───────────────────────────────────────────────────── */
table{width:100%;border-collapse:collapse;margin-bottom:1.5rem;font-size:.9rem}
th,td{text-align:left;padding:.65rem .875rem}
th{font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;
   color:var(--text-secondary);border-bottom:2px solid var(--border);background:transparent}
td{border-bottom:1px solid var(--border)}
tbody tr{transition:background var(--transition)}
tbody tr:nth-child(even){background:rgba(0,0,0,.015)}
tbody tr:hover{background:rgba(58,134,255,.04)}
.tbl-filter-wrap{margin-bottom:.5rem}
.tbl-filter{width:100%;max-width:20rem;padding:.4rem .65rem;font-size:.85rem;font-family:var(--mono);
  border:1px solid var(--border);border-radius:5px;background:var(--surface);color:var(--text);
  outline:none;transition:border-color var(--transition)}
.tbl-filter:focus{border-color:var(--accent)}
.tbl-sort-arrow{font-size:.7rem;opacity:.6;margin-left:.25rem}
th:hover .tbl-sort-arrow{opacity:1}
td a{font-family:var(--mono);font-size:.85rem;font-weight:500}

/* ── Badges ───────────────────────────────────────────────────── */
.badge{display:inline-flex;align-items:center;padding:.2rem .55rem;border-radius:5px;
       font-size:.73rem;font-weight:600;letter-spacing:.02em;line-height:1.4;white-space:nowrap}
.badge-error{background:#fee;color:#c62828}
.badge-warn{background:#fff8e1;color:#8b6914}
.badge-info{background:#e8f4fd;color:#0c5a82}
.badge-ok{background:#e6f9ed;color:#15713a}
.badge-type{background:#f0ecf9;color:#5b2d9e;font-family:var(--mono);font-size:.72rem}

/* ── Validation bar ──────────────────────────────────────────── */
.validation-bar{padding:1rem 1.25rem;border-radius:var(--radius);margin-bottom:1.25rem;font-weight:600;font-size:.95rem}
.validation-bar.pass{background:linear-gradient(135deg,#e6f9ed,#d4f5e0);color:#15713a;border:1px solid #b8e8c8}
.validation-bar.fail{background:linear-gradient(135deg,#fee,#fdd);color:#c62828;border:1px solid #f4c7c3}

/* ── Status progress bars ────────────────────────────────────── */
.status-bar-row{display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem;font-size:.85rem}
.status-bar-label{width:80px;text-align:right;font-weight:500;color:var(--text-secondary)}
.status-bar-track{flex:1;height:20px;background:#e5e5ea;border-radius:4px;overflow:hidden;position:relative}
.status-bar-fill{height:100%;border-radius:4px;transition:width .3s ease}
.status-bar-count{width:40px;font-variant-numeric:tabular-nums;color:var(--text-secondary)}

/* ── Cards ────────────────────────────────────────────────────── */
.card{background:var(--surface);border-radius:var(--radius);padding:1.5rem;
      margin-bottom:1.25rem;box-shadow:var(--shadow);border:1px solid var(--border);
      transition:box-shadow var(--transition)}

/* ── Stat grid ────────────────────────────────────────────────── */
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1rem;margin-bottom:1.75rem}
.stat-box{background:var(--surface);border-radius:var(--radius);padding:1.25rem 1rem;text-align:center;
          box-shadow:var(--shadow);border:1px solid var(--border);transition:box-shadow var(--transition),transform var(--transition);
          border-top:3px solid var(--border)}
.stat-box:hover{box-shadow:var(--shadow-md);transform:translateY(-1px)}
.stat-box .number{font-size:2rem;font-weight:800;letter-spacing:-.02em;
                  font-variant-numeric:tabular-nums;line-height:1.2}
.stat-box .label{font-size:.8rem;font-weight:500;color:var(--text-secondary);margin-top:.25rem;
                 text-transform:uppercase;letter-spacing:.04em}
.stat-blue{border-top-color:#3a86ff}.stat-blue .number{color:#3a86ff}
.stat-green{border-top-color:#15713a}.stat-green .number{color:#15713a}
.stat-orange{border-top-color:#e67e22}.stat-orange .number{color:#e67e22}
.stat-red{border-top-color:#c62828}.stat-red .number{color:#c62828}
.stat-amber{border-top-color:#b8860b}.stat-amber .number{color:#b8860b}
.stat-purple{border-top-color:#6f42c1}.stat-purple .number{color:#6f42c1}

/* ── Link pills ───────────────────────────────────────────────── */
.link-pill{display:inline-block;padding:.15rem .45rem;border-radius:4px;
           font-size:.76rem;font-family:var(--mono);background:#f0f0f3;
           color:var(--text-secondary);margin:.1rem;font-weight:500}

/* ── Forms ────────────────────────────────────────────────────── */
.form-row{display:flex;gap:1rem;align-items:end;flex-wrap:wrap;margin-bottom:1rem}
.form-row label{font-size:.8rem;font-weight:600;color:var(--text-secondary);
                text-transform:uppercase;letter-spacing:.04em}
.form-row select,.form-row input[type="text"],.form-row input[type="search"],
.form-row input:not([type]),.form-row input[list]{
  padding:.5rem .75rem;border:1px solid var(--border);border-radius:var(--radius-sm);
  font-size:.875rem;font-family:var(--font);background:var(--surface);color:var(--text);
  transition:border-color var(--transition),box-shadow var(--transition);appearance:none;
  -webkit-appearance:none}
.form-row select{padding-right:2rem;background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236e6e73' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right .75rem center}
.form-row input:focus,.form-row select:focus{
  outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(58,134,255,.15)}
.form-row input[type="range"]{padding:0;border:none;accent-color:var(--accent);width:100%}
.form-row input[type="range"]:focus{box-shadow:none}
.form-row button{padding:.5rem 1.25rem;background:var(--accent);color:#fff;border:none;
                 border-radius:var(--radius-sm);font-size:.875rem;font-weight:600;
                 font-family:var(--font);cursor:pointer;transition:all var(--transition);
                 box-shadow:0 1px 2px rgba(0,0,0,.08)}
.form-row button:hover{background:var(--accent-hover);box-shadow:0 2px 6px rgba(58,134,255,.25);transform:translateY(-1px)}
.form-row button:active{transform:translateY(0)}
.form-row button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* ── Definition lists ─────────────────────────────────────────── */
dl{margin:.75rem 0}
dt{font-weight:600;font-size:.8rem;color:var(--text-secondary);margin-top:.75rem;
   text-transform:uppercase;letter-spacing:.04em}
dd{margin-left:0;margin-bottom:.25rem;margin-top:.2rem}

/* ── Meta text ────────────────────────────────────────────────── */
.meta{color:var(--text-secondary);font-size:.85rem}

/* ── Nav icons & badges ───────────────────────────────────────── */
.nav-icon{display:inline-flex;width:1.25rem;height:1.25rem;align-items:center;justify-content:center;flex-shrink:0;opacity:.5}
nav a:hover .nav-icon,nav a.active .nav-icon{opacity:.9}
.nav-label{display:flex;align-items:center;gap:.5rem;flex:1;min-width:0}
.nav-badge{font-size:.65rem;font-weight:700;padding:.1rem .4rem;border-radius:4px;
           background:rgba(255,255,255,.08);color:rgba(255,255,255,.4);margin-left:auto;flex-shrink:0}
.nav-badge-error{background:rgba(220,53,69,.2);color:#ff6b7a}
nav .nav-divider{height:1px;background:rgba(255,255,255,.06);margin:.75rem .75rem}

/* ── Context bar ─────────────────────────────────────────────── */
.context-bar{display:flex;align-items:center;gap:.75rem;padding:.5rem 1.5rem;
  background:var(--surface);border-bottom:1px solid var(--border);font-size:.78rem;color:var(--text-secondary);
  flex-wrap:wrap}
.context-bar .ctx-project{font-weight:700;color:var(--text);font-size:.82rem}
.context-bar .ctx-sep{opacity:.25}
.context-bar .ctx-git{font-family:var(--mono);font-size:.72rem;padding:.15rem .4rem;border-radius:4px;
  background:rgba(58,134,255,.08);color:var(--accent)}
.context-bar .ctx-dirty{font-family:var(--mono);font-size:.68rem;padding:.15rem .4rem;border-radius:4px;
  background:rgba(220,53,69,.1);color:#c62828}
.context-bar .ctx-clean{font-family:var(--mono);font-size:.68rem;padding:.15rem .4rem;border-radius:4px;
  background:rgba(21,113,58,.1);color:#15713a}
.context-bar .ctx-time{margin-left:auto;opacity:.6}
.ctx-switcher{position:relative;display:inline-flex;align-items:center}
.ctx-switcher-details{position:relative}
.ctx-switcher-details summary{cursor:pointer;list-style:none;display:inline-flex;align-items:center;
  padding:.15rem .35rem;border-radius:4px;opacity:.5;transition:opacity .15s}
.ctx-switcher-details summary:hover{opacity:1;background:rgba(255,255,255,.06)}
.ctx-switcher-details summary::-webkit-details-marker{display:none}
.ctx-switcher-dropdown{position:absolute;top:100%;left:0;z-index:100;margin-top:.35rem;
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);
  padding:.5rem;min-width:280px;box-shadow:0 8px 24px rgba(0,0,0,.35)}
.ctx-switcher-item{padding:.5rem .65rem;border-radius:4px}
.ctx-switcher-item:hover{background:rgba(255,255,255,.04)}
.ctx-switcher-item .ctx-switcher-name{display:block;font-weight:600;font-size:.8rem;color:var(--text);margin-bottom:.2rem}
.ctx-switcher-item .ctx-switcher-cmd{display:block;font-size:.7rem;color:var(--text-secondary);
  padding:.2rem .4rem;background:rgba(255,255,255,.04);border-radius:3px;
  font-family:var(--mono);user-select:all;cursor:text}

/* ── Footer ──────────────────────────────────────────────────── */
.footer{padding:2rem 0 1rem;text-align:center;font-size:.75rem;color:var(--text-secondary);
        border-top:1px solid var(--border);margin-top:3rem}

/* ── Verification ────────────────────────────────────────────── */
.ver-level{margin-bottom:1.5rem}
.ver-level-header{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
.ver-level-title{font-size:1rem;font-weight:600;color:var(--text)}
.ver-level-arrow{color:var(--text-secondary);font-size:.85rem}
details.ver-row>summary{cursor:pointer;list-style:none;padding:.6rem .875rem;border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:.75rem;transition:background var(--transition)}
details.ver-row>summary::-webkit-details-marker{display:none}
details.ver-row>summary:hover{background:rgba(58,134,255,.04)}
details.ver-row[open]>summary{background:rgba(58,134,255,.04);border-bottom-color:var(--accent)}
details.ver-row>.ver-detail{padding:1rem 1.5rem;background:rgba(0,0,0,.01);border-bottom:1px solid var(--border)}
.ver-chevron{transition:transform var(--transition);display:inline-flex;opacity:.4}
details.ver-row[open] .ver-chevron{transform:rotate(90deg)}
.ver-steps{width:100%;border-collapse:collapse;font-size:.85rem;margin-top:.5rem}
.ver-steps th{text-align:left;font-weight:600;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.04em;color:var(--text-secondary);padding:.4rem .5rem;border-bottom:1px solid var(--border)}
.ver-steps td{padding:.4rem .5rem;border-bottom:1px solid rgba(0,0,0,.04);vertical-align:top}
.method-badge{display:inline-flex;padding:.15rem .5rem;border-radius:4px;font-size:.72rem;font-weight:600;
  background:#e8f4fd;color:#0c5a82}

/* ── Results ─────────────────────────────────────────────────── */
.result-pass{color:#15713a}.result-fail{color:#c62828}.result-skip{color:#6e6e73}
.result-error{color:#e67e22}.result-blocked{color:#8b6914}
.result-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:.35rem}
.result-dot-pass{background:#15713a}.result-dot-fail{background:#c62828}
.result-dot-skip{background:#c5c5cd}.result-dot-error{background:#e67e22}.result-dot-blocked{background:#b8860b}

/* ── Diff ────────────────────────────────────────────────────── */
.diff-added{background:rgba(21,113,58,.08)}
.diff-removed{background:rgba(198,40,40,.08)}
.diff-modified{background:rgba(184,134,11,.08)}
.diff-icon{display:inline-flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem;
  border-radius:4px;font-size:.85rem;font-weight:700;flex-shrink:0;margin-right:.35rem}
.diff-icon-add{background:rgba(21,113,58,.12);color:#15713a}
.diff-icon-remove{background:rgba(198,40,40,.12);color:#c62828}
.diff-icon-modify{background:rgba(184,134,11,.12);color:#b8860b}
.diff-summary{display:flex;gap:1.25rem;padding:.75rem 1rem;border-radius:var(--radius-sm);
  background:var(--surface);border:1px solid var(--border);margin-bottom:1.25rem;font-size:.9rem;font-weight:600}
.diff-summary-item{display:flex;align-items:center;gap:.35rem}
.diff-old{color:#c62828;text-decoration:line-through;font-size:.85rem}
.diff-new{color:#15713a;font-size:.85rem}
.diff-arrow{color:var(--text-secondary);margin:0 .25rem;font-size:.8rem}
details.diff-row>summary{cursor:pointer;list-style:none;padding:.6rem .875rem;border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:.5rem;transition:background var(--transition)}
details.diff-row>summary::-webkit-details-marker{display:none}
details.diff-row>summary:hover{background:rgba(58,134,255,.04)}
details.diff-row[open]>summary{background:rgba(184,134,11,.06);border-bottom-color:var(--border)}
details.diff-row>.diff-detail{padding:.75rem 1.25rem;background:rgba(0,0,0,.01);border-bottom:1px solid var(--border);font-size:.88rem}
.diff-field{padding:.3rem 0;display:flex;align-items:baseline;gap:.5rem}
.diff-field-name{font-weight:600;font-size:.8rem;color:var(--text-secondary);min-width:100px;
  text-transform:uppercase;letter-spacing:.03em}

/* ── Detail actions ──────────────────────────────────────────── */
.detail-actions{display:flex;gap:.75rem;align-items:center;margin-top:1rem}
.btn{display:inline-flex;align-items:center;gap:.4rem;padding:.45rem 1rem;border-radius:var(--radius-sm);
     font-size:.85rem;font-weight:600;font-family:var(--font);text-decoration:none;
     transition:all var(--transition);cursor:pointer;border:none}
.btn-primary{background:var(--accent);color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.btn-primary:hover{background:var(--accent-hover);transform:translateY(-1px);color:#fff;text-decoration:none}
.btn-secondary{background:transparent;color:var(--text-secondary);border:1px solid var(--border)}
.btn-secondary:hover{background:rgba(0,0,0,.03);color:var(--text);text-decoration:none}

/* ── SVG Viewer (fullscreen / popout / resize) ───────────────── */
.svg-viewer{position:relative;border:1px solid var(--border);border-radius:6px;overflow:hidden;
     resize:both;min-height:300px}
.svg-viewer-toolbar{position:absolute;top:8px;right:8px;z-index:20;display:flex;gap:4px}
.svg-viewer-toolbar button{background:rgba(0,0,0,0.6);color:#fff;border:1px solid rgba(255,255,255,0.2);
     border-radius:4px;padding:4px 8px;cursor:pointer;font-size:16px;line-height:1;
     transition:background var(--transition)}
.svg-viewer-toolbar button:hover{background:rgba(0,0,0,0.8)}
.svg-viewer.fullscreen{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;
     border-radius:0;background:var(--bg);resize:none}
.svg-viewer.fullscreen .svg-viewer-toolbar{top:16px;right:16px}
.svg-viewer .graph-container{border:none;border-radius:0}
.svg-viewer.fullscreen .graph-container{height:100vh;min-height:100vh}

/* ── Graph ────────────────────────────────────────────────────── */
.graph-container{border-radius:var(--radius);overflow:hidden;background:#fafbfc;cursor:grab;
     height:calc(100vh - 280px);min-height:400px;position:relative;border:1px solid var(--border)}
.graph-container:active{cursor:grabbing}
.graph-container svg{display:block;width:100%;height:100%;position:absolute;top:0;left:0}
.graph-controls{position:absolute;top:.75rem;right:.75rem;display:flex;flex-direction:column;gap:.35rem;z-index:10}
.graph-controls button{width:34px;height:34px;border:1px solid var(--border);border-radius:var(--radius-sm);
     background:var(--surface);font-size:1rem;cursor:pointer;display:flex;align-items:center;
     justify-content:center;box-shadow:var(--shadow);color:var(--text);
     transition:all var(--transition)}
.graph-controls button:hover{background:#f0f0f3;box-shadow:var(--shadow-md)}
.graph-controls button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.graph-legend{display:flex;flex-wrap:wrap;gap:.75rem;padding:.75rem 0 .25rem;font-size:.82rem}
.graph-legend-item{display:flex;align-items:center;gap:.35rem;color:var(--text-secondary)}
.graph-legend-swatch{width:12px;height:12px;border-radius:3px;flex-shrink:0}

/* ── Filter grid ──────────────────────────────────────────────── */
.filter-grid{display:flex;flex-wrap:wrap;gap:.6rem;margin-bottom:.75rem}
.filter-grid label{font-size:.8rem;display:flex;align-items:center;gap:.3rem;
                   color:var(--text-secondary);cursor:pointer;padding:.2rem .45rem;
                   border-radius:4px;transition:background var(--transition);
                   text-transform:none;letter-spacing:0;font-weight:500}
.filter-grid label:hover{background:rgba(58,134,255,.06)}
.filter-grid input[type="checkbox"]{margin:0;accent-color:var(--accent);width:14px;height:14px;
                                    cursor:pointer;border-radius:3px}

/* ── Document styles ──────────────────────────────────────────── */
.doc-body{line-height:1.8;font-size:.95rem}
.doc-body h1{font-size:1.4rem;font-weight:700;margin:2rem 0 .75rem;color:var(--text);
             border-bottom:2px solid var(--border);padding-bottom:.5rem}
.doc-body h2{font-size:1.2rem;font-weight:600;margin:1.5rem 0 .5rem;color:var(--text)}
.doc-body h3{font-size:1.05rem;font-weight:600;margin:1.25rem 0 .4rem;color:var(--text-secondary)}
.doc-body p{margin:.5rem 0}
.doc-body ul{margin:.5rem 0 .5rem 1.5rem}
.doc-body li{margin:.2rem 0}
.doc-body img{border-radius:6px;margin:.75rem 0;box-shadow:0 2px 8px rgba(0,0,0,.1)}
.doc-body pre.mermaid{background:transparent;border:1px solid var(--border);border-radius:6px;padding:1rem;text-align:center}
.artifact-ref{display:inline-flex;align-items:center;padding:.15rem .5rem;border-radius:5px;
     font-size:.8rem;font-weight:600;font-family:var(--mono);background:#edf2ff;
     color:#3a63c7;cursor:pointer;text-decoration:none;
     border:1px solid #d4def5;transition:all var(--transition)}
.artifact-ref:hover{background:#d4def5;text-decoration:none;transform:translateY(-1px);box-shadow:0 2px 4px rgba(0,0,0,.06)}
.artifact-ref.broken{background:#fde8e8;color:#c62828;border-color:#f4c7c3;cursor:default}
.artifact-ref.broken:hover{transform:none;box-shadow:none}
.doc-ref{display:inline-flex;align-items:center;padding:.15rem .5rem;border-radius:5px;
     font-size:.8rem;font-weight:600;font-family:var(--mono);background:#f0fdf4;
     color:#166534;cursor:pointer;text-decoration:none;
     border:1px solid #bbf7d0;transition:all var(--transition)}
.doc-ref:hover{background:#dcfce7;text-decoration:none;transform:translateY(-1px);box-shadow:0 2px 4px rgba(0,0,0,.06)}
/* ── Artifact hover preview ────────────────────────────────── */
.art-tooltip{position:absolute;z-index:1000;pointer-events:none;
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  box-shadow:var(--shadow-lg);padding:0;max-width:340px;min-width:220px;
  opacity:0;transition:opacity 120ms ease-in}
.art-tooltip.visible{opacity:1;pointer-events:auto}
.art-preview{padding:.75rem .85rem;font-size:.82rem;line-height:1.45}
.art-preview-header{display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem}
.art-preview-title{font-weight:600;font-size:.85rem;margin-bottom:.3rem;color:var(--text)}
.art-preview-desc{color:var(--text-secondary);font-size:.78rem;line-height:1.4;margin-top:.3rem;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.art-preview-links{font-size:.72rem;color:var(--text-secondary);margin-top:.35rem;font-family:var(--mono)}
.art-preview-tags{margin-top:.35rem;display:flex;flex-wrap:wrap;gap:.25rem}
.art-preview-tag{font-size:.65rem;padding:.1rem .35rem;border-radius:3px;
  background:rgba(58,134,255,.08);color:var(--accent);font-family:var(--mono)}
.doc-glossary{font-size:.9rem}
.doc-glossary dt{font-weight:600;color:var(--text)}
.doc-glossary dd{margin:0 0 .5rem 1rem;color:var(--text-secondary)}
.doc-toc{font-size:.88rem;background:var(--surface);border:1px solid var(--border);
         border-radius:var(--radius);padding:1rem 1.25rem;margin-bottom:1.25rem;
         box-shadow:var(--shadow)}
.doc-toc strong{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary)}
.doc-toc ul{list-style:none;margin:.5rem 0 0;padding:0}
.doc-toc li{margin:.2rem 0;color:var(--text-secondary)}
.doc-toc .toc-h2{padding-left:0}
.doc-toc .toc-h3{padding-left:1.25rem}
.doc-toc .toc-h4{padding-left:2.5rem}
.doc-meta{display:flex;gap:.75rem;flex-wrap:wrap;align-items:center;margin-bottom:1.25rem}

/* ── Source viewer ────────────────────────────────────────────── */
.source-tree{font-family:var(--mono);font-size:.85rem;line-height:1.8}
.source-tree ul{list-style:none;margin:0;padding:0}
.source-tree li{margin:0}
.source-tree .tree-item{display:flex;align-items:center;gap:.4rem;padding:.2rem .5rem;border-radius:var(--radius-sm);
  transition:background var(--transition);color:var(--text)}
.source-tree .tree-item:hover{background:rgba(58,134,255,.06);text-decoration:none}
.source-tree .tree-icon{display:inline-flex;width:1rem;height:1rem;align-items:center;justify-content:center;flex-shrink:0;opacity:.55}
.source-tree .indent{display:inline-block;width:1.25rem;flex-shrink:0}
.source-viewer{font-family:var(--mono);font-size:.82rem;line-height:1.7;overflow-x:auto;
  background:#fafbfc;border:1px solid var(--border);border-radius:var(--radius);padding:0}
.source-viewer table{width:100%;border-collapse:collapse;margin:0}
.source-viewer table td{padding:0;border:none;vertical-align:top}
.source-viewer table tr:hover{background:rgba(58,134,255,.04)}
.source-line{display:table-row}
.source-line .line-no{display:table-cell;width:3.5rem;min-width:3.5rem;padding:.05rem .75rem .05rem .5rem;
  text-align:right;color:#b0b0b8;user-select:none;border-right:1px solid var(--border);background:#f5f5f7}
.source-line .line-content{display:table-cell;padding:.05rem .75rem;white-space:pre;tab-size:4}
.source-line-highlight{background:rgba(58,134,255,.08) !important}
.source-line-highlight .line-no{background:rgba(58,134,255,.12);color:var(--accent);font-weight:600}
.source-line:target{background:rgba(255,210,50,.18) !important}
.source-line:target .line-no{background:rgba(255,210,50,.25);color:#9a6700;font-weight:700}
.source-line .line-no a{color:inherit;text-decoration:none}
.source-line .line-no a:hover{color:var(--accent);text-decoration:underline}
/* ── Syntax highlighting tokens ─────────────────────────────── */
.hl-key{color:#0550ae}.hl-str{color:#0a3069}.hl-num{color:#0550ae}
.hl-bool{color:#cf222e;font-weight:600}.hl-null{color:#cf222e;font-style:italic}
.hl-comment{color:#6e7781;font-style:italic}.hl-tag{color:#6639ba}
.hl-anchor{color:#953800}.hl-type{color:#8250df}.hl-kw{color:#cf222e;font-weight:600}
.hl-fn{color:#8250df}.hl-macro{color:#0550ae;font-weight:600}
.hl-attr{color:#116329}.hl-punct{color:#6e7781}
.hl-sh-cmd{color:#0550ae;font-weight:600}.hl-sh-flag{color:#953800}
.hl-sh-pipe{color:#cf222e;font-weight:700}
.source-ref-link{color:var(--accent);text-decoration:none;font-family:var(--mono);font-size:.85em}
.source-ref-link:hover{text-decoration:underline}
.source-breadcrumb{display:flex;align-items:center;gap:.4rem;font-size:.85rem;color:var(--text-secondary);
  margin-bottom:1rem;flex-wrap:wrap}
.source-breadcrumb a{color:var(--accent);font-weight:500}
.source-breadcrumb .sep{opacity:.35;margin:0 .1rem}
.source-meta{display:flex;gap:1.5rem;font-size:.8rem;color:var(--text-secondary);margin-bottom:1rem}
.source-meta .meta-item{display:flex;align-items:center;gap:.35rem}
.source-refs{margin-top:1.25rem}
.source-refs h3{font-size:.95rem;margin-bottom:.5rem}

/* ── STPA tree ───────────────────────────────────────────────── */
.stpa-tree{margin-top:1.25rem}
.stpa-level{padding-left:1.5rem;border-left:2px solid var(--border);margin-left:.5rem}
.stpa-node{display:flex;align-items:center;gap:.5rem;padding:.35rem 0;font-size:.9rem}
.stpa-node a{font-family:var(--mono);font-size:.82rem;font-weight:500}
.stpa-link-label{display:inline-block;padding:.1rem .4rem;border-radius:4px;font-size:.68rem;
  font-family:var(--mono);background:rgba(58,134,255,.08);color:var(--accent);font-weight:500;
  margin-right:.35rem;white-space:nowrap}
details.stpa-details>summary{cursor:pointer;list-style:none;padding:.4rem .5rem;border-radius:var(--radius-sm);
  display:flex;align-items:center;gap:.5rem;transition:background var(--transition);font-size:.9rem}
details.stpa-details>summary::-webkit-details-marker{display:none}
details.stpa-details>summary:hover{background:rgba(58,134,255,.04)}
details.stpa-details>summary .stpa-chevron{transition:transform var(--transition);display:inline-flex;opacity:.4;font-size:.7rem}
details.stpa-details[open]>summary .stpa-chevron{transform:rotate(90deg)}
.stpa-uca-table{width:100%;border-collapse:collapse;font-size:.88rem;margin-top:.75rem}
.stpa-uca-table th{font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;
  color:var(--text-secondary);padding:.5rem .75rem;border-bottom:2px solid var(--border)}
.stpa-uca-table td{padding:.55rem .75rem;border-bottom:1px solid var(--border);vertical-align:top}
.stpa-uca-table tbody tr:hover{background:rgba(58,134,255,.04)}
.uca-type-badge{display:inline-flex;padding:.15rem .5rem;border-radius:4px;font-size:.72rem;font-weight:600;white-space:nowrap}
.uca-type-not-providing{background:#fee;color:#c62828}
.uca-type-providing{background:#fff3e0;color:#e65100}
.uca-type-too-early-too-late{background:#e8f4fd;color:#0c5a82}
.uca-type-stopped-too-soon{background:#f3e5f5;color:#6a1b9a}

/* ── Traceability explorer ──────────────────────────────────────── */
.trace-matrix{border-collapse:collapse;font-size:.8rem;margin-bottom:1.5rem;width:100%}
.trace-matrix th{font-weight:600;font-size:.7rem;text-transform:uppercase;letter-spacing:.04em;
  color:var(--text-secondary);padding:.45rem .6rem;border-bottom:2px solid var(--border);white-space:nowrap}
.trace-matrix td{padding:.35rem .6rem;border-bottom:1px solid var(--border);text-align:center}
.trace-matrix td:first-child{text-align:left;font-family:var(--mono);font-size:.78rem;font-weight:500}
.trace-matrix tbody tr:hover{background:rgba(58,134,255,.04)}
.trace-cell{display:inline-flex;align-items:center;justify-content:center;width:28px;height:22px;
  border-radius:4px;font-size:.75rem;font-weight:700;font-variant-numeric:tabular-nums}
.trace-cell-ok{background:rgba(21,113,58,.1);color:#15713a}
.trace-cell-gap{background:rgba(198,40,40,.1);color:#c62828}
.trace-tree{margin-top:1rem}
.trace-node{display:flex;align-items:center;gap:.5rem;padding:.4rem .6rem;border-radius:var(--radius-sm);
  transition:background var(--transition);font-size:.88rem}
.trace-node:hover{background:rgba(58,134,255,.04)}
.trace-node a{font-family:var(--mono);font-size:.82rem;font-weight:500}
.trace-edge{display:inline-block;padding:.1rem .4rem;border-radius:4px;font-size:.68rem;
  font-family:var(--mono);background:rgba(58,134,255,.08);color:var(--accent);font-weight:500;
  margin-right:.35rem;white-space:nowrap}
.trace-level{padding-left:1.5rem;border-left:2px solid var(--border);margin-left:.5rem}
details.trace-details>summary{cursor:pointer;list-style:none;padding:.4rem .5rem;border-radius:var(--radius-sm);
  display:flex;align-items:center;gap:.5rem;transition:background var(--transition);font-size:.88rem}
details.trace-details>summary::-webkit-details-marker{display:none}
details.trace-details>summary:hover{background:rgba(58,134,255,.04)}
details.trace-details>summary .trace-chevron{transition:transform var(--transition);display:inline-flex;opacity:.4;font-size:.7rem}
details.trace-details[open]>summary .trace-chevron{transform:rotate(90deg)}
.trace-history{margin:.35rem 0 .5rem 1.5rem;padding:.5rem .75rem;background:rgba(0,0,0,.015);
  border-radius:var(--radius-sm);border:1px solid var(--border);font-size:.8rem}
.trace-history-title{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;
  color:var(--text-secondary);margin-bottom:.35rem}
.trace-history-item{display:flex;align-items:baseline;gap:.5rem;padding:.15rem 0;color:var(--text-secondary)}
.trace-history-item code{font-size:.75rem;color:var(--accent);font-weight:500}
.trace-history-item .hist-date{font-size:.72rem;color:var(--text-secondary);opacity:.7;min-width:70px}
.trace-history-item .hist-msg{font-size:.78rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.trace-status{display:inline-flex;padding:.12rem .4rem;border-radius:4px;font-size:.68rem;font-weight:600;
  margin-left:.25rem}
.trace-status-approved{background:rgba(21,113,58,.1);color:#15713a}
.trace-status-draft{background:rgba(184,134,11,.1);color:#b8860b}

/* ── Artifact embedding in docs ────────────────────────────────── */
.artifact-embed{margin:.75rem 0;padding:.75rem 1rem;background:var(--card-bg);border:1px solid var(--border);
  border-radius:var(--radius);border-left:3px solid var(--accent)}
.artifact-embed-header{display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem}
.artifact-embed-header .artifact-ref{font-family:var(--mono);font-size:.85rem;font-weight:600}
.artifact-embed-title{font-weight:600;font-size:.92rem;color:var(--text)}
.artifact-embed-desc{font-size:.82rem;color:var(--text-secondary);margin-top:.25rem;line-height:1.5}

/* ── Rendered markdown in descriptions ─────────────────────────── */
.artifact-desc p{margin:.3em 0}
.artifact-desc ul,.artifact-desc ol{margin:.3em 0;padding-left:1.5em}
.artifact-desc code{background:rgba(255,255,255,.1);padding:.1em .3em;border-radius:3px;font-size:.9em}
.artifact-desc pre{background:rgba(0,0,0,.3);padding:.5em;border-radius:4px;overflow-x:auto}
.artifact-desc pre code{background:none;padding:0}
.artifact-desc table{border-collapse:collapse;margin:.5em 0}
.artifact-desc table td,.artifact-desc table th{border:1px solid var(--border);padding:.3em .6em}
.artifact-desc del{opacity:.6}
.artifact-desc blockquote{border-left:3px solid var(--border);margin:.5em 0;padding-left:.8em;opacity:.85}
.artifact-embed-desc p{margin:.2em 0}
.artifact-embed-desc code{background:rgba(255,255,255,.1);padding:.1em .2em;border-radius:2px;font-size:.9em}

/* ── Diagram in artifact detail ────────────────────────────────── */
.artifact-diagram{margin:1rem 0}
.artifact-diagram .mermaid{background:var(--card-bg);padding:1rem;border-radius:var(--radius);
  border:1px solid var(--border)}

/* ── AADL SVG style overrides (match etch) ────────────────────── */
.aadl-viewport svg text{font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif !important;
  font-size:12px !important}
.aadl-viewport svg rect,.aadl-viewport svg polygon{rx:6;ry:6}
.aadl-viewport svg .node rect{stroke-width:1.5px;filter:drop-shadow(0 1px 3px rgba(0,0,0,.1))}
.aadl-viewport svg .edge path,.aadl-viewport svg .edge line{stroke:#888 !important;stroke-width:1.2px}
.aadl-viewport svg .edge polygon{fill:#888 !important;stroke:#888 !important}

/* ── Scrollbar (subtle) ───────────────────────────────────────── */
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#c5c5cd;border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:#a0a0aa}

/* ── Selection ────────────────────────────────────────────────── */
::selection{background:rgba(58,134,255,.18)}

/* ── Cmd+K search modal ──────────────────────────────────────── */
.cmd-k-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);
  z-index:10000;display:none;align-items:flex-start;justify-content:center;padding-top:min(20vh,160px)}
.cmd-k-overlay.open{display:flex}
.cmd-k-modal{background:var(--sidebar);border-radius:12px;width:100%;max-width:600px;
  box-shadow:0 16px 70px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08);
  overflow:hidden;display:flex;flex-direction:column;max-height:min(70vh,520px)}
.cmd-k-input{width:100%;padding:.875rem 1rem .875rem 2.75rem;font-size:1rem;font-family:var(--font);
  background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,.08);
  color:#fff;outline:none;caret-color:var(--accent)}
.cmd-k-input::placeholder{color:rgba(255,255,255,.35)}
.cmd-k-icon{position:absolute;left:1rem;top:.95rem;color:rgba(255,255,255,.35);pointer-events:none;
  font-size:.95rem}
.cmd-k-head{position:relative}
.cmd-k-results{overflow-y:auto;padding:.5rem 0;flex:1}
.cmd-k-empty{padding:1.5rem 1rem;text-align:center;color:rgba(255,255,255,.35);font-size:.9rem}
.cmd-k-group{padding:0 .5rem}
.cmd-k-group-label{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;
  color:rgba(255,255,255,.3);padding:.5rem .625rem .25rem}
.cmd-k-item{display:flex;align-items:center;gap:.75rem;padding:.5rem .625rem;border-radius:var(--radius-sm);
  cursor:pointer;color:var(--sidebar-text);font-size:.88rem;transition:background 80ms ease}
.cmd-k-item:hover,.cmd-k-item.active{background:rgba(255,255,255,.08);color:#fff}
.cmd-k-item-icon{width:1.5rem;height:1.5rem;border-radius:4px;display:flex;align-items:center;
  justify-content:center;font-size:.7rem;flex-shrink:0;background:rgba(255,255,255,.06);color:rgba(255,255,255,.5)}
.cmd-k-item-body{flex:1;min-width:0}
.cmd-k-item-title{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cmd-k-item-title mark{background:transparent;color:var(--accent);font-weight:700}
.cmd-k-item-meta{font-size:.75rem;color:rgba(255,255,255,.35);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cmd-k-item-meta mark{background:transparent;color:var(--accent);font-weight:600}
.cmd-k-item-field{font-size:.65rem;padding:.1rem .35rem;border-radius:3px;
  background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);white-space:nowrap;flex-shrink:0}
.cmd-k-kbd{display:inline-flex;align-items:center;gap:.2rem;font-size:.7rem;font-family:var(--mono);
  padding:.15rem .4rem;border-radius:4px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.4);
  border:1px solid rgba(255,255,255,.06)}
.nav-search-hint{display:flex;align-items:center;justify-content:space-between;padding:.5rem .75rem;
  margin-top:auto;border-top:1px solid rgba(255,255,255,.06);padding-top:1rem;
  color:var(--sidebar-text);font-size:.82rem;cursor:pointer;border-radius:var(--radius-sm);
  transition:all var(--transition)}
.nav-search-hint:hover{background:var(--sidebar-hover);color:var(--sidebar-active)}
.aadl-diagram{background:var(--card-bg);border:1px solid var(--border);border-radius:8px;
  margin:1.5rem 0;overflow:hidden;position:relative}
.aadl-diagram .aadl-caption{display:flex;align-items:center;justify-content:space-between;
  padding:.5rem 1rem;border-bottom:1px solid var(--border);background:var(--nav-bg);
  font-size:.82rem;color:var(--text-secondary)}
.aadl-caption .aadl-title{font-weight:600;color:var(--text);font-family:var(--mono);font-size:.85rem}
.aadl-caption .aadl-badge{display:inline-block;padding:.1rem .5rem;border-radius:var(--radius-sm);
  background:var(--primary);color:#fff;font-size:.72rem;font-weight:600;letter-spacing:.02em}
.aadl-controls{display:flex;gap:.25rem}
.aadl-controls button{background:var(--card-bg);border:1px solid var(--border);border-radius:var(--radius-sm);
  width:1.7rem;height:1.7rem;cursor:pointer;font-size:.85rem;line-height:1;display:flex;
  align-items:center;justify-content:center;color:var(--text-secondary);transition:all .15s}
.aadl-controls button:hover{background:var(--primary);color:#fff;border-color:var(--primary)}
.aadl-viewport{overflow:hidden;cursor:grab;min-height:300px;position:relative;background:var(--body-bg)}
.aadl-viewport.grabbing{cursor:grabbing}
.aadl-viewport svg{transform-origin:0 0;position:absolute;top:0;left:0}
.aadl-viewport svg .node rect,.aadl-viewport svg .node polygon,.aadl-viewport svg .node path,.aadl-viewport svg .node ellipse{filter:drop-shadow(0 1px 2px rgba(0,0,0,.08))}
.aadl-viewport svg .node text{font-family:system-ui,-apple-system,sans-serif}
.aadl-viewport svg .edge path{stroke-dasharray:none}
.aadl-loading{color:var(--text-secondary);font-style:italic;padding:2rem;text-align:center}
.aadl-error{color:var(--danger);font-style:italic;padding:1rem}
.aadl-analysis{border-top:1px solid var(--border);max-height:220px;overflow-y:auto;font-size:.78rem}
.aadl-analysis-header{display:flex;align-items:center;gap:.5rem;padding:.4rem 1rem;
  background:var(--nav-bg);font-weight:600;font-size:.75rem;color:var(--text-secondary);
  position:sticky;top:0;z-index:1;border-bottom:1px solid var(--border)}
.aadl-analysis-header .badge-count{display:inline-flex;align-items:center;justify-content:center;
  min-width:1.3rem;height:1.3rem;border-radius:99px;font-size:.65rem;font-weight:700;padding:0 .3rem}
.badge-error{background:var(--danger);color:#fff}
.badge-warning{background:#e8a735;color:#fff}
.badge-info{background:var(--primary);color:#fff}
.aadl-diag{display:flex;align-items:baseline;gap:.5rem;padding:.3rem 1rem;border-bottom:1px solid var(--border)}
.aadl-diag:last-child{border-bottom:none}
.aadl-diag:hover{background:rgba(0,0,0,.03)}
.aadl-diag .sev{flex-shrink:0;font-size:.65rem;font-weight:700;text-transform:uppercase;
  padding:.1rem .35rem;border-radius:var(--radius-sm);letter-spacing:.03em}
.sev-error{background:#fde8e8;color:var(--danger)}
.sev-warning{background:#fef3cd;color:#856404}
.sev-info{background:#d1ecf1;color:#0c5460}
.aadl-diag .diag-path{color:var(--text-secondary);font-family:var(--mono);font-size:.72rem;flex-shrink:0}
.aadl-diag .diag-msg{color:var(--text);flex:1}
.aadl-diag .diag-analysis{color:var(--text-secondary);font-size:.68rem;opacity:.7;flex-shrink:0}

/* ── Sortable table headers ──────────────────────────────── */
table.sortable th{cursor:pointer;user-select:none}
table.sortable th:hover{color:var(--text)}

/* ── Facet sidebar (artifact tag filtering) ──────────────── */
.artifacts-layout{display:flex;gap:1.5rem;align-items:flex-start}
.artifacts-main{flex:1;min-width:0}
.facet-sidebar{width:220px;flex-shrink:0;background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius);padding:1rem;position:sticky;top:1rem;max-height:calc(100vh - 4rem);overflow-y:auto}
.facet-sidebar h3{font-size:.8rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;
  color:var(--text-secondary);margin:0 0 .75rem;padding-bottom:.5rem;border-bottom:1px solid var(--border)}
.facet-list{display:flex;flex-direction:column;gap:.35rem}
.facet-item{display:flex;align-items:center;gap:.4rem;font-size:.82rem;color:var(--text);
  cursor:pointer;padding:.2rem .35rem;border-radius:4px;transition:background var(--transition)}
.facet-item:hover{background:rgba(58,134,255,.06)}
.facet-item input[type="checkbox"]{margin:0;accent-color:var(--accent);width:14px;height:14px;cursor:pointer}
.facet-item .facet-count{margin-left:auto;font-size:.72rem;color:var(--text-secondary);
  font-variant-numeric:tabular-nums;font-family:var(--mono)}

/* ── Group-by header rows ────────────────────────────────── */
.group-header-row td{background:rgba(58,134,255,.06);font-weight:600;font-size:.85rem;
  color:var(--text);padding:.5rem .875rem;border-bottom:2px solid var(--border);letter-spacing:.02em}

/* ── Document tree hierarchy ─────────────────────────────── */
.doc-tree{margin-bottom:1.5rem}
.doc-tree details{margin-bottom:.25rem}
.doc-tree summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:.5rem;
  padding:.5rem .75rem;border-radius:var(--radius-sm);font-weight:600;font-size:.9rem;
  color:var(--text);transition:background var(--transition)}
.doc-tree summary::-webkit-details-marker{display:none}
.doc-tree summary:hover{background:rgba(58,134,255,.04)}
.doc-tree summary .tree-chevron{transition:transform var(--transition);display:inline-flex;opacity:.4;font-size:.7rem}
.doc-tree details[open]>summary .tree-chevron{transform:rotate(90deg)}
.doc-tree summary .tree-count{font-size:.75rem;color:var(--text-secondary);font-weight:500;
  font-variant-numeric:tabular-nums;margin-left:.25rem}
.doc-tree ul{list-style:none;padding:0 0 0 1.5rem;margin:.25rem 0}
.doc-tree li{margin:.15rem 0}
.doc-tree li a{display:flex;align-items:center;gap:.5rem;padding:.35rem .75rem;border-radius:var(--radius-sm);
  font-size:.88rem;color:var(--text);transition:background var(--transition);text-decoration:none}
.doc-tree li a:hover{background:rgba(58,134,255,.04)}
.doc-tree .doc-tree-id{font-family:var(--mono);font-size:.8rem;font-weight:500;color:var(--accent)}
.doc-tree .doc-tree-status{font-size:.72rem}

/* ── Matrix cell drill-down ──────────────────────────────── */
.matrix-cell-clickable{cursor:pointer;transition:background var(--transition)}
.matrix-cell-clickable:hover{background:rgba(58,134,255,.08)}
.cell-detail{font-size:.82rem}
.cell-detail ul{list-style:none;padding:.5rem;margin:0}
.cell-detail li{padding:.25rem .5rem;border-bottom:1px solid var(--border)}
.cell-detail li:last-child{border-bottom:none}

/* ── Filter bar ────────────────────────────────────────── */
.filter-bar{margin-bottom:1rem;padding:1rem}
.filter-bar .form-row{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap}

/* ── Pagination ────────────────────────────────────────── */
.pagination{display:flex;gap:.25rem;align-items:center;justify-content:center;
  margin-top:1rem;padding:.75rem 0;flex-wrap:wrap}
.pagination a{display:inline-flex;align-items:center;justify-content:center;
  min-width:2rem;height:2rem;padding:0 .5rem;border:1px solid var(--border);
  border-radius:var(--radius-sm);font-size:.82rem;font-family:var(--font);
  color:var(--text);background:var(--surface);text-decoration:none;
  transition:all var(--transition);cursor:pointer}
.pagination a:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.pagination-current{display:inline-flex;align-items:center;justify-content:center;
  min-width:2rem;height:2rem;padding:0 .5rem;border:1px solid var(--accent);
  border-radius:var(--radius-sm);font-size:.82rem;font-weight:600;
  color:#fff;background:var(--accent)}
.pagination-disabled{display:inline-flex;align-items:center;justify-content:center;
  min-width:2rem;height:2rem;padding:0 .5rem;border:1px solid var(--border);
  border-radius:var(--radius-sm);font-size:.82rem;
  color:var(--text-secondary);background:var(--surface);opacity:.5}
.pagination-ellipsis{display:inline-flex;align-items:center;justify-content:center;
  min-width:1.5rem;height:2rem;font-size:.82rem;color:var(--text-secondary)}
"#;
