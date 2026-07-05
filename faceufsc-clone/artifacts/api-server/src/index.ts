import app from "./app";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { communitiesTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import { seedOfficialCommunities } from "./scripts/seed-communities";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runMigrations() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  logger.info("Migrations OK");
}

async function runSeedIfNeeded() {
  const [existing] = await db
    .select({ id: communitiesTable.id })
    .from(communitiesTable)
    .where(eq(communitiesTable.isOfficial, true))
    .limit(1);

  if (!existing) {
    logger.info("Nenhuma comunidade oficial encontrada — executando seed...");
    await seedOfficialCommunities();
    logger.info("Seed de comunidades oficiais concluído.");
  }
}

runMigrations()
  .then(runSeedIfNeeded)
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Migration/seed failed");
    process.exit(1);
  });
