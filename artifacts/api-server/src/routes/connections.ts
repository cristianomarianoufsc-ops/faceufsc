import { Router } from "express";
import { db } from "@workspace/db";
import { connectionsTable, usersTable } from "@workspace/db";
import { eq, or, and, sql } from "drizzle-orm";
import { z, ZodError } from "zod";
import { verifyToken, extractToken } from "../lib/jwt";

const router = Router();

function getAuthUserId(req: any): number | null {
  const token = extractToken(req.headers.authorization);
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

type UserRow = { name: string; avatarUrl: string | null; course: string };

async function getUserRow(id: number): Promise<UserRow> {
  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  return { name: u?.name ?? "", avatarUrl: u?.avatarUrl ?? null, course: u?.course ?? "" };
}

function formatConn(
  conn: typeof connectionsTable.$inferSelect,
  req: UserRow,
  rec: UserRow
) {
  return {
    id: conn.id,
    requesterId: conn.requesterId,
    receiverId: conn.receiverId,
    status: conn.status,
    requesterName: req.name,
    requesterAvatarUrl: req.avatarUrl,
    requesterCourse: req.course,
    receiverName: rec.name,
    receiverAvatarUrl: rec.avatarUrl,
    receiverCourse: rec.course,
    createdAt: conn.createdAt.toISOString(),
  };
}

// GET /connections — list my accepted connections
router.get("/connections", async (req, res): Promise<void> => {
  const userId = getAuthUserId(req);
  if (!userId) { res.status(401).json({ error: "Não autenticado." }); return; }

  try {
    const conns = await db.select().from(connectionsTable).where(
      and(
        or(eq(connectionsTable.requesterId, userId), eq(connectionsTable.receiverId, userId)),
        eq(connectionsTable.status, "accepted")
      )
    );

    const result = await Promise.all(
      conns.map(async (c) => {
        const req2 = await getUserRow(c.requesterId);
        const rec = await getUserRow(c.receiverId);
        return formatConn(c, req2, rec);
      })
    );

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /connections/requests — pending requests I received
router.get("/connections/requests", async (req, res): Promise<void> => {
  const userId = getAuthUserId(req);
  if (!userId) { res.status(401).json({ error: "Não autenticado." }); return; }

  try {
    const conns = await db.select().from(connectionsTable).where(
      and(eq(connectionsTable.receiverId, userId), eq(connectionsTable.status, "pending"))
    );

    const result = await Promise.all(
      conns.map(async (c) => {
        const requester = await getUserRow(c.requesterId);
        const receiver = await getUserRow(c.receiverId);
        return formatConn(c, requester, receiver);
      })
    );

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /connections/status/:userId — connection status with specific user
router.get("/connections/status/:userId", async (req, res): Promise<void> => {
  const myId = getAuthUserId(req);
  if (!myId) { res.status(401).json({ error: "Não autenticado." }); return; }

  try {
    const targetId = parseInt(req.params.userId);
    if (isNaN(targetId)) { res.status(400).json({ error: "ID inválido." }); return; }

    const [conn] = await db.select().from(connectionsTable).where(
      or(
        and(eq(connectionsTable.requesterId, myId), eq(connectionsTable.receiverId, targetId)),
        and(eq(connectionsTable.requesterId, targetId), eq(connectionsTable.receiverId, myId))
      )
    );

    if (!conn) {
      res.json({ status: "none", connectionId: null });
      return;
    }

    // Rows are only kept as "pending" or "accepted" — rejected rows are deleted.
    let status: string;
    if (conn.status === "accepted") {
      status = "connected";
    } else if (conn.requesterId === myId) {
      status = "pending_sent";
    } else {
      status = "pending_received";
    }

    res.json({ status, connectionId: conn.id });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /connections — send connection request
router.post("/connections", async (req, res): Promise<void> => {
  const userId = getAuthUserId(req);
  if (!userId) { res.status(401).json({ error: "Não autenticado." }); return; }

  try {
    const { receiverId } = z.object({ receiverId: z.number().int().positive() }).parse(req.body);

    if (receiverId === userId) {
      res.status(400).json({ error: "Não pode se conectar consigo mesmo." });
      return;
    }

    // Check for existing connection in either direction
    const [existing] = await db.select().from(connectionsTable).where(
      or(
        and(eq(connectionsTable.requesterId, userId), eq(connectionsTable.receiverId, receiverId)),
        and(eq(connectionsTable.requesterId, receiverId), eq(connectionsTable.receiverId, userId))
      )
    );

    if (existing) {
      res.status(409).json({ error: "Conexão já existe ou pedido já enviado." });
      return;
    }

    const [conn] = await db.insert(connectionsTable).values({
      requesterId: userId,
      receiverId,
      status: "pending",
    }).returning();

    const requester = await getUserRow(userId);
    const receiver = await getUserRow(receiverId);

    res.status(201).json(formatConn(conn, requester, receiver));
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Dados inválidos." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /connections/:id — accept or reject a request
router.patch("/connections/:id", async (req, res): Promise<void> => {
  const userId = getAuthUserId(req);
  if (!userId) { res.status(401).json({ error: "Não autenticado." }); return; }

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }

    const { action } = z.object({ action: z.enum(["accept", "reject"]) }).parse(req.body);

    const [conn] = await db.select().from(connectionsTable).where(eq(connectionsTable.id, id));
    if (!conn) { res.status(404).json({ error: "Conexão não encontrada." }); return; }
    if (conn.receiverId !== userId) { res.status(403).json({ error: "Sem permissão." }); return; }
    if (conn.status !== "pending") { res.status(400).json({ error: "Pedido não está pendente." }); return; }

    if (action === "accept") {
      // Use a transaction + conditional update to prevent double-processing race conditions
      let updated: typeof connectionsTable.$inferSelect | undefined;

      await db.transaction(async (tx) => {
        const [row] = await tx.update(connectionsTable)
          .set({ status: "accepted", updatedAt: new Date() })
          .where(and(eq(connectionsTable.id, id), eq(connectionsTable.status, "pending")))
          .returning();

        if (!row) return; // Concurrent request already processed it
        updated = row;

        await tx.update(usersTable)
          .set({ connectionsCount: sql`${usersTable.connectionsCount} + 1` })
          .where(eq(usersTable.id, conn.requesterId));
        await tx.update(usersTable)
          .set({ connectionsCount: sql`${usersTable.connectionsCount} + 1` })
          .where(eq(usersTable.id, conn.receiverId));
      });

      if (!updated) {
        res.status(409).json({ error: "Pedido já foi processado." });
        return;
      }

      res.status(204).send();
    } else {
      // Reject: delete the row so the requester can send a new request later
      await db.transaction(async (tx) => {
        await tx.delete(connectionsTable)
          .where(and(eq(connectionsTable.id, id), eq(connectionsTable.status, "pending")));
      });

      res.status(204).send();
    }
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Dados inválidos." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /connections/:id — cancel request or remove accepted connection
router.delete("/connections/:id", async (req, res): Promise<void> => {
  const userId = getAuthUserId(req);
  if (!userId) { res.status(401).json({ error: "Não autenticado." }); return; }

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }

    const [conn] = await db.select().from(connectionsTable).where(eq(connectionsTable.id, id));
    if (!conn) { res.status(404).json({ error: "Conexão não encontrada." }); return; }

    const isParticipant = conn.requesterId === userId || conn.receiverId === userId;
    if (!isParticipant) { res.status(403).json({ error: "Sem permissão." }); return; }

    await db.transaction(async (tx) => {
      await tx.delete(connectionsTable).where(eq(connectionsTable.id, id));

      // Only decrement if it was an accepted connection
      if (conn.status === "accepted") {
        await tx.update(usersTable)
          .set({ connectionsCount: sql`GREATEST(${usersTable.connectionsCount} - 1, 0)` })
          .where(eq(usersTable.id, conn.requesterId));
        await tx.update(usersTable)
          .set({ connectionsCount: sql`GREATEST(${usersTable.connectionsCount} - 1, 0)` })
          .where(eq(usersTable.id, conn.receiverId));
      }
    });

    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
