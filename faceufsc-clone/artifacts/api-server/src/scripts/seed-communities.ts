/**
 * Seed: creates all official UFSC communities (centers + courses) and assigns
 * existing users to their course + department communities.
 *
 * - Uses INSERT … ON CONFLICT DO NOTHING for atomic, idempotent upserts.
 * - Matching is done via canonical tags in the description field, normalized.
 * - The caller (index.ts) guards against duplicate runs via app_settings lock.
 *
 * Run standalone: node --loader ts-node/esm src/scripts/seed-communities.ts
 */

import { db } from "@workspace/db";
import { communitiesTable, communityMembershipsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

// ─── Official UFSC centers ────────────────────────────────────────────────────
const CENTERS: { name: string; description: string }[] = [
  { name: "CTC", description: "Centro Tecnológico da UFSC [dept:CTC]" },
  { name: "CCS", description: "Centro de Ciências da Saúde da UFSC [dept:CCS]" },
  { name: "CFH", description: "Centro de Filosofia e Ciências Humanas da UFSC [dept:CFH]" },
  { name: "CCJ", description: "Centro de Ciências Jurídicas da UFSC [dept:CCJ]" },
  { name: "CCE", description: "Centro de Comunicação e Expressão da UFSC [dept:CCE]" },
  { name: "CCA", description: "Centro de Ciências Agrárias da UFSC [dept:CCA]" },
  { name: "CDS", description: "Centro de Desportos da UFSC [dept:CDS]" },
  { name: "CFM", description: "Centro de Ciências Físicas e Matemáticas da UFSC [dept:CFM]" },
  { name: "CSE", description: "Centro Socioeconômico da UFSC [dept:CSE]" },
  { name: "CED", description: "Centro de Ciências da Educação da UFSC [dept:CED]" },
  { name: "NDI", description: "Núcleo de Desenvolvimento Infantil da UFSC [dept:NDI]" },
];

// ─── Official UFSC courses ────────────────────────────────────────────────────
const COURSES: { name: string; description: string }[] = [
  // CTC
  { name: "Ciência da Computação",               description: "Curso de Ciência da Computação — CTC [course:Ciência da Computação]" },
  { name: "Sistemas de Informação",              description: "Curso de Sistemas de Informação — CTC [course:Sistemas de Informação]" },
  { name: "Engenharia de Computação",            description: "Curso de Engenharia de Computação — CTC [course:Engenharia de Computação]" },
  { name: "Engenharia Elétrica",                 description: "Curso de Engenharia Elétrica — CTC [course:Engenharia Elétrica]" },
  { name: "Engenharia Mecânica",                 description: "Curso de Engenharia Mecânica — CTC [course:Engenharia Mecânica]" },
  { name: "Engenharia Civil",                    description: "Curso de Engenharia Civil — CTC [course:Engenharia Civil]" },
  { name: "Engenharia Química",                  description: "Curso de Engenharia Química — CTC [course:Engenharia Química]" },
  { name: "Engenharia de Controle e Automação",  description: "Curso de Engenharia de Controle e Automação — CTC [course:Engenharia de Controle e Automação]" },
  { name: "Engenharia de Materiais",             description: "Curso de Engenharia de Materiais — CTC [course:Engenharia de Materiais]" },
  { name: "Engenharia de Produção",              description: "Curso de Engenharia de Produção — CTC [course:Engenharia de Produção]" },
  { name: "Engenharia Sanitária e Ambiental",    description: "Curso de Engenharia Sanitária e Ambiental — CTC [course:Engenharia Sanitária e Ambiental]" },
  { name: "Arquitetura e Urbanismo",             description: "Curso de Arquitetura e Urbanismo — CTC [course:Arquitetura e Urbanismo]" },
  // CCS
  { name: "Medicina",                            description: "Curso de Medicina — CCS [course:Medicina]" },
  { name: "Enfermagem",                          description: "Curso de Enfermagem — CCS [course:Enfermagem]" },
  { name: "Odontologia",                         description: "Curso de Odontologia — CCS [course:Odontologia]" },
  { name: "Farmácia",                            description: "Curso de Farmácia — CCS [course:Farmácia]" },
  { name: "Nutrição",                            description: "Curso de Nutrição — CCS [course:Nutrição]" },
  { name: "Fonoaudiologia",                      description: "Curso de Fonoaudiologia — CCS [course:Fonoaudiologia]" },
  // CFH
  { name: "Psicologia",                          description: "Curso de Psicologia — CFH [course:Psicologia]" },
  { name: "História",                            description: "Curso de História — CFH [course:História]" },
  { name: "Filosofia",                           description: "Curso de Filosofia — CFH [course:Filosofia]" },
  { name: "Ciências Sociais",                    description: "Curso de Ciências Sociais — CFH [course:Ciências Sociais]" },
  { name: "Geografia",                           description: "Curso de Geografia — CFH [course:Geografia]" },
  { name: "Antropologia",                        description: "Curso de Antropologia — CFH [course:Antropologia]" },
  // CCJ
  { name: "Direito",                             description: "Curso de Direito — CCJ [course:Direito]" },
  // CCE
  { name: "Jornalismo",                          description: "Curso de Jornalismo — CCE [course:Jornalismo]" },
  { name: "Letras",                              description: "Curso de Letras — CCE [course:Letras]" },
  { name: "Letras - Língua Portuguesa",          description: "Curso de Letras - Língua Portuguesa — CCE [course:Letras - Língua Portuguesa]" },
  { name: "Letras - Língua Inglesa",             description: "Curso de Letras - Língua Inglesa — CCE [course:Letras - Língua Inglesa]" },
  { name: "Design",                              description: "Curso de Design — CCE [course:Design]" },
  { name: "Biblioteconomia",                     description: "Curso de Biblioteconomia — CCE [course:Biblioteconomia]" },
  // CSE
  { name: "Administração",                       description: "Curso de Administração — CSE [course:Administração]" },
  { name: "Ciências Econômicas",                 description: "Curso de Ciências Econômicas — CSE [course:Ciências Econômicas]" },
  { name: "Ciências Contábeis",                  description: "Curso de Ciências Contábeis — CSE [course:Ciências Contábeis]" },
  { name: "Serviço Social",                      description: "Curso de Serviço Social — CSE [course:Serviço Social]" },
  // CCA
  { name: "Agronomia",                           description: "Curso de Agronomia — CCA [course:Agronomia]" },
  { name: "Zootecnia",                           description: "Curso de Zootecnia — CCA [course:Zootecnia]" },
  { name: "Medicina Veterinária",                description: "Curso de Medicina Veterinária — CCA [course:Medicina Veterinária]" },
  { name: "Aquicultura",                         description: "Curso de Aquicultura — CCA [course:Aquicultura]" },
  // CFM
  { name: "Física",                              description: "Curso de Física — CFM [course:Física]" },
  { name: "Matemática",                          description: "Curso de Matemática — CFM [course:Matemática]" },
  { name: "Química",                             description: "Curso de Química — CFM [course:Química]" },
  { name: "Oceanografia",                        description: "Curso de Oceanografia — CFM [course:Oceanografia]" },
  // CED / CDS
  { name: "Pedagogia",                           description: "Curso de Pedagogia — CED [course:Pedagogia]" },
  { name: "Educação Física",                     description: "Curso de Educação Física — CDS [course:Educação Física]" },
];

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function extractTag(description: string, prefix: "course" | "dept"): string | null {
  const match = description.match(new RegExp(`\\[${prefix}:(.+?)\\]`));
  return match ? normalize(match[1]) : null;
}

async function upsertCommunity(
  name: string,
  description: string,
  category: string,
): Promise<number> {
  // Atomic upsert: INSERT … ON CONFLICT (name) DO NOTHING, then SELECT.
  // Requires that communities.name is unique — we enforce this via the ON CONFLICT target.
  await db.execute(sql`
    INSERT INTO communities (name, description, category, is_official, members_count, posts_count, created_at)
    VALUES (${name}, ${description}, ${category}, TRUE, 0, 0, NOW())
    ON CONFLICT (name) DO UPDATE
      SET description = EXCLUDED.description,
          is_official = TRUE
  `);

  const [row] = await db
    .select({ id: communitiesTable.id })
    .from(communitiesTable)
    .where(eq(communitiesTable.name, name));

  return row.id;
}

async function joinUser(userId: number, communityId: number): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(communityMembershipsTable).values({ communityId, userId });
      await tx
        .update(communitiesTable)
        .set({ membersCount: sql`${communitiesTable.membersCount} + 1` })
        .where(eq(communitiesTable.id, communityId));
      await tx
        .update(usersTable)
        .set({ communitiesCount: sql`${usersTable.communitiesCount} + 1` })
        .where(eq(usersTable.id, userId));
    });
  } catch (err: any) {
    if (err?.code === "23505") return; // already a member — expected
    throw err;
  }
}

export async function seedOfficialCommunities(): Promise<void> {
  console.log("🏛️  Criando comunidades oficiais da UFSC...");

  // Build tag → id maps for assignment
  const courseTagToId = new Map<string, number>();
  const deptTagToId = new Map<string, number>();

  for (const c of CENTERS) {
    const id = await upsertCommunity(c.name, c.description, "centro");
    const tag = extractTag(c.description, "dept");
    if (tag) deptTagToId.set(tag, id);
    console.log(`  ✓ Centro: ${c.name} (id=${id})`);
  }

  for (const c of COURSES) {
    const id = await upsertCommunity(c.name, c.description, "curso");
    const tag = extractTag(c.description, "course");
    if (tag) courseTagToId.set(tag, id);
    console.log(`  ✓ Curso: ${c.name} (id=${id})`);
  }

  // Assign all existing users
  const users = await db
    .select({ id: usersTable.id, course: usersTable.course, department: usersTable.department })
    .from(usersTable);

  console.log(`\n👥 Associando ${users.length} usuário(s) existente(s)...`);

  for (const user of users) {
    const normCourse = normalize(user.course);
    const normDept = normalize(user.department);
    let joined = 0;

    const courseId = courseTagToId.get(normCourse);
    if (courseId) { await joinUser(user.id, courseId); joined++; }

    const deptId = deptTagToId.get(normDept);
    if (deptId) { await joinUser(user.id, deptId); joined++; }

    console.log(`  ✓ Usuário #${user.id} (${user.course} / ${user.department}) → ${joined} comunidade(s)`);
  }

  console.log("✅ Seed de comunidades concluído!");
}

// Standalone execution
if (
  process.argv[1]?.endsWith("seed-communities.ts") ||
  process.argv[1]?.endsWith("seed-communities.js")
) {
  seedOfficialCommunities()
    .then(() => process.exit(0))
    .catch((err) => { console.error("❌ Erro:", err); process.exit(1); });
}
