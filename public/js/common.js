/* Núcleo compartido: datos, iconografía SVG sin emojis, cabecera, pie, carrito, favoritos, compartir */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.8 4.8"/>',
    bag: '<path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    heart: '<path d="M20.8 8.6c0 4.8-8.8 11-8.8 11s-8.8-6.2-8.8-11a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l1.4-1.4"/>',
    moon: '<path d="M20 15.8A8.7 8.7 0 0 1 8.2 4a8.7 8.7 0 1 0 11.8 11.8Z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrowUpRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    shield: '<path d="M12 3 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z"/><path d="m9 12 2 2 4-4"/>',
    truck: '<rect x="2" y="6" width="13" height="10" rx="1"/><path d="M15 9h4l3 3v4h-7V9Z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    spark: '<path d="M12 3v4m0 10v4M3 12h4m10 0h4m-2.8-6.2-2.8 2.8m-6.8 6.8-2.8 2.8m12.4 0-2.8-2.8M8.4 8.4 5.6 5.6"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="8" cy="8" r="1.5"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    chevRight: '<path d="m9 18 6-6-6-6"/>'
  };

  const ico = (n, c = 'icon') => `<svg class="${c}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ICON.spark}</svg>`;
  const WA_SVG = '<svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8A13 13 0 1 0 16 3Zm0 23.7c-2 0-3.9-.6-5.5-1.6l-.4-.2-4 1.1 1.1-3.9-.3-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-1-2.2-1-.3-.1-.5-.2-.7.2s-.8 1-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 1.9.8 2.7.9 3.6.7.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4Z"/></svg>';

  const S = window.Shop = { products: [], categories: [], settings: {}, ico, WA_SVG, $, $$ };

  const store = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  let cart = store('shop_cart', {});
  let favs = new Set(store('shop_favs', []));
  const persist = () => {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
    localStorage.setItem('shop_favs', JSON.stringify([...favs]));
  };

  S.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  S.money = n => `${S.settings.currency || 'Bs'} ${Number(n).toLocaleString('es-BO', { maximumFractionDigits: 2 })}`;
  S.img = p => (p && p.images && p.images[0]) ? p.images[0] : VyraArt((p && p.art) || 'headphone');
  S.isReal = p => !!(p && p.images && p.images[0]);
  S.pct = p => p && p.old && p.old > p.price ? Math.round((1 - p.price / p.old) * 100) : 0;
  S.catName = id => (S.categories.find(c => c.id === id) || {}).name || '';
  S.productUrl = p => `${location.origin}/producto.html?id=${p.id}`;
  S.catalogUrl = () => `${location.origin}/catalogo.html`;
  S.waLink = text => `https://wa.me/${S.settings.whatsapp || ''}?text=${encodeURIComponent(text)}`;
  S.waProduct = p => {
    const custom = p.waCustom ? `\n${p.waCustom}` : '';
    return S.waLink(`Hola, me interesa este producto:\n*${p.name}*${p.sku ? ` (${p.sku})` : ''} — ${S.money(p.price)}${custom}\n${S.productUrl(p)}\n¿Está disponible?`);
  };

  let toastT;
  S.toast = msg => {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('on'), 2400);
  };

  S.load = async () => {
    const base = window.VYRA_DEFAULT_STORE || { settings: {}, categories: [], products: [] };
    let d = {
      settings: { ...(base.settings || {}) },
      categories: [...(base.categories || [])],
      products: [...(base.products || [])]
    };
    try {
      const r = await fetch('/api/store', { cache: 'no-store' });
      if (r.ok) {
        const srv = await r.json();
        if (srv && srv.settings && Array.isArray(srv.products) && srv.products.length) {
          d = srv;
        }
      }
    } catch {}
    try {
      const ov = JSON.parse(localStorage.getItem('vyra_store_override') || 'null');
      if (ov && ov.settings && Array.isArray(ov.products)) {
        d = {
          settings: { ...(d.settings || {}), ...ov.settings },
          categories: Array.isArray(ov.categories) && ov.categories.length ? ov.categories : (d.categories || []),
          products: ov.products.filter(p => p.visible !== false)
        };
      }
    } catch {}
    Object.assign(S, d);
    document.documentElement.style.setProperty('--accent', (d.settings && d.settings.accent) || '#d9f059');
    return d;
  };

  /* ---------- Compartir ---------- */
  S.share = async ({ title, text, url }) => {
    const m = $('#shareModal');
    $('#shareTitle').textContent = title;
    $('#shareUrl').value = url;
    $('#shareWa').href = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
    $('#shareNative').hidden = !navigator.share;
    $('#shareNative').onclick = () => navigator.share({ title, text, url }).catch(() => {});
    $('#shareCopy').onclick = async () => {
      try { await navigator.clipboard.writeText(url); }
      catch { $('#shareUrl').select(); document.execCommand('copy'); }
      S.toast('Enlace copiado al portapapeles');
    };
    m.classList.add('open');
    $('#overlay').classList.add('on');
  };
  S.shareProduct = p => S.share({ title: p.name, text: `Mira este producto: ${p.name} — ${S.money(p.price)}`, url: S.productUrl(p) });
  S.shareCatalog = () => S.share({ title: `Catálogo ${S.settings.storeName}`, text: `Explora el catálogo completo de ${S.settings.storeName}:`, url: S.catalogUrl() });

  /* ---------- Favoritos / Carrito ---------- */
  S.isFav = id => favs.has(id);
  S.toggleFav = id => {
    favs.has(id) ? favs.delete(id) : favs.add(id);
    persist();
    favUI();
    return favs.has(id);
  };
  S.favs = () => favs;
  S.addCart = (id, n = 1) => {
    cart[id] = Math.min(99, (cart[id] || 0) + n);
    persist();
    cartUI();
    S.toast('Producto agregado a tu pedido');
  };
  const favUI = () => {
    const c = $('#favCount');
    if (c) { c.hidden = !favs.size; c.textContent = favs.size; }
    document.dispatchEvent(new Event('favchange'));
  };
  function cartUI() {
    const ids = Object.keys(cart).filter(id => S.products.some(p => p.id === id));
    const n = ids.reduce((a, id) => a + cart[id], 0);
    const c = $('#cartCount');
    if (c) { c.hidden = !n; c.textContent = n; }
    const list = $('#cartItems');
    if (!list) return;
    if (!ids.length) {
      list.innerHTML = '<div class="drawer-empty">Tu selección está vacía.<br>Agrega productos del catálogo para enviar tu pedido completo por WhatsApp.</div>';
      $('#cartTotal').textContent = S.money(0);
      $('#cartSend').disabled = true;
      return;
    }
    let total = 0;
    list.innerHTML = ids.map(id => {
      const p = S.products.find(x => x.id === id);
      total += p.price * cart[id];
      return `<div class="cart-row"><img class="${S.isReal(p) ? 'real' : ''}" src="${S.esc(S.img(p))}" alt=""><div><strong>${S.esc(p.name)}</strong><small>${S.money(p.price)}</small><div class="qty"><button data-q="-1" data-id="${id}" aria-label="Menos">−</button><span>${cart[id]}</span><button data-q="1" data-id="${id}" aria-label="Más">+</button></div></div></div>`;
    }).join('');
    $('#cartTotal').textContent = S.money(total);
    $('#cartSend').disabled = false;
    $('#cartSend').onclick = () => {
      const lines = ids.map(id => {
        const p = S.products.find(x => x.id === id);
        return `- ${cart[id]} x ${p.name} (${S.money(p.price * cart[id])})\n  ${S.productUrl(p)}`;
      });
      window.open(S.waLink(`Hola, deseo realizar el siguiente pedido:\n\n${lines.join('\n')}\n\n*Total: ${S.money(total)}*`), '_blank');
    };
  }
  S.refreshCart = cartUI;

  /* ---------- Estructura común ---------- */
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    localStorage.setItem('shop_theme', t);
    const b = $('#themeBtn');
    if (b) b.innerHTML = ico(t === 'dark' ? 'sun' : 'moon');
  }
  const closeAll = () => {
    $$('.drawer.open,.modal.open').forEach(e => e.classList.remove('open'));
    $('#overlay').classList.remove('on');
  };
  S.closeAll = closeAll;

  S.chrome = (active) => {
    const s = S.settings;
    const rawName = String(s.storeName || 'Vyra.sc');
    const dotIdx = rawName.indexOf('.');
    const brandHtml = dotIdx > 0
      ? `${S.esc(rawName.slice(0, dotIdx))}<i>${S.esc(rawName.slice(dotIdx))}</i>`
      : `${S.esc(rawName)}<i>.</i>`;
    const name = S.esc(rawName);
    document.body.insertAdjacentHTML('afterbegin', `
    ${s.announcement ? `<div class="topbar">${S.esc(s.announcement)}</div>` : ''}
    <header class="site"><div class="container nav">
      <a class="brand" href="/" aria-label="Inicio"><span class="brand-mark"></span>${brandHtml}</a>
      <nav class="navlinks">
        <a href="/" class="${active === 'home' ? 'on' : ''}">Inicio</a>
        <a href="/catalogo.html" class="${active === 'catalog' ? 'on' : ''}">Catálogo</a>
        <a href="/#destacados">Destacados</a>
        <a href="/#ofertas">Ofertas</a>
        <a href="/#editorial">Colección</a>
        <a href="/#como-comprar">Proceso de compra</a>
      </nav>
      <div class="actions">
        <a class="btn btn-dark btn-sm" href="/catalogo.html" style="margin-right:2px">Catálogo ${ico('arrowUpRight')}</a>
        <button class="nav-icon-btn" id="shareCatBtn" aria-label="Compartir catálogo" title="Compartir catálogo">${ico('share')}</button>
        <button class="nav-icon-btn" id="themeBtn" aria-label="Cambiar tema" title="Cambiar tema"></button>
        <a class="nav-icon-btn" href="/catalogo.html?favoritos=1" aria-label="Favoritos" title="Favoritos">${ico('heart')}<span class="counter" id="favCount" hidden>0</span></a>
        <button class="nav-icon-btn" id="cartBtn" aria-label="Mi pedido" title="Mi pedido">${ico('bag')}<span class="counter" id="cartCount" hidden>0</span></button>
        <button class="nav-icon-btn menu-btn" id="menuBtn" aria-label="Menú" aria-expanded="false">${ico('menu')}</button>
      </div>
    </div>
    <div class="mobile-menu" id="mobileMenu">
      <a href="/">Inicio</a>
      <a href="/catalogo.html">Catálogo completo</a>
      <a href="/catalogo.html?oferta=1">Ofertas</a>
      <a href="/catalogo.html?favoritos=1">Mis favoritos</a>
      <a href="/#como-comprar">Proceso de compra</a>
    </div></header>`);

    const social = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']]
      .filter(([k]) => s[k])
      .map(([k, l]) => `<a href="${S.esc(s[k])}" target="_blank" rel="noopener">${l}</a>`)
      .join('');

    document.body.insertAdjacentHTML('beforeend', `
    <footer class="site"><div class="container"><div class="foot-grid">
      <div><div class="foot-brand">${brandHtml}</div><p class="foot-desc">${S.esc(s.footerText)}</p></div>
      <div class="foot-col"><h4>Navegación</h4><a href="/">Inicio</a><a href="/catalogo.html">Catálogo</a><a href="/catalogo.html?oferta=1">Ofertas</a></div>
      <div class="foot-col"><h4>Redes</h4>${social || '<p>Canales digitales oficiales</p>'}</div>
      <div class="foot-col"><h4>Atención directa</h4><a href="${S.waLink('Hola, quisiera recibir información.')}" target="_blank" rel="noopener">WhatsApp: +${S.esc(s.whatsapp)}</a><p>${S.esc(s.address)}</p></div>
    </div><div class="foot-end"><span>© ${new Date().getFullYear()} ${name}. Todos los derechos reservados.</span><span>Precios expresados en ${S.esc(s.currency)}</span></div></div></footer>
    <a class="wa-float" href="${S.waLink('Hola, quisiera recibir información sobre sus productos.')}" target="_blank" rel="noopener" aria-label="Atención por WhatsApp">${WA_SVG}<span>WhatsApp</span></a>
    <div class="overlay" id="overlay"></div>
    <aside class="drawer" id="cartDrawer" role="dialog" aria-label="Mi pedido">
      <div class="drawer-head"><h2>Mi pedido</h2><button class="close" id="cartClose" aria-label="Cerrar">×</button></div>
      <div class="drawer-list" id="cartItems"></div>
      <div class="drawer-foot">
        <div class="total"><span>Total estimado</span><strong id="cartTotal"></strong></div>
        <button class="btn btn-wa btn-block" id="cartSend">${WA_SVG}<span>Enviar pedido por WhatsApp</span></button>
      </div>
    </aside>
    <div class="modal" id="shareModal" role="dialog" aria-label="Compartir">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h2 style="font-size:20px;font-weight:800;letter-spacing:-0.03em">Compartir enlace</h2>
        <button class="close" data-close aria-label="Cerrar">×</button>
      </div>
      <p id="shareTitle" style="color:var(--muted);font-size:13px;margin:8px 0 0"></p>
      <div class="share-list">
        <a class="btn btn-wa btn-block" id="shareWa" target="_blank" rel="noopener">${WA_SVG}<span>Enviar por WhatsApp</span></a>
        <button class="btn btn-dark btn-block" id="shareNative">${ico('share')}<span>Más opciones del dispositivo</span></button>
        <button class="btn btn-ghost btn-block" id="shareCopy">${ico('copy')}<span>Copiar enlace directo</span></button>
      </div>
      <div class="share-link"><input id="shareUrl" readonly aria-label="Enlace para compartir"></div>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>`);

    setTheme(localStorage.getItem('shop_theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
    $('#themeBtn').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    $('#shareCatBtn').onclick = S.shareCatalog;
    $('#cartBtn').onclick = () => { $('#cartDrawer').classList.add('open'); $('#overlay').classList.add('on'); };
    $('#cartClose').onclick = $('#overlay').onclick = closeAll;
    $$('[data-close]').forEach(b => b.onclick = closeAll);
    $('#menuBtn').onclick = () => {
      const o = $('#mobileMenu').classList.toggle('open');
      $('#menuBtn').setAttribute('aria-expanded', o);
    };
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
    $('#cartItems').onclick = e => {
      const b = e.target.closest('[data-q]');
      if (!b) return;
      const id = b.dataset.id;
      cart[id] = (cart[id] || 0) + Number(b.dataset.q);
      if (cart[id] <= 0) delete cart[id];
      persist();
      cartUI();
    };
    favUI();
    cartUI();
  };

  /* ---------- Tarjeta de producto compacta y limpia (sin especificaciones ni descripciones) ---------- */
  S.card = (p) => {
    const pct = S.pct(p);
    const fav = S.isFav(p.id);
    return `<article class="card">
      <a class="photo" href="/producto.html?id=${p.id}" aria-label="${S.esc(p.name)}">
        ${p.badge ? `<span class="badge">${S.esc(p.badge)}</span>` : ''}
        ${pct ? `<span class="badge off">-${pct}%</span>` : ''}
        <img class="${S.isReal(p) ? 'real' : ''}" src="${S.esc(S.img(p))}" alt="${S.esc(p.name)}" loading="lazy">
        ${p.stock ? '' : '<span class="soldout">Agotado</span>'}
      </a>
      <div class="card-body">
        <div class="label">${S.esc(p.brand || S.catName(p.cat))}</div>
        <a class="title" href="/producto.html?id=${p.id}">${S.esc(p.name)}</a>
        <div class="price">
          <span>${S.money(p.price)}</span>
          ${pct ? `<s>${S.money(p.old)}</s><span class="pct">-${pct}%</span>` : ''}
        </div>
      </div>
      <div class="card-action-bar">
        <button class="btn btn-dark btn-sm" data-act="add" data-id="${p.id}" ${p.stock ? '' : 'disabled'}>
          ${ico('plus')}<span>Agregar</span>
        </button>
        <a class="btn-icon wa" href="${S.waProduct(p)}" target="_blank" rel="noopener" aria-label="Consultar por WhatsApp" title="Consultar por WhatsApp">
          ${WA_SVG}
        </a>
        <button class="btn-icon" data-act="share" data-id="${p.id}" aria-label="Compartir enlace del producto" title="Compartir producto">
          ${ico('share')}
        </button>
        <button class="btn-icon hide-mobile ${fav ? 'on' : ''}" data-act="fav" data-id="${p.id}" aria-label="Guardar en favoritos" title="Guardar en favoritos">
          ${ico('heart')}
        </button>
      </div>
    </article>`;
  };

  /* ---------- Tarjeta especializada de Oferta con anclaje de ahorro ---------- */
  S.dealCard = (p) => {
    const pct = S.pct(p);
    const saved = p.old && p.old > p.price ? (p.old - p.price) : 0;
    const fav = S.isFav(p.id);
    return `<article class="card deal-card">
      <a class="photo" href="/producto.html?id=${p.id}" aria-label="${S.esc(p.name)}">
        <span class="badge off">${pct ? `-${pct}% OFF` : 'Oferta'}</span>
        ${saved > 0 ? `<span class="deal-save-pill">Ahorras ${S.money(saved)}</span>` : ''}
        <img class="${S.isReal(p) ? 'real' : ''}" src="${S.esc(S.img(p))}" alt="${S.esc(p.name)}" loading="lazy">
        ${p.stock ? '' : '<span class="soldout">Agotado</span>'}
      </a>
      <div class="card-body">
        <div class="label">${S.esc(p.brand || S.catName(p.cat))}</div>
        <a class="title" href="/producto.html?id=${p.id}">${S.esc(p.name)}</a>
        <div class="price">
          <span>${S.money(p.price)}</span>
          ${p.old ? `<s>${S.money(p.old)}</s>` : ''}
        </div>
      </div>
      <div class="card-action-bar">
        <button class="btn btn-dark btn-sm" data-act="add" data-id="${p.id}" ${p.stock ? '' : 'disabled'}>
          ${ico('plus')}<span>Agregar</span>
        </button>
        <a class="btn-icon wa" href="${S.waProduct(p)}" target="_blank" rel="noopener" aria-label="Pedir oferta por WhatsApp" title="Pedir oferta por WhatsApp">
          ${WA_SVG}
        </a>
        <button class="btn-icon" data-act="share" data-id="${p.id}" aria-label="Compartir oferta" title="Compartir oferta">
          ${ico('share')}
        </button>
        <button class="btn-icon hide-mobile ${fav ? 'on' : ''}" data-act="fav" data-id="${p.id}" aria-label="Guardar en favoritos" title="Guardar en favoritos">
          ${ico('heart')}
        </button>
      </div>
    </article>`;
  };

  S.bindCards = root => root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const p = S.products.find(x => x.id === b.dataset.id);
    if (!p) return;
    if (b.dataset.act === 'fav') {
      const on = S.toggleFav(p.id);
      b.classList.toggle('on', on);
      S.toast(on ? 'Guardado en tus favoritos' : 'Eliminado de favoritos');
    }
    if (b.dataset.act === 'share') S.shareProduct(p);
    if (b.dataset.act === 'add') S.addCart(p.id);
  });

  /* Arrastre con el mouse (drag-to-scroll) para carruseles horizontales */
  S.enableDragScroll = (track) => {
    if (!track) return;
    let isDown = false, startX = 0, scrollLeft = 0, moved = false;
    track.addEventListener('mousedown', e => {
      if (e.target.closest('button, a.btn, a.btn-icon')) return;
      isDown = true;
      moved = false;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    window.addEventListener('mouseup', () => {
      isDown = false;
      setTimeout(() => track.classList.remove('dragging'), 30);
    });
    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.35;
      if (Math.abs(walk) > 6) {
        moved = true;
        track.classList.add('dragging');
        e.preventDefault();
        track.scrollLeft = scrollLeft - walk;
      }
    });
    track.addEventListener('click', e => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);
  };
})();
