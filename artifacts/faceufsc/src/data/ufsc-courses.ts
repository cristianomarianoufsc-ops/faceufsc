export interface UfscCourse {
  name: string;
  department: string;
}

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
