# Guía de despliegue de la web de Lebeche en un NAS Synology (Web Station)

La web pública es **100 % estática** (HTML + CSS + JavaScript puro). El **panel Staff opcional**
(`admin/`) sí usa **PHP** para guardar los contenidos, pero **no necesita base de datos**.
**Web Station** de Synology sirve ambas cosas a la vez.

---

## 1. Requisitos

- NAS Synology con **DSM 7** (o superior).
- Paquete **Web Station** instalado.
- Acceso de administrador al panel (DSM) y, opcionalmente, **File Station** o **SFTP/SCP**.
- (Recomendado) Dominio DDNS como `pelotxo.synology.me` y certificado **HTTPS de Let's Encrypt**.

---

## 2. Qué hay que subir

| Origen local | Destino en el NAS |
|--------------|-------------------|
| `index.html` | raíz de la web |
| `css/`       | carpeta `css/` |
| `js/`        | carpeta `js/` |
| `data/`      | carpeta `data/` (contenidos editables) |
| `admin/`     | carpeta `admin/` (panel Staff) |
| `assets/`    | carpeta `assets/` |

No subas `docs/`, `.git/`, `README.md` ni `.gitignore`: no se usan para servir la web.

---

## 3. Paso 1 — Instalar Web Station

1. Abre **Centro de paquetes**.
2. Busca **Web Station** y pulsa **Instalar**.
3. Acepta las dependencias (servidor web **Nginx** o **Apache** y **PHP**). El PHP se instala
   pero **no lo usaremos**.

---

## 4. Paso 2 — Decidir la ruta (subcarpeta o dominio propio)

### Opción A — Subcarpeta dentro de la web raíz (la más simple)

La raíz web por defecto de Synology es `/volume1/web/`. Si subes la web a una subcarpeta:

- Destino: `/volume1/web/lebeche/`
- URL pública: `https://pelotxo.synology.me/lebeche/`

Con esta opción **no hace falta crear nada** en Web Station: la carpeta se sirve sola.

### Opción B — Virtual host (dominio o subdominio propio)

Útil si quieres un dominio dedicado (p. ej. `lebeche.synology.me`) o servirla en la raíz de un dominio.

1. Abre **Web Station → Portal web → Crear**.
2. Tipo: **Servicio web**.
3. Nombre: `lebeche`.
4. **Raíz de documentos:** `/volume1/web/lebeche/`.
5. Protocolos: **HTTP y HTTPS** (puertos 80/443) o los que prefieras.

---

## 5. Paso 3 — Subir los archivos

Elige una de estas dos vías:

### Vía A — File Station (sin terminal)

1. Abre **File Station**.
2. Entra en la carpeta compartida **web**.
3. Crea la carpeta `lebeche`.
4. Arrastra dentro `index.html` y las carpetas `css`, `js` y `assets`.

### Vía B — SFTP / SCP (desde un ordenador)

```bash
scp -r index.html css js assets usuario@TU_NAS:/volume1/web/lebeche/
```

---

## 6. Paso 4 — Permisos

1. En **File Station**, haz clic derecho en la carpeta `lebeche` → **Propiedades → Permisos**.
2. Asegúrate de que el usuario/grupo que usa el servidor web tenga **lectura**. En DSM suele ser
   el grupo **http** (o el grupo `Everyone` con permisos de lectura).
3. Marca **Aplicar a esta carpeta, subcarpetas y archivos** y acepta.

---

## 7. Paso 5 — HTTPS con Let's Encrypt

1. Ve a **Panel de control → Seguridad → Certificado → Añadir**.
2. Elige **Obtener certificado de Let's Encrypt**.
3. En **Dominio**, escribe `pelotxo.synology.me` (o tu dominio).
4. Activa la **renovación automática**.
5. Asigna el certificado al servicio:
   - **Panel de control → Inicio de sesión → DSM** y
   - **Web Station → Portal web** (selecciona el servicio y su certificado).

---

## 8. Paso 6 — Comprobar

1. Abre `https://pelotxo.synology.me/lebeche/` en el navegador.
2. Revisa en **móvil** y en **escritorio**:
   - El menú móvil se abre y cierra.
   - Las noticias, aplicaciones, ubicación y contacto se ven bien.
   - El logo y las imágenes cargan.
   - El mapa de Google Maps aparece.

---

## 9. Solución de problemas

| Problema | Posible causa y solución |
|----------|--------------------------|
| Error 404 | Comprueba mayúsculas/minúsculas y que `index.html` esté en la raíz de `lebeche`. |
| Imágenes o logo rotos | La carpeta `assets/` no se subió completa. Vuelve a subirla. |
| El mapa no carga | El mapa es un iframe de Google Maps; requiere conexión a internet. |
| Sale HTTP en vez de HTTPS | Usa la URL con `https://` o fuerza redirección en Web Station. |
| Fuentes distintas en el móvil | Las fuentes se cargan desde Google Fonts; sin internet se usan fuentes del sistema (es normal). |

---

## 10. Actualizar la web

Para publicar cambios:

1. Sobrescribe en el NAS `index.html`, `css/`, `js/` y `assets/` con las versiones nuevas.
2. Recarga la página con **Ctrl + F5** (no hay caché de servicio worker, se ve al instante).

---

## 11. Panel Staff (edición sin código)

Permite editar **programación, noticias, apps y contacto/ubicación** desde el navegador, sin tocar
código.

- **URL:** `https://pelotxo.synology.me/lebeche/admin/`
- **Usuario:** `lebeche`
- **Contraseña:** la configurada en `admin/config.php` (ver "Cambiar la contraseña").

### Permisos importantes

Para que el panel pueda guardar, la carpeta `data/` debe ser **escribible por PHP**:

1. En **File Station**, clic derecho en `lebeche/data` → **Propiedades → Permisos**.
2. Da permiso de **lectura y escritura** al grupo/usuario que ejecuta PHP (en DSM suele ser
   `http`, o el grupo `Everyone` con lectura/escritura).
3. Marca **Aplicar a esta carpeta, subcarpetas y archivos**.

> Si al guardar ves "No se pudo escribir", es que falta este permiso de escritura en `data/`.

### Cambiar la contraseña

1. Genera un hash nuevo (PBKDF2-HMAC-SHA256). Con PHP puedes usar este fragmento:

   ```php
   <?php
   $clave = 'TU_NUEVA_CONTRASENA';
   $salt  = bin2hex(random_bytes(16));
   echo 'STAFF_SALT = ' . $salt . "\n";
   echo 'STAFF_HASH = ' . hash_pbkdf2('sha256', $clave, $salt, 100000) . "\n";
   ```

2. Abre `admin/config.php` y actualiza `STAFF_HASH` y `STAFF_SALT` con los valores generados.
3. Sube el archivo actualizado al NAS.

---

## Resumen de rutas

- **Web en el NAS:** `/volume1/web/lebeche/`
- **URL pública (subcarpeta):** `https://pelotxo.synology.me/lebeche/`
- **Panel Staff:** `https://pelotxo.synology.me/lebeche/admin/`
- **Barrioteca (ya publicada):** `https://pelotxo.synology.me/barrioteca/`
