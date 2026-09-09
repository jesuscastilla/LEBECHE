<?php
// Credenciales del panel Staff de la web de Lebeche.
// La contraseña NO se guarda en claro: aquí solo está el hash (PBKDF2-HMAC-SHA256).
// Para cambiar la contraseña, genera un hash nuevo y actualiza STAFF_HASH y STAFF_SALT
// (consulta docs/GUIA_NAS_SYNOLOGY_WEB_STATION.md).
define('STAFF_USUARIO', 'lebeche');
define('STAFF_HASH', 'd5e16702cbf68133d79a1bb4d268882a56faa949841ff167eecf29697b3b534a');
define('STAFF_SALT', 'a9735486ecc8f6b499569ed5ffe49d9c');
define('STAFF_ITER', 100000);
define('DATA_DIR', __DIR__ . '/../data/');
