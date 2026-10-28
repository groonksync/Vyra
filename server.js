/* Servidor de la tienda — Node 18+, sin dependencias externas.
   Uso: node server.js (puerto 3000 por defecto, o PORT=xxxx) */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const IS_VERCEL = !!process.env.VERCEL;
const SEED_DB_FILE = path.join(ROOT, 'data', 'db.json');
const DB_FILE = IS_VERCEL ? '/tmp/vyra-db.json' : SEED_DB_FILE;
const UPLOADS = IS_VERCEL ? '/tmp/uploads' : path.join(ROOT, 'uploads');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon'
};

/* ---------- Base de datos (archivo JSON) ---------- */
const hash = (pw, salt = crypto.randomBytes(16).toString('hex')) =>
  salt + ':' + crypto.scryptSync(pw, salt, 32).toString('hex');
const verify = (pw, stored) => {
  const [salt, h] = String(stored).split(':');
  const test = crypto.scryptSync(pw, salt, 32).toString('hex');
  return h && crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(test, 'hex'));
};

const seedProducts = [
  {
    name: 'Audífonos Studio Wireless ANC',
    sku: 'VYR-AUD-01',
    brand: 'SONIDO / ESTUDIO',
    cat: 'audio',
    art: 'headphone',
    price: 490,
    old: 590,
    cost: 290,
    badge: 'Más buscado',
    featured: true,
    specs: ['Cancelación activa híbrida', 'Batería de 38 horas', 'Audio sin pérdida USB-C'],
    variants: ['Negro Mate', 'Plata Lunar'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Cancelación activa de ruido de alta precisión, transductores de 40 mm y hasta 38 horas de autonomía continua con carga rápida USB-C.'
  },
  {
    name: 'Hub Multipuerto USB-C 8 en 1 Pro',
    sku: 'VYR-SET-02',
    brand: 'SETUP / CONECTIVIDAD',
    cat: 'setup',
    art: 'hub',
    price: 329,
    old: null,
    cost: 185,
    badge: 'Selección',
    featured: true,
    specs: ['HDMI 4K 60Hz', 'Power Delivery 100W', 'Chasis de aluminio'],
    variants: ['Gris Espacial'],
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Chasis de aluminio anodizado con salida HDMI 4K 60Hz, entrega de potencia PD 100W, lector SD/TF de alta velocidad y puertos USB 3.2.'
  },
  {
    name: 'Cargador Rápido GaN USB-C 65W',
    sku: 'VYR-NRG-03',
    brand: 'ENERGÍA / CARGA RÁPIDA',
    cat: 'carga',
    art: 'charger',
    price: 219,
    old: 259,
    cost: 120,
    badge: 'Oferta',
    featured: true,
    specs: ['Tecnología GaN II', '3 puertos simultáneos', 'Protección térmica'],
    variants: ['Grafito', 'Blanco Mate'],
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Tecnología de nitruro de galio (GaN) de última generación. Carga simultáneamente tu laptop, tablet y smartphone en un cuerpo ultracompacto.'
  },
  {
    name: 'Smartphone Edge Pro 256 GB',
    sku: 'VYR-MOV-04',
    brand: 'MÓVIL / FLAGSHIP',
    cat: 'moviles',
    art: 'phone',
    price: 3890,
    old: 4250,
    cost: 2950,
    badge: 'Nuevo',
    featured: true,
    specs: ['Pantalla OLED 120Hz', '256 GB almacenamiento', 'Triple cámara 50 MP'],
    variants: ['Titanio Oscuro', 'Arena'],
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Pantalla OLED de 120 Hz sin bordes, sistema triple de cámaras con sensor principal de 50 MP y acabado en cristal mate de alta resistencia.'
  },
  {
    name: 'Auriculares TWS Air Compact',
    sku: 'VYR-AUD-05',
    brand: 'SONIDO / INALÁMBRICO',
    cat: 'audio',
    art: 'earbuds',
    price: 289,
    old: 340,
    cost: 155,
    badge: 'Destacado',
    featured: true,
    specs: ['Estuche MagSafe', '24h de autonomía total', 'Resistencia IPX4'],
    variants: ['Blanco', 'Negro'],
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Diseño ergonómico ultraligero con aislamiento acústico pasivo, micrófonos duales para llamadas claras y estuche de carga de bolsillo.'
  },
  {
    name: 'Laptop Ultrabook Studio 14"',
    sku: 'VYR-SET-06',
    brand: 'SETUP / CÓMPUTO',
    cat: 'setup',
    art: 'laptop',
    price: 5490,
    old: null,
    cost: 4300,
    badge: 'Edición Pro',
    featured: true,
    specs: ['Pantalla 14" Retina', '16 GB RAM / 512 GB SSD', 'Chasis unibody'],
    variants: ['Plata', 'Gris Espacial'],
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Arquitectura silenciosa de alto rendimiento, pantalla Retina calibrada de fábrica y batería para toda la jornada profesional.'
  },
  {
    name: 'Batería Magnética 10.000 mAh',
    sku: 'VYR-NRG-07',
    brand: 'ENERGÍA / PORTÁTIL',
    cat: 'carga',
    art: 'powerbank',
    price: 269,
    old: 315,
    cost: 145,
    badge: 'Favorito',
    featured: true,
    specs: ['Capacidad 10.000 mAh', 'Carga inalámbrica 15W', 'USB-C PD 20W'],
    variants: ['Negro', 'Verde Salvia'],
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Acoplamiento magnético instantáneo y puerto bidireccional USB-C de 20W. Recarga segura sin cables en cualquier lugar.'
  },
  {
    name: 'Teclado Mecánico Low-Profile',
    sku: 'VYR-SET-08',
    brand: 'SETUP / PERIFÉRICOS',
    cat: 'setup',
    art: 'keyboard',
    price: 610,
    old: 690,
    cost: 370,
    badge: null,
    featured: true,
    specs: ['Switches táctiles', 'Bluetooth 5.1 + USB-C', 'Aluminio CNC'],
    variants: ['Antracita'],
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Switches táctiles silenciosos, estructura de aluminio mecanizado y conexión multipunto Bluetooth + receptor 2.4 GHz.'
  },
  {
    name: 'Smartwatch Active Titanium',
    sku: 'VYR-MOV-09',
    brand: 'MÓVIL / WEARABLES',
    cat: 'moviles',
    art: 'watch',
    price: 685,
    old: 799,
    cost: 410,
    badge: 'Oferta',
    featured: true,
    specs: ['Cristal de zafiro', 'GPS multibanda', 'Sumergible 5 ATM'],
    variants: ['Titanio Natural', 'Negro'],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Caja de aleación ligera con cristal de zafiro, monitoreo continuo de salud, GPS integrado y resistencia al agua 5 ATM.'
  },
  {
    name: 'Altavoz Acústico Bluetooth Mini',
    sku: 'VYR-AUD-10',
    brand: 'SONIDO / PORTÁTIL',
    cat: 'audio',
    art: 'speaker',
    price: 399,
    old: null,
    cost: 220,
    badge: null,
    featured: false,
    specs: ['Sonido 360 grados', 'Protección IP67', '16 horas de música'],
    variants: ['Carbón', 'Arena'],
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Sonido omnidireccional de 360 grados con radiador pasivo de graves profundos y acabado textil impermeable.'
  },
  {
    name: 'Estación de Carga GaN de Viaje',
    sku: 'VYR-NRG-11',
    brand: 'ENERGÍA / VIAJES',
    cat: 'carga',
    art: 'charger',
    price: 189,
    old: 230,
    cost: 95,
    badge: null,
    featured: false,
    specs: ['Clavijas plegables', 'Ultradelgado 14mm', 'Carga rápida PD'],
    variants: ['Gris Plata'],
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Diseño ultradelgado con clavijas abatibles y protección térmica inteligente para viajes internacionales.'
  },
  {
    name: 'Soporte y Hub de Escritorio Pro',
    sku: 'VYR-SET-12',
    brand: 'SETUP / ESTACIÓN',
    cat: 'setup',
    art: 'hub',
    price: 449,
    old: 499,
    cost: 260,
    badge: 'Edición Pro',
    featured: false,
    specs: ['Ergonomía ajustable', '7 puertos integrados', 'Soporta hasta 17"'],
    variants: ['Plata', 'Negro'],
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=85'
    ],
    desc: 'Eleva tu estación de trabajo con conectividad completa integrada y gestión limpia de cables.'
  }
];

function defaultDb() {
  const now = Date.now();
  return {
    settings: {
      storeName: 'Vyra.sc',
      currency: 'Bs',
      whatsapp: '59170000000',
      announcement: 'SELECCIÓN DE TECNOLOGÍA ESENCIAL · ENVÍOS A TODO EL PAÍS · ATENCIÓN DIRECTA',
      /* Portada principal */
      heroBadge: 'CURADURÍA TECNOLÓGICA / VOL. 03',
      heroTitle: 'Lo nuevo',
      heroAccent: 'se siente.',
      heroText: 'Tecnología que se integra a tu estilo. Objetos esenciales de diseño limpio, alto rendimiento y compra directa.',
      heroImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
      heroCta: 'Explorar catálogo',
      heroCta2: 'Atención en línea',
      /* Tarjetas laterales de portada */
      heroSide1Sub: '01 — SIEMPRE CONTIGO',
      heroSide1Title: 'Conecta con lo que viene.',
      heroSide1Btn: 'Ver colección',
      heroSide1Link: '/catalogo.html?cat=moviles',
      heroSide1Bg: '#e5e2f2',
      heroSide1Image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85',
      heroSide2Sub: '02 — MÁS ENERGÍA',
      heroSide2Title: 'Pequeño. Poderoso.',
      heroSide2Btn: 'Ver colección',
      heroSide2Link: '/catalogo.html?cat=carga',
      heroSide2Bg: '#ebe5dc',
      heroSide2Image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=85',
      /* Encabezados de secciones */
      sec1Eyebrow: '01 / Universos de producto',
      sec1Title: 'Explora por',
      sec1Accent: 'categoría.',
      sec2Eyebrow: '02 / Selección de la semana',
      sec2Title: 'Piezas que',
      sec2Accent: 'destacan.',
      sec3Eyebrow: '03 / Selección en tendencia',
      sec3Title: 'Los más',
      sec3Accent: 'destacados.',
      sec4Eyebrow: '04 / Diseño funcional',
      sec4Title: 'Un estilo de vida',
      sec4Accent: 'digital.',
      sec4Sub: 'Equipamiento pensado para integrarse con naturalidad a tu espacio de trabajo, estudio o viaje.',
      /* Bloques Editoriales (Estilo de vida) */
      ed1Eyebrow: 'ACÚSTICA DE PRECISIÓN',
      ed1Title: 'Tu espacio. Tu sonido.',
      ed1Text: 'Aislamiento superior y fidelidad acústica para concentrarte en lo que importa.',
      ed1Btn: 'Explorar audio',
      ed1Link: '/catalogo.html?cat=audio',
      ed1Image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
      ed2Eyebrow: 'ESTACIÓN DE TRABAJO',
      ed2Title: 'Todo listo. Adonde vayas.',
      ed2Text: 'Conectividad multipuerto, carga rápida GaN y periféricos diseñados para rendir al máximo.',
      ed2Btn: 'Explorar productividad',
      ed2Link: '/catalogo.html?cat=setup',
      ed2Image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85',
      /* Pasos de compra */
      stepsEyebrow: '05 / Experiencia directa',
      stepsTitle: 'Compra simple en',
      stepsAccent: 'tres pasos.',
      stepsSub: 'Sin registros complejos ni formularios interminables. Atención personalizada de principio a fin.',
      steps: [
        { num: 'PASO 01', title: 'Explora y selecciona', text: 'Navega por el catálogo, revisa especificaciones detalladas y agrega tus productos al pedido o guarda tus favoritos.' },
        { num: 'PASO 02', title: 'Confirma por WhatsApp', text: 'Con un solo clic se genera el resumen de tu pedido o consulta directa hacia nuestro canal oficial de WhatsApp.' },
        { num: 'PASO 03', title: 'Recibe tu pedido', text: 'Coordinamos el método de pago y el envío inmediato a tu domicilio o ciudad con seguimiento directo.' }
      ],
      /* Banner de cierre */
      promoEyebrow: 'ATENCIÓN PERSONALIZADA',
      promoTitle: '¿Buscas un producto o cotización especial?',
      promoText: 'Escríbenos directamente a nuestro WhatsApp para enviarte disponibilidad inmediata, fotos reales y opciones de entrega.',
      promoBtn1: 'Comunicarse por WhatsApp',
      promoBtn2: 'Ver catálogo completo',
      /* Colores y redes */
      accent: '#d9f059',
      instagram: '',
      facebook: '',
      tiktok: '',
      address: 'Bolivia · Envíos nacionales',
      footerText: 'Objetos inteligentes para un mundo en movimiento. Curaduría de tecnología, audio, energía y productividad.',
      benefits: [
        { icon: 'bolt', title: 'Atención inmediata', text: 'Asesoría y pedidos en tiempo real por WhatsApp.' },
        { icon: 'shield', title: 'Calidad verificada', text: 'Productos seleccionados con garantía real.' },
        { icon: 'truck', title: 'Envío seguro', text: 'Entregas rápidas en tu ciudad y a todo el país.' },
        { icon: 'spark', title: 'Diseño contemporáneo', text: 'Piezas pensadas para durar y destacar.' }
      ]
    },
    categories: [
      { id: 'audio', name: 'Sonido', subtitle: 'Haz que cada nota cuente.', cta: 'Explorar', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85' },
      { id: 'carga', name: 'Energía', subtitle: 'Potencia compacta sin límites.', cta: 'Explorar', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=85' },
      { id: 'moviles', name: 'Móvil', subtitle: 'Siempre conectado.', cta: 'Explorar', image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=85' },
      { id: 'setup', name: 'Productividad', subtitle: 'Un mejor espacio. Un mejor día.', cta: 'Explorar', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85' }
    ],
    products: seedProducts.map((p, i) => ({
      id: String(i + 1), images: [], specs: [], variants: [], cost: 0, waCustom: '', stock: true, visible: true, featured: false, createdAt: now - i * 1000, ...p
    })),
    admin: { password: hash('admin123'), defaultPassword: true },
    sessions: {}
  };
}

let db;
function load() {
  try {
    const srcFile = fs.existsSync(DB_FILE) ? DB_FILE : SEED_DB_FILE;
    db = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
    const def = defaultDb();
    db.settings = { ...def.settings, ...db.settings };
    if (!db.settings.storeName || db.settings.storeName.toLowerCase() === 'vyra') db.settings.storeName = 'Vyra.sc';
    if (!Array.isArray(db.settings.steps) || db.settings.steps.length < 3) db.settings.steps = def.settings.steps;
    if (!Array.isArray(db.settings.benefits) || db.settings.benefits.length < 4) db.settings.benefits = def.settings.benefits;
    db.categories = (db.categories || def.categories).map((c, idx) => ({
      cta: 'Explorar',
      ...(def.categories[idx] || {}),
      ...c
    }));
    db.products = (db.products || []).map((p, idx) => {
      const seed = def.products[idx] || {};
      return {
        ...p,
        specs: (Array.isArray(p.specs) && p.specs.length) ? p.specs : (seed.specs || []),
        variants: (Array.isArray(p.variants) && p.variants.length) ? p.variants : (seed.variants || []),
        sku: p.sku || seed.sku || `VYR-0${idx + 1}`,
        cost: p.cost || seed.cost || 0,
        waCustom: p.waCustom || ''
      };
    });
    save();
  } catch {
    db = defaultDb();
    save();
  }
}
function save() {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
    fs.renameSync(tmp, DB_FILE);
  } catch {}
}

/* ---------- Utilidades HTTP ---------- */
const send = (res, code, data, headers = {}) => {
  const body = typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(body);
};
const readBody = (req, limit = 12 * 1024 * 1024) => new Promise((resolve, reject) => {
  let size = 0; const chunks = [];
  req.on('data', c => { size += c.length; if (size > limit) { reject(new Error('Archivo demasiado grande')); req.destroy(); } else chunks.push(c); });
  req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks)) : {}); } catch { reject(new Error('JSON inválido')); } });
});
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, max = 400) => String(v ?? '').trim().slice(0, max);
const num = v => (v === null || v === '' || v === undefined || isNaN(Number(v)) ? null : Math.max(0, Number(v)));

const makeToken = () => {
  const exp = Date.now() + 30 * 24 * 3600e3;
  const sig = crypto.createHmac('sha256', db.admin.password).update(String(exp)).digest('hex');
  return `${exp}.${sig}`;
};

const authed = req => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  if (!t) return null;
  const s = db.sessions[t];
  if (s && s > Date.now()) return t;
  const [expStr, sig] = t.split('.');
  const exp = Number(expStr);
  if (exp && sig && exp > Date.now()) {
    const expected = crypto.createHmac('sha256', db.admin.password).update(expStr).digest('hex');
    if (expected.length === sig.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return t;
  }
  if (s) { delete db.sessions[t]; }
  return null;
};

const isValidImg = u => typeof u === 'string' && (/^\/uploads\/[\w.-]+$/.test(u) || /^https?:\/\//.test(u) || /^data:image\/(png|jpeg|webp);base64,/.test(u));

const sanitizeProduct = (b, prev = {}) => {
  const images = Array.isArray(b.images) ? b.images.filter(isValidImg).slice(0, 8) : (prev.images || []);
  const specs = Array.isArray(b.specs) ? b.specs.map(s => clean(s, 90)).filter(Boolean).slice(0, 8) : (prev.specs || []);
  const variants = Array.isArray(b.variants) ? b.variants.map(s => clean(s, 40)).filter(Boolean).slice(0, 8) : (prev.variants || []);
  return {
    ...prev,
    name: clean(b.name, 120) || prev.name || 'Producto',
    sku: clean(b.sku, 40) || prev.sku || '',
    cat: clean(b.cat, 40) || prev.cat || '',
    brand: clean(b.brand, 80),
    desc: clean(b.desc, 2000),
    price: num(b.price) ?? 0,
    old: num(b.old),
    cost: num(b.cost) ?? prev.cost ?? 0,
    badge: clean(b.badge, 30) || null,
    art: clean(b.art, 20) || prev.art || 'headphone',
    images,
    specs,
    variants,
    waCustom: clean(b.waCustom, 300),
    stock: b.stock !== false,
    visible: b.visible !== false,
    featured: !!b.featured
  };
};

/* ---------- API ---------- */
async function api(req, res, url) {
  const route = req.method + ' ' + url.pathname;

  if (route === 'GET /api/store') {
    return send(res, 200, {
      settings: db.settings, categories: db.categories,
      products: db.products.filter(p => p.visible)
    }, { 'Cache-Control': 'no-store' });
  }
  if (route === 'POST /api/login') {
    const b = await readBody(req, 4096);
    const rawPw = String(b.password || '').trim();
    if (!verify(rawPw, db.admin.password)) {
      return send(res, 401, { error: 'Contraseña incorrecta' });
    }
    const token = makeToken();
    db.sessions[token] = Date.now() + 30 * 24 * 3600e3; save();
    return send(res, 200, { token, defaultPassword: !!db.admin.defaultPassword });
  }

  if (!url.pathname.startsWith('/api/admin/')) return send(res, 404, { error: 'No encontrado' });
  const token = authed(req);
  if (!token) return send(res, 401, { error: 'Sesión no válida' });

  if (route === 'GET /api/admin/store') return send(res, 200, { settings: db.settings, categories: db.categories, products: db.products, defaultPassword: !!db.admin.defaultPassword });
  if (route === 'POST /api/admin/logout') { delete db.sessions[token]; save(); return send(res, 200, { ok: true }); }

  if (route === 'POST /api/admin/password') {
    const b = await readBody(req, 4096);
    if (!verify(String(b.current || ''), db.admin.password)) return send(res, 400, { error: 'La contraseña actual no coincide' });
    if (String(b.next || '').length < 8) return send(res, 400, { error: 'Mínimo 8 caracteres' });
    db.admin = { password: hash(String(b.next)) }; save();
    return send(res, 200, { ok: true });
  }

  if (route === 'POST /api/admin/products') {
    const b = await readBody(req);
    const p = { id: crypto.randomBytes(5).toString('hex'), createdAt: Date.now(), ...sanitizeProduct(b) };
    db.products.unshift(p); save(); return send(res, 201, p);
  }

  if (route === 'POST /api/admin/bulk') {
    const b = await readBody(req);
    const ids = Array.isArray(b.ids) && b.ids.length ? new Set(b.ids) : null;
    const cat = b.cat || '';
    const act = b.action;
    const val = Number(b.value) || 0;
    db.products.forEach(p => {
      if (ids && !ids.has(p.id)) return;
      if (cat && p.cat !== cat) return;
      if (act === 'discount' && val > 0 && val < 100) {
        const base = p.old && p.old > p.price ? p.old : p.price;
        p.old = base;
        p.price = Math.round(base * (100 - val)) / 100;
      } else if (act === 'restore') {
        if (p.old && p.old > p.price) { p.price = p.old; p.old = null; }
      } else if (act === 'show') {
        p.visible = true;
      } else if (act === 'hide') {
        p.visible = false;
      } else if (act === 'stock_in') {
        p.stock = true;
      } else if (act === 'stock_out') {
        p.stock = false;
      } else if (act === 'feature_all') {
        p.featured = true;
      }
    });
    save();
    return send(res, 200, { products: db.products });
  }

  if (route === 'POST /api/admin/import') {
    const b = await readBody(req);
    if (Array.isArray(b.products)) {
      db.products = b.products.map((p, i) => ({
        id: clean(p.id, 30) || crypto.randomBytes(5).toString('hex'),
        createdAt: Number(p.createdAt) || (Date.now() - i * 1000),
        ...sanitizeProduct(p)
      }));
    }
    if (Array.isArray(b.categories)) {
      db.categories = b.categories.slice(0, 20).map(c => ({
        id: clean(c.id, 30).toLowerCase().replace(/[^a-z0-9-]/g, '') || crypto.randomBytes(3).toString('hex'),
        name: clean(c.name, 40) || 'Categoría',
        subtitle: clean(c.subtitle, 80) || '',
        cta: clean(c.cta, 40) || 'Explorar',
        image: (/^\/uploads\/[\w.-]+$/.test(c.image) || /^https?:\/\//.test(c.image)) ? c.image : ''
      }));
    }
    save();
    return send(res, 200, { products: db.products, categories: db.categories });
  }

  let m = url.pathname.match(/^\/api\/admin\/products\/([\w-]+)$/);
  if (m) {
    const i = db.products.findIndex(p => p.id === m[1]);
    if (i < 0) return send(res, 404, { error: 'Producto no existe' });
    if (req.method === 'PUT') { db.products[i] = sanitizeProduct(await readBody(req), db.products[i]); save(); return send(res, 200, db.products[i]); }
    if (req.method === 'DELETE') { db.products.splice(i, 1); save(); return send(res, 200, { ok: true }); }
  }

  if (route === 'PUT /api/admin/settings') {
    const b = await readBody(req);
    const s = db.settings;
    const str = [
      'storeName', 'currency', 'announcement',
      'heroBadge', 'heroTitle', 'heroAccent', 'heroText', 'heroCta', 'heroCta2',
      'heroSide1Title', 'heroSide1Sub', 'heroSide1Btn', 'heroSide1Link',
      'heroSide2Title', 'heroSide2Sub', 'heroSide2Btn', 'heroSide2Link',
      'sec1Eyebrow', 'sec1Title', 'sec1Accent',
      'sec2Eyebrow', 'sec2Title', 'sec2Accent',
      'sec3Eyebrow', 'sec3Title', 'sec3Accent',
      'sec4Eyebrow', 'sec4Title', 'sec4Accent', 'sec4Sub',
      'ed1Eyebrow', 'ed1Title', 'ed1Text', 'ed1Btn', 'ed1Link',
      'ed2Eyebrow', 'ed2Title', 'ed2Text', 'ed2Btn', 'ed2Link',
      'stepsEyebrow', 'stepsTitle', 'stepsAccent', 'stepsSub',
      'promoEyebrow', 'promoTitle', 'promoText', 'promoBtn1', 'promoBtn2',
      'instagram', 'facebook', 'tiktok', 'address', 'footerText'
    ];
    str.forEach(k => { if (k in b) s[k] = clean(b[k], 400); });
    if ('whatsapp' in b) s.whatsapp = clean(b.whatsapp, 20).replace(/\D/g, '');
    ['accent', 'heroSide1Bg', 'heroSide2Bg'].forEach(colKey => {
      if (colKey in b && /^#[0-9a-f]{6}$/i.test(b[colKey])) s[colKey] = b[colKey];
    });
    ['heroImage', 'heroSide1Image', 'heroSide2Image', 'ed1Image', 'ed2Image'].forEach(imgKey => {
      if (imgKey in b && (isValidImg(b[imgKey]) || b[imgKey] === '')) {
        s[imgKey] = b[imgKey];
      }
    });
    if (Array.isArray(b.benefits)) {
      s.benefits = b.benefits.slice(0, 4).map(x => ({ icon: clean(x.icon, 20), title: clean(x.title, 60), text: clean(x.text, 160) }));
    }
    if (Array.isArray(b.steps)) {
      s.steps = b.steps.slice(0, 3).map(x => ({ num: clean(x.num, 20), title: clean(x.title, 60), text: clean(x.text, 220) }));
    }
    save();
    return send(res, 200, s);
  }
  if (route === 'PUT /api/admin/categories') {
    const b = await readBody(req);
    if (!Array.isArray(b.categories)) return send(res, 400, { error: 'Datos inválidos' });
    db.categories = b.categories.slice(0, 20).map(c => ({
      id: clean(c.id, 30).toLowerCase().replace(/[^a-z0-9-]/g, '') || crypto.randomBytes(3).toString('hex'),
      name: clean(c.name, 40) || 'Categoría',
      subtitle: clean(c.subtitle, 80) || '',
      cta: clean(c.cta, 40) || 'Explorar',
      image: isValidImg(c.image) ? c.image : ''
    }));
    save();
    return send(res, 200, db.categories);
  }
  if (route === 'POST /api/admin/upload') {
    const b = await readBody(req);
    const mm = /^data:image\/(png|jpeg|webp);base64,(.+)$/.exec(b.data || '');
    if (!mm) return send(res, 400, { error: 'Imagen no válida (usa JPG, PNG o WebP)' });
    if (IS_VERCEL) {
      return send(res, 201, { url: b.data });
    }
    const ext = mm[1] === 'jpeg' ? 'jpg' : mm[1];
    const name = Date.now().toString(36) + crypto.randomBytes(4).toString('hex') + '.' + ext;
    fs.mkdirSync(UPLOADS, { recursive: true });
    fs.writeFileSync(path.join(UPLOADS, name), Buffer.from(mm[2], 'base64'));
    return send(res, 201, { url: '/uploads/' + name });
  }
  return send(res, 404, { error: 'No encontrado' });
}

/* ---------- Páginas con metadatos para compartir (Open Graph) ---------- */
function productPage(url, req) {
  let html = fs.readFileSync(path.join(PUBLIC, 'producto.html'), 'utf8');
  const p = db.products.find(x => x.id === url.searchParams.get('id') && x.visible);
  const origin = (req.headers['x-forwarded-proto'] || 'http') + '://' + req.headers.host;
  const s = db.settings;
  const title = p ? `${p.name} — ${s.currency} ${p.price} | ${s.storeName}` : s.storeName;
  const desc = p ? (p.desc || 'Mira este producto en nuestro catálogo').slice(0, 160) : 'Catálogo de productos';
  const rawImg = p && p.images && p.images[0] ? p.images[0] : '';
  const img = rawImg ? (rawImg.startsWith('http') ? rawImg : origin + rawImg) : '';
  const og = `<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="product">` +
    (img ? `<meta property="og:image" content="${esc(img)}"><meta name="twitter:card" content="summary_large_image">` : '');
  return html.replace('<!--OG-->', og);
}

/* ---------- Servidor ---------- */
function serveStatic(res, file) {
  try {
    const data = fs.readFileSync(file);
    const ext = path.extname(file).toLowerCase();
    send(res, 200, data, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': file.startsWith(UPLOADS) ? 'public, max-age=604800' : 'no-cache'
    });
  } catch {
    send(res, 404, 'No encontrado', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
}

async function handleRequest(req, res) {
  try {
    const url = new URL(req.url, 'http://localhost');
    const rewritten = url.searchParams.get('__path');
    if (rewritten) {
      url.pathname = rewritten.startsWith('/') ? rewritten : '/' + rewritten;
      url.searchParams.delete('__path');
    }
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (url.pathname === '/producto.html' || url.pathname === '/producto') return send(res, 200, productPage(url, req), { 'Content-Type': MIME['.html'] });

    let rel = decodeURIComponent(url.pathname);
    if (rel === '/') rel = '/index.html';
    if (rel === '/catalogo' || rel === '/admin') rel += '.html';
    const base = rel.startsWith('/uploads/') ? UPLOADS : PUBLIC;
    const file = path.normalize(path.join(base, rel.replace(/^\/uploads\//, '')));
    if (!file.startsWith(base)) return send(res, 403, 'Prohibido', { 'Content-Type': 'text/plain' });
    serveStatic(res, file);
  } catch (e) {
    send(res, 500, { error: e.message || 'Error interno' });
  }
}

load();

if (require.main === module) {
  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`\n  Tienda:   http://localhost:${PORT}`);
    console.log(`  Catálogo: http://localhost:${PORT}/catalogo`);
    console.log(`  Panel:    http://localhost:${PORT}/admin`);
    if (db.admin.defaultPassword) console.log('  Contraseña inicial del panel: admin123  (cámbiala al entrar)\n');
  });
}

module.exports = handleRequest;
