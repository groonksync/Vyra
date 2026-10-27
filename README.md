# Tienda en línea

Sin dependencias. Requiere Node 18+.

```bash
cd Shop/tienda
node server.js        # http://localhost:3000
```

- Tienda: `/` · Catálogo: `/catalogo` · Producto: `/producto.html?id=…`
- Panel privado: `/admin` (contraseña inicial `admin123`, cámbiala en Seguridad).
- Datos en `data/db.json`, fotos subidas en `uploads/` (respáldalos).
- Para publicarla necesita un hosting con Node (Render, Railway, VPS). Define `PORT` si hace falta.
- Primer paso: en el panel → Mi sitio, pon tu número de WhatsApp (con código de país, ej. 59171234567).
