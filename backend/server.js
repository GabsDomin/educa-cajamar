import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = process.env.DATA_DIR || __dirname;
const dbFile = path.join(dataDir, "db.json");
const seedDbFile = path.join(__dirname, "db.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dbFile) && fs.existsSync(seedDbFile)) {
  fs.copyFileSync(seedDbFile, dbFile);
}

const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { institutions: [], activities: [] });
await db.read();

const app = express();
app.use(cors());
app.use(express.json());

const getNeighborhoods = () => {
  const map = new Map();
  for (const i of db.data.institutions) {
    if (!i.neighborhood) continue;
    if (!map.has(i.neighborhood)) {
      map.set(i.neighborhood, {
        name: i.neighborhood,
        schoolCount: 0,
        institutionCount: 0,
        activityCount: 0,
        averageRating: 0,
        coverageIndex: 0,
      });
    }
    const row = map.get(i.neighborhood);
    row.institutionCount += 1;
    if (i.type === "Escola") row.schoolCount += 1;
    row.averageRating += Number(i.rating || 0);
  }

  for (const a of db.data.activities) {
    const neighborhood = a.neighborhood;
    if (!neighborhood || !map.has(neighborhood)) continue;
    map.get(neighborhood).activityCount += 1;
  }

  for (const row of map.values()) {
    row.averageRating =
      row.institutionCount > 0
        ? Number((row.averageRating / row.institutionCount).toFixed(1))
        : 0;
    row.coverageIndex = Number(
      (row.schoolCount * 2 + row.institutionCount * 1.5 + row.activityCount).toFixed(1)
    );
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
};

app.get("/api/institutions", (_req, res) => {
  res.json(db.data.institutions);
});

app.post("/api/institutions", async (req, res) => {
  const payload = req.body;
  const institution = {
    ...payload,
    id: nanoid(8),
    city: payload.city || "Cajamar",
    state: payload.state || "SP",
    address: `${payload.street}, ${payload.number}`,
    lastUpdate: new Date().toISOString().split("T")[0],
  };
  db.data.institutions.push(institution);
  await db.write();
  res.status(201).json(institution);
});

app.put("/api/institutions/:id", async (req, res) => {
  const idx = db.data.institutions.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Institution not found" });

  const updated = {
    ...db.data.institutions[idx],
    ...req.body,
    id: req.params.id,
    address: `${req.body.street}, ${req.body.number}`,
    lastUpdate: new Date().toISOString().split("T")[0],
  };
  db.data.institutions[idx] = updated;

  db.data.activities = db.data.activities.map((a) =>
    a.institutionId === req.params.id
      ? { ...a, institutionName: updated.name, neighborhood: updated.neighborhood }
      : a
  );

  await db.write();
  res.json(updated);
});

app.patch("/api/institutions/:id/status", async (req, res) => {
  const institution = db.data.institutions.find((i) => i.id === req.params.id);
  if (!institution) return res.status(404).json({ message: "Institution not found" });
  institution.status = req.body.status;
  institution.lastUpdate = new Date().toISOString().split("T")[0];
  await db.write();
  res.json(institution);
});

app.get("/api/activities", (_req, res) => {
  res.json(db.data.activities);
});

app.post("/api/activities", async (req, res) => {
  const payload = req.body;
  const institution = db.data.institutions.find((i) => i.id === payload.institutionId);
  if (!institution) return res.status(400).json({ message: "Institution not found" });

  const activity = {
    ...payload,
    id: `a${nanoid(7)}`,
    institutionName: institution.name,
    neighborhood: institution.neighborhood,
  };
  db.data.activities.push(activity);
  await db.write();
  res.status(201).json(activity);
});

app.put("/api/activities/:id", async (req, res) => {
  const idx = db.data.activities.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Activity not found" });

  const institution = db.data.institutions.find((i) => i.id === req.body.institutionId);
  if (!institution) return res.status(400).json({ message: "Institution not found" });

  const updated = {
    ...db.data.activities[idx],
    ...req.body,
    id: req.params.id,
    institutionName: institution.name,
    neighborhood: institution.neighborhood,
  };
  db.data.activities[idx] = updated;
  await db.write();
  res.json(updated);
});

app.patch("/api/activities/:id/status", async (req, res) => {
  const activity = db.data.activities.find((a) => a.id === req.params.id);
  if (!activity) return res.status(404).json({ message: "Activity not found" });
  activity.status = req.body.status;
  await db.write();
  res.json(activity);
});

app.get("/api/neighborhoods", (_req, res) => {
  res.json(getNeighborhoods());
});

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
