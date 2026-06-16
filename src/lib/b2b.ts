// Etiquetas B2B para el formulario (los ids deben coincidir con backend/src/lib/b2b.ts).
// Formato [id, label] para encajar con el componente Chips.

export const AREAS_B2B: [string, string][] = [
  ['comercio_turismo', 'Comercio, turismo y hostelería'],
  ['industria_energia', 'Industria y energía'],
  ['agro_pesca', 'Agricultura, pesca y alimentación'],
  ['cultura', 'Cultura y creatividad'],
  ['idi', 'Investigación e innovación (I+D+i)'],
  ['empleo', 'Empleo y RRHH'],
  ['educacion', 'Educación y formación'],
  ['construccion_vivienda', 'Construcción e infraestructura'],
  ['transporte', 'Transporte y logística'],
  ['sanidad', 'Salud y sanidad'],
  ['social', 'Servicios sociales y tercer sector'],
]

export const OBJETIVOS_B2B: [string, string][] = [
  ['digitalizar', 'Digitalización'],
  ['exportar', 'Internacionalización / exportar'],
  ['innovar', 'Innovación / I+D'],
  ['contratar', 'Contratar / crear empleo'],
  ['energia_eficiencia', 'Eficiencia energética / sostenibilidad'],
  ['emprender', 'Emprender / nueva empresa'],
  ['modernizar', 'Modernizar / maquinaria'],
  ['formacion', 'Formación'],
]

export const FORMA_JURIDICA: [string, string][] = [
  ['AUTONOMO_PF', 'Autónomo (persona física)'],
  ['SOCIEDAD', 'Sociedad (SL, SA)'],
  ['COOPERATIVA', 'Cooperativa / S. laboral'],
  ['ASOCIACION', 'Asociación / fundación'],
]
