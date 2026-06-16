// Divisiones CNAE-2009 (2 dígitos). El matching compara solo los 2 primeros
// dígitos del CNAE, así que la división es la granularidad correcta: el usuario
// elige su actividad por nombre y guardamos el código.

export interface CnaeDivision {
  code: string
  label: string
}

export const CNAE_DIVISIONES: CnaeDivision[] = [
  { code: '01', label: 'Agricultura, ganadería, caza y servicios relacionados' },
  { code: '02', label: 'Silvicultura y explotación forestal' },
  { code: '03', label: 'Pesca y acuicultura' },
  { code: '05', label: 'Extracción de antracita, hulla y lignito' },
  { code: '06', label: 'Extracción de crudo de petróleo y gas natural' },
  { code: '07', label: 'Extracción de minerales metálicos' },
  { code: '08', label: 'Otras industrias extractivas' },
  { code: '09', label: 'Actividades de apoyo a las industrias extractivas' },
  { code: '10', label: 'Industria de la alimentación' },
  { code: '11', label: 'Fabricación de bebidas' },
  { code: '12', label: 'Industria del tabaco' },
  { code: '13', label: 'Industria textil' },
  { code: '14', label: 'Confección de prendas de vestir' },
  { code: '15', label: 'Industria del cuero y del calzado' },
  { code: '16', label: 'Industria de la madera y del corcho (excepto muebles)' },
  { code: '17', label: 'Industria del papel' },
  { code: '18', label: 'Artes gráficas y reproducción de soportes grabados' },
  { code: '19', label: 'Coquerías y refino de petróleo' },
  { code: '20', label: 'Industria química' },
  { code: '21', label: 'Fabricación de productos farmacéuticos' },
  { code: '22', label: 'Fabricación de productos de caucho y plásticos' },
  { code: '23', label: 'Fabricación de otros productos minerales no metálicos' },
  { code: '24', label: 'Metalurgia' },
  { code: '25', label: 'Fabricación de productos metálicos (excepto maquinaria)' },
  { code: '26', label: 'Productos informáticos, electrónicos y ópticos' },
  { code: '27', label: 'Fabricación de material y equipo eléctrico' },
  { code: '28', label: 'Fabricación de maquinaria y equipo' },
  { code: '29', label: 'Fabricación de vehículos de motor y remolques' },
  { code: '30', label: 'Fabricación de otro material de transporte' },
  { code: '31', label: 'Fabricación de muebles' },
  { code: '32', label: 'Otras industrias manufactureras' },
  { code: '33', label: 'Reparación e instalación de maquinaria y equipo' },
  { code: '35', label: 'Energía eléctrica, gas, vapor y aire acondicionado' },
  { code: '36', label: 'Captación, depuración y distribución de agua' },
  { code: '37', label: 'Recogida y tratamiento de aguas residuales' },
  { code: '38', label: 'Recogida y tratamiento de residuos; valorización' },
  { code: '39', label: 'Descontaminación y gestión de residuos' },
  { code: '41', label: 'Construcción de edificios' },
  { code: '42', label: 'Ingeniería civil (obra pública)' },
  { code: '43', label: 'Construcción especializada (instaladores, acabados)' },
  { code: '45', label: 'Venta y reparación de vehículos de motor y motocicletas' },
  { code: '46', label: 'Comercio al por mayor (excepto vehículos)' },
  { code: '47', label: 'Comercio al por menor (excepto vehículos)' },
  { code: '49', label: 'Transporte terrestre y por tubería' },
  { code: '50', label: 'Transporte marítimo y por vías navegables' },
  { code: '51', label: 'Transporte aéreo' },
  { code: '52', label: 'Almacenamiento y actividades anexas al transporte' },
  { code: '53', label: 'Actividades postales y de correos' },
  { code: '55', label: 'Alojamiento (hoteles, turismo rural...)' },
  { code: '56', label: 'Servicios de comidas y bebidas (hostelería)' },
  { code: '58', label: 'Edición (libros, prensa, software)' },
  { code: '59', label: 'Cine, vídeo, televisión y grabación de sonido' },
  { code: '60', label: 'Programación y emisión de radio y televisión' },
  { code: '61', label: 'Telecomunicaciones' },
  { code: '62', label: 'Programación, consultoría informática (software/TIC)' },
  { code: '63', label: 'Servicios de información (portales, datos)' },
  { code: '64', label: 'Servicios financieros (excepto seguros)' },
  { code: '65', label: 'Seguros, reaseguros y fondos de pensiones' },
  { code: '66', label: 'Actividades auxiliares a finanzas y seguros' },
  { code: '68', label: 'Actividades inmobiliarias' },
  { code: '69', label: 'Actividades jurídicas y de contabilidad' },
  { code: '70', label: 'Consultoría de gestión empresarial' },
  { code: '71', label: 'Arquitectura, ingeniería y ensayos técnicos' },
  { code: '72', label: 'Investigación y desarrollo (I+D)' },
  { code: '73', label: 'Publicidad y estudios de mercado' },
  { code: '74', label: 'Otras actividades profesionales (diseño, traducción...)' },
  { code: '75', label: 'Actividades veterinarias' },
  { code: '77', label: 'Alquiler de bienes (maquinaria, vehículos...)' },
  { code: '78', label: 'Actividades relacionadas con el empleo (ETT, RRHH)' },
  { code: '79', label: 'Agencias de viajes y operadores turísticos' },
  { code: '80', label: 'Seguridad e investigación' },
  { code: '81', label: 'Servicios a edificios y jardinería (limpieza)' },
  { code: '82', label: 'Actividades administrativas de oficina y auxiliares' },
  { code: '84', label: 'Administración pública y defensa' },
  { code: '85', label: 'Educación y formación' },
  { code: '86', label: 'Actividades sanitarias' },
  { code: '87', label: 'Asistencia en establecimientos residenciales' },
  { code: '88', label: 'Servicios sociales sin alojamiento' },
  { code: '90', label: 'Creación, artes escénicas y espectáculos' },
  { code: '91', label: 'Bibliotecas, archivos, museos y cultura' },
  { code: '92', label: 'Juegos de azar y apuestas' },
  { code: '93', label: 'Actividades deportivas, recreativas y de ocio' },
  { code: '94', label: 'Actividades asociativas' },
  { code: '95', label: 'Reparación de ordenadores y efectos personales' },
  { code: '96', label: 'Otros servicios personales (peluquería, estética...)' },
]

const CODE_TO_LABEL: Record<string, string> = Object.fromEntries(
  CNAE_DIVISIONES.map(d => [d.code, d.label])
)

// Opciones para el Combobox: "47 · Comercio al por menor…"
export const CNAE_OPTIONS: string[] = CNAE_DIVISIONES.map(d => `${d.code} · ${d.label}`)

// Texto a mostrar a partir del código guardado.
export function cnaeDisplay(code: string | null): string {
  if (!code) return ''
  const label = CODE_TO_LABEL[code]
  return label ? `${code} · ${label}` : code
}

// De lo que el usuario elige/teclea → código de 2 dígitos (o lo tecleado si es libre).
export function cnaeFromInput(v: string): string | null {
  const t = v.trim()
  if (!t) return null
  const m = t.match(/^(\d{2})/)
  if (m) return m[1]
  const digits = t.replace(/\D/g, '').slice(0, 6)
  return digits || null
}
