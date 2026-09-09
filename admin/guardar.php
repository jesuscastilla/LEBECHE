<?php
require_once __DIR__ . '/config.php';
session_start();

if (empty($_SESSION['lebeche_staff'])) {
  http_response_code(401);
  echo 'No autorizado';
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo 'Método no permitido';
  exit;
}

if (empty($_POST['csrf']) || empty($_SESSION['lebeche_csrf']) || !hash_equals($_SESSION['lebeche_csrf'], (string)$_POST['csrf'])) {
  http_response_code(403);
  echo 'Token inválido';
  exit;
}

$tipos = ['programacion', 'noticias', 'apps', 'datos'];
$tipo = isset($_POST['tipo']) ? (string)$_POST['tipo'] : '';
if (!in_array($tipo, $tipos, true)) {
  http_response_code(400);
  echo 'Tipo no válido';
  exit;
}

$data = isset($_POST['data']) ? (string)$_POST['data'] : '';
$decoded = json_decode($data, true);
if (json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo 'JSON no válido';
  exit;
}

if (!is_dir(DATA_DIR)) {
  @mkdir(DATA_DIR, 0775, true);
}

$archivo = DATA_DIR . $tipo . '.json';
$tmp = $archivo . '.tmp';
$json = json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if (@file_put_contents($tmp, $json, LOCK_EX) === false) {
  http_response_code(500);
  echo 'No se pudo escribir (revisa los permisos de la carpeta data/)';
  exit;
}

if (!@rename($tmp, $archivo)) {
  http_response_code(500);
  echo 'No se pudo guardar el archivo';
  exit;
}

echo 'ok';
