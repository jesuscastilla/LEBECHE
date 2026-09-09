# Lebeche — Web oficial e índice de proyectos

Sitio web de la **Asociación Lebeche**, asociación cultural y vecinal de Salobreña (Granada),
y el índice de los proyectos digitales que impulsa.

> Infraestructura: NAS Synology con Web Station (Nginx + PHP 8 + MariaDB).
> Dominio público: `pelotxo.synology.me`.
> Logos en `G:\GITHUB\LOGOS\`.

---

## La web

Web estática (HTML + CSS + JavaScript puro, sin frameworks ni CDN de scripts) con el tema visual
de la Barrioteca y la identidad de Lebeche. Secciones: asociación, programación, noticias,
aplicaciones, Barrioteca Acalencá, ubicación y contacto.

### Cómo editar sin saber código

La web incluye un **panel Staff** privado (en `admin/`, con usuario y contraseña) desde el que se
pueden editar de forma visual la **programación**, las **noticias**, las **apps** y el
**contacto/ubicación**. Requiere PHP (Web Station). Ver `docs/GUIA_NAS_SYNOLOGY_WEB_STATION.md`.

Los contenidos se guardan en archivos **JSON** de la carpeta `data/` (la "fuente de verdad").
Los archivos `js/*.js` son solo valores por defecto: la web carga primero el JSON y, si no está
disponible, usa esos valores.

### Estructura

```
LEBECHE/
├── index.html                     # Página principal (secciones ancla)
├── css/styles.css                 # Estilos (tema Barrioteca + identidad Lebeche)
├── js/datos.js                    # Valores por defecto (dirección, redes, contacto)
├── js/apps.js                     # Valores por defecto (aplicaciones)
├── js/noticias.js                 # Valores por defecto (noticias)
├── js/programacion.js             # Valores por defecto (programación)
├── js/main.js                     # Menú móvil, carga de datos, render, animaciones
├── data/                          # ★ Contenidos editables (JSON) — se editan desde el panel
├── admin/                         # Panel Staff (PHP): login y edición visual
├── assets/                        # Logos y favicon
└── docs/
    └── GUIA_NAS_SYNOLOGY_WEB_STATION.md   # Guía de despliegue en el NAS
```

### Ver en local

Abre `index.html` con el navegador, o lanza un servidor:

```bash
python -m http.server
```

y abre `http://localhost:8000`.

> El panel Staff (`admin/`) necesita PHP. Para probarlo en local:
> `php -S localhost:8000` desde la carpeta, y abre `http://localhost:8000/admin/`.

### Desplegar en el NAS

Consulta `docs/GUIA_NAS_SYNOLOGY_WEB_STATION.md`.

---

## Proyectos Lebeche

Aplicaciones y servicios digitales de la **Asociación Lebeche** (Salobreña, Granada).

---

## Calendario Lebeche — App Android nativa (CalDAV)

- **Estado:** en desarrollo (v1)
- **Tipo:** app Android nativa (Kotlin + Jetpack Compose)
- **Repositorio local:** `g:\GITHUB\calendario-lebeche\`
- **Package ID:** `com.lebeche.calendario`
- **Descripción:** calendario que se conecta a servidores **CalDAV** (como **Synology
  Calendar**), permite crear/editar/ver eventos con **notificaciones**, sincronización
  bidireccional y **exporta los eventos al calendario del sistema Android**.
- **Tecnología:** Kotlin · Jetpack Compose · OkHttp · biweekly (iCalendar) · WorkManager ·
  AlarmManager · SQLite · CalendarContract.
- **Icono:** símbolo de Lebeche en negro (`LOGOS/icono lebeche negro.jpg`).

---

## Barrioteca Acalencá

Aplicación de biblioteca vecinal autogestionada: catálogo, préstamos y devoluciones por
código de barras.

| Entrega | Tecnología | Repositorio local | Estado |
|---|---|---|---|
| Web (PWA) | React 19 + Vite + Tailwind + TypeScript | `g:\GITHUB\PWA\` | activa |
| Backend | SLiMS 9.7.2 (PHP + MariaDB) | `g:\GITHUB\SLiMS\` | activa |
| Android (TWA) | Android (Trusted Web Activity) | `g:\GITHUB\barrioteca-android-app\` | activa |
| iOS | Swift | `g:\GITHUB\barrioteca-ios\` | activa |

- **URL pública:** `https://pelotxo.synology.me/barrioteca/`

---

## Digitalización Lebeche — Web hub informativo

- **Tipo:** web estática (HTML + CSS + JS, sin CDN)
- **Repositorio local:** `g:\GITHUB\digitalizacion-lebeche\`
- **Descripción:** presenta a las socias y vecinas las aplicaciones de la asociación.
- **Identidad:** paleta azul Lebeche `#8FD6EF` + acento ámbar `#E8A33D`.

---

## Próximamente

- **Archivo multimedia** (fotos, carteles y documentos de la asociación).
- **Tablón de anuncios** (avisos y novedades).
