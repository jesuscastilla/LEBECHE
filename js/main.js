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

  // Utilidades de fecha seguras: nunca lanzan con fechas vacías o incorrectas
  function fechaValida(valor) {
    if (!valor) return null;
    var d = new Date(valor);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatearFecha(valor, formateador, porDefecto) {
    var d = fechaValida(valor);
    return d ? formateador.format(d) : (porDefecto || "");
  }

  // ---- Noticias ----
  function crearNoticia(n) {
    var tarjeta = crear("article", "noticia" + (n.destacada ? " noticia--destacada" : ""));
    var cuerpo = crear("div", "noticia__cuerpo");

    var meta = crear("div", "noticia__meta");
    var etiqueta = crear("span", "noticia__etiqueta");
    etiqueta.textContent = n.categoria || "Lebeche";
    var fecha = crear("time", "noticia__fecha");
    fecha.textContent = formatearFecha(n.fecha, formatoFecha, "Fecha por confirmar");
    if (fechaValida(n.fecha)) fecha.setAttribute("datetime", n.fecha);
    meta.appendChild(etiqueta);
    meta.appendChild(fecha);

    var titulo = crear("h3", "noticia__titulo");
    titulo.textContent = n.titulo || n.categoria || "Noticia";
    cuerpo.appendChild(meta);
    cuerpo.appendChild(titulo);

    if (n.texto) {
      var texto = crear("p", "noticia__texto");
      texto.textContent = n.texto;
      cuerpo.appendChild(texto);
    }
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
      var da = fechaValida(a.fecha), db = fechaValida(b.fecha);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db - da;
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

  // ---- Añadir al calendario (iCalendar) ----
  var VTIMEZONE_MADRID = [
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Madrid",
    "BEGIN:STANDARD",
    "DTSTART:19701025T030000",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "TZNAME:CET",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:19700329T020000",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "TZNAME:CEST",
    "END:DAYLIGHT",
    "END:VTIMEZONE"
  ].join("\r\n");

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function icsEscapar(t) {
    return String(t == null ? "" : t)
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  function ubicacionEvento(e) {
    var lug = e && e.lugar && String(e.lugar).trim();
    if (lug) return lug;
    var d = window._lebecheDatos || window.DATOS_LEBECHE || {};
    var u = d.ubicacion || {};
    return [u.direccion, u.cp ? (u.cp + " " + u.localidad) : u.localidad, u.provincia, u.pais]
      .filter(Boolean).join(", ");
  }

  function icsFechaYHora(e) {
    var fecha = String(e.fecha || "").replace(/-/g, "");
    function fmt(d) { return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + "T" + pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + "00"; }
    function fmtD(d) { return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()); }
    if (e.hora) {
      var p = String(e.hora).split(":");
      var h = parseInt(p[0] || "0", 10), m = parseInt(p[1] || "0", 10);
      var y = parseInt(fecha.slice(0, 4), 10), mo = parseInt(fecha.slice(4, 6), 10) - 1, dia = parseInt(fecha.slice(6, 8), 10);
      var base = new Date(Date.UTC(y, mo, dia, h, m));
      var fin;
      if (e.horaFin) {
        var pf = String(e.horaFin).split(":");
        var hf = parseInt(pf[0] || "0", 10), mf = parseInt(pf[1] || "0", 10);
        fin = new Date(Date.UTC(y, mo, dia, hf, mf));
      } else {
        fin = new Date(base.getTime() + 2 * 3600000);
      }
      return { start: fmt(base), end: fmt(fin), allDay: false };
    }
    var y2 = parseInt(fecha.slice(0, 4), 10), mo2 = parseInt(fecha.slice(4, 6), 10) - 1, dia2 = parseInt(fecha.slice(6, 8), 10);
    var sig = new Date(Date.UTC(y2, mo2, dia2 + 1));
    return { start: fecha, end: fmtD(sig), allDay: true };
  }

  function icsDtstamp() {
    var n = new Date();
    return n.getUTCFullYear() + pad2(n.getUTCMonth() + 1) + pad2(n.getUTCDate()) + "T" + pad2(n.getUTCHours()) + pad2(n.getUTCMinutes()) + pad2(n.getUTCSeconds()) + "Z";
  }

  function crearICS(e) {
    var f = icsFechaYHora(e);
    var lugar = ubicacionEvento(e);
    var uid = "lebeche-" + String(e.fecha || "") + "-" +
      (e.titulo || "evento").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) +
      "@corrientelebeche.es";
    var l = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Lebeche//Programacion//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      VTIMEZONE_MADRID,
      "BEGIN:VEVENT",
      "UID:" + uid,
      "DTSTAMP:" + icsDtstamp()
    ];
    if (f.allDay) {
      l.push("DTSTART;VALUE=DATE:" + f.start);
      l.push("DTEND;VALUE=DATE:" + f.end);
    } else {
      l.push("DTSTART;TZID=Europe/Madrid:" + f.start);
      l.push("DTEND;TZID=Europe/Madrid:" + f.end);
    }
    l.push("SUMMARY:" + icsEscapar(e.titulo || "Evento Lebeche"));
    l.push("DESCRIPTION:" + icsEscapar((e.texto || "") + (e.etiqueta ? " · " + e.etiqueta : "") + " · Lebeche · https://www.corrientelebeche.es/lebeche/#programacion"));
    if (lugar) l.push("LOCATION:" + icsEscapar(lugar));
    l.push("URL:https://www.corrientelebeche.es/lebeche/#programacion");
    l.push("END:VEVENT");
    l.push("END:VCALENDAR");
    return l.join("\r\n");
  }

  function nombreICS(e) {
    var s = (e.titulo || "evento").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return (s || "evento") + ".ics";
  }

  function crearEnlaceICS(e) {
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(crearICS(e));
  }

  function urlGoogleCalendar(e) {
    var f = icsFechaYHora(e);
    var lugar = ubicacionEvento(e);
    var u = "https://calendar.google.com/calendar/render?action=TEMPLATE"
      + "&text=" + encodeURIComponent(e.titulo || "Evento Lebeche")
      + "&dates=" + encodeURIComponent(f.start + "/" + f.end)
      + "&details=" + encodeURIComponent((e.texto || "") + " · Lebeche");
    if (lugar) u += "&location=" + encodeURIComponent(lugar);
    u += "&ctz=" + encodeURIComponent("Europe/Madrid");
    return u;
  }

  // ---- Programación ----
  function crearEvento(e) {
    var art = crear("article", "evento");

    var fechaEv = fechaValida(e.fecha);

    var fecha = crear("div", "evento__fecha");
    var dia = crear("span", "evento__dia");
    var mes = crear("span", "evento__mes");
    if (fechaEv) {
      dia.textContent = formatoDia.format(fechaEv);
      mes.textContent = formatoMes.format(fechaEv);
    } else {
      dia.textContent = "…";
      mes.textContent = "Por confirmar";
    }
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
      hora.textContent = e.horaFin ? (e.hora + " – " + e.horaFin) : e.hora;
      meta.appendChild(hora);
    }
    var titulo = crear("h3", "evento__titulo");
    titulo.textContent = e.titulo || e.etiqueta || "Evento";
    cuerpo.appendChild(meta);
    cuerpo.appendChild(titulo);

    if (e.texto) {
      var texto = crear("p", "evento__texto");
      texto.textContent = e.texto;
      cuerpo.appendChild(texto);
    }

    if (fechaEv) {
      var acciones = crear("div", "evento__acciones");
      var btnCal = crear("a", "evento__calendario");
      btnCal.href = crearEnlaceICS(e);
      btnCal.download = nombreICS(e);
      btnCal.textContent = "📅 Añadir al calendario";
      acciones.appendChild(btnCal);
      var btnGoogle = crear("a", "evento__google");
      btnGoogle.href = urlGoogleCalendar(e);
      btnGoogle.target = "_blank";
      btnGoogle.rel = "noopener";
      btnGoogle.textContent = "Google Calendar";
      acciones.appendChild(btnGoogle);
      cuerpo.appendChild(acciones);
    }

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

    // Se separan los eventos con fecha válida y futura de los que vienen sin
    // fecha: éstos últimos se muestran al final con la etiqueta "Por confirmar"
    // en lugar de desaparecer sin aviso.
    var proximos = [];
    var porConfirmar = [];
    eventos.forEach(function (e) {
      var d = fechaValida(e.fecha);
      if (d && d >= hoy) proximos.push(e);
      else if (!d && (e.titulo || e.etiqueta || e.texto)) porConfirmar.push(e);
    });

    proximos.sort(function (a, b) { return fechaValida(a.fecha) - fechaValida(b.fecha); });

    var visibles = proximos.concat(porConfirmar);

    if (!visibles.length) {
      var vacio = crear("div", "programacion__vacia");
      vacio.textContent = "Próximamente publicaremos la programación.";
      lista.appendChild(vacio);
      return;
    }

    visibles.forEach(function (e) { lista.appendChild(crearEvento(e)); });
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
    window._lebecheDatos = r[3] || window.DATOS_LEBECHE || {};

    // Cada sección se pinta de forma aislada para que un contenido con un dato
    // incorrecto no pueda dejar en blanco el resto de la página.
    [
      [renderProgramacion, r[0]],
      [renderNoticias, r[1]],
      [renderApps, r[2]],
      [renderContactoUbicacion, r[3]]
    ].forEach(function (par) {
      try {
        par[0](par[1]);
      } catch (e) {
        console.error("[Lebeche] Error al renderizar una sección:", e);
      }
    });
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


