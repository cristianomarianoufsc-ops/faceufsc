/**
 * Seed script: creates all official UFSC communities and assigns
 * existing users to their course + department communities.
 *
 * Run: pnpm --filter @workspace/api-server tsx src/scripts/seed-communities.ts
 */

import { db } from "@workspace/db";
import { communitiesTable, communityMembershipsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

// ─── Centros da UFSC ─────────────────────────────────────────────────────────
const CENTERS = [
  { name: "CTC", description: "Centro Tecnológico [dept:CTC]", category: "centro" },
  { name: "CCS", description: "Centro de Ciências da Saúde [dept:CCS]", category: "centro" },
  { name: "CFH", description: "Centro de Filosofia e Ciências Humanas [dept:CFH]", category: "centro" },
  { name: "CCJ", description: "Centro de Ciências Jurídicas [dept:CCJ]", category: "centro" },
  { name: "CCE", description: "Centro de Comunicação e Expressão [dept:CCE]", category: "centro" },
  { name: "CCA", description: "Centro de Ciências Agrárias [dept:CCA]", category: "centro" },
  { name: "CDS", description: "Centro de Desportos [dept:CDS]", category: "centro" },
  { name: "CFM", description: "Centro de Ciências Físicas e Matemáticas [dept:CFM]", category: "centro" },
  { name: "CSE", description: "Centro Socioeconômico [dept:CSE]", category: "centro" },
  { name: "CED", description: "Centro de Ciências da Educação [dept:CED]", category: "centro" },
  { name: "NDI", description: "Núcleo de Desenvolvimento Infantil [dept:NDI]", category: "centro" },
];

// ─── Cursos da UFSC ──────────────────────────────────────────────────────────
const COURSES = [
  // CTC
  { name: "Ciência da Computação", description: "Curso de Ciência da Computação — CTC [course:Ciência da Computação]", category: "curso" },
  { name: "Sistemas de Informação", description: "Curso de Sistemas de Informação — CTC [course:Sistemas de Informação]", category: "curso" },
  { name: "Engenharia de Computação", description: "Curso de Engenharia de Computação — CTC [course:Engenharia de Computação]", category: "curso" },
  { name: "Engenharia Elétrica", description: "Curso de Engenharia Elétrica — CTC [course:Engenharia Elétrica]", category: "curso" },
  { name: "Engenharia Mecânica", description: "Curso de Engenharia Mecânica — CTC [course:Engenharia Mecânica]", category: "curso" },
  { name: "Engenharia Civil", description: "Curso de Engenharia Civil — CTC [course:Engenharia Civil]", category: "curso" },
  { name: "Engenharia Química", description: "Curso de Engenharia Química — CTC [course:Engenharia Química]", category: "curso" },
  { name: "Engenharia de Controle e Automação", description: "Curso de Engenharia de Controle e Automação — CTC [course:Engenharia de Controle e Automação]", category: "curso" },
  { name: "Engenharia de Materiais", description: "Curso de Engenharia de Materiais — CTC [course:Engenharia de Materiais]", category: "curso" },
  { name: "Engenharia de Produção", description: "Curso de Engenharia de Produção — CTC [course:Engenharia de Produção]", category: "curso" },
  { name: "Engenharia Sanitária e Ambiental", description: "Curso de Engenharia Sanitária e Ambiental — CTC [course:Engenharia Sanitária e Ambiental]", category: "curso" },
  { name: "Arquitetura e Urbanismo", description: "Curso de Arquitetura e Urbanismo — CTC [course:Arquitetura e Urbanismo]", category: "curso" },
  // CCS
  { name: "Medicina", description: "Curso de Medicina — CCS [course:Medicina]", category: "curso" },
  { name: "Enfermagem", description: "Curso de Enfermagem — CCS [course:Enfermagem]", category: "curso" },
  { name: "Odontologia", description: "Curso de Odontologia — CCS [course:Odontologia]", category: "curso" },
  { name: "Farmácia", description: "Curso de Farmácia — CCS [course:Farmácia]", category: "curso" },
  { name: "Nutrição", description: "Curso de Nutrição — CCS [course:Nutrição]", category: "curso" },
  { name: "Fonoaudiologia", description: "Curso de Fonoaudiologia — CCS [course:Fonoaudiologia]", category: "curso" },
  // CFH
  { name: "Psicologia", description: "Curso de Psicologia — CFH [course:Psicologia]", category: "curso" },
  { name: "História", description: "Curso de História — CFH [course:História]", category: "curso" },
  { name: "Filosofia", description: "Curso de Filosofia — CFH [course:Filosofia]", category: "curso" },
  { name: "Ciências Sociais", description: "Curso de Ciências Sociais — CFH [course:Ciências Sociais]", category: "curso" },
  { name: "Geografia", description: "Curso de Geografia — CFH [course:Geografia]", category: "curso" },
  { name: "Antropologia", description: "Curso de Antropologia — CFH [course:Antropologia]", category: "curso" },
  // CCJ
  { name: "Direito", description: "Curso de Direito — CCJ [course:Direito]", category: "curso" },
  // CCE
  { name: "Jornalismo", description: "Curso de Jornalismo — CCE [course:Jornalismo]", category: "curso" },
  { name: "Letras", description: "Curso de Letras — CCE [course:Letras]", category: "curso" },
  { name: "Letras - Língua Portuguesa", description: "Curso de Letras - Língua Portuguesa — CCE [course:Letras - Língua Portuguesa]", category: "curso" },
  { name: "Letras - Língua Inglesa", description: "Curso de Letras - Língua Inglesa — CCE [course:Letras - Língua Inglesa]", category: "curso" },
  { name: "Design", description: "Curso de Design — CCE [course:Design]", category: "curso" },
  { name: "Biblioteconomia", description: "Curso de Biblioteconomia — CCE [course:Biblioteconomia]", category: "curso" },
  // CSE
  { name: "Administração", description: "Curso de Administração — CSE [course:Administração]", category: "curso" },
  { name: "Ciências Econômicas", description: "Curso de Ciências Econômicas — CSE [course:Ciências Econômicas]", category: "curso" },
  { name: "Ciências Contábeis", description: "Curso de Ciências Contábeis — CSE [course:Ciências Contábeis]", category: "curso" },
  { name: "Serviço Social", description: "Curso de Serviço Social — CSE [course:Serviço Social]", category: "curso" },
  // CCA
  { name: "Agronomia", description: "Curso de Agronomia — CCA [course:Agronomia]", category: "curso" },
  { name: "Zootecnia", description: "Curso de Zootecnia — CCA [course:Zootecnia]", category: "curso" },
  { name: "Medicina Veterinária", description: "Curso de Medicina Veterinária — CCA [course:Medicina Veterinária]", category: "curso" },
  { name: "Aquicultura", description: "Curso de Aquicultura — CCA [course:Aquicultura]", category: "curso" },
  // CFM
  { name: "Física", description: "Curso de Física — CFM [course:Física]", category: "curso" },
  { name: "Matemática", description: "Curso de Matemática — CFM [course:Matemática]", category: "curso" },
  { name: "Química", description: "Curso de Química — CFM [course:Química]", category: "curso" },
  { name: "Oceanografia", description: "Curso de Oceanografia — CFM [course:Oceanografia]", category: "curso" },
  // CED
  { name: "Pedagogia", description: "Curso de Pedagogia — CED [course:Pedagogia]", category: "curso" },
  { name: "Educação Física", description: "Curso de Educação Física — CED/CDS [course:Educação Física]", category: "curso" },
];

async function upsertCommunity(data: { name: string; description: string; category: string }): Promise<number> {
  // Check if already exists by name
  const [existing] = await db
    .select({ id: communitiesTable.id })
    .from(communitiesTable)
    .where(eq(communitiesTable.name, data.name));

  if (existing) return existing.id;

  const [created] = await db
    .insert(communitiesTable)
    .values({ ...data, isOfficial: true, membersCount: 0, postsCount: 0 })
    .returning({ id: communitiesTable.id });

  return created.id;
}

async function joinUser(userId: number, communityId: number): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(communityMembershipsTable).values({ communityId, userId });
      await tx.update(communitiesTable)
        .set({ membersCount: sql`${communitiesTable.membersCount} + 1` })
        .where(eq(communitiesTable.id, communityId));
      await tx.update(usersTable)
        .set({ communitiesCount: sql`${usersTable.communitiesCount} + 1` })
        .where(eq(usersTable.id, userId));
    });
  } catch {
    // Already a member — skip
  }
}

export async function seedOfficialCommunities(): Promise<void> {
  console.log("🏛️  Criando comunidades oficiais da UFSC...");

  // 1. Upsert all center communities
  const centerIds = new Map<string, number>();
  for (const center of CENTERS) {
    const id = await upsertCommunity(center);
    const tag = center.description.match(/\[dept:(.+?)\]/)?.[1] ?? center.name;
    centerIds.set(tag, id);
    console.log(`  ✓ Centro: ${center.name} (id=${id})`);
  }

  // 2. Upsert all course communities
  const courseIds = new Map<string, number>();
  for (const course of COURSES) {
    const id = await upsertCommunity(course);
    const tag = course.description.match(/\[course:(.+?)\]/)?.[1] ?? course.name;
    courseIds.set(tag, id);
    console.log(`  ✓ Curso: ${course.name} (id=${id})`);
  }

  // 3. Fetch all existing users and assign them
  const users = await db.select({
    id: usersTable.id,
    course: usersTable.course,
    department: usersTable.department,
  }).from(usersTable);

  console.log(`\n👥 Associando ${users.length} usuários existentes...`);

  for (const user of users) {
    let joined = 0;

    const courseId = courseIds.get(user.course) ??
      [...courseIds.entries()].find(([k]) => k.toLowerCase() === user.course.toLowerCase())?.[1];
    if (courseId) { await joinUser(user.id, courseId); joined++; }

    const deptId = centerIds.get(user.department) ??
      [...centerIds.entries()].find(([k]) => k.toLowerCase() === user.department.toLowerCase())?.[1];
    if (deptId) { await joinUser(user.id, deptId); joined++; }

    console.log(`  ✓ Usuário #${user.id} (${user.course} / ${user.department}) → ${joined} comunidade(s)`);
  }

  console.log("✅ Seed de comunidades concluído!");
}

// Allow running directly
if (process.argv[1]?.endsWith("seed-communities.ts") || process.argv[1]?.endsWith("seed-communities.js")) {
  seedOfficialCommunities().then(() => process.exit(0)).catch((err) => {
    console.error("❌ Erro:", err);
    process.exit(1);
  });
}
