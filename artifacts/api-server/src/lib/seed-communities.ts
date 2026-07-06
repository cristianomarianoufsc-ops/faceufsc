export interface CommunityData {
  name: string;
  description: string;
  category: string;
  isFixed: boolean;
}

// ─── Por campus ─────────────────────────────────────────────────────────────
const CAMPUS_COMMUNITIES: CommunityData[] = [
  {
    name: "UFSC — Campus Florianópolis",
    description: "Comunidade oficial do campus sede da UFSC em Florianópolis. Reúne estudantes, professores e servidores do campus principal.",
    category: "campus",
    isFixed: true,
  },
  {
    name: "UFSC — Campus Joinville",
    description: "Comunidade oficial do Centro Tecnológico de Joinville (CTJ). Engenharias de ponta no norte catarinense.",
    category: "campus",
    isFixed: true,
  },
  {
    name: "UFSC — Campus Araranguá",
    description: "Comunidade oficial do Campus Araranguá. Cursos de saúde, tecnologia e energia no extremo sul de Santa Catarina.",
    category: "campus",
    isFixed: true,
  },
  {
    name: "UFSC — Campus Curitibanos",
    description: "Comunidade oficial do Campus Curitibanos. Foco em ciências agrárias e ciências rurais no planalto serrano.",
    category: "campus",
    isFixed: true,
  },
  {
    name: "UFSC — Campus Blumenau",
    description: "Comunidade oficial do Campus Blumenau. Engenharias e ciências no Vale do Itajaí.",
    category: "campus",
    isFixed: true,
  },
];

// ─── Por centro ─────────────────────────────────────────────────────────────
const CENTRO_COMMUNITIES: CommunityData[] = [
  {
    name: "CTC — Centro Tecnológico",
    description: "Centro Tecnológico da UFSC. Reúne os cursos de engenharia, computação, arquitetura e sistemas do campus de Florianópolis.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CCS — Centro de Ciências da Saúde",
    description: "Centro de Ciências da Saúde da UFSC. Abriga medicina, enfermagem, farmácia, odontologia, nutrição e fonoaudiologia.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CFH — Centro de Filosofia e Ciências Humanas",
    description: "Centro de Filosofia e Ciências Humanas da UFSC. Psicologia, história, filosofia, ciências sociais, antropologia e mais.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CCJ — Centro de Ciências Jurídicas",
    description: "Centro de Ciências Jurídicas da UFSC. Um dos cursos de Direito mais conceituados do Brasil.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CCE — Centro de Comunicação e Expressão",
    description: "Centro de Comunicação e Expressão da UFSC. Design, jornalismo, letras, artes cênicas e cinema.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CCB — Centro de Ciências Biológicas",
    description: "Centro de Ciências Biológicas da UFSC. Ciências biológicas e biotecnologia.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CDS — Centro de Desportos",
    description: "Centro de Desportos da UFSC. Educação física, esporte e bem-estar na universidade.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CED — Centro de Ciências da Educação",
    description: "Centro de Ciências da Educação da UFSC. Pedagogia, educação do campo e formação de professores.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CFM — Centro de Ciências Físicas e Matemáticas",
    description: "Centro de Ciências Físicas e Matemáticas da UFSC. Física, matemática, química, meteorologia e oceanografia.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CSE — Centro Socioeconômico",
    description: "Centro Socioeconômico da UFSC. Administração, economia, ciências contábeis, relações internacionais e serviço social.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CTJ — Centro Tecnológico de Joinville",
    description: "Centro Tecnológico de Joinville (Campus Joinville). Engenharias especializadas no polo industrial do norte catarinense.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CCA — Campus Araranguá (Centro)",
    description: "Comunidade do Centro Acadêmico do Campus Araranguá. Saúde, energia e tecnologia no sul do estado.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CCB — Campus Blumenau (Centro)",
    description: "Comunidade do Centro Acadêmico do Campus Blumenau. Engenharias e ciências no Vale do Itajaí.",
    category: "centro",
    isFixed: true,
  },
  {
    name: "CBS — Campus Curitibanos (Centro)",
    description: "Comunidade do Centro Acadêmico do Campus Curitibanos. Ciências agrárias e rurais no planalto serrano.",
    category: "centro",
    isFixed: true,
  },
];

// ─── Por curso ───────────────────────────────────────────────────────────────
interface CourseEntry { name: string; department: string; }

const UFSC_COURSES: CourseEntry[] = [
  // CCE
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
  // CCB
  { name: "Biotecnologia", department: "CCB" },
  { name: "Ciências Biológicas", department: "CCB" },
  // CCJ
  { name: "Direito", department: "CCJ" },
  // CCS
  { name: "Enfermagem", department: "CCS" },
  { name: "Farmácia", department: "CCS" },
  { name: "Fonoaudiologia", department: "CCS" },
  { name: "Medicina", department: "CCS" },
  { name: "Nutrição", department: "CCS" },
  { name: "Odontologia", department: "CCS" },
  // CDS
  { name: "Educação Física", department: "CDS" },
  // CED
  { name: "Educação do Campo", department: "CED" },
  { name: "Pedagogia", department: "CED" },
  // CFH
  { name: "Antropologia", department: "CFH" },
  { name: "Arqueologia", department: "CFH" },
  { name: "Ciências Sociais", department: "CFH" },
  { name: "Filosofia", department: "CFH" },
  { name: "Geociências", department: "CFH" },
  { name: "História", department: "CFH" },
  { name: "Museologia", department: "CFH" },
  { name: "Psicologia", department: "CFH" },
  // CFM
  { name: "Física", department: "CFM" },
  { name: "Matemática", department: "CFM" },
  { name: "Meteorologia", department: "CFM" },
  { name: "Oceanografia", department: "CFM" },
  { name: "Química", department: "CFM" },
  // CSE
  { name: "Administração", department: "CSE" },
  { name: "Ciências Contábeis", department: "CSE" },
  { name: "Ciências Econômicas", department: "CSE" },
  { name: "Relações Internacionais", department: "CSE" },
  { name: "Serviço Social", department: "CSE" },
  // CTC
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
  // Campus Araranguá
  { name: "Engenharia de Energia — Araranguá", department: "ARA" },
  { name: "Fisioterapia — Araranguá", department: "ARA" },
  { name: "Medicina — Araranguá", department: "ARA" },
  { name: "Tecnologias da Informação e Comunicação — Araranguá", department: "ARA" },
  // Campus Blumenau
  { name: "Engenharia de Controle e Automação — Blumenau", department: "BNU" },
  { name: "Engenharia de Materiais — Blumenau", department: "BNU" },
  { name: "Engenharia Têxtil — Blumenau", department: "BNU" },
  { name: "Farmácia — Blumenau", department: "BNU" },
  { name: "Química — Blumenau", department: "BNU" },
  // Campus Curitibanos
  { name: "Agronomia — Curitibanos", department: "CBS" },
  { name: "Ciências Rurais — Curitibanos", department: "CBS" },
  { name: "Engenharia Florestal — Curitibanos", department: "CBS" },
  { name: "Medicina Veterinária — Curitibanos", department: "CBS" },
  // Campus Joinville
  { name: "Engenharia Automotiva — Joinville", department: "JOI" },
  { name: "Engenharia Civil — Joinville", department: "JOI" },
  { name: "Engenharia de Infraestrutura — Joinville", department: "JOI" },
  { name: "Engenharia Ferroviária e Metroviária — Joinville", department: "JOI" },
  { name: "Engenharia Mecatrônica — Joinville", department: "JOI" },
  { name: "Engenharia Naval — Joinville", department: "JOI" },
];

const DEPT_LABEL: Record<string, string> = {
  CCE: "CCE — Comunicação e Expressão", CCB: "CCB — Ciências Biológicas",
  CCJ: "CCJ — Ciências Jurídicas", CCS: "CCS — Ciências da Saúde",
  CDS: "CDS — Centro de Desportos", CED: "CED — Ciências da Educação",
  CFH: "CFH — Filosofia e Ciências Humanas", CFM: "CFM — Ciências Físicas e Matemáticas",
  CSE: "CSE — Centro Socioeconômico", CTC: "CTC — Centro Tecnológico",
  ARA: "Campus Araranguá", BNU: "Campus Blumenau",
  CBS: "Campus Curitibanos", JOI: "Campus Joinville",
};

function buildCursoCommunities(): CommunityData[] {
  return UFSC_COURSES.map(c => ({
    name: c.name,
    description: `Comunidade do curso de ${c.name} na UFSC (${DEPT_LABEL[c.department] ?? c.department}). Espaço para estudantes, ex-alunos e professores do curso.`,
    category: "curso",
    isFixed: true,
  }));
}

// ─── Export ──────────────────────────────────────────────────────────────────
export function generateAllCommunities(): CommunityData[] {
  return [
    ...CAMPUS_COMMUNITIES,
    ...CENTRO_COMMUNITIES,
    ...buildCursoCommunities(),
  ];
}
