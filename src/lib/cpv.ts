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

const CPV_LABEL: Record<string, string> = Object.fromEntries(CPV_DIVISIONES.map(d => [d.code, d.label]))

// Etiqueta de una familia CPV (2 dígitos) o de un código completo (toma los 2 primeros).
export function cpvLabel(code: string): string {
  const fam = code.replace(/[^0-9]/g, '').slice(0, 2)
  return CPV_LABEL[fam] ?? `CPV ${fam}`
}
