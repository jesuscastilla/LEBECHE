# Guía del dominio `corrientelebeche.es` (paraguas de proyectos Lebeche)

> Estado (2026-09-15): **el dominio ya resuelve en Internet.** Delegación publicada en el
> registro `.es` hacia Cloudflare (`lady`/`elliot.ns.cloudflare.com`); apex resolviendo a
> `79.112.15.97`; Web Station sirviendo `/lebeche/`, `/barrioteca/`, `/slims/` y la portada-hub
> desplegada en la raíz. **Pendiente:** certificado Let's Encrypt — bloqueado temporalmente
> por un límite de uso de LE; reintentar una sola vez tras ~3 h (ver sección 3).

`corrientelebeche.es` es el **dominio paraguas** de todos los proyectos digitales que
viven en `G:\GITHUB\` y se sirven desde el NAS Synology (`/volume1/web/`). La web de
Lebeche se publica en una **subruta** (no en un subdominio): `corrientelebeche.es/lebeche/`.

---

## 1. Arquitectura

```text
https://corrientelebeche.es/            → portada-hub de proyectos  (/volume1/web/index.html)
https://corrientelebeche.es/lebeche/    → web oficial de LEBECHE      (/volume1/web/lebeche/)
https://corrientelebeche.es/barrioteca/ → PWA Barrioteca Acalencá     (/volume1/web/barrioteca/)
https://corrientelebeche.es/slims/      → SLiMS (backend biblioteca)  (/volume1/web/slims/)
https://corrientelebeche.es/portfolio/  → Portfolio de Pelotxo        (/volume1/web/portfolio/, pendiente de subir)

DNS: Cloudflare (autoritativo) → CNAME a pelotxo.synology.me (DDNS Synology, TTL 240 s)
     → NAS (Web Station/Nginx) por IPv4 79.112.15.97 e IPv6 2a0c:5a80:3a07:a00:9209:d0ff:fe99:60ca.
```

La web de Lebeche usa **rutas relativas** (`css/…`, `data/*.json`, `assets/…`), así que
funciona igual servida en `/lebeche/` o en cualquier otra ruta: **no requiere cambios de código**.

---

## 2. DNS

### 2.1. Lo que tenía Hostalia (zona original, en desuso tras migrar a Cloudflare)

| Tipo | Nombre | Valor |
|------|--------|-------|
| `A` | `@` | `217.116.0.191` (luego `217.116.5.231`; servidor de parking/Basekit) |
| `A` | `www` | `217.116.0.191` (redirigía 301 al apex) |
| `MX` | `@` | `10 mx.corrientelebeche.es.` |
| `TXT` | `@` | `v=spf1 redirect=spf.dominioabsoluto.net` |
| `A` | `mx` / `imap` / `pop3` / `smtp` | `217.116.0.227` / `.237` / `.237` / `.228` |
| `NS` | `@` | `ns10/ns11/ns12.servicio-online.net` |

### 2.2. Configuración final en Cloudflare (plan Free)

| Tipo | Nombre | Contenido | Proxy | Notas |
|------|--------|-----------|-------|-------|
| `CNAME` | `@` | `pelotxo.synology.me` | ⚪ **DNS only** | Apex resuelve al NAS (A+AAAA); sirve las rutas |
| `CNAME` | `www` | `pelotxo.synology.me` | ⚪ **DNS only** | Ídem |
| `MX` | `@` (prio 10) | `mx.corrientelebeche.es` | — | Correo |
| `TXT` | `@` | `v=spf1 redirect=spf.dominioabsoluto.net` | — | SPF |
| `A` | `mx` | `217.116.0.227` | ⚪ | Correo |
| `A` | `imap` | `217.116.0.237` | ⚪ | Correo |
| `A` | `pop3` | `217.116.0.237` | ⚪ | Correo |
| `A` | `smtp` | `217.116.0.228` | ⚪ | Correo |

**Reglas:**
- ❌ No crear `AAAA` (el IPv6 llega vía CNAME aplanado, ya verificado alcanzable desde fuera).
- ⚪ El apex **NO** va en naranja (proxied): se probó y las Redirect Rules exigen proxy, lo
  que impediría servir `/lebeche/`, `/barrioteca/` y `/slims/` desde el NAS. En gris, el
  certificado lo pone el NAS con Let's Encrypt.
- ❌ No actives DNSSEC hasta que el dominio esté activo y resolviendo.
- NS en Hostalia (personalizados): `lady.ns.cloudflare.com` y `elliot.ns.cloudflare.com`.

---

## 3. Certificados

- **`corrientelebeche.es` + `www.corrientelebeche.es`** → Let's Encrypt en el NAS:
  *Panel de control → Seguridad → Certificado → Añadir → Obtener de Let's Encrypt*.
  Requisito: el dominio debe resolver al NAS (puerto 80 accesible — verificado).
- Asignar el certificado al **servicio Web Station** y activar la **renovación automática**.

> ⚠️ **Rate limit de Let's Encrypt (2026-09-15):** al reintentar varias veces antes de que el
> dominio resolviera, LE devolvió *"Too many registrations/certificates"*. No reintentar en
> bucle: esperar ~3 h desde el último intento, comprobar el puerto 80 desde fuera (móvil sin
> WiFi → `http://corrientelebeche.es/`) y reintentar **una sola vez**. `crt.sh` está vacío, así
> que no es un límite de "certificados ya emitidos", sino de solicitudes/intentos fallidos.

---

## 4. Web Station (NAS)

1. **Web Station → Portal web**: añadir los hostnames `corrientelebeche.es` y
   `www.corrientelebeche.es` al portal que ya sirve `pelotxo.synology.me`, o crear uno
   nuevo con la **misma configuración** (mismo perfil PHP).
2. **Raíz de documentos:** `/volume1/web/` (para que funcionen las subrutas).
3. Protocolos **HTTP 80 + HTTPS 443**, perfil **PHP 8.1+** (SLiMS necesita `mysqli`,
   `pdo_mysql`, `gd`, `curl`, `mbstring`, `intl`, `openssl`, `xml`, `zip`).
4. Portada raíz: `LEBECHE/hub/index.html` → `/volume1/web/index.html` (ya desplegado; la raíz responde 200).

## 5. Verificación

```bash
# Delegación (publicada 2026-09-15 → debe mostrar lady/elliot)
dig NS corrientelebeche.es @a.nic.es        # debe mostrar lady/elliot.ns.cloudflare.com

# Resolución
dig A  corrientelebeche.es @1.1.1.1          # 79.112.15.97
dig CNAME www.corrientelebeche.es @1.1.1.1   # pelotxo.synology.me

# Web
curl -I https://corrientelebeche.es/lebeche/        # 200
curl -I https://corrientelebeche.es/barrioteca/     # 200
curl -I https://corrientelebeche.es/slims/          # 200
curl -I https://www.corrientelebeche.es/            # 200
```

---

## 6. Solución de problemas

| Problema | Causa probable |
|----------|----------------|
| `NXDOMAIN` en todo (a.nic.es incluido) | Hostalia **no ha publicado el alta en el registro `.es`**. No es propagación: es el TLD el que dice "no existe". Reclamar a Hostalia. |
| Cloudflare "Pending Nameserver Update" | Normal hasta que el registro `.es` publique la delegación a `lady`/`elliot`. |
| Aviso de certificado en el apex | Verificar que el apex es DNS only (gris) y que el NAS tiene el cert de Let's Encrypt. |
| La raíz `/` da 403 | No hay `index.html` en `/volume1/web/`; subir la portada-hub. |
| `/slims/` da error 500 | El portal no usa el perfil PHP correcto (extensiones de SLiMS). |
| IPv6 no responde | Verificado alcanzable desde fuera (HTTP 200 por IPv6). Si cambiara, revisar el cortafuegos del router. |
| *"Too many registrations/certificates"* al pedir Let's Encrypt | Límite de uso de LE por intentos fallidos previos. NO reintentar en bucle: esperar ~3 h, comprobar el puerto 80 desde fuera (móvil sin WiFi → `http://corrientelebeche.es/`) y reintentar **una sola vez**. |

---

## 7. Seguridad (auditoría 2026-09-15)

Los siguientes scripts viven bajo `/volume1/web/` **sin autenticación** y, salvo que se
borren, quedan expuestos en el dominio nuevo:

| Script | Riesgo |
|--------|--------|
| `slims/importar-csv.php`, `slims/importar-isbns.php`, `slims/anadir-libro.php` | **Alto** — insertan libros en la BD, crean autores/editoriales, escriben ficheros. Cualquiera con la URL puede alterar el catálogo. |
| `slims/actualizar-metadatos.php` | **Alto** — modifica portadas/sinopsis de todos los libros (`?dry=1`). |
| `slims/diagnostico_isbn.php`, `barrioteca/diagnostico.php` | **Medio** — revelan rutas internas y estado de la API/Google Books. |
| `barrioteca/api-proxy.php` | **Por diseño** (público para la app), pero con CORS `*` + credenciales y enumeración de IDs de socia (`verify`). |
| `slims/oai.php` / `oai2.php` | Bajo — OAI-PMH deshabilitado por defecto. |
| `slims/chatserver.php` | Bajo/medio — servidor WebSocket de SLiMS; retirar si no se usa. |

> ⚠️ **No borrar todavía:** Pelotxo los borrará cuando acabe la importación. Mientras
> tanto, NO eliminar ni "proteger" estos scripts para no interrumpir la importación.

**Recomendación (cuando acabe la importación):** borrar del NAS los scripts de mantenimiento
(sus propios comentarios lo piden) o protegerlos con un token (`?key=…`) / sesión de SLiMS.

Los secretos (`api-config.php`, `sysconfig.inc.php`) están correctamente en `.gitignore`
y solo los lee PHP del lado servidor.

---

## 8. URLs hardcodeadas a migrar (gradual)

`pelotxo.synology.me` aparece hardcodeado en código de apps; no conviene cambiarlo de
golpe (obligaría a publicar nuevas versiones). Migrar **añadiendo** el dominio nuevo:

| Archivo | Referencias |
|---------|-------------|
| `barrioteca-android-app-v2/app/src/main/java/com/lebeche/barrioteca/data/SlmsApi.kt` | `:97` api-proxy |
| `barrioteca-android-app-v2/app/src/main/java/com/lebeche/barrioteca/data/Parsers.kt` | `:13`, `:40` imágenes |
| `barrioteca-ios/Barrioteca/Barrioteca/ContentView.swift` | `:5-6` appURL/appHost |
| `Portfolio-Pelotxo/index.html` | `:77`, `:117` enlaces en vivo |
| `Portfolio-Pelotxo/index-en.html` | `:77`, `:117` |
| `PWA/README.md`, `SLiMS/README.md`, `CONTEXT.md` | documentación |

> Regla del proyecto: "No hardcodear URLs de `pelotxo.synology.me` en el código".

---

## 9. Referencias

- Guía de despliegue en el NAS: `GUIA_NAS_SYNOLOGY_WEB_STATION.md`
- Portada-hub: `LEBECHE/hub/index.html` (→ `/volume1/web/index.html`)
- NAS: Web Station (Nginx 1.23.1) + PHP 8 + MariaDB · SSH `192.168.50.93`/`94` · DSM `https://pelotxo.synology.me:5001`

