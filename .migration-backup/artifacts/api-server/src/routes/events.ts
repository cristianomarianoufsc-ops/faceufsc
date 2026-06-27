import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/events", async (req, res) => {
  try {
    const events = await db.select().from(eventsTable).orderBy(asc(eventsTable.date));
    res.json(events.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const { title, description, location, date, time, organizer, category, maxAttendees } = req.body;
    if (!title || !description || !location || !date || !time || !organizer || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const [event] = await db.insert(eventsTable).values({
      title,
      description,
      location,
      date,
      time,
      organizer,
      category,
      attendeesCount: 0,
      maxAttendees: maxAttendees || null,
    }).returning();
    res.status(201).json({ ...event, createdAt: event.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ ...event, createdAt: event.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
