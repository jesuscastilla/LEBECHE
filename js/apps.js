// Lista de aplicaciones de Lebeche.
// Para añadir una aplicación nueva, copia un bloque { ... } y cambia los datos.
//   estado: "activa" (ya tiene enlace de uso) o "proximamente" (aún en preparación)
//   url: enlace para usar la aplicación (déjalo en "" si aún no está lista)
//   etiquetas: plataformas donde se puede usar (Web, Android, iPhone/iPad...)
window.APPS_LEBECHE = [
  {
    nombre: "Barrioteca Acalencá",
    emoji: "📚",
    descripcion: "La biblioteca vecinal autogestionada: consulta el catálogo, llévate libros en préstamo y devuélvelos escaneando su código con el móvil.",
    estado: "activa",
    url: "https://pelotxo.synology.me/barrioteca/",
    etiquetas: ["Web", "Android", "iPhone/iPad"]
  },
  {
    nombre: "Calendario Lebeche",
    emoji: "📅",
    descripcion: "Agenda común de la asociación con recordatorios, sincronizada con el calendario del móvil. En preparación.",
    estado: "proximamente",
    url: "",
    etiquetas: ["Android"]
  },
  {
    nombre: "Archivo multimedia",
    emoji: "🖼️",
    descripcion: "Fotos, carteles y documentos de la asociación, disponibles para las vecinas. En preparación.",
    estado: "proximamente",
    url: "",
    etiquetas: []
  },
  {
    nombre: "Tablón de anuncios",
    emoji: "📌",
    descripcion: "Avisos y novedades para estar al día de todo lo que pasa en Lebeche. En preparación.",
    estado: "proximamente",
    url: "",
    etiquetas: []
  }
];
