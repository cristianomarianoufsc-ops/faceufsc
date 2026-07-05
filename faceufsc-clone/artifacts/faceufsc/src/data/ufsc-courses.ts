export interface UfscCourse {
  name: string;
  department: string;
}

export interface DepartmentConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
}

export const DEPARTMENT_CONFIG: Record<string, DepartmentConfig> = {
  CCE: {
    label: "CCE — Comunicação e Expressão",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-700",
    icon: "Palette",
  },
  CCB: {
    label: "CCB — Ciências Biológicas",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
    icon: "Microscope",
  },
  CCJ: {
    label: "CCJ — Ciências Jurídicas",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    icon: "Scale",
  },
  CCS: {
    label: "CCS — Ciências da Saúde",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
    icon: "HeartPulse",
  },
  CDS: {
    label: "CDS — Centro de Desportos",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
    icon: "Trophy",
  },
  CED: {
    label: "CED — Ciências da Educação",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    icon: "GraduationCap",
  },
  CFH: {
    label: "CFH — Filosofia e Ciências Humanas",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
    icon: "Brain",
  },
  CFM: {
    label: "CFM — Ciências Físicas e Matemáticas",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-700",
    icon: "Atom",
  },
  CSE: {
    label: "CSE — Centro Socioeconômico",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-700",
    icon: "TrendingUp",
  },
  CTC: {
    label: "CTC — Centro Tecnológico",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-700",
    icon: "Cpu",
  },
  ARA: {
    label: "ARA — Campus Araranguá",
    bg: "bg-lime-50",
    text: "text-lime-700",
    border: "border-lime-200",
    badgeBg: "bg-lime-100",
    badgeText: "text-lime-700",
    icon: "MapPin",
  },
  BNU: {
    label: "BNU — Campus Blumenau",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-700",
    icon: "MapPin",
  },
  CBS: {
    label: "CBS — Campus Curitibanos",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    icon: "TreePine",
  },
  JOI: {
    label: "JOI — Campus Joinville",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    icon: "Factory",
  },
};

export const UFSC_COURSES: UfscCourse[] = [
  // CCE — Centro de Comunicação e Expressão
  { name: "Artes Cênicas", department: "CCE" },
  { name: "Cinema", department: "CCE" },
  { name: "Design", department: "CCE" },
  { name: "Jornalismo", department: "CCE" },
  { name: "Letras — Língua e Literatura Alemã", department: "CCE" },
  { name: "Letras — Língua e Literatura Espanhola", department: "CCE" },
  { name: "Letras — Língua e Literatura Francesa", department: "CCE" },
  { name: "Letras — Língua e Literatura Italiana", department: "CCE" },
  { name: "Letras — Língua e Literatura Japonesa", department: "CCE" },
  { name: "Letras — Língua e Literatura Portuguesa", department: "CCE" },
  { name: "Letras — Língua e Literaturas de Língua Inglesa", department: "CCE" },
  { name: "Letras — Língua Brasileira de Sinais (LIBRAS)", department: "CCE" },
  { name: "Letras — Português e Espanhol", department: "CCE" },

  // CCB — Centro de Ciências Biológicas
  { name: "Biotecnologia", department: "CCB" },
  { name: "Ciências Biológicas", department: "CCB" },

  // CCJ — Centro de Ciências Jurídicas
  { name: "Direito", department: "CCJ" },

  // CCS — Centro de Ciências da Saúde
  { name: "Enfermagem", department: "CCS" },
  { name: "Farmácia", department: "CCS" },
  { name: "Fonoaudiologia", department: "CCS" },
  { name: "Medicina", department: "CCS" },
  { name: "Nutrição", department: "CCS" },
  { name: "Odontologia", department: "CCS" },

  // CDS — Centro de Desportos
  { name: "Educação Física", department: "CDS" },

  // CED — Centro de Ciências da Educação
  { name: "Educação do Campo", department: "CED" },
  { name: "Pedagogia", department: "CED" },

  // CFH — Centro de Filosofia e Ciências Humanas
  { name: "Antropologia", department: "CFH" },
  { name: "Arqueologia", department: "CFH" },
  { name: "Ciências Sociais", department: "CFH" },
  { name: "Filosofia", department: "CFH" },
  { name: "Geociências", department: "CFH" },
  { name: "História", department: "CFH" },
  { name: "Museologia", department: "CFH" },
  { name: "Psicologia", department: "CFH" },

  // CFM — Centro de Ciências Físicas e Matemáticas
  { name: "Física", department: "CFM" },
  { name: "Matemática", department: "CFM" },
  { name: "Meteorologia", department: "CFM" },
  { name: "Oceanografia", department: "CFM" },
  { name: "Química", department: "CFM" },

  // CSE — Centro Socioeconômico
  { name: "Administração", department: "CSE" },
  { name: "Ciências Contábeis", department: "CSE" },
  { name: "Ciências Econômicas", department: "CSE" },
  { name: "Relações Internacionais", department: "CSE" },
  { name: "Serviço Social", department: "CSE" },

  // CTC — Centro Tecnológico
  { name: "Arquitetura e Urbanismo", department: "CTC" },
  { name: "Ciência da Computação", department: "CTC" },
  { name: "Engenharia Aeroespacial", department: "CTC" },
  { name: "Engenharia Civil", department: "CTC" },
  { name: "Engenharia de Alimentos", department: "CTC" },
  { name: "Engenharia de Computação", department: "CTC" },
  { name: "Engenharia de Controle e Automação", department: "CTC" },
  { name: "Engenharia de Materiais", department: "CTC" },
  { name: "Engenharia de Produção", department: "CTC" },
  { name: "Engenharia Elétrica", department: "CTC" },
  { name: "Engenharia Mecânica", department: "CTC" },
  { name: "Engenharia Química", department: "CTC" },
  { name: "Engenharia Sanitária e Ambiental", department: "CTC" },
  { name: "Sistemas de Informação", department: "CTC" },

  // Campus Araranguá (ARA)
  { name: "Engenharia de Energia — Araranguá", department: "ARA" },
  { name: "Fisioterapia — Araranguá", department: "ARA" },
  { name: "Medicina — Araranguá", department: "ARA" },
  { name: "Tecnologias da Informação e Comunicação — Araranguá", department: "ARA" },

  // Campus Blumenau (BNU)
  { name: "Engenharia de Controle e Automação — Blumenau", department: "BNU" },
  { name: "Engenharia de Materiais — Blumenau", department: "BNU" },
  { name: "Engenharia Têxtil — Blumenau", department: "BNU" },
  { name: "Farmácia — Blumenau", department: "BNU" },
  { name: "Química — Blumenau", department: "BNU" },

  // Campus Curitibanos (CBS)
  { name: "Agronomia — Curitibanos", department: "CBS" },
  { name: "Ciências Rurais — Curitibanos", department: "CBS" },
  { name: "Engenharia Florestal — Curitibanos", department: "CBS" },
  { name: "Medicina Veterinária — Curitibanos", department: "CBS" },

  // Campus Joinville (JOI)
  { name: "Engenharia Automotiva — Joinville", department: "JOI" },
  { name: "Engenharia Civil — Joinville", department: "JOI" },
  { name: "Engenharia de Infraestrutura — Joinville", department: "JOI" },
  { name: "Engenharia Ferroviária e Metroviária — Joinville", department: "JOI" },
  { name: "Engenharia Mecatrônica — Joinville", department: "JOI" },
  { name: "Engenharia Naval — Joinville", department: "JOI" },
];

export function searchCourses(query: string): UfscCourse[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return UFSC_COURSES.filter(c => {
    const name = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return name.includes(q);
  }).slice(0, 8);
}
