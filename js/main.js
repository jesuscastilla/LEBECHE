(function () {
  "use strict";

  // ---- Menú móvil ----
  var boton = document.getElementById("menuBoton");
  var menu = document.getElementById("menuNav");

  function cerrarMenu() {
    if (!menu || !boton) return;
    menu.classList.remove("abierto");
    boton.classList.remove("activo");
    boton.setAttribute("aria-expanded", "false");
  }

  if (boton && menu) {
    boton.addEventListener("click", function () {
      var abierto = menu.classList.toggle("abierto");
      boton.classList.toggle("activo", abierto);
      boton.setAttribute("aria-expanded", String(abierto));
    });

    menu.querySelectorAll("a").forEach(function (enlace) {
      enlace.addEventListener("click", cerrarMenu);
    });
  }

  // ---- Sombra en la cabecera ----
  var cabecera = document.getElementById("cabecera");
  function actualizarCabecera() {
    if (cabecera) cabecera.classList.toggle("compacta", window.scrollY > 10);
  }
  window.addEventListener("scroll", actualizarCabecera, { passive: true });
  actualizarCabecera();

  // ---- Utilidades ----
  function crear(tag, clase) {
    var el = document.createElement(tag);
    if (clase) el.className = clase;
    return el;
  }

  function setText(id, texto) {
    var el = document.getElementById(id);
    if (el && texto) el.textContent = texto;
  }

  var formatoFecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" });
  var formatoDia = new Intl.DateTimeFormat("es-ES", { day: "numeric" });
  var formatoMes = new Intl.DateTimeFormat("es-ES", { month: "short" });

  // ---- Noticias ----
  function crearNoticia(n) {
    var tarjeta = crear("article", "noticia" + (n.destacada ? " noticia--destacada" : ""));
    var cuerpo = crear("div", "noticia__cuerpo");

    var meta = crear("div", "noticia__meta");
    var etiqueta = crear("span", "noticia__etiqueta");
    etiqueta.textContent = n.categoria || "Lebeche";
    var fecha = crear("time", "noticia__fecha");
    fecha.textContent = formatoFecha.format(new Date(n.fecha));
    fecha.setAttribute("datetime", n.fecha);
    meta.appendChild(etiqueta);
    meta.appendChild(fecha);

    var titulo = crear("h3", "noticia__titulo");
    titulo.textContent = n.titulo;
    var texto = crear("p", "noticia__texto");
    texto.textContent = n.texto;

    cuerpo.appendChild(meta);
    cuerpo.appendChild(titulo);
    cuerpo.appendChild(texto);
    tarjeta.appendChild(cuerpo);
    return tarjeta;
  }

  function renderNoticias(noticias) {
    var lista = document.getElementById("listaNoticias");
    if (!lista) return;
    lista.innerHTML = "";
    var datos = (noticias || []).slice();
    datos.sort(function (a, b) {
      if (!!a.destacada !== !!b.destacada) return (b.destacada ? 1 : 0) - (a.destacada ? 1 : 0);
      return new Date(b.fecha) - new Date(a.fecha);
    });
    datos.forEach(function (n) { lista.appendChild(crearNoticia(n)); });
  }

  // ---- Aplicaciones ----
  function crearApp(app) {
    var tarjeta = crear("article", "app" + (app.estado === "proximamente" ? " app--proxima" : ""));

    var cuerpo = crear("div", "app__cuerpo");
    var emoji = crear("span", "app__emoji");
    emoji.textContent = app.emoji || "✨";
    emoji.setAttribute("aria-hidden", "true");
    var nombre = crear("h3", "app__nombre");
    nombre.textContent = app.nombre;
    var desc = crear("p", "app__desc");
    desc.textContent = app.descripcion;

    cuerpo.appendChild(emoji);
    cuerpo.appendChild(nombre);
    cuerpo.appendChild(desc);

    if (app.etiquetas && app.etiquetas.length) {
      var tags = crear("div", "app__etiquetas");
      app.etiquetas.forEach(function (t) {
        var span = crear("span");
        span.textContent = t;
        tags.appendChild(span);
      });
      cuerpo.appendChild(tags);
    }

    var pie = crear("div", "app__pie");
    if (app.estado === "activa" && app.url) {
      var enlace = crear("a", "boton boton--app");
      enlace.href = app.url;
      enlace.target = "_blank";
      enlace.rel = "noopener";
      enlace.textContent = "Usar la aplicación ↗";
      pie.appendChild(enlace);
    } else {
      var aviso = crear("span", "app__aviso");
      aviso.textContent = "En preparación";
      pie.appendChild(aviso);
    }

    tarjeta.appendChild(cuerpo);
    tarjeta.appendChild(pie);
    return tarjeta;
  }

  function renderApps(apps) {
    var lista = document.getElementById("listaApps");
    if (!lista) return;
    lista.innerHTML = "";
    (apps || []).forEach(function (app) { lista.appendChild(crearApp(app)); });
  }

  // ---- Programación ----
  function crearEvento(e) {
    var art = crear("article", "evento");

    var fecha = crear("div", "evento__fecha");
    var dia = crear("span", "evento__dia");
    dia.textContent = formatoDia.format(new Date(e.fecha));
    var mes = crear("span", "evento__mes");
    mes.textContent = formatoMes.format(new Date(e.fecha));
    fecha.appendChild(dia);
    fecha.appendChild(mes);

    var cuerpo = crear("div", "evento__cuerpo");
    var meta = crear("div", "evento__meta");
    if (e.etiqueta) {
      var et = crear("span", "evento__etiqueta");
      et.textContent = e.etiqueta;
      meta.appendChild(et);
    }
    if (e.hora) {
      var hora = crear("span", "evento__hora");
      hora.textContent = e.hora;
      meta.appendChild(hora);
    }
    var titulo = crear("h3", "evento__titulo");
    titulo.textContent = e.titulo;
    var texto = crear("p", "evento__texto");
    texto.textContent = e.texto;

    cuerpo.appendChild(meta);
    cuerpo.appendChild(titulo);
    cuerpo.appendChild(texto);
    art.appendChild(fecha);
    art.appendChild(cuerpo);
    return art;
  }

  function renderProgramacion(programacion) {
    var v = programacion && programacion.viernes;
    if (v) {
      setText("viernesTitulo", v.titulo);
      setText("viernesTexto", v.texto);
    }

    var lista = document.getElementById("listaProgramacion");
    if (!lista) return;
    lista.innerHTML = "";

    var eventos = (programacion && programacion.proximos) || [];
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    var proximos = eventos
      .filter(function (e) { return new Date(e.fecha) >= hoy; })
      .sort(function (a, b) { return new Date(a.fecha) - new Date(b.fecha); });

    if (!proximos.length) {
      var vacio = crear("div", "programacion__vacia");
      vacio.textContent = "Próximamente publicaremos la programación.";
      lista.appendChild(vacio);
      return;
    }

    proximos.forEach(function (e) { lista.appendChild(crearEvento(e)); });
  }

  // ---- Contacto y ubicación ----
  function crearContacto(c) {
    var tarjeta = crear("a", "contacto__tarjeta");
    tarjeta.href = c.url || "#";
    tarjeta.target = "_blank";
    tarjeta.rel = "noopener";

    var icono = crear("span", "contacto__icono");
    icono.textContent = c.icono || "🔗";
    icono.setAttribute("aria-hidden", "true");
    var nombre = crear("span", "contacto__nombre");
    nombre.textContent = c.nombre;
    var valor = crear("span", "contacto__valor");
    valor.textContent = c.valor;
    var desc = crear("span", "contacto__desc");
    desc.textContent = c.desc || "";

    tarjeta.appendChild(icono);
    tarjeta.appendChild(nombre);
    tarjeta.appendChild(valor);
    if (c.desc) tarjeta.appendChild(desc);
    return tarjeta;
  }

  function renderContactoUbicacion(datos) {
    var lista = document.getElementById("listaContacto");
    if (lista) {
      lista.innerHTML = "";
      (datos.contacto || []).forEach(function (c) { lista.appendChild(crearContacto(c)); });
    }

    var ubi = datos.ubicacion;
    if (!ubi) return;

    var direccionTexto = document.getElementById("direccionTexto");
    if (direccionTexto) {
      direccionTexto.textContent = [
        ubi.direccion,
        ubi.cp ? ubi.cp + " " + ubi.localidad : ubi.localidad,
        ubi.provincia,
        ubi.pais
      ].filter(Boolean).join(", ");
    }

    var ubicacionNota = document.getElementById("ubicacionNota");
    if (ubicacionNota && ubi.nota) ubicacionNota.textContent = ubi.nota;

    if (ubi.consultaMapa) {
      var q = encodeURIComponent(ubi.consultaMapa);
      var mapa = document.getElementById("mapa");
      if (mapa) mapa.src = "https://www.google.com/maps?q=" + q + "&output=embed&z=16";

      var enlaceMapa = document.getElementById("enlaceMapa");
      if (enlaceMapa) enlaceMapa.href = "https://www.google.com/maps/search/?api=1&query=" + q;
    }
  }

  // ---- Carga de datos (JSON) con respaldo a los valores por defecto ----
  function cargar(tipo, porDefecto) {
    return fetch("data/" + tipo + ".json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("no ok"); return r.json(); })
      .catch(function () { return porDefecto; });
  }

  Promise.all([
    cargar("programacion", window.PROGRAMACION_LEBECHE || null),
    cargar("noticias", window.NOTICIAS_LEBECHE || []),
    cargar("apps", window.APPS_LEBECHE || []),
    cargar("datos", window.DATOS_LEBECHE || {})
  ]).then(function (r) {
    renderProgramacion(r[0]);
    renderNoticias(r[1]);
    renderApps(r[2]);
    renderContactoUbicacion(r[3]);
  });

  // ---- Año actual en el pie ----
  var anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();

  // ---- Aparición suave de las secciones ----
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observer.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".seccion, .hero").forEach(function (el) {
      el.classList.add("aparecer");
      observer.observe(el);
    });
  }
})();


