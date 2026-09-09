(function () {
  "use strict";

  var csrf = document.body.getAttribute("data-csrf") || "";

  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function input(tipo, cls, valor, placeholder) {
    var el = document.createElement("input");
    el.type = tipo;
    if (cls) el.className = cls;
    if (valor != null) el.value = valor;
    if (placeholder) el.placeholder = placeholder;
    return el;
  }

  function textarea(cls, valor, placeholder) {
    var el = document.createElement("textarea");
    if (cls) el.className = cls;
    if (valor != null) el.value = valor;
    if (placeholder) el.placeholder = placeholder;
    return el;
  }

  function select(cls, opciones, valor) {
    var el = document.createElement("select");
    el.className = cls;
    opciones.forEach(function (v) {
      var o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      if (v === valor) o.selected = true;
      el.appendChild(o);
    });
    return el;
  }

  function campo(etiqueta, control) {
    var div = h("div", "campo");
    div.appendChild(h("label", "campo__label", etiqueta));
    div.appendChild(control);
    return div;
  }

  function fila() { return h("div", "fila"); }

  function botonQuitar() {
    var b = h("button", "btn btn--quitar", "Quitar");
    b.type = "button";
    b.addEventListener("click", function () { b.closest(".fila").remove(); });
    return b;
  }

  var datos = { programacion: null, noticias: null, apps: null, datos: null };

  function get(tipo) {
    return fetch("../data/" + tipo + ".json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("no ok"); return r.json(); })
      .catch(function () { return null; });
  }

  function vacioProgramacion() { return { viernes: { titulo: "", texto: "" }, proximos: [] }; }

  function cargar() {
    return Promise.all([get("programacion"), get("noticias"), get("apps"), get("datos")])
      .then(function (r) {
        datos.programacion = r[0] || vacioProgramacion();
        datos.noticias = r[1] || [];
        datos.apps = r[2] || [];
        datos.datos = r[3] || { asociacion: {}, ubicacion: {}, contacto: [] };
        renderProgramacion();
        renderNoticias();
        renderApps();
        renderDatos();
      });
  }

  function estado(texto, ok) {
    var el = document.getElementById("estado");
    el.textContent = texto;
    el.className = "admin__estado " + (ok ? "ok" : "error");
    clearTimeout(estado._t);
    estado._t = setTimeout(function () { el.className = "admin__estado"; el.textContent = ""; }, 3500);
  }

  function guardar(tipo, data) {
    var fd = new FormData();
    fd.append("csrf", csrf);
    fd.append("tipo", tipo);
    fd.append("data", JSON.stringify(data));
    fetch("guardar.php", { method: "POST", body: fd })
      .then(function (r) { return r.text().then(function (t) { return { ok: r.ok, texto: t }; }); })
      .then(function (res) { estado(res.ok ? "Guardado correctamente" : ("Error: " + res.texto), res.ok); })
      .catch(function () { estado("No se pudo guardar (¿está activo el servidor PHP?)", false); });
  }

  // ---- Pestañas ----
  var tabs = document.querySelectorAll(".admin__tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("activo"); });
      tab.classList.add("activo");
      document.querySelectorAll(".admin__panel").forEach(function (p) { p.classList.remove("activo"); });
      document.getElementById("panel-" + tab.getAttribute("data-tab")).classList.add("activo");
    });
  });

  document.querySelectorAll("[data-save]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tipo = btn.getAttribute("data-save");
      var data = null;
      if (tipo === "programacion") data = recogerProgramacion();
      else if (tipo === "noticias") data = recogerNoticias();
      else if (tipo === "apps") data = recogerApps();
      else if (tipo === "datos") data = recogerDatos();
      if (data !== null) guardar(tipo, data);
    });
  });

  // ---- Programación ----
  function renderProgramacion() {
    var p = datos.programacion;
    var cont = document.getElementById("form-programacion");
    cont.innerHTML = "";

    cont.appendChild(campo("Título del aviso de los viernes", input("text", "campo__control viernes-titulo", p.viernes.titulo)));
    cont.appendChild(campo("Texto del aviso de los viernes", textarea("campo__control viernes-texto", p.viernes.texto)));

    cont.appendChild(h("div", "editor__titulo", "Próximos días"));
    var lista = h("div", "editor");
    (p.proximos || []).forEach(function (ev) { lista.appendChild(filaEvento(ev)); });
    cont.appendChild(lista);

    var anadir = h("button", "btn btn--anadir", "＋ Añadir evento");
    anadir.type = "button";
    anadir.addEventListener("click", function () { lista.appendChild(filaEvento({})); });
    cont.appendChild(anadir);
  }

  function filaEvento(ev) {
    ev = ev || {};
    var f = fila();
    f.appendChild(campo("Fecha", input("date", "campo__control fila__fecha", ev.fecha || "")));
    f.appendChild(campo("Hora", input("time", "campo__control fila__hora", ev.hora || "")));
    f.appendChild(campo("Título", input("text", "campo__control fila__titulo fila--ancha", ev.titulo || "", "Título")));
    f.appendChild(campo("Etiqueta", input("text", "campo__control fila__etiqueta", ev.etiqueta || "", "Taller, Actividad…")));
    f.appendChild(campo("Descripción", input("text", "campo__control fila__texto fila--ancha", ev.texto || "", "Descripción")));
    f.appendChild(botonQuitar());
    return f;
  }

  function recogerProgramacion() {
    var cont = document.getElementById("form-programacion");
    var viernes = {
      titulo: cont.querySelector(".viernes-titulo").value,
      texto: cont.querySelector(".viernes-texto").value
    };
    var proximos = [];
    cont.querySelectorAll(".fila").forEach(function (f) {
      var fecha = f.querySelector(".fila__fecha").value;
      var hora = f.querySelector(".fila__hora").value;
      var titulo = f.querySelector(".fila__titulo").value;
      var etiqueta = f.querySelector(".fila__etiqueta").value;
      var texto = f.querySelector(".fila__texto").value;
      if (fecha || titulo) {
        proximos.push({ fecha: fecha, hora: hora, titulo: titulo, etiqueta: etiqueta, texto: texto });
      }
    });
    return { viernes: viernes, proximos: proximos };
  }

  // ---- Noticias ----
  function renderNoticias() {
    var cont = document.getElementById("form-noticias");
    cont.innerHTML = "";
    var lista = h("div", "editor");
    (datos.noticias || []).forEach(function (n) { lista.appendChild(filaNoticia(n)); });
    cont.appendChild(lista);
    var anadir = h("button", "btn btn--anadir", "＋ Añadir noticia");
    anadir.type = "button";
    anadir.addEventListener("click", function () { lista.appendChild(filaNoticia({})); });
    cont.appendChild(anadir);
  }

  function filaNoticia(n) {
    n = n || {};
    var f = fila();
    f.appendChild(campo("Título", input("text", "campo__control fila__titulo fila--ancha", n.titulo || "", "Título")));
    f.appendChild(campo("Categoría", input("text", "campo__control fila__categoria", n.categoria || "", "Lebeche, Barrioteca, Apps…")));
    f.appendChild(campo("Fecha", input("date", "campo__control fila__fecha", n.fecha || "")));
    f.appendChild(campo("Texto", input("text", "campo__control fila__texto fila--ancha", n.texto || "", "Texto")));

    var chk = input("checkbox", "fila__destacada", null);
    chk.checked = !!n.destacada;
    var lab = h("label", "campo__check", "");
    lab.appendChild(chk);
    lab.appendChild(h("span", "", " Marcar como destacada"));
    f.appendChild(lab);
    f.appendChild(botonQuitar());
    return f;
  }

  function recogerNoticias() {
    var cont = document.getElementById("form-noticias");
    var out = [];
    cont.querySelectorAll(".fila").forEach(function (f) {
      var titulo = f.querySelector(".fila__titulo").value;
      var categoria = f.querySelector(".fila__categoria").value;
      var fecha = f.querySelector(".fila__fecha").value;
      var texto = f.querySelector(".fila__texto").value;
      var destacada = f.querySelector(".fila__destacada").checked;
      if (titulo || fecha) {
        out.push({ titulo: titulo, categoria: categoria, fecha: fecha, texto: texto, destacada: destacada });
      }
    });
    return out;
  }

  // ---- Apps ----
  function renderApps() {
    var cont = document.getElementById("form-apps");
    cont.innerHTML = "";
    var lista = h("div", "editor");
    (datos.apps || []).forEach(function (a) { lista.appendChild(filaApp(a)); });
    cont.appendChild(lista);
    var anadir = h("button", "btn btn--anadir", "＋ Añadir app");
    anadir.type = "button";
    anadir.addEventListener("click", function () { lista.appendChild(filaApp({})); });
    cont.appendChild(anadir);
  }

  function filaApp(a) {
    a = a || {};
    var f = fila();
    f.appendChild(campo("Nombre", input("text", "campo__control fila__nombre", a.nombre || "", "Nombre")));
    f.appendChild(campo("Emoji", input("text", "campo__control fila__emoji", a.emoji || "", "📚")));
    f.appendChild(campo("Descripción", input("text", "campo__control fila__desc fila--ancha", a.descripcion || "", "Descripción")));
    f.appendChild(campo("Estado", select("campo__control fila__estado", ["activa", "proximamente"], a.estado || "proximamente")));
    f.appendChild(campo("URL (solo si está activa)", input("text", "campo__control fila__url", a.url || "", "https://…")));
    f.appendChild(campo("Etiquetas (separadas por coma)", input("text", "campo__control fila__etiquetas fila--ancha", (a.etiquetas || []).join(", "), "Web, Android, iPhone/iPad")));
    f.appendChild(botonQuitar());
    return f;
  }

  function recogerApps() {
    var cont = document.getElementById("form-apps");
    var out = [];
    cont.querySelectorAll(".fila").forEach(function (f) {
      var nombre = f.querySelector(".fila__nombre").value;
      if (!nombre) return;
      var etiquetas = f.querySelector(".fila__etiquetas").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      out.push({
        nombre: nombre,
        emoji: f.querySelector(".fila__emoji").value,
        descripcion: f.querySelector(".fila__desc").value,
        estado: f.querySelector(".fila__estado").value,
        url: f.querySelector(".fila__url").value,
        etiquetas: etiquetas
      });
    });
    return out;
  }

  // ---- Datos (contacto y ubicación) ----
  function renderDatos() {
    var d = datos.datos;
    var cont = document.getElementById("form-datos");
    cont.innerHTML = "";
    var a = d.asociacion || {};
    var u = d.ubicacion || {};

    cont.appendChild(h("div", "seccion", "Asociación"));
    cont.appendChild(campo("Nombre", input("text", "campo__control datos-nombre", a.nombre || "", "Lebeche")));
    cont.appendChild(campo("Tipo", input("text", "campo__control datos-tipo", a.tipo || "", "Asociación cultural y vecinal")));
    cont.appendChild(campo("Localidad", input("text", "campo__control datos-localidad", a.localidad || "", "Salobreña (Granada)")));

    cont.appendChild(h("div", "seccion", "Ubicación"));
    cont.appendChild(campo("Dirección", input("text", "campo__control datos-direccion", u.direccion || "")));
    cont.appendChild(campo("Localidad", input("text", "campo__control datos-localidad-ubi", u.localidad || "")));
    cont.appendChild(campo("Provincia", input("text", "campo__control datos-provincia", u.provincia || "")));
    cont.appendChild(campo("Código postal", input("text", "campo__control datos-cp", u.cp || "")));
    cont.appendChild(campo("País", input("text", "campo__control datos-pais", u.pais || "España")));
    cont.appendChild(campo("Búsqueda para el mapa", input("text", "campo__control datos-mapa", u.consultaMapa || "", "Calle Santa Cruz 8, 18680 Salobreña, Granada, España")));
    cont.appendChild(campo("Nota", textarea("campo__control datos-nota", u.nota || "")));

    cont.appendChild(h("div", "seccion", "Contacto"));
    var lista = h("div", "editor");
    (d.contacto || []).forEach(function (c) { lista.appendChild(filaContacto(c)); });
    cont.appendChild(lista);
    var anadir = h("button", "btn btn--anadir", "＋ Añadir contacto");
    anadir.type = "button";
    anadir.addEventListener("click", function () { lista.appendChild(filaContacto({})); });
    cont.appendChild(anadir);
  }

  function filaContacto(c) {
    c = c || {};
    var f = fila();
    f.appendChild(campo("Icono (emoji)", input("text", "campo__control fila__icono", c.icono || "", "📸")));
    f.appendChild(campo("Nombre", input("text", "campo__control fila__nombre", c.nombre || "", "Instagram…")));
    f.appendChild(campo("Valor", input("text", "campo__control fila__valor", c.valor || "", "@usuario")));
    f.appendChild(campo("URL", input("text", "campo__control fila__url", c.url || "", "https://…")));
    f.appendChild(campo("Descripción", input("text", "campo__control fila__desc fila--ancha", c.desc || "", "")));
    f.appendChild(botonQuitar());
    return f;
  }

  function recogerDatos() {
    var cont = document.getElementById("form-datos");
    var contacto = [];
    cont.querySelectorAll(".fila").forEach(function (f) {
      var nombre = f.querySelector(".fila__nombre").value;
      var valor = f.querySelector(".fila__valor").value;
      if (!nombre && !valor) return;
      contacto.push({
        icono: f.querySelector(".fila__icono").value,
        nombre: nombre,
        valor: valor,
        url: f.querySelector(".fila__url").value,
        desc: f.querySelector(".fila__desc").value
      });
    });

    return {
      asociacion: {
        nombre: cont.querySelector(".datos-nombre").value,
        tipo: cont.querySelector(".datos-tipo").value,
        localidad: cont.querySelector(".datos-localidad").value
      },
      ubicacion: {
        direccion: cont.querySelector(".datos-direccion").value,
        localidad: cont.querySelector(".datos-localidad-ubi").value,
        provincia: cont.querySelector(".datos-provincia").value,
        cp: cont.querySelector(".datos-cp").value,
        pais: cont.querySelector(".datos-pais").value,
        consultaMapa: cont.querySelector(".datos-mapa").value,
        nota: cont.querySelector(".datos-nota").value
      },
      contacto: contacto
    };
  }

  // ---- Iniciar ----
  cargar();
})();



