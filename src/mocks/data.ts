// ============================================================================
// DATOS DE DEMOSTRACIÓN — 100 % FICTICIOS
// Portados del diseño aprobado (Archivo STEAM.dc.html). Personas, instituciones,
// cifras y trayectorias son inventadas para probar el diseño. NO representan
// personas reales. En la Fase 3, la capa src/lib/repository sustituye estos
// mocks por consultas reales a Supabase sin tocar los componentes.
// ============================================================================

import type {
  Archive,
  AudioState,
  Chapter,
  City,
  Collection,
  DisciplineKey,
  Source,
  TranscriptTurn,
} from "@/types/domain";
import { pad3, slugify } from "@/lib/format";

export const DISCIPLINES: Record<string, string> = {
  sci: "Ciencia",
  tec: "Tecnología",
  ing: "Ingeniería",
  art: "Arte",
  mat: "Matemáticas",
  med: "Medicina",
  sal: "Salud",
  edu: "Educación",
  ind: "Industria",
  emp: "Empresa",
  cul: "Cultura",
  com: "Comunicación",
};

const CITIES_RAW: Omit<City, "count">[] = [
  { id: "puebla", name: "Puebla", tag: "Ciencia y cultura", intro: "Entre universidades históricas y talleres, Puebla reúne trayectorias que cruzan la ciencia básica con la vida cultural de la ciudad." },
  { id: "cdmx", name: "Ciudad de México", tag: "Cine e investigación", intro: "La capital concentra centros de investigación, estudios de cine y una densidad de historias imposible de agotar." },
  { id: "queretaro", name: "Querétaro", tag: "Industria y tecnología", intro: "Polo aeroespacial y manufacturero, Querétaro documenta el salto de la línea de producción a la alta tecnología." },
  { id: "tampico", name: "Tampico", tag: "Energía y puerto", intro: "Puerto e industria energética, Tampico guarda historias de ingeniería, mar y comunidad." },
  { id: "guadalajara", name: "Guadalajara", tag: "Software y diseño", intro: "Capital del software mexicano y del diseño, Guadalajara aporta voces del cruce entre tecnología y creatividad." },
  { id: "monterrey", name: "Monterrey", tag: "Ingeniería e industria", intro: "Ciudad industrial por excelencia, Monterrey documenta la ingeniería, los materiales y la manufactura avanzada." },
];

const COLLECTIONS_RAW: Omit<Collection, "count">[] = [
  { id: "ia", title: "Inteligencia artificial", desc: "Quienes construyen y cuestionan los sistemas que aprenden.", bg: "linear-gradient(150deg,#241c2e,#12101a)" },
  { id: "ciencia-mx", title: "Ciencia mexicana", desc: "Investigación que ocurre aquí, con recursos y contexto propios.", bg: "linear-gradient(150deg,#1c2620,#101512)" },
  { id: "industria", title: "Industria y manufactura", desc: "De la planta a la automatización: cómo se hacen las cosas.", bg: "linear-gradient(150deg,#2a2114,#14100a)" },
  { id: "cine", title: "Cine y narrativa", desc: "Contar historias con cámara, sonido y paciencia.", bg: "linear-gradient(150deg,#2a1a1a,#150e0e)" },
  { id: "monterrey", title: "Historias de Monterrey", desc: "Ingeniería, materiales y empresa en la ciudad industrial.", bg: "linear-gradient(150deg,#22241c,#111310)" },
  { id: "tampico", title: "Historias de Tampico", desc: "Energía, puerto y comunidad en el Golfo.", bg: "linear-gradient(150deg,#1a2428,#0e1315)" },
  { id: "cotidiano", title: "Investigaciones de uso cotidiano", desc: "Ciencia que ya está en tu casa sin que la notes.", bg: "linear-gradient(150deg,#26221a,#131009)" },
  { id: "errores", title: "Errores que cambiaron una trayectoria", desc: "Lo que se aprende cuando algo sale mal.", bg: "linear-gradient(150deg,#24191c,#130d0f)" },
  { id: "educacion", title: "Educación y comunidad", desc: "Enseñar, divulgar y construir comunidad alrededor del saber.", bg: "linear-gradient(150deg,#1c2226,#0f1314)" },
];

interface RawArchive {
  n: number;
  name: string;
  role: string;
  inst: string;
  city: string;
  disc: DisciplineKey[];
  topics: string[];
  cols: string[];
  title: string;
  summary: string;
  durMin: number;
  rec: string;
  pub: string;
  views: number;
  listens: number;
  saves: number;
  trend: number;
  audio: AudioState;
  thumb: string;
  persona?: string;
  investig?: string;
  aplic?: string;
}

const RAW: RawArchive[] = [
  { n: 3, name: "Daniela Requena", role: "Ingeniera de materiales", inst: "Instituto demo de Materiales", city: "monterrey", disc: ["ing", "ind"], topics: ["materiales", "manufactura"], cols: ["monterrey", "industria", "errores"], title: "Materiales que aprenden del error", summary: "Cómo un lote fallido de aleaciones abrió una línea de investigación sobre materiales autorreparables.", durMin: 52, rec: "2025-01-14", pub: "2025-03-06", views: 8400, listens: 1200, saves: 340, trend: 92, audio: "READY", thumb: "Retrato · laboratorio", persona: "Formada en ingeniería metalúrgica, dedicó una década a entender por qué fallan los materiales antes de intentar mejorarlos.", investig: "Estudia aleaciones capaces de recuperar parte de su estructura tras microfracturas, reduciendo mantenimiento en piezas críticas.", aplic: "Componentes industriales con mayor vida útil, menos paros de planta y menor desperdicio de material." },
  { n: 8, name: "Marco Villalpando", role: "Ingeniero industrial", inst: "Planta demo de Automatización", city: "queretaro", disc: ["ing", "tec", "ind"], topics: ["robotica", "manufactura"], cols: ["industria"], title: "De la línea de producción a la robótica", summary: "La transición de operar una línea manual a diseñar celdas robóticas, contada desde el piso de planta.", durMin: 67, rec: "2025-02-02", pub: "2025-04-11", views: 6100, listens: 900, saves: 210, trend: 74, audio: "READY", thumb: "Retrato · planta", persona: "Empezó como operador y estudió por las noches; hoy diseña procesos automatizados sin olvidar el trabajo manual del que viene.", investig: "Documenta cómo introducir robótica colaborativa sin desplazar personas, rediseñando tareas en lugar de eliminarlas.", aplic: "Celdas de manufactura más seguras y flexibles para pequeñas y medianas empresas." },
  { n: 12, name: "Renata Ocampo", role: "Cineasta documental", inst: "Colectivo demo de Cine", city: "cdmx", disc: ["art", "com", "cul"], topics: ["cine", "datos"], cols: ["cine"], title: "Narrar la ciencia en el cine", summary: "Qué cambia cuando una investigación se convierte en documental y cómo se cuida el rigor sin perder la emoción.", durMin: 48, rec: "2025-02-18", pub: "2025-04-20", views: 9200, listens: 1500, saves: 410, trend: 88, audio: "PROCESSING", thumb: "Retrato · foro", persona: "Documentalista con formación en comunicación de la ciencia; busca puentes entre el laboratorio y la sala de cine.", investig: "Explora cómo la narrativa audiovisual afecta la comprensión pública de temas científicos complejos.", aplic: "Mejores estrategias de divulgación para instituciones, museos y aulas." },
  { n: 17, name: "Iván Salgado", role: "Ingeniero de software", inst: "Estudio demo de IA", city: "guadalajara", disc: ["tec"], topics: ["inteligencia-artificial", "datos"], cols: ["ia", "cotidiano"], title: "Modelos que caben en un teléfono", summary: "Llevar inteligencia artificial útil a dispositivos pequeños, sin depender siempre de la nube.", durMin: 59, rec: "2025-03-01", pub: "2025-04-28", views: 11200, listens: 2100, saves: 520, trend: 96, audio: "READY", thumb: "Retrato · estudio", persona: "Ingeniero de software enfocado en modelos ligeros que corren en el dispositivo, sin enviar datos a la nube.", investig: "Optimiza modelos de aprendizaje automático para que funcionen con poca memoria y batería.", aplic: "Asistentes y herramientas de IA que respetan la privacidad y funcionan sin conexión." },
  { n: 19, name: "Emilio Bárcena", role: "Físico", inst: "Centro demo de Física", city: "puebla", disc: ["sci", "mat"], topics: ["energia", "clima"], cols: ["ciencia-mx", "cotidiano"], title: "Medir la luz para entender el clima", summary: "Instrumentos hechos en México para medir radiación solar y alimentar modelos climáticos regionales.", durMin: 63, rec: "2025-01-28", pub: "2025-03-19", views: 5400, listens: 820, saves: 190, trend: 61, audio: "NOT_REQUESTED", thumb: "Retrato · observatorio", persona: "Físico experimental que construye sus propios instrumentos porque importarlos costaba diez veces más.", investig: "Desarrolla sensores de radiación de bajo costo y una red abierta de datos climáticos regionales.", aplic: "Datos climáticos más finos para agricultura, energía solar y política pública local." },
  { n: 24, name: "Ximena Fuentes", role: "Bióloga molecular", inst: "Laboratorio demo de Biotecnología", city: "cdmx", disc: ["sci", "med", "sal"], topics: ["biotecnologia", "salud-publica"], cols: ["ciencia-mx"], title: "Diagnósticos que no necesitan un hospital", summary: "Pruebas moleculares de bajo costo pensadas para comunidades sin laboratorio cercano.", durMin: 55, rec: "2025-02-11", pub: "2025-04-02", views: 7800, listens: 1350, saves: 380, trend: 83, audio: "READY", thumb: "Retrato · laboratorio", persona: "Bióloga molecular convencida de que la ciencia de frontera también puede ser barata y portátil.", investig: "Diseña pruebas diagnósticas que funcionan sin cadena de frío ni equipo especializado.", aplic: "Detección temprana de enfermedades en zonas rurales y de difícil acceso." },
  { n: 31, name: "Aarón Michel", role: "Ingeniero de software", inst: "Estudio demo de Software", city: "guadalajara", disc: ["tec", "com"], topics: ["datos", "inteligencia-artificial"], cols: ["ia", "educacion"], title: "Programar para quien nunca programó", summary: "Herramientas que dejan crear software a personas sin formación técnica, y qué se gana y se pierde en el camino.", durMin: 44, rec: "2025-03-08", pub: "2025-05-01", views: 6600, listens: 1000, saves: 250, trend: 70, audio: "OUTDATED", thumb: "Retrato · estudio", persona: "Autodidacta que aprendió a programar en una biblioteca pública y hoy construye herramientas para otros autodidactas.", investig: "Trabaja en interfaces que traducen intención en código, bajando la barrera de entrada al desarrollo.", aplic: "Más personas creando soluciones digitales para sus propias comunidades." },
  { n: 36, name: "Lucía Prado", role: "Arquitecta", inst: "Taller demo de Arquitectura", city: "guadalajara", disc: ["art", "ing", "cul"], topics: ["arquitectura", "clima"], cols: ["cotidiano"], title: "Construir con lo que ya está ahí", summary: "Arquitectura que reutiliza materiales locales y adapta técnicas antiguas al clima de hoy.", durMin: 50, rec: "2025-02-25", pub: "2025-04-15", views: 4900, listens: 600, saves: 160, trend: 58, audio: "NOT_REQUESTED", thumb: "Retrato · taller", persona: "Arquitecta interesada en el bajo impacto: menos concreto nuevo, más inteligencia sobre lo existente.", investig: "Investiga sistemas constructivos que combinan tierra, madera y residuos industriales.", aplic: "Vivienda más fresca, barata y de menor huella de carbono." },
  { n: 42, name: "Tomás Iregui", role: "Ingeniero energético", inst: "Instituto demo de Energía", city: "tampico", disc: ["ing", "sci", "ind"], topics: ["energia", "clima"], cols: ["tampico", "industria"], title: "La transición vista desde el puerto", summary: "Qué significa la transición energética para una ciudad construida alrededor del petróleo.", durMin: 69, rec: "2025-01-20", pub: "2025-03-12", views: 5200, listens: 780, saves: 200, trend: 64, audio: "READY", thumb: "Retrato · puerto", persona: "Ingeniero que creció entre refinerías y hoy trabaja en cómo reconvertir esa infraestructura y ese conocimiento.", investig: "Analiza cómo reutilizar infraestructura portuaria y energética para energías renovables.", aplic: "Rutas realistas de transición para regiones dependientes de hidrocarburos." },
  { n: 47, name: "Fernanda Solís", role: "Matemática", inst: "Centro demo de Matemáticas", city: "puebla", disc: ["mat", "edu"], topics: ["datos", "educacion"], cols: ["ciencia-mx", "educacion"], title: "Las matemáticas que no se enseñan", summary: "Por qué gran parte de la matemática útil queda fuera del aula y cómo acercarla sin diluirla.", durMin: 46, rec: "2025-03-14", pub: "2025-05-04", views: 6000, listens: 940, saves: 230, trend: 67, audio: "NOT_REQUESTED", thumb: "Retrato · pizarrón", persona: "Matemática y divulgadora que se niega a elegir entre el rigor y la claridad.", investig: "Trabaja en didáctica de la modelación matemática para bachillerato y comunidad.", aplic: "Estudiantes que entienden para qué sirven las matemáticas, no solo cómo aprobar." },
  { n: 53, name: "Gabriel Ontiveros", role: "Médico e investigador", inst: "Hospital demo Universitario", city: "monterrey", disc: ["med", "sal", "sci"], topics: ["salud-publica", "neurociencia"], cols: ["monterrey"], title: "Lo que el sueño le hace al cerebro", summary: "Años estudiando cómo el descanso repara —o deja de reparar— funciones cognitivas.", durMin: 58, rec: "2025-02-06", pub: "2025-03-28", views: 8900, listens: 1600, saves: 430, trend: 81, audio: "READY", thumb: "Retrato · clínica", persona: "Médico que dejó parcialmente la consulta para investigar algo que veía todos los días: pacientes que no duermen.", investig: "Estudia la relación entre calidad del sueño y deterioro cognitivo en adultos.", aplic: "Guías de higiene del sueño basadas en evidencia para clínicas y familias." },
  { n: 58, name: "Paola Cervantes", role: "Diseñadora industrial", inst: "Estudio demo de Diseño", city: "guadalajara", disc: ["art", "ind", "tec"], topics: ["manufactura", "datos"], cols: ["industria", "cotidiano"], title: "Diseñar objetos que se puedan reparar", summary: "Contra la obsolescencia: productos pensados para durar, abrirse y arreglarse.", durMin: 41, rec: "2025-03-20", pub: "2025-05-08", views: 5700, listens: 700, saves: 210, trend: 72, audio: "PROCESSING", thumb: "Retrato · taller", persona: "Diseñadora que mide el éxito de un objeto por cuánto tiempo la gente decide quedárselo.", investig: "Explora principios de diseño para reparabilidad y ensamblaje sin herramientas especiales.", aplic: "Electrodomésticos y muebles con vida útil más larga y menos residuos." },
  { n: 61, name: "Héctor Naranjo", role: "Ingeniero aeroespacial", inst: "Clúster demo Aeroespacial", city: "queretaro", disc: ["ing", "tec"], topics: ["manufactura", "robotica"], cols: ["industria"], title: "Piezas que vuelan y no pueden fallar", summary: "La cultura de calidad extrema de la manufactura aeroespacial, contada sin épica.", durMin: 64, rec: "2025-01-31", pub: "2025-03-23", views: 4600, listens: 540, saves: 150, trend: 55, audio: "NOT_REQUESTED", thumb: "Retrato · hangar", persona: "Ingeniero para quien un error de milímetros no es una anécdota, es una vida.", investig: "Documenta procesos de control de calidad y trazabilidad en manufactura de precisión.", aplic: "Estándares transferibles a otras industrias donde la falla es costosa." },
  { n: 66, name: "Rubén Alcázar", role: "Luthier", inst: "Taller demo de Luthería", city: "puebla", disc: ["art", "cul"], topics: ["musica", "manufactura"], cols: ["cotidiano"], title: "La ciencia escondida en un violín", summary: "Cómo la acústica, la madera y siglos de oficio conviven en la construcción de un instrumento.", durMin: 53, rec: "2025-02-22", pub: "2025-04-18", views: 7100, listens: 1250, saves: 360, trend: 78, audio: "READY", thumb: "Retrato · taller", persona: "Luthier que estudia física de materiales para explicar lo que sus manos ya sabían.", investig: "Relaciona propiedades de la madera y geometría con el timbre del instrumento.", aplic: "Formación de nuevos luthiers y conservación de instrumentos históricos." },
  { n: 72, name: "Adriana Lozano", role: "Comunicadora de la ciencia", inst: "Museo demo de Ciencia", city: "cdmx", disc: ["com", "edu", "cul"], topics: ["educacion", "datos"], cols: ["educacion", "cine"], title: "Un museo no es un libro de texto", summary: "Diseñar experiencias donde la gente toca, se equivoca y entiende.", durMin: 45, rec: "2025-03-11", pub: "2025-05-02", views: 6800, listens: 1100, saves: 290, trend: 75, audio: "NOT_REQUESTED", thumb: "Retrato · museo", persona: "Curadora que aprendió más de los visitantes que de cualquier manual de museografía.", investig: "Estudia cómo el diseño de exhibiciones interactivas afecta el aprendizaje informal.", aplic: "Museos y centros culturales con mayor impacto educativo." },
  { n: 77, name: "Sergio Maldonado", role: "Ingeniero civil", inst: "Constructora demo", city: "tampico", disc: ["ing", "ind"], topics: ["clima", "energia"], cols: ["tampico"], title: "Construir para un mar que sube", summary: "Infraestructura costera pensada para un clima que ya no es el de los manuales.", durMin: 57, rec: "2025-02-14", pub: "2025-04-06", views: 4300, listens: 520, saves: 140, trend: 52, audio: "FAILED", thumb: "Retrato · costa", persona: "Ingeniero civil que rehace sus propios supuestos cada temporada de huracanes.", investig: "Adapta criterios de diseño de infraestructura costera al aumento del nivel del mar.", aplic: "Puertos y comunidades costeras más resilientes." },
  { n: 84, name: "Valeria Ánimas", role: "Neurocientífica", inst: "Instituto demo de Neurociencia", city: "monterrey", disc: ["sci", "med", "sal"], topics: ["neurociencia", "datos"], cols: ["monterrey", "ciencia-mx"], title: "Cómo aprende un cerebro que aprende", summary: "Qué revela la neurociencia sobre la memoria y por qué olvidamos casi todo.", durMin: 60, rec: "2025-03-04", pub: "2025-04-30", views: 9800, listens: 1800, saves: 470, trend: 90, audio: "READY", thumb: "Retrato · laboratorio", persona: "Neurocientífica fascinada por el olvido tanto como por la memoria.", investig: "Investiga los mecanismos de consolidación de la memoria durante el aprendizaje.", aplic: "Métodos de estudio y rehabilitación cognitiva basados en evidencia." },
  { n: 89, name: "Rodrigo Fierro", role: "Emprendedor social", inst: "Iniciativa demo Comunitaria", city: "guadalajara", disc: ["emp", "edu", "com"], topics: ["educacion", "emprendimiento"], cols: ["educacion"], title: "Emprender sin traicionar la causa", summary: "Sostener económicamente un proyecto social sin convertirlo en otra cosa.", durMin: 49, rec: "2025-03-18", pub: "2025-05-06", views: 5100, listens: 640, saves: 180, trend: 63, audio: "NOT_REQUESTED", thumb: "Retrato · comunidad", persona: "Emprendedor que mide el éxito en personas alcanzadas, no en rondas de inversión.", investig: "Documenta modelos de sostenibilidad para proyectos de impacto social.", aplic: "Organizaciones comunitarias más duraderas y menos dependientes de donativos." },
  { n: 93, name: "Camila Rentería", role: "Ingeniera ambiental", inst: "Centro demo Ambiental", city: "cdmx", disc: ["ing", "sci", "sal"], topics: ["clima", "salud-publica"], cols: ["ciencia-mx", "cotidiano"], title: "El aire que respira una ciudad", summary: "Medir, entender y comunicar la calidad del aire en una de las ciudades más grandes del mundo.", durMin: 54, rec: "2025-02-28", pub: "2025-04-24", views: 7300, listens: 1150, saves: 310, trend: 79, audio: "READY", thumb: "Retrato · azotea", persona: "Ingeniera ambiental que convirtió una red casera de sensores en un proyecto ciudadano.", investig: "Construye redes de monitoreo de contaminación abiertas y de bajo costo.", aplic: "Información accionable para decisiones de salud y política ambiental." },
  { n: 100, name: "Ignacio del Real", role: "Historiador de la tecnología", inst: "Archivo demo Histórico", city: "puebla", disc: ["cul", "com", "edu"], topics: ["datos", "educacion"], cols: ["educacion", "errores"], title: "Lo que olvidamos cuando innovamos", summary: "Un recorrido por tecnologías que fracasaron y por lo que su fracaso todavía enseña.", durMin: 62, rec: "2025-03-22", pub: "2025-05-10", views: 8100, listens: 1400, saves: 400, trend: 85, audio: "READY", thumb: "Retrato · archivo", persona: "Historiador que colecciona fracasos técnicos como otros coleccionan éxitos.", investig: "Estudia la historia de la tecnología en México a partir de proyectos abandonados.", aplic: "Memoria técnica que evita repetir errores costosos." },
];

const CHAPTER_LABELS = ["Introducción", "Cómo empezó", "El giro", "El trabajo que no se ve", "Lo que salió mal", "Qué debería preservarse"];

function buildChapters(durMin: number): Chapter[] {
  const total = durMin * 60;
  return CHAPTER_LABELS.map((label, i) => ({ t: Math.round((total * i) / CHAPTER_LABELS.length), label }));
}

function buildTranscript(name: string, city: string): TranscriptTurn[] {
  return [
    { time: "00:00", sp: "Archivo STEAM", text: `Estamos en ${city} con ${name}. Gracias por recibirnos. Quiero empezar por el principio: ¿cómo llegaste a esto?` },
    { time: "00:42", sp: name, text: "Nadie en mi familia se dedicaba a algo parecido. Llegué medio por accidente, siguiendo una curiosidad que no me dejaba en paz." },
    { time: "02:15", sp: "Archivo STEAM", text: "¿Hubo una decisión concreta que cambió tu rumbo?" },
    { time: "02:38", sp: name, text: "Sí. Hubo un momento en que algo falló de forma tan clara que tuve que elegir: taparlo o entenderlo. Elegí entenderlo, y eso definió todo lo demás." },
    { time: "05:10", sp: "Archivo STEAM", text: "Hablemos de la parte que la gente no ve de tu trabajo." },
    { time: "05:30", sp: name, text: "La mayoría del tiempo no es el gran hallazgo. Es repetir, documentar, equivocarse y volver a empezar. Esa constancia es el trabajo real." },
    { time: "08:02", sp: "Archivo STEAM", text: "Si alguien empieza hoy en tu campo, ¿qué le dirías?" },
    { time: "08:20", sp: name, text: "Que no le tenga miedo a no saber. El conocimiento no vive en un solo lugar ni en una sola persona; se comparte, y por eso crece." },
  ];
}

function buildFuentes(a: RawArchive, numStr: string): Source[] {
  const topic = (a.topics[0] || "el tema").replace(/-/g, " ");
  return [
    { kind: "declaracion", title: "Declaración en entrevista", meta: `${numStr} · Archivo STEAM` },
    { kind: "investigacion", title: `Ficha de investigación de ${a.name}`, meta: "Verificación interna · Archivo STEAM" },
    { kind: "externa", title: `Publicación de referencia sobre ${topic}`, meta: `${a.inst || "Institución demo"} (demo)` },
    { kind: "complementario", title: "Material complementario del archivo", meta: "Documento de apoyo · demo" },
  ];
}

const cityNameById = new Map(CITIES_RAW.map((c) => [c.id, c.name]));

function build(a: RawArchive): Archive {
  const numStr = `ARCHIVO ${pad3(a.n)}`;
  const cityName = cityNameById.get(a.city) || a.city;
  const discLabel = a.disc.map((d) => DISCIPLINES[d]).filter(Boolean)[0] || "";
  return {
    ...a,
    slug: `${pad3(a.n)}-${slugify(a.name)}`,
    numStr,
    cityName,
    discLabel,
    persona: a.persona || "",
    investig: a.investig || "",
    aplic: a.aplic || "",
    chapters: buildChapters(a.durMin),
    transcript: buildTranscript(a.name, cityName),
    fuentes: buildFuentes(a, numStr),
  };
}

export const ARCHIVES: Archive[] = RAW.map(build);
export const archiveBySlug = new Map(ARCHIVES.map((a) => [a.slug, a]));
export const archiveByN = new Map(ARCHIVES.map((a) => [a.n, a]));

export const CITIES: City[] = CITIES_RAW.map((c) => ({
  ...c,
  count: ARCHIVES.filter((a) => a.city === c.id).length,
}));
export const cityById = new Map(CITIES.map((c) => [c.id, c]));

export const COLLECTIONS: Collection[] = COLLECTIONS_RAW.map((c) => ({
  ...c,
  count: ARCHIVES.filter((a) => a.cols.includes(c.id)).length,
}));
export const collectionById = new Map(COLLECTIONS.map((c) => [c.id, c]));
