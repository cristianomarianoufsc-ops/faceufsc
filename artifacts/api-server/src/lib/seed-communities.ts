/**
 * Seed hierárquico de comunidades fixas da UFSC.
 * Hierarquia: Campus → Centro → Curso
 * Campi menores (ARA, CBS, BNU) não têm centro: Campus → Curso direto.
 */

// ─── Campus ──────────────────────────────────────────────────────────────────
export const CAMPUS_SEED = [
  { key: "FLO", name: "UFSC — Campus Florianópolis", description: "Comunidade oficial do campus sede da UFSC em Florianópolis. Reúne estudantes, professores e servidores do campus principal." },
  { key: "JOI", name: "UFSC — Campus Joinville", description: "Comunidade oficial do Campus Joinville (CTJ). Engenharias de ponta no polo industrial do norte catarinense." },
  { key: "ARA", name: "UFSC — Campus Araranguá", description: "Comunidade oficial do Campus Araranguá. Cursos de saúde, tecnologia e energia no extremo sul de Santa Catarina." },
  { key: "CBS", name: "UFSC — Campus Curitibanos", description: "Comunidade oficial do Campus Curitibanos. Foco em ciências agrárias e ciências rurais no planalto serrano." },
  { key: "BNU", name: "UFSC — Campus Blumenau", description: "Comunidade oficial do Campus Blumenau. Engenharias e ciências no Vale do Itajaí." },
];

// ─── Centro ──────────────────────────────────────────────────────────────────
// campusKey referencia a chave do campus pai
export const CENTRO_SEED = [
  // Florianópolis
  { key: "CTC", campusKey: "FLO", name: "CTC — Centro Tecnológico", description: "Centro Tecnológico da UFSC. Reúne os cursos de engenharia, computação, arquitetura e sistemas do campus de Florianópolis." },
  { key: "CCS", campusKey: "FLO", name: "CCS — Centro de Ciências da Saúde", description: "Centro de Ciências da Saúde da UFSC. Abriga medicina, enfermagem, farmácia, odontologia, nutrição e fonoaudiologia." },
  { key: "CFH", campusKey: "FLO", name: "CFH — Centro de Filosofia e Ciências Humanas", description: "Centro de Filosofia e Ciências Humanas da UFSC. Psicologia, história, filosofia, ciências sociais, antropologia e mais." },
  { key: "CCJ", campusKey: "FLO", name: "CCJ — Centro de Ciências Jurídicas", description: "Centro de Ciências Jurídicas da UFSC. Um dos cursos de Direito mais conceituados do Brasil." },
  { key: "CCE", campusKey: "FLO", name: "CCE — Centro de Comunicação e Expressão", description: "Centro de Comunicação e Expressão da UFSC. Design, jornalismo, letras, artes cênicas e cinema." },
  { key: "CCB", campusKey: "FLO", name: "CCB — Centro de Ciências Biológicas", description: "Centro de Ciências Biológicas da UFSC. Ciências biológicas e biotecnologia." },
  { key: "CDS", campusKey: "FLO", name: "CDS — Centro de Desportos", description: "Centro de Desportos da UFSC. Educação física, esporte e bem-estar na universidade." },
  { key: "CED", campusKey: "FLO", name: "CED — Centro de Ciências da Educação", description: "Centro de Ciências da Educação da UFSC. Pedagogia, educação do campo e formação de professores." },
  { key: "CFM", campusKey: "FLO", name: "CFM — Centro de Ciências Físicas e Matemáticas", description: "Centro de Ciências Físicas e Matemáticas da UFSC. Física, matemática, química, meteorologia e oceanografia." },
  { key: "CSE", campusKey: "FLO", name: "CSE — Centro Socioeconômico", description: "Centro Socioeconômico da UFSC. Administração, economia, ciências contábeis, relações internacionais e serviço social." },
  // Joinville tem um centro único
  { key: "CTJ", campusKey: "JOI", name: "CTJ — Centro Tecnológico de Joinville", description: "Centro Tecnológico de Joinville. Engenharias especializadas no polo industrial do norte catarinense." },
];

// ─── Curso ───────────────────────────────────────────────────────────────────
// centroKey → vincula ao centro; campusKey → vincula direto ao campus (sem centro)
export const CURSO_SEED: Array<{ name: string; centroKey?: string; campusKey?: string }> = [
  // CTC — Centro Tecnológico (Florianópolis)
  { name: "Arquitetura e Urbanismo", centroKey: "CTC" },
  { name: "Ciência da Computação", centroKey: "CTC" },
  { name: "Engenharia Aeroespacial", centroKey: "CTC" },
  { name: "Engenharia Civil", centroKey: "CTC" },
  { name: "Engenharia de Alimentos", centroKey: "CTC" },
  { name: "Engenharia de Computação", centroKey: "CTC" },
  { name: "Engenharia de Controle e Automação", centroKey: "CTC" },
  { name: "Engenharia de Materiais", centroKey: "CTC" },
  { name: "Engenharia de Produção", centroKey: "CTC" },
  { name: "Engenharia Elétrica", centroKey: "CTC" },
  { name: "Engenharia Mecânica", centroKey: "CTC" },
  { name: "Engenharia Química", centroKey: "CTC" },
  { name: "Engenharia Sanitária e Ambiental", centroKey: "CTC" },
  { name: "Sistemas de Informação", centroKey: "CTC" },
  // CCS — Ciências da Saúde (Florianópolis)
  { name: "Enfermagem", centroKey: "CCS" },
  { name: "Farmácia", centroKey: "CCS" },
  { name: "Fonoaudiologia", centroKey: "CCS" },
  { name: "Medicina", centroKey: "CCS" },
  { name: "Nutrição", centroKey: "CCS" },
  { name: "Odontologia", centroKey: "CCS" },
  // CFH — Filosofia e Ciências Humanas (Florianópolis)
  { name: "Antropologia", centroKey: "CFH" },
  { name: "Arqueologia", centroKey: "CFH" },
  { name: "Ciências Sociais", centroKey: "CFH" },
  { name: "Filosofia", centroKey: "CFH" },
  { name: "Geociências", centroKey: "CFH" },
  { name: "História", centroKey: "CFH" },
  { name: "Museologia", centroKey: "CFH" },
  { name: "Psicologia", centroKey: "CFH" },
  // CCJ — Ciências Jurídicas (Florianópolis)
  { name: "Direito", centroKey: "CCJ" },
  // CCE — Comunicação e Expressão (Florianópolis)
  { name: "Artes Cênicas", centroKey: "CCE" },
  { name: "Cinema", centroKey: "CCE" },
  { name: "Design", centroKey: "CCE" },
  { name: "Jornalismo", centroKey: "CCE" },
  { name: "Letras — Língua e Literatura Alemã", centroKey: "CCE" },
  { name: "Letras — Língua e Literatura Espanhola", centroKey: "CCE" },
  { name: "Letras — Língua e Literatura Francesa", centroKey: "CCE" },
  { name: "Letras — Língua e Literatura Italiana", centroKey: "CCE" },
  { name: "Letras — Língua e Literatura Japonesa", centroKey: "CCE" },
  { name: "Letras — Língua e Literatura Portuguesa", centroKey: "CCE" },
  { name: "Letras — Língua e Literaturas de Língua Inglesa", centroKey: "CCE" },
  { name: "Letras — Língua Brasileira de Sinais (LIBRAS)", centroKey: "CCE" },
  { name: "Letras — Português e Espanhol", centroKey: "CCE" },
  // CCB — Ciências Biológicas (Florianópolis)
  { name: "Biotecnologia", centroKey: "CCB" },
  { name: "Ciências Biológicas", centroKey: "CCB" },
  // CDS — Centro de Desportos (Florianópolis)
  { name: "Educação Física", centroKey: "CDS" },
  // CED — Ciências da Educação (Florianópolis)
  { name: "Educação do Campo", centroKey: "CED" },
  { name: "Pedagogia", centroKey: "CED" },
  // CFM — Ciências Físicas e Matemáticas (Florianópolis)
  { name: "Física", centroKey: "CFM" },
  { name: "Matemática", centroKey: "CFM" },
  { name: "Meteorologia", centroKey: "CFM" },
  { name: "Oceanografia", centroKey: "CFM" },
  { name: "Química", centroKey: "CFM" },
  // CSE — Centro Socioeconômico (Florianópolis)
  { name: "Administração", centroKey: "CSE" },
  { name: "Ciências Contábeis", centroKey: "CSE" },
  { name: "Ciências Econômicas", centroKey: "CSE" },
  { name: "Relações Internacionais", centroKey: "CSE" },
  { name: "Serviço Social", centroKey: "CSE" },
  // CTJ — Campus Joinville
  { name: "Engenharia Automotiva — Joinville", centroKey: "CTJ" },
  { name: "Engenharia Civil — Joinville", centroKey: "CTJ" },
  { name: "Engenharia de Infraestrutura — Joinville", centroKey: "CTJ" },
  { name: "Engenharia Ferroviária e Metroviária — Joinville", centroKey: "CTJ" },
  { name: "Engenharia Mecatrônica — Joinville", centroKey: "CTJ" },
  { name: "Engenharia Naval — Joinville", centroKey: "CTJ" },
  // Campus Araranguá — direto (sem centro)
  { name: "Engenharia de Energia — Araranguá", campusKey: "ARA" },
  { name: "Fisioterapia — Araranguá", campusKey: "ARA" },
  { name: "Medicina — Araranguá", campusKey: "ARA" },
  { name: "Tecnologias da Informação e Comunicação — Araranguá", campusKey: "ARA" },
  // Campus Curitibanos — direto (sem centro)
  { name: "Agronomia — Curitibanos", campusKey: "CBS" },
  { name: "Ciências Rurais — Curitibanos", campusKey: "CBS" },
  { name: "Engenharia Florestal — Curitibanos", campusKey: "CBS" },
  { name: "Medicina Veterinária — Curitibanos", campusKey: "CBS" },
  // Campus Blumenau — direto (sem centro)
  { name: "Engenharia de Controle e Automação — Blumenau", campusKey: "BNU" },
  { name: "Engenharia de Materiais — Blumenau", campusKey: "BNU" },
  { name: "Engenharia Têxtil — Blumenau", campusKey: "BNU" },
  { name: "Farmácia — Blumenau", campusKey: "BNU" },
  { name: "Química — Blumenau", campusKey: "BNU" },
];

function cursoDescription(name: string, centro?: string, campus?: string): string {
  const location = centro ?? campus ?? "UFSC";
  return `Comunidade do curso de ${name} na UFSC (${location}). Espaço para estudantes, ex-alunos e professores do curso.`;
}

// ─── Nomes dos centros e campi para descrição dos cursos ─────────────────────
const CENTRO_LABEL: Record<string, string> = {
  CTC: "CTC — Centro Tecnológico",
  CCS: "CCS — Ciências da Saúde",
  CFH: "CFH — Filosofia e Ciências Humanas",
  CCJ: "CCJ — Ciências Jurídicas",
  CCE: "CCE — Comunicação e Expressão",
  CCB: "CCB — Ciências Biológicas",
  CDS: "CDS — Centro de Desportos",
  CED: "CED — Ciências da Educação",
  CFM: "CFM — Ciências Físicas e Matemáticas",
  CSE: "CSE — Centro Socioeconômico",
  CTJ: "CTJ — Joinville",
};
const CAMPUS_LABEL: Record<string, string> = {
  ARA: "Campus Araranguá",
  CBS: "Campus Curitibanos",
  BNU: "Campus Blumenau",
};

export function buildCursoDescription(c: typeof CURSO_SEED[number]): string {
  return cursoDescription(
    c.name,
    c.centroKey ? CENTRO_LABEL[c.centroKey] : undefined,
    c.campusKey ? CAMPUS_LABEL[c.campusKey] : undefined,
  );
}
