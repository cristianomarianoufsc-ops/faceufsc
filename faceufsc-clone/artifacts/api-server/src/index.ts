import app from "./app";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { seedOfficialCommunities } from "./scripts/seed-communities";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const SEED_VERSION = "official-communities-v1";

async function runMigrations() {
  // Core settings table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Add is_official column if the DB predates this migration
  await db.execute(sql`
    ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_official BOOLEAN NOT NULL DEFAULT FALSE
  `);

  logger.info("Migrations OK");
}

async function runSeedIfNeeded() {
  // Use app_settings as an idempotency lock — one row per seed version.
  // This is safe across restarts and concurrent instances: the first writer wins
  // because app_settings.key is a PRIMARY KEY (unique), so a concurrent INSERT
  // will throw a unique-violation and that instance skips seeding.
  const result = await db.execute(sql`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (${SEED_VERSION}, 'done', NOW())
    ON CONFLICT (key) DO NOTHING
    RETURNING key
  `);

  const didInsert = (result.rowCount ?? 0) > 0;
  if (!didInsert) {
    // Another instance already seeded (or this boot already ran seed)
    return;
  }

  logger.info("Executando seed de comunidades oficiais...");
  try {
    await seedOfficialCommunities();
    logger.info("Seed de comunidades oficiais concluído.");
  } catch (err) {
    // Roll back the marker so the next boot retries
    await db.execute(sql`DELETE FROM app_settings WHERE key = ${SEED_VERSION}`);
    throw err;
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
