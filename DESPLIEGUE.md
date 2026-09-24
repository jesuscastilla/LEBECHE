# Despliegue de la web de Lebeche al NAS

La web vive en el NAS Synology, servida por **Web Station** en `/volume1/web/lebeche/`
(`https://www.corrientelebeche.es/lebeche/`).

Hay dos formas de subir los cambios desde este repositorio: **SMB** (Explorador de
Windows, la más fácil) o **SSH/SCP**. También existe un script que lo hace en un paso:
[`despliegue.ps1`](despliegue.ps1).

> ⚠️ **No sobrescribas `data/` sin querer.** Ahí guarda el panel Staff los contenidos
> en vivo (`programacion.json`, `noticias.json`, `apps.json`, `datos.json`). El script
> **no** los sube salvo que lo pidas con `-ConDatos`.

---

## Opción A — Script (un solo paso)

En PowerShell:

```powershell
cd G:\GITHUB\LEBECHE

# Subir solo los 4 archivos de código del arreglo (lo habitual):
.\despliegue.ps1

# Subir todo el sitio (index.html, css, js, assets, admin) sin data/:
.\despliegue.ps1 -Todo

# Simular (ver qué se copiaría, sin copiar):
.\despliegue.ps1 -DryRun

# Forzar SSH/scp en vez de SMB (por defecto lo detecta solo):
.\despliegue.ps1 -Metodo scp -NasIp 192.168.50.93
```

El script detecta si el NAS responde por SMB (`\\192.168.50.94\web\lebeche`) y, si no,
usa `scp` con el usuario `pelotxo`.

---

## Opción B — Manual (Explorador de Windows / SMB)

> **Tipografías (2026-09-24):** la web ahora usa `fonts/` (9 .ttf de marca). Si subes a mano, arrastra también la carpeta `fonts/` completa junto a `css/` y `assets/`.

1. Abre `\\192.168.50.94\web\lebeche\` en el Explorador.
2. Arrastra (sobrescribiendo):
   - `js\main.js`
   - `admin\admin.js`
   - `admin\guardar.php`
   - `admin\estilos.css`
3. Recarga la web con **Ctrl + F5**.

---

## Opción C — Manual (SSH/SCP)

```bash
scp js/main.js                          pelotxo@192.168.50.93:/volume1/web/lebeche/js/
scp admin/admin.js admin/guardar.php admin/estilos.css \
    pelotxo@192.168.50.93:/volume1/web/lebeche/admin/
```

---

## Arreglar los contenidos en vivo (datos)

El panel Staff guarda en `data/*.json` (no se tocan en este despliegue). Para corregir
las noticias/eventos que se quedaron con campos vacíos:

1. Entra en `https://www.corrientelebeche.es/lebeche/admin/` (usuario `lebeche`).
2. En **Noticias**: pon fecha a «Archivo multimedia, próximamente» y a
   «Próximamente: Newsletter Mensual!» (y texto a esta última).
3. En **Programación**: pon título al evento del 01/10 («Merienda vecinal»).

Con la web ya corregida (nuevo `js/main.js`), aunque una fecha quede vacía la página ya
no se rompe: muestra «Fecha por confirmar» y el panel avisa antes de guardar.

---

## Comprobar

- Consola del navegador (F12) sin errores.
- Se ven: 4 noticias, 5 eventos, 2 apps, 3 contactos, dirección y mapa.
- Probar a guardar una noticia sin fecha desde el panel → debe avisar y no guardar.

Rutas del NAS (referencia):
- Web: `/volume1/web/lebeche/`
- Panel: `/volume1/web/lebeche/admin/`
- SMB: `\\192.168.50.94\web\lebeche\` · SSH: `pelotxo@192.168.50.93` (o `.94`), puerto 22
