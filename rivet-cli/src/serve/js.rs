// Auto-extracted from serve.rs

// ── Pan/zoom JS ──────────────────────────────────────────────────────────

pub(crate) const GRAPH_JS: &str = r#"
<script>
(function(){
  // ── Loading bar ──────────────────────────────────────────
  var bar=document.getElementById('loading-bar');
  if(bar){
    document.body.addEventListener('htmx:beforeRequest',function(){
      bar.classList.remove('done');
      bar.style.width='0';
      void bar.offsetWidth;
      bar.classList.add('active');
    });
    document.body.addEventListener('htmx:afterRequest',function(){
      bar.classList.remove('active');
      bar.classList.add('done');
      bar.style.width='100%';
      setTimeout(function(){bar.classList.remove('done');bar.style.width='0'},400);
    });
  }

  // ── Nav active state ─────────────────────────────────────
  function setActiveNav(url){
    document.querySelectorAll('nav a[hx-get]').forEach(function(a){
      var href=a.getAttribute('hx-get');
      if(url===href || (href!=='/' && url.startsWith(href))){
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }
  document.body.addEventListener('htmx:afterRequest',function(e){
    var path=e.detail.pathInfo&&e.detail.pathInfo.requestPath;
    if(path) setActiveNav(path);
  });
  // Set initial active state
  document.addEventListener('DOMContentLoaded',function(){
    var p=window.location.pathname;
    if(p==='/'||p==='') p='/stats';
    setActiveNav(p);
  });

  // ── Browser back/forward ─────────────────────────────────
  window.addEventListener('popstate',function(){
    var p=window.location.pathname;
    if(p==='/'||p==='') p='/stats';
    setActiveNav(p);
    htmx.ajax('GET',p,'#content');
  });

  // ── Source line anchor scroll ────────────────────────────
  function scrollToLineAnchor(){
    var h=window.location.hash;
    if(h&&h.match(/^#L\d+$/)){
      var el=document.getElementById(h.substring(1));
      if(el){el.scrollIntoView({behavior:'smooth',block:'center'});}
    }
  }
  document.body.addEventListener('htmx:afterSwap',scrollToLineAnchor);
  document.addEventListener('DOMContentLoaded',scrollToLineAnchor);

  // ── Pan/zoom ─────────────────────────────────────────────
  document.addEventListener('htmx:afterSwap', initPanZoom);
  document.addEventListener('DOMContentLoaded', initPanZoom);

  function initPanZoom(){
    document.querySelectorAll('.graph-container').forEach(function(c){
      if(c._pz) return;
      c._pz=true;
      var svg=c.querySelector('svg');
      if(!svg) return;
      var vb=svg.viewBox.baseVal;
      var origVB={x:vb.x, y:vb.y, w:vb.width, h:vb.height};
      var drag=false, sx=0, sy=0, ox=0, oy=0;

      // Pan (mousedown only — move/up handled in node-drag block)
      c.addEventListener('mousedown',function(e){
        if(e.target.closest('.graph-controls')) return;
        if(e.target.closest('.node')) return; // let node drag handle it
        drag=true; sx=e.clientX; sy=e.clientY;
        ox=vb.x; oy=vb.y; e.preventDefault();
      });
      c.addEventListener('mouseleave',function(){ drag=false; });

      // Zoom with wheel
      c.addEventListener('wheel',function(e){
        e.preventDefault();
        var f=e.deltaY>0?1.12:1/1.12;
        var r=c.getBoundingClientRect();
        var mx=(e.clientX-r.left)/r.width;
        var my=(e.clientY-r.top)/r.height;
        var nx=vb.width*f, ny=vb.height*f;
        vb.x+=(vb.width-nx)*mx;
        vb.y+=(vb.height-ny)*my;
        vb.width=nx; vb.height=ny;
      },{passive:false});

      // Touch support
      var lastDist=0, lastMid=null;
      c.addEventListener('touchstart',function(e){
        if(e.touches.length===1){
          drag=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY;
          ox=vb.x; oy=vb.y;
        } else if(e.touches.length===2){
          drag=false;
          var dx=e.touches[1].clientX-e.touches[0].clientX;
          var dy=e.touches[1].clientY-e.touches[0].clientY;
          lastDist=Math.sqrt(dx*dx+dy*dy);
          lastMid={x:(e.touches[0].clientX+e.touches[1].clientX)/2,
                   y:(e.touches[0].clientY+e.touches[1].clientY)/2};
        }
      },{passive:true});
      c.addEventListener('touchmove',function(e){
        if(e.touches.length===1 && drag){
          e.preventDefault();
          var scale=vb.width/c.clientWidth;
          vb.x=ox-(e.touches[0].clientX-sx)*scale;
          vb.y=oy-(e.touches[0].clientY-sy)*scale;
        } else if(e.touches.length===2){
          e.preventDefault();
          var dx=e.touches[1].clientX-e.touches[0].clientX;
          var dy=e.touches[1].clientY-e.touches[0].clientY;
          var dist=Math.sqrt(dx*dx+dy*dy);
          var f=lastDist/dist;
          var r=c.getBoundingClientRect();
          var mid={x:(e.touches[0].clientX+e.touches[1].clientX)/2,
                   y:(e.touches[0].clientY+e.touches[1].clientY)/2};
          var mx=(mid.x-r.left)/r.width;
          var my=(mid.y-r.top)/r.height;
          var nx=vb.width*f, ny=vb.height*f;
          vb.x+=(vb.width-nx)*mx;
          vb.y+=(vb.height-ny)*my;
          vb.width=nx; vb.height=ny;
          lastDist=dist; lastMid=mid;
        }
      },{passive:false});
      c.addEventListener('touchend',function(){ drag=false; lastDist=0; });

      // Zoom buttons
      var controls=c.querySelector('.graph-controls');
      if(controls){
        controls.querySelector('.zoom-in').addEventListener('click',function(){
          var cx=vb.x+vb.width/2, cy=vb.y+vb.height/2;
          vb.width/=1.3; vb.height/=1.3;
          vb.x=cx-vb.width/2; vb.y=cy-vb.height/2;
        });
        controls.querySelector('.zoom-out').addEventListener('click',function(){
          var cx=vb.x+vb.width/2, cy=vb.y+vb.height/2;
          vb.width*=1.3; vb.height*=1.3;
          vb.x=cx-vb.width/2; vb.y=cy-vb.height/2;
        });
        controls.querySelector('.zoom-fit').addEventListener('click',function(){
          vb.x=origVB.x; vb.y=origVB.y; vb.width=origVB.w; vb.height=origVB.h;
        });
      }

      // ── Node dragging + click ──────────────────────────────
      var dragNode=null, dnSX=0, dnSY=0, dnOX=0, dnOY=0, dnMoved=false;
      var nodeOffsets={}; // id -> {dx,dy}

      function getNodeCenter(node){
        var r=node.querySelector('rect');
        if(!r) return {x:0,y:0};
        var x=parseFloat(r.getAttribute('x'))||0;
        var y=parseFloat(r.getAttribute('y'))||0;
        var w=parseFloat(r.getAttribute('width'))||0;
        var h=parseFloat(r.getAttribute('height'))||0;
        var id=node.getAttribute('data-id')||'';
        var off=nodeOffsets[id]||{dx:0,dy:0};
        return {x:x+w/2+off.dx, y:y+h/2+off.dy};
      }

      function updateEdges(){
        svg.querySelectorAll('.edge').forEach(function(edge){
          var src=edge.getAttribute('data-source');
          var tgt=edge.getAttribute('data-target');
          var srcOff=nodeOffsets[src]||{dx:0,dy:0};
          var tgtOff=nodeOffsets[tgt]||{dx:0,dy:0};
          var path=edge.querySelector('path');
          if(!path) return;
          var origD=path.getAttribute('data-orig-d');
          if(!origD){ origD=path.getAttribute('d'); path.setAttribute('data-orig-d',origD); }
          // Parse path points and offset them
          var newD=offsetPath(origD,srcOff,tgtOff);
          path.setAttribute('d',newD);
          // Move label
          var lbg=edge.querySelector('.label-bg');
          var ltxt=edge.querySelector('text');
          if(lbg){
            var ox=lbg.getAttribute('data-orig-x');
            if(!ox){ ox=lbg.getAttribute('x'); lbg.setAttribute('data-orig-x',ox);
                     var oy=lbg.getAttribute('y'); lbg.setAttribute('data-orig-y',oy); }
            var avgDx=(srcOff.dx+tgtOff.dx)/2;
            var avgDy=(srcOff.dy+tgtOff.dy)/2;
            lbg.setAttribute('x',parseFloat(lbg.getAttribute('data-orig-x'))+avgDx);
            lbg.setAttribute('y',parseFloat(lbg.getAttribute('data-orig-y'))+avgDy);
          }
          if(ltxt){
            var otx=ltxt.getAttribute('data-orig-x');
            if(!otx){ otx=ltxt.getAttribute('x'); ltxt.setAttribute('data-orig-x',otx);
                      var oty=ltxt.getAttribute('y'); ltxt.setAttribute('data-orig-y',oty); }
            var avgDx2=(srcOff.dx+tgtOff.dx)/2;
            var avgDy2=(srcOff.dy+tgtOff.dy)/2;
            ltxt.setAttribute('x',parseFloat(ltxt.getAttribute('data-orig-x'))+avgDx2);
            ltxt.setAttribute('y',parseFloat(ltxt.getAttribute('data-orig-y'))+avgDy2);
          }
        });
      }

      function offsetPath(d,srcOff,tgtOff){
        // SVG path: M x y, L x y, C x y x y x y, etc.
        // Split into commands and offset first point by srcOff, last by tgtOff, middle interpolated
        var tokens=d.match(/[MLCQZ]|[-]?[\d.]+/gi);
        if(!tokens) return d;
        var pts=[];
        var i=0;
        while(i<tokens.length){
          var t=tokens[i];
          if(t==='M'||t==='L'||t==='m'||t==='l'){
            i++; pts.push({cmd:t.toUpperCase(),x:parseFloat(tokens[i]),y:parseFloat(tokens[i+1])}); i+=2;
          } else if(t==='C'||t==='c'){
            i++;
            pts.push({cmd:'C1',x:parseFloat(tokens[i]),y:parseFloat(tokens[i+1])});
            pts.push({cmd:'C2',x:parseFloat(tokens[i+2]),y:parseFloat(tokens[i+3])});
            pts.push({cmd:'C3',x:parseFloat(tokens[i+4]),y:parseFloat(tokens[i+5])});
            i+=6;
          } else { i++; }
        }
        if(pts.length===0) return d;
        // First point gets srcOff, last gets tgtOff, middle gets interpolated
        var n=pts.length;
        for(var j=0;j<n;j++){
          var frac=n>1?j/(n-1):0;
          pts[j].x+= srcOff.dx*(1-frac)+tgtOff.dx*frac;
          pts[j].y+= srcOff.dy*(1-frac)+tgtOff.dy*frac;
        }
        // Rebuild
        var out='';
        for(var j=0;j<pts.length;j++){
          var p=pts[j];
          if(p.cmd==='M') out+='M '+p.x+' '+p.y+' ';
          else if(p.cmd==='L') out+='L '+p.x+' '+p.y+' ';
          else if(p.cmd==='C1') out+='C '+p.x+' '+p.y+', ';
          else if(p.cmd==='C2') out+=p.x+' '+p.y+', ';
          else if(p.cmd==='C3') out+=p.x+' '+p.y+' ';
        }
        return out.trim();
      }

      svg.querySelectorAll('.node').forEach(function(node){
        node.style.cursor='grab';
        var nid=node.getAttribute('data-id')||'';
        nodeOffsets[nid]={dx:0,dy:0};

        node.addEventListener('mousedown',function(e){
          if(e.button!==0) return;
          e.stopPropagation();
          dragNode=node; dnMoved=false;
          var scale=vb.width/c.clientWidth;
          dnSX=e.clientX; dnSY=e.clientY;
          var off=nodeOffsets[nid];
          dnOX=off.dx; dnOY=off.dy;
          node.style.cursor='grabbing';
          e.preventDefault();
        });

        node.addEventListener('click',function(e){
          e.stopPropagation();
          if(dnMoved) return; // was a drag, not a click
          var href=node.getAttribute('data-href');
          if(href) htmx.ajax('GET',href,'#content');
        });

        node.addEventListener('mouseenter',function(){
          var rect=node.querySelector('rect');
          if(rect) rect.setAttribute('stroke-width','3');
        });
        node.addEventListener('mouseleave',function(){
          var rect=node.querySelector('rect');
          if(rect){
            var isHL=rect.getAttribute('stroke')==='#ff6600';
            rect.setAttribute('stroke-width', isHL?'3':'1.5');
          }
        });
      });

      c.addEventListener('mousemove',function(e){
        if(dragNode){
          var scale=vb.width/c.clientWidth;
          var dx=(e.clientX-dnSX)*scale;
          var dy=(e.clientY-dnSY)*scale;
          if(Math.abs(dx)>2||Math.abs(dy)>2) dnMoved=true;
          var nid=dragNode.getAttribute('data-id')||'';
          nodeOffsets[nid]={dx:dnOX+dx, dy:dnOY+dy};
          dragNode.setAttribute('transform','translate('+nodeOffsets[nid].dx+','+nodeOffsets[nid].dy+')');
          updateEdges();
          return; // don't pan while dragging a node
        }
        if(!drag) return;
        var scale2=vb.width/c.clientWidth;
        vb.x=ox-(e.clientX-sx)*scale2;
        vb.y=oy-(e.clientY-sy)*scale2;
      });
      c.addEventListener('mouseup',function(){
        if(dragNode){ dragNode.style.cursor='grab'; dragNode=null; }
        drag=false;
      });

      // Fit to container on first load with some padding
      var padding=40;
      vb.x=-padding; vb.y=-padding;
      vb.width=origVB.w+padding*2;
      vb.height=origVB.h+padding*2;
      origVB={x:vb.x, y:vb.y, w:vb.width, h:vb.height};
    });
  }

  // ── Artifact hover preview tooltip ───────────────────────
  (function(){
    var tip=document.createElement('div');
    tip.className='art-tooltip';
    document.body.appendChild(tip);
    var timer=null, ctrl=null, currentEl=null;

    function show(el){
      var href=el.getAttribute('hx-get')||'';
      var m=href.match(/^\/artifacts\/(.+)$/);
      if(!m) return;
      var id=m[1];
      if(ctrl) ctrl.abort();
      ctrl=new AbortController();
      fetch('/artifacts/'+encodeURIComponent(id)+'/preview',{signal:ctrl.signal,headers:{'HX-Request':'true'}})
        .then(function(r){return r.text()})
        .then(function(html){
          tip.innerHTML=html;
          tip.classList.add('visible');
          position(el);
        }).catch(function(){});
    }

    function position(el){
      var r=el.getBoundingClientRect();
      var tw=tip.offsetWidth, th=tip.offsetHeight;
      var left=r.left+r.width/2-tw/2;
      var top=r.top-th-6;
      if(top<4){ top=r.bottom+6; }
      if(left<4) left=4;
      if(left+tw>window.innerWidth-4) left=window.innerWidth-tw-4;
      tip.style.left=left+'px';
      tip.style.top=top+window.scrollY+'px';
    }

    function hide(){
      clearTimeout(timer); timer=null;
      if(ctrl){ ctrl.abort(); ctrl=null; }
      tip.classList.remove('visible');
      currentEl=null;
    }

    document.body.addEventListener('mouseenter',function(e){
      var el=e.target.closest('[hx-get^="/artifacts/"]');
      if(!el||el.getAttribute('hx-get').indexOf('/preview')!==-1) return;
      currentEl=el;
      timer=setTimeout(function(){ show(el); },300);
    },true);

    document.body.addEventListener('mouseleave',function(e){
      var el=e.target.closest('[hx-get^="/artifacts/"]');
      if(el&&el===currentEl) hide();
    },true);

    // also hide when clicking (navigating away)
    document.body.addEventListener('click',function(){ hide(); },true);
  })();

  // ── SVG viewer: fullscreen / popout / zoom-fit ──────────────
  window.svgFullscreen=function(btn){
    var viewer=btn.closest('.svg-viewer');
    if(!viewer) return;
    viewer.classList.toggle('fullscreen');
    var isFS=viewer.classList.contains('fullscreen');
    btn.textContent=isFS?'\u2715':'\u26F6';
    btn.title=isFS?'Exit fullscreen':'Fullscreen';
  };

  window.svgPopout=function(btn){
    var viewer=btn.closest('.svg-viewer');
    if(!viewer) return;
    var svg=viewer.querySelector('svg');
    if(!svg) return;
    var popup=window.open('','_blank','width=1200,height=800');
    var doc=popup.document;
    doc.open();
    var style=doc.createElement('style');
    style.textContent='body{margin:0;background:#fafbfc;display:flex;align-items:center;justify-content:center;min-height:100vh} svg{max-width:95vw;max-height:95vh}';
    doc.head.appendChild(style);
    doc.title='Rivet Graph';
    doc.body.appendChild(svg.cloneNode(true));
    doc.close();
  };

  window.svgZoomFit=function(btn){
    var viewer=btn.closest('.svg-viewer');
    if(!viewer) return;
    var container=viewer.querySelector('.graph-container');
    var svg=viewer.querySelector('svg');
    if(!svg) return;
    // Trigger the existing zoom-fit button if present
    if(container){
      var fitBtn=container.querySelector('.zoom-fit');
      if(fitBtn){ fitBtn.click(); return; }
    }
    // Fallback: reset viewBox from bounding box
    var bbox=svg.getBBox();
    var pad=40;
    svg.setAttribute('viewBox',
      (bbox.x-pad)+' '+(bbox.y-pad)+' '+(bbox.width+pad*2)+' '+(bbox.height+pad*2));
  };

  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      document.querySelectorAll('.svg-viewer.fullscreen').forEach(function(v){
        v.classList.remove('fullscreen');
        var btn=v.querySelector('.svg-viewer-toolbar button[title="Exit fullscreen"]');
        if(btn){ btn.textContent='\u26F6'; btn.title='Fullscreen'; }
      });
    }
  });

  // ── VS Code WebView bridge ──────────────────────────────
  // If running inside a VS Code WebView iframe, send navigation
  // messages to the parent frame so the editor can open source files.
  if(window.parent !== window){
    document.addEventListener('click',function(e){
      var link=e.target.closest('a[hx-get^="/artifacts/"]');
      if(link){
        var id=link.getAttribute('hx-get').replace('/artifacts/','');
        window.parent.postMessage({type:'rivet-navigate',artifactId:id},'*');
      }
    });
  }
})();
</script>
"#;

// ── Cmd+K search JS ──────────────────────────────────────────────────────
//
// URL persistence (fixes search-url-persistence bug):
// When the user types in Cmd+K, the current URL is updated in-place with
// a `cmdk` query param (via history.replaceState) so that a page reload
// preserves the search term and re-opens the overlay with results. We use
// `cmdk` (not `q`) to avoid colliding with /artifacts?q=... filter state.

pub(crate) const SEARCH_JS: &str = r#"
<script>
(function(){
  var overlay=document.getElementById('cmd-k-overlay');
  var input=document.getElementById('cmd-k-input');
  var results=document.getElementById('cmd-k-results');
  var timer=null;
  var activeIdx=-1;
  var items=[];
  var emptyHtml='<div class="cmd-k-empty">Type to search artifacts and documents</div>';

  // Update the URL's `cmdk` query param without navigating.
  // Empty string clears the param so the URL stays clean.
  function syncUrl(q){
    try {
      var u=new URL(window.location.href);
      if(q && q.length>0){ u.searchParams.set('cmdk', q); }
      else { u.searchParams.delete('cmdk'); }
      history.replaceState(history.state, '', u.toString());
    } catch(_){ /* replaceState is best-effort; never throw into UI */ }
  }

  function runSearch(q){
    fetch('/search?q='+encodeURIComponent(q))
      .then(function(r){return r.text()})
      .then(function(html){
        // html is server-rendered search-results fragment (html_escape'd).
        results.innerHTML=html;
        items=results.querySelectorAll('.cmd-k-item');
        activeIdx=-1;
        setActive(-1);
      });
  }

  function open(prefill){
    overlay.classList.add('open');
    var q=(prefill==null?'':String(prefill));
    input.value=q;
    if(q){ runSearch(q); syncUrl(q); }
    else {
      results.innerHTML=emptyHtml;
      activeIdx=-1; items=[];
    }
    setTimeout(function(){input.focus();if(input.select)input.select();},20);
  }
  function close(){
    overlay.classList.remove('open');
    input.blur();
    syncUrl('');
  }

  // Keyboard shortcut: Cmd+K / Ctrl+K
  document.addEventListener('keydown',function(e){
    if((e.metaKey||e.ctrlKey)&&e.key==='k'){
      e.preventDefault();
      if(overlay.classList.contains('open')){close()}else{open()}
    }
    if(e.key==='Escape'&&overlay.classList.contains('open')){
      e.preventDefault();close();
    }
  });

  // Click outside to close
  overlay.addEventListener('mousedown',function(e){
    if(e.target===overlay) close();
  });

  // Nav hint click
  var hint=document.getElementById('nav-search-hint');
  if(hint) hint.addEventListener('click',function(){open()});

  // Debounced search. URL sync fires immediately (not debounced) so the
  // address bar is always in sync with what the user typed — reload
  // preserves the search term.
  input.addEventListener('input',function(){
    clearTimeout(timer);
    var q=input.value.trim();
    syncUrl(q);
    if(!q){
      results.innerHTML=emptyHtml;
      activeIdx=-1;items=[];
      return;
    }
    timer=setTimeout(function(){runSearch(q);},200);
  });

  // Arrow navigation
  input.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){
      e.preventDefault();
      if(items.length>0){activeIdx=Math.min(activeIdx+1,items.length-1);setActive(activeIdx);}
    } else if(e.key==='ArrowUp'){
      e.preventDefault();
      if(items.length>0){activeIdx=Math.max(activeIdx-1,0);setActive(activeIdx);}
    } else if(e.key==='Enter'){
      e.preventDefault();
      if(activeIdx>=0&&activeIdx<items.length){
        navigate(items[activeIdx]);
      }
    }
  });

  function setActive(idx){
    for(var i=0;i<items.length;i++){
      items[i].classList.toggle('active',i===idx);
    }
    if(idx>=0&&idx<items.length){
      items[idx].scrollIntoView({block:'nearest'});
    }
  }

  function navigate(el){
    var url=el.getAttribute('data-url');
    if(url){
      close();
      htmx.ajax('GET',url,'#content');
    }
  }

  // Click on result
  results.addEventListener('click',function(e){
    var item=e.target.closest('.cmd-k-item');
    if(item) navigate(item);
  });

  // On initial page load, if the URL carries ?cmdk=..., re-open the overlay
  // with the saved query so Cmd+R preserves an in-flight search.
  function restoreFromUrl(){
    try {
      var u=new URL(window.location.href);
      var q=u.searchParams.get('cmdk');
      if(q && q.length>0 && !overlay.classList.contains('open')){
        open(q);
      }
    } catch(_){ /* no-op */ }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',restoreFromUrl);
  } else {
    restoreFromUrl();
  }
})();
</script>
"#;

// ── AADL diagram JS ─────────────────────────────────────────────────────

pub(crate) const AADL_JS: &str = r#"
<script type="module">
// ── AADL diagram rendering via spar WASM component (client-side) ──────
//
// The jco-transpiled module at /wasm/spar_wasm.js exposes:
//   instantiate(getCoreModule, imports) → { renderer: { render(root, highlight) → svg } }
//
// We provide a minimal virtual WASI filesystem so the WASM component can
// read .aadl files that we pre-fetch from the server via /source-raw/.

const AADL_DIR = 'arch';  // directory under project root containing .aadl files

// ── Minimal WASI stubs ────────────────────────────────────────────────

class VPollable { block(){} }
class VError {}
class VInputStream {
  constructor(bytes){ this._buf = bytes; this._pos = 0; }
  blockingRead(len){ const n = Number(len); const end = Math.min(this._pos + n, this._buf.length); const chunk = this._buf.slice(this._pos, end); this._pos = end; if(chunk.length === 0) throw { tag: 'closed' }; return chunk; }
  subscribe(){ return new VPollable(); }
}
class VOutputStream {
  checkWrite(){ return 65536n; }
  write(){}
  blockingFlush(){}
  subscribe(){ return new VPollable(); }
}
class VDirStream {
  constructor(entries){ this._entries = entries; this._i = 0; }
  readDirectoryEntry(){ return this._i < this._entries.length ? this._entries[this._i++] : undefined; }
}
class VDescriptor {
  constructor(kind, content, children){
    this._kind = kind;        // 'directory' | 'regular-file'
    this._content = content;  // Uint8Array for files
    this._children = children; // [{name,type,content}] for dirs
  }
  readViaStream(offset){ return new VInputStream(this._content.slice(Number(offset))); }
  writeViaStream(){ return new VOutputStream(); }
  appendViaStream(){ return new VOutputStream(); }
  getFlags(){ return { read: true }; }
  readDirectory(){ return new VDirStream(this._children.map(c => ({ type: c.type, name: c.name }))); }
  stat(){ return { type: this._kind, linkCount: 1n, size: BigInt(this._content ? this._content.length : 0) }; }
  openAt(_pf, path, _of, _fl){
    if(path === '.' || path === '/' || path === '') return this;
    // Handle paths like ./file.aadl
    var name = path.replace(/^\.\//, '');
    var child = this._children && this._children.find(c => c.name === name);
    if(!child) throw 'no-entry';
    return new VDescriptor(child.type, child.content, child.children);
  }
  metadataHash(){ return { lower: 0n, upper: 0n }; }
  metadataHashAt(){ return { lower: 0n, upper: 0n }; }
}

function buildWasiImports(rootDesc){
  var enc = new TextEncoder();
  return {
    'wasi:cli/environment':       { getEnvironment(){ return []; } },
    'wasi:cli/exit':              { exit(){} },
    'wasi:cli/stderr':            { getStderr(){ return new VOutputStream(); } },
    'wasi:cli/stdin':             { getStdin(){ return new VInputStream(new Uint8Array(0)); } },
    'wasi:cli/stdout':            { getStdout(){ return new VOutputStream(); } },
    'wasi:cli/terminal-input':    { TerminalInput: class {} },
    'wasi:cli/terminal-output':   { TerminalOutput: class {} },
    'wasi:cli/terminal-stderr':   { getTerminalStderr(){ return undefined; } },
    'wasi:cli/terminal-stdin':    { getTerminalStdin(){ return undefined; } },
    'wasi:cli/terminal-stdout':   { getTerminalStdout(){ return undefined; } },
    'wasi:clocks/monotonic-clock':{ now(){ return 0n; }, subscribe(){ return new VPollable(); } },
    'wasi:clocks/wall-clock':     { now(){ return { seconds: 0n, nanoseconds: 0 }; } },
    'wasi:filesystem/preopens':   { getDirectories(){ return [[rootDesc, '/']]; } },
    'wasi:filesystem/types':      { Descriptor: VDescriptor, DirectoryEntryStream: VDirStream },
    'wasi:io/error':             { Error: VError },
    'wasi:io/poll':              { Pollable: VPollable },
    'wasi:io/streams':           { InputStream: VInputStream, OutputStream: VOutputStream },
    'wasi:random/insecure-seed':  { insecureSeed(){ return [0n, 0n]; } },
  };
}

// ── Fetch .aadl files and build virtual FS ────────────────────────────

async function fetchAadlSources(){
  // List .aadl files via /source-raw/arch (returns JSON array of filenames).
  var resp = await fetch('/source-raw/' + AADL_DIR);
  if(!resp.ok) return [];
  var files = await resp.json();
  var aadlFiles = files.filter(function(f){ return f.endsWith('.aadl'); });

  var enc = new TextEncoder();
  var children = [];
  for(var name of aadlFiles){
    var r = await fetch('/source-raw/' + AADL_DIR + '/' + name);
    if(!r.ok) continue;
    var text = await r.text();
    children.push({ name: name, type: 'regular-file', content: enc.encode(text) });
  }
  return children;
}

// ── WASM module cache ─────────────────────────────────────────────────

var wasmModulePromise = null;
var wasmAvailable = null;

async function checkWasmAvailable(){
  if(wasmAvailable === null){
    try {
      var probe = await fetch('/wasm/spar_wasm.js', {method:'HEAD'});
      wasmAvailable = probe.ok;
    } catch(e){ wasmAvailable = false; }
  }
  return wasmAvailable;
}

async function getSparRenderer(aadlFiles){
  if(!wasmAvailable){
    throw new Error('AADL WASM renderer not available (run ./scripts/build-wasm.sh and rebuild)');
  }
  if(!wasmModulePromise){
    wasmModulePromise = import('/wasm/spar_wasm.js');
  }
  var mod = await wasmModulePromise;
  var rootDesc = new VDescriptor('directory', null, aadlFiles);
  var imports = buildWasiImports(rootDesc);
  var getCoreModule = async function(path){
    var url = '/wasm/' + path;
    return WebAssembly.compileStreaming(fetch(url));
  };
  var instance = await mod.instantiate(getCoreModule, imports);
  return instance.renderer;
}

// ── Diagram initialization ────────────────────────────────────────────

var aadlFilesCache = null;

async function initAadlDiagrams(){
  var containers = document.querySelectorAll('.aadl-diagram:not([data-loaded])');
  if(containers.length === 0) return;

  // Check WASM availability once — if unavailable, show quiet fallback on all containers
  var available = await checkWasmAvailable();
  if(!available){
    containers.forEach(function(c){
      c.setAttribute('data-loaded','true');
      var ld = c.querySelector('.aadl-loading');
      if(ld) ld.textContent = 'AADL diagram requires spar WASM (run ./scripts/build-wasm.sh and rebuild)';
    });
    return;
  }

  try {
    if(!aadlFilesCache) aadlFilesCache = await fetchAadlSources();
    if(aadlFilesCache.length === 0){
      containers.forEach(function(c){
        var ld = c.querySelector('.aadl-loading');
        if(ld) ld.textContent = 'No .aadl files found in ' + AADL_DIR + '/';
      });
      return;
    }
  } catch(e){
    containers.forEach(function(c){
      var ld = c.querySelector('.aadl-loading');
      if(ld) ld.textContent = 'Failed to load AADL sources: ' + e.message;
    });
    return;
  }

  for(var container of containers){
    container.setAttribute('data-loaded','true');
    var root = container.getAttribute('data-root');
    if(!root) continue;
    try {
      var renderer = await getSparRenderer(aadlFilesCache);
      var svgText = renderer.render(root, []);
      var dp = new DOMParser();
      var xdoc = dp.parseFromString(svgText, 'image/svg+xml');
      var svg = xdoc.documentElement;
      if(svg.nodeName === 'parsererror' || svg.querySelector('parsererror')){
        throw new Error('Invalid SVG from WASM renderer');
      }
      // Clear loading placeholder
      while(container.firstChild) container.removeChild(container.firstChild);

      // Caption bar
      var parts = root.split('::');
      var pkgName = parts[0] || '';
      var implName = parts[1] || root;
      var caption = document.createElement('div');
      caption.className = 'aadl-caption';
      // Left side: badge + title
      var captionLeft = document.createElement('div');
      var badge = document.createElement('span');
      badge.className = 'aadl-badge';
      badge.textContent = 'AADL';
      captionLeft.appendChild(badge);
      captionLeft.appendChild(document.createTextNode(' '));
      var titleSpan = document.createElement('span');
      titleSpan.className = 'aadl-title';
      titleSpan.textContent = implName;
      captionLeft.appendChild(titleSpan);
      captionLeft.appendChild(document.createTextNode(' '));
      var pkgSpan = document.createElement('span');
      pkgSpan.style.opacity = '.6';
      pkgSpan.textContent = '(' + pkgName + ')';
      captionLeft.appendChild(pkgSpan);
      caption.appendChild(captionLeft);
      // Right side: zoom controls
      var controls = document.createElement('div');
      controls.className = 'aadl-controls';
      var btnOut = document.createElement('button');
      btnOut.setAttribute('data-zoom','-1'); btnOut.title = 'Zoom out'; btnOut.textContent = '\u2212';
      var btnFit = document.createElement('button');
      btnFit.setAttribute('data-zoom','0'); btnFit.title = 'Fit to view'; btnFit.textContent = 'Fit';
      var btnIn = document.createElement('button');
      btnIn.setAttribute('data-zoom','1'); btnIn.title = 'Zoom in'; btnIn.textContent = '+';
      controls.appendChild(btnOut);
      controls.appendChild(btnFit);
      controls.appendChild(btnIn);
      caption.appendChild(controls);
      container.appendChild(caption);

      // Viewport
      var viewport = document.createElement('div');
      viewport.className = 'aadl-viewport';
      var imported = document.importNode(svg, true);
      var nodeCount = imported.querySelectorAll('.node').length;
      if(nodeCount > 0){
        var info = document.createElement('span');
        info.style.cssText = 'opacity:.5;font-size:.75rem;margin-left:.5rem';
        info.textContent = nodeCount + ' component' + (nodeCount !== 1 ? 's' : '');
        captionLeft.appendChild(info);
      }
      viewport.appendChild(imported);
      container.appendChild(viewport);
      initZoomPan(viewport, imported);
      initDiagramInteraction(viewport);

      // Run analysis and display diagnostics panel
      try {
        var diags = renderer.analyze(root);
        if(diags && diags.length > 0){
          var panel = document.createElement('div');
          panel.className = 'aadl-analysis';

          // Header with severity counts
          var hdr = document.createElement('div');
          hdr.className = 'aadl-analysis-header';
          hdr.textContent = 'Analysis ';
          var errors = diags.filter(function(d){ return d.severity === 'error'; }).length;
          var warnings = diags.filter(function(d){ return d.severity === 'warning'; }).length;
          var infos = diags.filter(function(d){ return d.severity === 'info'; }).length;
          if(errors > 0){ var b = document.createElement('span'); b.className = 'badge-count badge-error'; b.textContent = errors; hdr.appendChild(b); }
          if(warnings > 0){ var b = document.createElement('span'); b.className = 'badge-count badge-warning'; b.textContent = warnings; hdr.appendChild(b); }
          if(infos > 0){ var b = document.createElement('span'); b.className = 'badge-count badge-info'; b.textContent = infos; hdr.appendChild(b); }
          panel.appendChild(hdr);

          // Sort: errors first, then warnings, then info
          var order = {error:0, warning:1, info:2};
          diags.sort(function(a,b){ return (order[a.severity]||9) - (order[b.severity]||9); });

          for(var i = 0; i < diags.length; i++){
            var d = diags[i];
            var row = document.createElement('div');
            row.className = 'aadl-diag';
            var sev = document.createElement('span');
            sev.className = 'sev sev-' + d.severity;
            sev.textContent = d.severity;
            row.appendChild(sev);
            if(d.componentPath){
              var path = document.createElement('span');
              path.className = 'diag-path';
              path.textContent = d.componentPath;
              row.appendChild(path);
            }
            var msg = document.createElement('span');
            msg.className = 'diag-msg';
            msg.textContent = d.message;
            row.appendChild(msg);
            var an = document.createElement('span');
            an.className = 'diag-analysis';
            an.textContent = d.analysisName;
            row.appendChild(an);
            panel.appendChild(row);
          }
          container.appendChild(panel);
        }
      } catch(analyzeErr){
        console.warn('AADL analysis error:', analyzeErr);
      }
    } catch(err){
      while(container.firstChild) container.removeChild(container.firstChild);
      var p = document.createElement('p');
      p.className = 'aadl-error';
      var detail = err.payload ? JSON.stringify(err.payload) : (err.message || String(err));
      p.textContent = 'AADL diagram error: ' + detail;
      console.error('AADL render error:', err, err.payload);
      container.appendChild(p);
    }
  }
}

function initZoomPan(viewport, svg){
  var scale = 1, panX = 0, panY = 0;
  var dragging = false, dragMoved = false, startMX, startMY, startPX, startPY;
  var minScale = 0.05, maxScale = 12;

  function apply(){
    svg.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + scale + ')';
  }

  // Get SVG intrinsic size
  var svgW = parseFloat(svg.getAttribute('width')) || 400;
  var svgH = parseFloat(svg.getAttribute('height')) || 300;

  // Fit diagram into viewport with padding
  function fitToView(){
    var vw = viewport.clientWidth || 600;
    var vh = viewport.clientHeight || 400;
    var pad = 24;
    scale = Math.min((vw - pad) / svgW, (vh - pad) / svgH, 3);
    panX = (vw - svgW * scale) / 2;
    panY = (vh - svgH * scale) / 2;
    apply();
  }

  // Zoom toward a point in viewport coordinates
  function zoomAt(mx, my, factor){
    var ns = Math.max(minScale, Math.min(maxScale, scale * factor));
    panX = mx - (mx - panX) * (ns / scale);
    panY = my - (my - panY) * (ns / scale);
    scale = ns;
    apply();
  }

  // Zoom buttons
  var controls = viewport.parentElement.querySelector('.aadl-controls');
  if(controls){
    controls.addEventListener('click', function(e){
      var btn = e.target.closest('button');
      if(!btn) return;
      var z = btn.getAttribute('data-zoom');
      if(z === '0'){ fitToView(); return; }
      var vw = viewport.clientWidth || 600;
      var vh = viewport.clientHeight || 400;
      zoomAt(vw/2, vh/2, parseInt(z) > 0 ? 1.5 : 1/1.5);
    });
  }

  // Mouse wheel zoom toward cursor
  viewport.addEventListener('wheel', function(e){
    e.preventDefault();
    var rect = viewport.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    // Trackpad pinch sends ctrlKey + small delta; mouse wheel sends larger delta
    var factor = e.ctrlKey
      ? (e.deltaY > 0 ? 0.97 : 1.03)
      : (e.deltaY > 0 ? 0.85 : 1/0.85);
    zoomAt(mx, my, factor);
  }, {passive: false});

  // Pan via drag (works anywhere, including on nodes)
  viewport.addEventListener('mousedown', function(e){
    if(e.button !== 0) return;
    dragging = true; dragMoved = false;
    startMX = e.clientX; startMY = e.clientY;
    startPX = panX; startPY = panY;
    viewport.classList.add('grabbing');
  });
  window.addEventListener('mousemove', function(e){
    if(!dragging) return;
    var dx = e.clientX - startMX, dy = e.clientY - startMY;
    if(!dragMoved && Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
    if(dragMoved){
      panX = startPX + dx;
      panY = startPY + dy;
      apply();
    }
  });
  window.addEventListener('mouseup', function(){
    if(!dragging) return;
    dragging = false;
    viewport.classList.remove('grabbing');
    // Mark viewport so node click handler can distinguish click from drag
    if(dragMoved) viewport.setAttribute('data-dragged','');
    else viewport.removeAttribute('data-dragged');
  });

  // Double-click to zoom in toward cursor
  viewport.addEventListener('dblclick', function(e){
    e.preventDefault();
    var rect = viewport.getBoundingClientRect();
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, 2);
  });

  // Initial fit
  fitToView();
}

function initDiagramInteraction(viewport){
  var nodes = viewport.querySelectorAll('svg [data-id]');
  nodes.forEach(function(node){
    node.style.cursor = 'pointer';
    node.addEventListener('click', function(e){
      // Skip if this was a drag gesture, not a click
      if(viewport.hasAttribute('data-dragged')){
        viewport.removeAttribute('data-dragged');
        return;
      }
      e.stopPropagation();
      var id = node.getAttribute('data-id');
      if(!id) return;
      fetch('/artifacts/' + encodeURIComponent(id) + '/preview', {headers:{'HX-Request':'true'}})
        .then(function(r){
          if(r.ok) return r.text();
          return null;
        })
        .then(function(html){
          if(html && html.indexOf('not found') === -1 && html.indexOf('Not Found') === -1){
            htmx.ajax('GET', '/artifacts/' + encodeURIComponent(id), {target:'#content'});
          }
        });
    });
  });
}

window.highlightAadlNodes = function(artifactIds){
  var nodes = document.querySelectorAll('.aadl-diagram svg .node');
  nodes.forEach(function(node){
    var id = node.getAttribute('data-id');
    // Shape may be rect, polygon, path, or ellipse depending on AADL category
    var shape = node.querySelector('rect, polygon, path, ellipse');
    if(!shape) return;
    if(artifactIds.indexOf(id) !== -1){
      shape.setAttribute('stroke','#f0c040');
      shape.setAttribute('stroke-width','3');
    } else {
      shape.setAttribute('stroke','');
      shape.setAttribute('stroke-width','');
    }
  });
};

document.body.addEventListener('htmx:afterSwap', initAadlDiagrams);

// ── Table sort & filter ──────────────────────────────────
function initTables(){
  var tables = document.querySelectorAll('#content table');
  tables.forEach(function(table){
    if(table.classList.contains('tbl-enhanced')) return;
    var thead = table.querySelector('thead');
    var tbody = table.querySelector('tbody');
    if(!thead || !tbody) return;
    var rows = tbody.querySelectorAll('tr');
    if(rows.length < 3) return; // skip tiny tables
    table.classList.add('tbl-enhanced');

    // Add filter input above table
    var wrap = document.createElement('div');
    wrap.className = 'tbl-filter-wrap';
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Filter rows\u2026';
    inp.className = 'tbl-filter';
    inp.addEventListener('input', function(){
      var q = inp.value.toLowerCase();
      tbody.querySelectorAll('tr').forEach(function(row){
        row.style.display = row.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
      });
    });
    wrap.appendChild(inp);
    table.parentNode.insertBefore(wrap, table);

    // Sortable headers
    var ths = thead.querySelectorAll('th');
    ths.forEach(function(th, colIdx){
      th.style.cursor = 'pointer';
      th.style.userSelect = 'none';
      th.title = 'Click to sort';
      var arrow = document.createElement('span');
      arrow.className = 'tbl-sort-arrow';
      arrow.textContent = '';
      th.appendChild(arrow);
      var asc = true;
      th.addEventListener('click', function(){
        // Reset all arrows
        ths.forEach(function(h){
          var a = h.querySelector('.tbl-sort-arrow');
          if(a) a.textContent = '';
        });
        var rowsArr = Array.from(tbody.querySelectorAll('tr'));
        rowsArr.sort(function(a, b){
          var at = (a.children[colIdx] || {}).textContent || '';
          var bt = (b.children[colIdx] || {}).textContent || '';
          // Try numeric sort first
          var an = parseFloat(at), bn = parseFloat(bt);
          if(!isNaN(an) && !isNaN(bn)){
            return asc ? an - bn : bn - an;
          }
          return asc ? at.localeCompare(bt) : bt.localeCompare(at);
        });
        rowsArr.forEach(function(r){ tbody.appendChild(r); });
        arrow.textContent = asc ? ' \u25B2' : ' \u25BC';
        asc = !asc;
      });
    });
  });
}
document.body.addEventListener('htmx:afterSwap', initTables);
document.addEventListener('DOMContentLoaded', initTables);

// ── Tag faceting (artifacts page) ──────────────────────────
function initTagFacets(){
  var sidebar=document.getElementById('tag-facets');
  if(!sidebar) return;
  var table=document.getElementById('artifacts-table');
  if(!table) return;
  var tbody=table.querySelector('tbody');
  if(!tbody) return;
  // Find the tag column index (data-col="tags")
  var tagColIdx=-1;
  var ths=table.querySelectorAll('thead th');
  ths.forEach(function(th,i){ if(th.getAttribute('data-col')==='tags') tagColIdx=i; });
  if(tagColIdx<0) return;

  // Collect all unique tags with counts
  var tagCounts={};
  tbody.querySelectorAll('tr').forEach(function(row){
    var cell=row.children[tagColIdx];
    if(!cell) return;
    var tags=cell.getAttribute('data-tags');
    if(!tags) return;
    tags.split(',').forEach(function(t){
      t=t.trim();
      if(t){ tagCounts[t]=(tagCounts[t]||0)+1; }
    });
  });

  var tagNames=Object.keys(tagCounts).sort();
  if(tagNames.length===0){
    sidebar.textContent='No tags';
    sidebar.style.cssText='font-size:.8rem;color:var(--text-secondary)';
    return;
  }

  // Build facet checkboxes via DOM API
  sidebar.textContent='';
  var list=document.createElement('div');
  list.className='facet-list';
  tagNames.forEach(function(tag){
    var label=document.createElement('label');
    label.className='facet-item';
    var cb=document.createElement('input');
    cb.type='checkbox';
    cb.value=tag;
    cb.checked=true;
    label.appendChild(cb);
    label.appendChild(document.createTextNode(' '+tag+' '));
    var cnt=document.createElement('span');
    cnt.className='facet-count';
    cnt.textContent=tagCounts[tag];
    label.appendChild(cnt);
    list.appendChild(label);
  });
  sidebar.appendChild(list);

  // Filter rows when checkboxes change
  sidebar.addEventListener('change',function(){
    var checked=[];
    sidebar.querySelectorAll('input[type="checkbox"]:checked').forEach(function(cb){ checked.push(cb.value); });
    var allChecked=checked.length===tagNames.length;
    tbody.querySelectorAll('tr').forEach(function(row){
      if(row.classList.contains('group-header-row')){ row.style.display=''; return; }
      if(allChecked){ row.style.display=''; return; }
      var cell=row.children[tagColIdx];
      if(!cell){ row.style.display='none'; return; }
      var tags=(cell.getAttribute('data-tags')||'').split(',').map(function(t){return t.trim()}).filter(Boolean);
      if(tags.length===0){ row.style.display=checked.length===0?'':'none'; return; }
      var match=tags.some(function(t){ return checked.indexOf(t)!==-1; });
      row.style.display=match?'':'none';
    });
  });
}
document.body.addEventListener('htmx:afterSwap', initTagFacets);
document.addEventListener('DOMContentLoaded', initTagFacets);

// ── Group-by (artifacts page) ──────────────────────────────
window.groupArtifacts=function(field){
  var table=document.getElementById('artifacts-table');
  if(!table) return;
  var tbody=table.querySelector('tbody');
  if(!tbody) return;

  // Remove existing group header rows
  tbody.querySelectorAll('.group-header-row').forEach(function(r){ r.remove(); });

  if(field==='none'){
    // Restore original order: sort by ID (first column)
    var rows=Array.from(tbody.querySelectorAll('tr'));
    rows.sort(function(a,b){
      var at=(a.children[0]||{}).textContent||'';
      var bt=(b.children[0]||{}).textContent||'';
      return at.localeCompare(bt);
    });
    rows.forEach(function(r){ tbody.appendChild(r); });
    return;
  }

  // Find column index for grouping
  var colMap={type:1, status:3, tag:-1};
  var ths=table.querySelectorAll('thead th');
  ths.forEach(function(th,i){ if(th.getAttribute('data-col')==='tags') colMap.tag=i; });
  var colIdx=colMap[field];
  if(colIdx===undefined||colIdx<0) return;

  var rows=Array.from(tbody.querySelectorAll('tr'));
  var groups={};
  rows.forEach(function(row){
    var key='';
    if(field==='tag'){
      var cell=row.children[colIdx];
      var tags=(cell&&cell.getAttribute('data-tags'))||'';
      key=tags.split(',')[0]||'(no tag)';
      key=key.trim()||'(no tag)';
    } else {
      key=(row.children[colIdx]||{}).textContent||'(empty)';
      key=key.trim()||'(empty)';
    }
    if(!groups[key]) groups[key]=[];
    groups[key].push(row);
  });

  var colCount=ths.length;
  var sortedKeys=Object.keys(groups).sort();
  sortedKeys.forEach(function(key){
    var hdr=document.createElement('tr');
    hdr.className='group-header-row';
    var td=document.createElement('td');
    td.setAttribute('colspan',String(colCount));
    td.textContent=key+' ('+groups[key].length+')';
    hdr.appendChild(td);
    tbody.appendChild(hdr);
    groups[key].forEach(function(r){ tbody.appendChild(r); });
  });
};

// ── Matrix cell drill-down ─────────────────────────────────
function initMatrixDrilldown(){
  document.querySelectorAll('.matrix-cell-clickable').forEach(function(cell){
    if(cell._drilldown) return;
    cell._drilldown=true;
    cell.addEventListener('click',function(){
      var detail=cell.nextElementSibling;
      if(!detail||!detail.classList.contains('cell-detail')) return;
      if(detail.childNodes.length>0){
        detail.textContent='';
        return;
      }
      var src=cell.getAttribute('data-source-type');
      var tgt=cell.getAttribute('data-target-type');
      var link=cell.getAttribute('data-link-type');
      var dir=cell.getAttribute('data-direction');
      var url='/matrix/cell?source_type='+encodeURIComponent(src)+'&target_type='+encodeURIComponent(tgt)+'&link_type='+encodeURIComponent(link)+'&direction='+encodeURIComponent(dir);
      htmx.ajax('GET',url,{target:detail,swap:'innerHTML'});
    });
  });
}
document.body.addEventListener('htmx:afterSwap', initMatrixDrilldown);
document.addEventListener('DOMContentLoaded', initMatrixDrilldown);
</script>
"#;
