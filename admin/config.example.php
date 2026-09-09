<?php
// Plantilla de configuración del panel Staff de la web de Lebeche.
//
// 1. Copia este archivo como `config.php` (en esta misma carpeta admin/).
// 2. Rellena STAFF_USUARIO, STAFF_HASH y STAFF_SALT.
//    Para generar el hash, consulta docs/GUIA_NAS_SYNOLOGY_WEB_STATION.md (sección "Panel Staff").
//
// Nota: `config.example.php` SÍ se sube a Git. `config.php` está en `.gitignore`
// para no exponer las credenciales en el repositorio.

define('STAFF_USUARIO', 'lebeche');
define('STAFF_HASH', '');
define('STAFF_SALT', '');
define('STAFF_ITER', 100000);
define('DATA_DIR', __DIR__ . '/../data/');
