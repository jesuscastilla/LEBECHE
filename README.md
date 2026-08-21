# Portfolio — Proyectos Lebeche

Aplicaciones y servicios digitales de la **Asociación Lebeche** (Salobreña, Granada).

> Infraestructura: NAS Synology con Web Station (Nginx + PHP 8 + MariaDB).
> Dominio público: `pelotxo.synology.me`.
> Logos en `G:\GITHUB\LOGOS\`.

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
