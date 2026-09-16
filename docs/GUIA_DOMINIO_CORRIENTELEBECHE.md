# Guía del dominio `corrientelebeche.es` (paraguas de proyectos Lebeche)

> Estado (2026-09-16): **dominio en producción con HTTPS.** Delegación en Cloudflare; apex y
> `www` en **Proxied** → certificado **Universal SSL de Cloudflare (Google Trust Services)**,
> válido y auto-renovable, cubre `corrientelebeche.es` y `*.corrientelebeche.es`. Web Station
> sirve `/lebeche/`, `/barrioteca/`, `/slims/` (la raíz redirige 301 a `/lebeche/`). **Origin Certificate de
> Cloudflare instalado en el NAS y modo SSL/TLS `Full (strict)` activo.** Let's Encrypt del
> NAS descartado (rate limit). **Canónico `www`** (apex → 301 → www). La programación permite
> añadir cada evento al calendario (`.ics` + Google Calendar), con hora de inicio y fin.

`corrientelebeche.es` es el **dominio paraguas** de todos los proyectos digitales que
viven en `G:\GITHUB\` y se sirven desde el NAS Synology (`/volume1/web/`). La web de
Lebeche se publica en una **subruta** (no en un subdominio): `www.corrientelebeche.es/lebeche/`.

---

## 1. Arquitectura

```text
https://www.corrientelebeche.es/            → 301 → /lebeche/  (/volume1/web/index.php)
https://www.corrientelebeche.es/lebeche/    → web oficial de LEBECHE      (/volume1/web/lebeche/)
https://www.corrientelebeche.es/barrioteca/ → PWA Barrioteca Acalencá     (/volume1/web/barrioteca/)
https://www.corrientelebeche.es/slims/      → SLiMS (backend biblioteca)  (/volume1/web/slims/)
https://www.corrientelebeche.es/portfolio/  → Portfolio de Pelotxo        (/volume1/web/portfolio/, pendiente de subir)

DNS: Cloudflare (autoritativo, proxied en apex/www) → CNAME a pelotxo.synology.me (DDNS, TTL 240 s)
     → NAS (Web Station/Nginx) por IPv4 79.112.15.97 e IPv6 2a0c:5a80:3a07:a00:9209:d0ff:fe99:60ca.
     HTTPS: certificado Universal SSL de Cloudflare en el edge (no en el NAS).
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
| `CNAME` | `@` | `pelotxo.synology.me` | 🟠 **Proxied** | Certificado de Cloudflare en el edge; reenvía al NAS |
| `CNAME` | `www` | `pelotxo.synology.me` | 🟠 **Proxied** | Ídem |
| `MX` | `@` (prio 10) | `mx.corrientelebeche.es` | — | Correo |
| `TXT` | `@` | `v=spf1 redirect=spf.dominioabsoluto.net` | — | SPF |
| `A` | `mx` | `217.116.0.227` | ⚪ | Correo |
| `A` | `imap` | `217.116.0.237` | ⚪ | Correo |
| `A` | `pop3` | `217.116.0.237` | ⚪ | Correo |
| `A` | `smtp` | `217.116.0.228` | ⚪ | Correo |

**Reglas:**
- 🟠 El apex y `www` van **Proxied** (naranja) → el certificado lo sirve Cloudflare (edge).
- ⚪ El **correo** (`MX`, `TXT`, `A mx/imap/pop3/smtp`) se queda en **DNS only (gris)**.
- SSL/TLS en Cloudflare: modo **Full** (no `Full (strict)`: el origen solo tiene el certificado de `pelotxo.synology.me` → daría error 526).
- No activar DNSSEC todavía.
- NS en Hostalia (personalizados): `lady.ns.cloudflare.com` y `elliot.ns.cloudflare.com`.

---

## 3. Certificados

- **HTTPS = Cloudflare Universal SSL** (emisor *Google Trust Services*), emitido y renovado
  automáticamente por Cloudflare. Cubre `corrientelebeche.es` y `*.corrientelebeche.es`.
  **No hace falta certificado en el NAS** para estos nombres.
- **SSL/TLS → modo `Full (strict)`** (con el *Cloudflare Origin Certificate* instalado en el NAS, ver 3.2).
- El certificado de **Let's Encrypt del NAS quedó descartado**: LE devolvía *rate limit*
  (error `5503` en DSM) por reintentos previos; con el proxy de Cloudflare ya no es necesario.

### 3.1. Cache Rules (toda la web sin caché)

Con el proxy activo, Cloudflare cachea estáticos (CSS/JS/imágenes) por defecto. Como toda
la web es dinámica (PHP, JSON y estáticos editados a mano), lo más simple es **no cachear
nada** del dominio. Crear **una única Cache Rule** que cubre apex y `www`:

- **Caching → Cache Rules → Create rule**
- **Nombre:** `No cache (toda la web)`
- **When incoming requests match → Custom filter expression:**
  `(http.host eq "corrientelebeche.es" or http.host eq "www.corrientelebeche.es")`
- **Then → Eligible for cache → Bypass cache**

> Sustituye a la regla anterior de `/lebeche/` (puedes borrarla). Con "Bypass cache",
> cualquier cambio en `/volume1/web/…` se ve al instante. Si algún día quieres cachear
> algo concreto (logos/imágenes), se añade una regla específica después de esta.

### 3.2. Cloudflare Origin Certificate — ✅ instalado (2026-09-16)

> Hecho: *Origin Certificate* importado en DSM, asignado a **Web Station** y modo `Full (strict)`
> activo. Pasos que se siguieron (por si hay que regenerarlo):

Con el modo `Full` ya funcionaba, pero no validaba el origen. Para validarlo (más seguro),
instalar un *Origin Certificate* de Cloudflare en el NAS y cambiar a `Full (strict)`:

1. **Cloudflare → SSL/TLS → Origin Server → Create Certificate**.
   - Hostnames: `corrientelebeche.es` y `*.corrientelebeche.es` · Validez: 15 años · Formato **PEM**.
   - Copia el **Origin Certificate** y la **Private Key** (se muestran una sola vez; si se pierden, genera otro).
2. **DSM → Panel de control → Seguridad → Certificado → Añadir → Agregar certificado** (importar):
   - Descripción: `Cloudflare Origin`
   - **Clave privada**: pega la *Private Key*.
   - **Certificado**: pega el *Origin Certificate*.
   - **Certificado intermedio**: pega el *Cloudflare Origin CA — RSA Root* (Cloudflare lo da en la misma página; si DSM guarda sin él, sigue).
   - Guardar.
3. **Certificado → Configuración**: asigna `Cloudflare Origin` al servicio **Web Station** (`corrientelebeche.es:80/443`).
4. **Cloudflare → SSL/TLS → Overview → Full (strict)**.

> El *Origin Certificate* va ligado al **dominio**, no a la IP: los cambios de IP doméstica
> no le afectan (el proxy sigue el DDNS de Synology con TTL 240 s).

---

## 4. Web Station (NAS)

1. **Web Station → Portal web**: añadir los hostnames `corrientelebeche.es` y
   `www.corrientelebeche.es` al portal que ya sirve `pelotxo.synology.me`, o crear uno
   nuevo con la **misma configuración** (mismo perfil PHP).
2. **Raíz de documentos:** `/volume1/web/` (para que funcionen las subrutas).
3. Protocolos **HTTP 80 + HTTPS 443**, perfil **PHP 8.1+** (SLiMS necesita `mysqli`,
   `pdo_mysql`, `gd`, `curl`, `mbstring`, `intl`, `openssl`, `xml`, `zip`).
4. Raíz: `/volume1/web/index.php` redirige con **301** a `/lebeche/` (la portada-hub se eliminó).

## 5. Verificación

```bash
# Delegación (Cloudflare)
dig NS corrientelebeche.es @a.nic.es        # lady/elliot.ns.cloudflare.com

# Resolución (proxied → devuelve IPs de Cloudflare, no la del NAS)
dig A  corrientelebeche.es @1.1.1.1          # 188.114.96.x / 188.114.97.x
dig A  www.corrientelebeche.es @1.1.1.1      # ídem (proxied)

# Web (certificado válido vía Cloudflare)
curl -I https://www.corrientelebeche.es/                # 301 → /lebeche/
curl -I https://www.corrientelebeche.es/lebeche/        # 200
curl -I https://www.corrientelebeche.es/barrioteca/     # 200
curl -I https://www.corrientelebeche.es/slims/          # 200
curl -I https://www.www.corrientelebeche.es/            # 301 → /lebeche/
```

---

## 6. Solución de problemas

| Problema | Causa probable |
|----------|----------------|
| `NXDOMAIN` en todo (a.nic.es incluido) | Hostalia **no ha publicado el alta en el registro `.es`**. No es propagación: es el TLD el que dice "no existe". Reclamar a Hostalia. |
| Cloudflare "Pending Nameserver Update" | Normal hasta que el registro `.es` publique la delegación a `lady`/`elliot`. |
| Error 526 | El modo SSL/TLS está en "Full (strict)"; cámbialo a "Full" (el origen solo tiene el cert de `pelotxo.synology.me`). |
| La raíz `/` no redirige a `/lebeche/` | Verificar `/volume1/web/index.php` (301 → `/lebeche/`). |
| `/slims/` da error 500 | El portal no usa el perfil PHP correcto (extensiones de SLiMS). |
| IPv6 no responde | Verificado alcanzable desde fuera (HTTP 200 por IPv6). Si cambiara, revisar el cortafuegos del router. |
| Cambios no se ven tras desplegar | Caché de Cloudflare. Crear la Cache Rule de `/lebeche/` (sección 3.1) o hacer Caching → Purge Everything. |

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
- Redirección de la raíz: `/volume1/web/index.php` (301 → `/lebeche/`)
- NAS: Web Station (Nginx 1.23.1) + PHP 8 + MariaDB · SSH `192.168.50.93`/`94` · DSM `https://pelotxo.synology.me:5001`

