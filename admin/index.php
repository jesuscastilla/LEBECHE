<?php
require_once __DIR__ . '/config.php';
session_start();

function lebeche_conectado() {
  return !empty($_SESSION['lebeche_staff']);
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['accion']) && $_POST['accion'] === 'login') {
  $usuario = isset($_POST['usuario']) ? (string)$_POST['usuario'] : '';
  $clave   = isset($_POST['clave']) ? (string)$_POST['clave'] : '';
  $hash    = hash_pbkdf2('sha256', $clave, STAFF_SALT, STAFF_ITER);

  if (hash_equals(STAFF_USUARIO, $usuario) && hash_equals(STAFF_HASH, $hash)) {
    $_SESSION['lebeche_staff'] = true;
    $_SESSION['lebeche_csrf'] = bin2hex(random_bytes(16));
    header('Location: index.php');
    exit;
  }
  $error = 'Usuario o contraseña incorrectos.';
}

if (!lebeche_conectado()) {
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Acceso Staff · Lebeche</title>
<link rel="stylesheet" href="estilos.css">
</head>
<body class="login">
  <form class="login__caja" method="post" action="index.php">
    <div class="login__logo" aria-hidden="true">🌊</div>
    <h1>Panel Staff</h1>
    <p class="login__sub">Web de Lebeche</p>
    <?php if ($error !== ''): ?>
      <p class="login__error"><?php echo htmlspecialchars($error); ?></p>
    <?php endif; ?>
    <input type="hidden" name="accion" value="login">
    <label for="usuario">Usuario</label>
    <input type="text" id="usuario" name="usuario" autocomplete="username" required>
    <label for="clave">Contraseña</label>
    <input type="password" id="clave" name="clave" autocomplete="current-password" required>
    <button type="submit" class="btn">Entrar</button>
    <a class="login__volver" href="../index.html">← Volver a la web</a>
  </form>
</body>
</html>
<?php
  exit;
}

$csrf = isset($_SESSION['lebeche_csrf']) ? $_SESSION['lebeche_csrf'] : '';
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Panel Staff · Lebeche</title>
<link rel="stylesheet" href="estilos.css">
</head>
<body class="admin" data-csrf="<?php echo htmlspecialchars($csrf); ?>">
<header class="admin__cabecera">
  <div class="admin__marca">Panel Staff · <strong>Lebeche</strong></div>
  <nav class="admin__tabs" aria-label="Secciones del panel">
    <button class="admin__tab activo" data-tab="programacion" type="button">Programación</button>
    <button class="admin__tab" data-tab="noticias" type="button">Noticias</button>
    <button class="admin__tab" data-tab="apps" type="button">Apps</button>
    <button class="admin__tab" data-tab="datos" type="button">Contacto y ubicación</button>
  </nav>
  <a class="admin__salir" href="logout.php">Salir</a>
</header>

<main class="admin__main">
  <p class="admin__nota">Los cambios se publican en la web al pulsar <strong>Guardar</strong>. Sin conocimientos técnicos: solo escribe y guarda.</p>

  <section class="admin__panel activo" id="panel-programacion">
    <h2>Programación</h2>
    <div id="form-programacion"></div>
    <button class="btn btn--guardar" data-save="programacion" type="button">Guardar programación</button>
  </section>

  <section class="admin__panel" id="panel-noticias">
    <h2>Noticias</h2>
    <div id="form-noticias"></div>
    <button class="btn btn--guardar" data-save="noticias" type="button">Guardar noticias</button>
  </section>

  <section class="admin__panel" id="panel-apps">
    <h2>Apps</h2>
    <div id="form-apps"></div>
    <button class="btn btn--guardar" data-save="apps" type="button">Guardar apps</button>
  </section>

  <section class="admin__panel" id="panel-datos">
    <h2>Contacto y ubicación</h2>
    <div id="form-datos"></div>
    <button class="btn btn--guardar" data-save="datos" type="button">Guardar contacto y ubicación</button>
  </section>

  <div class="admin__estado" id="estado" role="status" aria-live="polite"></div>
</main>

<script src="admin.js"></script>
</body>
</html>
