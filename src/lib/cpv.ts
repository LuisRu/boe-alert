// Catálogo CPV a nivel de DIVISIÓN (2 primeros dígitos) con etiquetas en lenguaje
// claro. El matching de licitaciones trabaja por familia (2 dígitos), así que el
// usuario elige divisiones, no los 8 dígitos completos. Lista curada para pymes.

export interface CpvDivision {
  code: string // 2 dígitos
  label: string
}

export const CPV_DIVISIONES: CpvDivision[] = [
  { code: '03', label: 'Agricultura, ganadería y pesca' },
  { code: '09', label: 'Energía, combustibles y electricidad' },
  { code: '15', label: 'Alimentación y bebidas' },
  { code: '18', label: 'Ropa, textil y calzado' },
  { code: '22', label: 'Imprenta y artes gráficas' },
  { code: '24', label: 'Productos químicos' },
  { code: '30', label: 'Equipos informáticos y de oficina' },
  { code: '31', label: 'Material eléctrico' },
  { code: '32', label: 'Telecomunicaciones y audiovisual' },
  { code: '33', label: 'Material sanitario y farmacéutico' },
  { code: '34', label: 'Vehículos y transporte' },
  { code: '37', label: 'Instrumentos, deporte y juguetes' },
  { code: '38', label: 'Equipos de laboratorio y precisión' },
  { code: '39', label: 'Mobiliario y enseres' },
  { code: '42', label: 'Maquinaria industrial' },
  { code: '44', label: 'Materiales de construcción' },
  { code: '45', label: 'Obras y construcción' },
  { code: '48', label: 'Software y aplicaciones' },
  { code: '50', label: 'Reparación y mantenimiento' },
  { code: '51', label: 'Servicios de instalación' },
  { code: '55', label: 'Hostelería y restauración' },
  { code: '60', label: 'Transporte (terrestre, aéreo…)' },
  { code: '63', label: 'Logística y agencias de viaje' },
  { code: '64', label: 'Correos y telecomunicaciones' },
  { code: '66', label: 'Servicios financieros y seguros' },
  { code: '70', label: 'Servicios inmobiliarios' },
  { code: '71', label: 'Arquitectura e ingeniería' },
  { code: '72', label: 'Servicios informáticos (TI)' },
  { code: '73', label: 'Investigación y desarrollo (I+D)' },
  { code: '77', label: 'Jardinería y servicios agrícolas' },
  { code: '79', label: 'Consultoría, jurídico y marketing' },
  { code: '80', label: 'Educación y formación' },
  { code: '85', label: 'Sanidad y servicios sociales' },
  { code: '90', label: 'Limpieza, residuos y medioambiente' },
  { code: '92', label: 'Cultura, ocio y deporte' },
  { code: '98', label: 'Otros servicios' },
]

// Códigos CPV específicos más buscados (servicios/suministros/obras frecuentes),
// para poder encontrarlos por NOMBRE en el selector (p.ej. "traducción"). El
// filtro envía el código completo y el backend casa por prefijo.
export const CPV_COMUNES: CpvDivision[] = [
  // Servicios profesionales y de empresa (79)
  { code: '79530000', label: 'Servicios de traducción' },
  { code: '79540000', label: 'Servicios de interpretación' },
  { code: '79100000', label: 'Servicios jurídicos' },
  { code: '79200000', label: 'Contabilidad, auditoría y fiscal' },
  { code: '79300000', label: 'Estudios de mercado y encuestas' },
  { code: '79340000', label: 'Publicidad y marketing' },
  { code: '79400000', label: 'Consultoría de gestión y negocio' },
  { code: '79500000', label: 'Apoyo administrativo / oficina' },
  { code: '79620000', label: 'Suministro de personal (ETT)' },
  { code: '79710000', label: 'Seguridad y vigilancia' },
  { code: '79950000', label: 'Organización de eventos y ferias' },
  // Formación, salud y social (80, 85)
  { code: '80500000', label: 'Servicios de formación' },
  { code: '85100000', label: 'Servicios de salud' },
  { code: '85300000', label: 'Servicios de asistencia social' },
  // Limpieza, residuos y medioambiente (90)
  { code: '90910000', label: 'Servicios de limpieza' },
  { code: '90500000', label: 'Gestión de residuos' },
  { code: '90600000', label: 'Limpieza y saneamiento urbano' },
  // Hostelería, transporte, finanzas (55, 60, 63, 66)
  { code: '55520000', label: 'Catering' },
  { code: '55300000', label: 'Restaurante y comidas' },
  { code: '60100000', label: 'Transporte por carretera' },
  { code: '63500000', label: 'Agencias de viajes' },
  { code: '66510000', label: 'Seguros' },
  // Ingeniería y arquitectura (71)
  { code: '71200000', label: 'Servicios de arquitectura' },
  { code: '71300000', label: 'Servicios de ingeniería' },
  { code: '71400000', label: 'Urbanismo y paisajismo' },
  // TI y software (72, 48, 30)
  { code: '72200000', label: 'Desarrollo de software y consultoría TI' },
  { code: '72400000', label: 'Servicios de Internet' },
  { code: '72600000', label: 'Soporte y apoyo informático' },
  { code: '48000000', label: 'Software y sistemas de información' },
  { code: '30200000', label: 'Equipo y material informático' },
  // Sanitario, vehículos, mobiliario (33, 34, 39)
  { code: '33600000', label: 'Productos farmacéuticos' },
  { code: '33100000', label: 'Equipos médicos' },
  { code: '34100000', label: 'Vehículos de motor' },
  { code: '39000000', label: 'Mobiliario y enseres' },
  // Construcción y mantenimiento (45, 50, 51, 44)
  { code: '45210000', label: 'Construcción de edificios' },
  { code: '45230000', label: 'Obra civil (carreteras, redes)' },
  { code: '45233000', label: 'Obras de carreteras' },
  { code: '50700000', label: 'Mantenimiento de edificios' },
  // Energía, alimentación, agrario (09, 15, 03, 77)
  { code: '09300000', label: 'Electricidad y energía' },
  { code: '15000000', label: 'Alimentos y bebidas' },
  { code: '77300000', label: 'Servicios de jardinería' },
  // Telecomunicaciones e inmobiliario (64, 70)
  { code: '64200000', label: 'Telecomunicaciones' },
  { code: '70000000', label: 'Servicios inmobiliarios' },
]

// Catálogo para el selector: familias (2 díg.) + códigos específicos comunes.
export const CPV_CATALOGO: CpvDivision[] = [...CPV_DIVISIONES, ...CPV_COMUNES]

const CPV_LABEL: Record<string, string> = Object.fromEntries(CPV_DIVISIONES.map(d => [d.code, d.label]))

// Etiqueta de una familia CPV (2 dígitos) o de un código completo (toma los 2 primeros).
export function cpvLabel(code: string): string {
  const fam = code.replace(/[^0-9]/g, '').slice(0, 2)
  return CPV_LABEL[fam] ?? `CPV ${fam}`
}
