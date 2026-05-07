import express from "express";
import cors from "cors";
import pg from "pg";
import { nanoid } from "nanoid";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDbFile = path.join(__dirname, "db.json");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Set it to your Supabase Postgres connection string.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

const asDateString = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
};

const asNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const calculateScoreEduca = (institution) => {
  const notaPortugues = asNullableNumber(institution.nota_portugues_saresp);
  const notaMatematica = asNullableNumber(institution.nota_matematica_saresp);
  const taxaAprovacao = asNullableNumber(institution.taxa_aprovacao);
  const taxaEvolucao = asNullableNumber(institution.taxa_evolucao);

  if (
    notaPortugues === null ||
    notaMatematica === null ||
    taxaAprovacao === null ||
    taxaEvolucao === null ||
    notaPortugues < 0 ||
    notaMatematica < 0 ||
    taxaAprovacao < 0 ||
    taxaAprovacao > 100
  ) {
    return null;
  }

  const pontosPortugues = Math.round(clamp(notaPortugues * 30, 0, 300));
  const pontosMatematica = Math.round(clamp(notaMatematica * 30, 0, 300));
  const pontosAprovacao = Math.round(clamp(taxaAprovacao * 2, 0, 200));
  const pontosEvolucao = taxaEvolucao >= 10
    ? 200
    : taxaEvolucao >= 5
      ? 160
      : taxaEvolucao >= 1
        ? 120
        : taxaEvolucao === 0
          ? 100
          : taxaEvolucao >= -4.9
            ? 60
            : 20;
  const score = Math.round(clamp(pontosPortugues + pontosMatematica + pontosAprovacao + pontosEvolucao, 0, 1000));
  const classificacao = score >= 850 ? "Excelente" : score >= 700 ? "Boa" : score >= 500 ? "Regular" : "Em atenção";

  return `${score}/1000 (${classificacao})`;
};

const rowToInstitution = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  rating: Number(row.rating || 0),
  address: row.address,
  street: row.street,
  number: row.number,
  neighborhood: row.neighborhood,
  city: row.city,
  state: row.state,
  phone: row.phone,
  email: row.email,
  imageUrl: row.image_url || undefined,
  google360Url: row.google_360_url || undefined,
  description: row.description,
  openingHours: row.opening_hours,
  targetAudience: row.target_audience,
  isFree: row.is_free,
  accessibility: row.accessibility,
  responsible: row.responsible,
  status: row.status,
  lastUpdate: asDateString(row.last_update),
  lat: Number(row.lat || 0),
  lng: Number(row.lng || 0),
  schoolNetwork: row.school_network || undefined,
  schoolLevels: row.school_levels || undefined,
  schoolShifts: row.school_shifts || undefined,
  infrastructure: row.infrastructure || undefined,
  nota_portugues_saresp: asNullableNumber(row.nota_portugues_saresp),
  nota_matematica_saresp: asNullableNumber(row.nota_matematica_saresp),
  ano_base: asNullableNumber(row.ano_base),
  taxa_aprovacao: asNullableNumber(row.taxa_aprovacao),
  taxa_evolucao: asNullableNumber(row.taxa_evolucao),
});

const rowToActivity = (row) => ({
  id: row.id,
  name: row.name,
  institutionId: row.institution_id,
  institutionName: row.institution_name,
  category: row.category,
  description: row.description,
  weekDays: row.week_days || [],
  startTime: row.start_time,
  endTime: row.end_time,
  targetAudience: row.target_audience,
  ageRange: row.age_range,
  isFree: Boolean(row.is_free),
  availableSlots: Number(row.available_slots || 0),
  totalSlots: Number(row.total_slots || 0),
  status: row.status,
  enrollmentInfo: row.enrollment_info,
  instructor: row.instructor || undefined,
  neighborhood: row.neighborhood,
});

const createSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS institutions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      rating NUMERIC DEFAULT 0,
      address TEXT NOT NULL,
      street TEXT NOT NULL,
      number TEXT NOT NULL,
      neighborhood TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Cajamar',
      state TEXT NOT NULL DEFAULT 'SP',
      phone TEXT NOT NULL,
      email TEXT,
      image_url TEXT,
      google_360_url TEXT,
      description TEXT NOT NULL,
      opening_hours TEXT NOT NULL,
      target_audience TEXT NOT NULL,
      is_free TEXT NOT NULL,
      accessibility TEXT NOT NULL,
      responsible TEXT NOT NULL,
      status TEXT NOT NULL,
      last_update DATE NOT NULL,
      lat DOUBLE PRECISION NOT NULL DEFAULT 0,
      lng DOUBLE PRECISION NOT NULL DEFAULT 0,
      school_network TEXT,
      school_levels JSONB,
      school_shifts JSONB,
      infrastructure JSONB,
      nota_portugues_saresp NUMERIC,
      nota_matematica_saresp NUMERIC,
      ano_base INTEGER,
      taxa_aprovacao NUMERIC,
      taxa_evolucao NUMERIC
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      institution_name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      week_days JSONB NOT NULL DEFAULT '[]',
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      target_audience TEXT NOT NULL,
      age_range TEXT NOT NULL,
      is_free BOOLEAN NOT NULL DEFAULT true,
      available_slots INTEGER NOT NULL DEFAULT 0,
      total_slots INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      enrollment_info TEXT NOT NULL,
      instructor TEXT,
      neighborhood TEXT NOT NULL
    );
  `);

  await pool.query(`
    ALTER TABLE institutions
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS google_360_url TEXT,
      ADD COLUMN IF NOT EXISTS nota_portugues_saresp NUMERIC,
      ADD COLUMN IF NOT EXISTS nota_matematica_saresp NUMERIC,
      ADD COLUMN IF NOT EXISTS ano_base INTEGER,
      ADD COLUMN IF NOT EXISTS taxa_aprovacao NUMERIC,
      ADD COLUMN IF NOT EXISTS taxa_evolucao NUMERIC;
  `);
};

const insertInstitution = async (institution) => {
  const payload = {
    ...institution,
    city: institution.city || "Cajamar",
    state: institution.state || "SP",
    address: institution.address || `${institution.street}, ${institution.number}`,
    lastUpdate: institution.lastUpdate || new Date().toISOString().slice(0, 10),
  };

  const result = await pool.query(
    `
      INSERT INTO institutions (
        id, name, type, rating, address, street, number, neighborhood, city, state,
        phone, email, image_url, google_360_url, description, opening_hours, target_audience, is_free,
        accessibility, responsible, status, last_update, lat, lng, school_network,
        school_levels, school_shifts, infrastructure, nota_portugues_saresp,
        nota_matematica_saresp, ano_base, taxa_aprovacao, taxa_evolucao
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25,
        $26, $27, $28, $29, $30, $31, $32, $33
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        rating = EXCLUDED.rating,
        address = EXCLUDED.address,
        street = EXCLUDED.street,
        number = EXCLUDED.number,
        neighborhood = EXCLUDED.neighborhood,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        image_url = EXCLUDED.image_url,
        google_360_url = EXCLUDED.google_360_url,
        description = EXCLUDED.description,
        opening_hours = EXCLUDED.opening_hours,
        target_audience = EXCLUDED.target_audience,
        is_free = EXCLUDED.is_free,
        accessibility = EXCLUDED.accessibility,
        responsible = EXCLUDED.responsible,
        status = EXCLUDED.status,
        last_update = EXCLUDED.last_update,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        school_network = EXCLUDED.school_network,
        school_levels = EXCLUDED.school_levels,
        school_shifts = EXCLUDED.school_shifts,
        infrastructure = EXCLUDED.infrastructure,
        nota_portugues_saresp = EXCLUDED.nota_portugues_saresp,
        nota_matematica_saresp = EXCLUDED.nota_matematica_saresp,
        ano_base = EXCLUDED.ano_base,
        taxa_aprovacao = EXCLUDED.taxa_aprovacao,
        taxa_evolucao = EXCLUDED.taxa_evolucao
      RETURNING *
    `,
    [
      payload.id,
      payload.name,
      payload.type,
      payload.rating || 0,
      payload.address,
      payload.street,
      payload.number,
      payload.neighborhood,
      payload.city,
      payload.state,
      payload.phone,
      payload.email || null,
      payload.imageUrl || null,
      payload.google360Url || null,
      payload.description,
      payload.openingHours,
      payload.targetAudience,
      payload.isFree,
      payload.accessibility,
      payload.responsible,
      payload.status,
      payload.lastUpdate,
      payload.lat || 0,
      payload.lng || 0,
      payload.schoolNetwork || null,
      payload.schoolLevels ? JSON.stringify(payload.schoolLevels) : null,
      payload.schoolShifts ? JSON.stringify(payload.schoolShifts) : null,
      payload.infrastructure ? JSON.stringify(payload.infrastructure) : null,
      asNullableNumber(payload.nota_portugues_saresp),
      asNullableNumber(payload.nota_matematica_saresp),
      asNullableNumber(payload.ano_base),
      asNullableNumber(payload.taxa_aprovacao),
      asNullableNumber(payload.taxa_evolucao),
    ]
  );
  return rowToInstitution(result.rows[0]);
};

const insertActivity = async (activity) => {
  const result = await pool.query(
    `
      INSERT INTO activities (
        id, name, institution_id, institution_name, category, description, week_days,
        start_time, end_time, target_audience, age_range, is_free, available_slots,
        total_slots, status, enrollment_info, instructor, neighborhood
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        institution_id = EXCLUDED.institution_id,
        institution_name = EXCLUDED.institution_name,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        week_days = EXCLUDED.week_days,
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        target_audience = EXCLUDED.target_audience,
        age_range = EXCLUDED.age_range,
        is_free = EXCLUDED.is_free,
        available_slots = EXCLUDED.available_slots,
        total_slots = EXCLUDED.total_slots,
        status = EXCLUDED.status,
        enrollment_info = EXCLUDED.enrollment_info,
        instructor = EXCLUDED.instructor,
        neighborhood = EXCLUDED.neighborhood
      RETURNING *
    `,
    [
      activity.id,
      activity.name,
      activity.institutionId,
      activity.institutionName,
      activity.category,
      activity.description,
      JSON.stringify(activity.weekDays || []),
      activity.startTime,
      activity.endTime,
      activity.targetAudience,
      activity.ageRange,
      Boolean(activity.isFree),
      activity.availableSlots || 0,
      activity.totalSlots || 0,
      activity.status,
      activity.enrollmentInfo,
      activity.instructor || null,
      activity.neighborhood,
    ]
  );
  return rowToActivity(result.rows[0]);
};

const seedIfEmpty = async () => {
  const count = await pool.query("SELECT COUNT(*)::int AS total FROM institutions");
  if (count.rows[0].total > 0) return;

  const contents = await fs.readFile(seedDbFile, "utf-8");
  const seed = JSON.parse(contents);

  for (const institution of seed.institutions || []) {
    await insertInstitution(institution);
  }

  for (const activity of seed.activities || []) {
    await insertActivity(activity);
  }
};

await createSchema();
await seedIfEmpty();

const app = express();
app.use(cors());
app.use(express.json());

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getInstitutionById = async (id) => {
  const result = await pool.query("SELECT * FROM institutions WHERE id = $1", [id]);
  return result.rows[0] ? rowToInstitution(result.rows[0]) : null;
};

const buildAiContext = async () => {
  const [institutionsResult, activitiesResult, neighborhoodsResult] = await Promise.all([
    pool.query("SELECT * FROM institutions ORDER BY name LIMIT 200"),
    pool.query("SELECT * FROM activities ORDER BY name LIMIT 200"),
    pool.query(`
      WITH institution_stats AS (
        SELECT
          neighborhood,
          COUNT(*)::int AS institution_count,
          COUNT(*) FILTER (WHERE type = 'Escola')::int AS school_count,
          COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS average_rating
        FROM institutions
        WHERE neighborhood IS NOT NULL AND neighborhood <> ''
        GROUP BY neighborhood
      ),
      activity_stats AS (
        SELECT neighborhood, COUNT(*)::int AS activity_count
        FROM activities
        WHERE neighborhood IS NOT NULL AND neighborhood <> ''
        GROUP BY neighborhood
      )
      SELECT
        i.neighborhood AS name,
        i.school_count,
        i.institution_count,
        COALESCE(a.activity_count, 0)::int AS activity_count,
        i.average_rating,
        ROUND((i.school_count * 2 + i.institution_count * 1.5 + COALESCE(a.activity_count, 0))::numeric, 1)::float AS coverage_index
      FROM institution_stats i
      LEFT JOIN activity_stats a ON a.neighborhood = i.neighborhood
      ORDER BY i.neighborhood
      LIMIT 80
    `),
  ]);

  const institutions = institutionsResult.rows.map(rowToInstitution);
  const activities = activitiesResult.rows.map(rowToActivity);
  const neighborhoods = neighborhoodsResult.rows;

  return [
    "INSTITUIÇÕES CADASTRADAS:",
    ...institutions.map((institution) => {
      const score = institution.type === "Escola" ? calculateScoreEduca(institution) : null;
      return [
        `- ${institution.name}`,
        `tipo: ${institution.type}`,
        `bairro: ${institution.neighborhood}`,
        `endereço: ${institution.address}, ${institution.city}/${institution.state}`,
        `telefone: ${institution.phone}`,
        `gratuito: ${institution.isFree}`,
        `acessibilidade: ${institution.accessibility}`,
        `avaliação: ${institution.rating}/5`,
        score ? `score educa cajamar: ${score}` : null,
      ].filter(Boolean).join("; ");
    }),
    "",
    "ATIVIDADES CADASTRADAS:",
    ...activities.map((activity) => [
      `- ${activity.name}`,
      `instituição: ${activity.institutionName}`,
      `categoria: ${activity.category}`,
      `bairro: ${activity.neighborhood}`,
      `dias: ${(activity.weekDays || []).join(", ")}`,
      `horário: ${activity.startTime} às ${activity.endTime}`,
      `gratuita: ${activity.isFree ? "sim" : "não"}`,
      `vagas: ${activity.availableSlots}/${activity.totalSlots}`,
      `status: ${activity.status}`,
      `público: ${activity.targetAudience}`,
    ].join("; ")),
    "",
    "RESUMO POR BAIRRO:",
    ...neighborhoods.map((neighborhood) => [
      `- ${neighborhood.name}`,
      `escolas: ${neighborhood.school_count}`,
      `instituições: ${neighborhood.institution_count}`,
      `atividades: ${neighborhood.activity_count}`,
      `avaliação média: ${neighborhood.average_rating}`,
      `índice de cobertura: ${neighborhood.coverage_index}`,
    ].join("; ")),
  ].join("\n").slice(0, 45000);
};

const askGemini = async (question, context) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: [
              "Você é o Assistente Educa Cajamar.",
              "Responda em português brasileiro, com linguagem clara e útil para moradores de Cajamar.",
              "Use somente os dados fornecidos no contexto do Educa Cajamar.",
              "Se a informação não estiver no contexto, diga que ela ainda não está cadastrada.",
              "Não invente endereços, telefones, vagas, notas, horários ou rankings.",
              "Prefira respostas curtas, organizadas e acionáveis.",
            ].join(" "),
          }],
        },
        contents: [{
          role: "user",
          parts: [{
            text: `Pergunta do usuário:\n${question}\n\nContexto do Educa Cajamar:\n${context}`,
          }],
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 700,
        },
      }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${details}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  return text || "Não consegui gerar uma resposta agora. Tente novamente em instantes.";
};

app.post(
  "/api/ai/ask",
  asyncHandler(async (req, res) => {
    const question = String(req.body?.question || "").trim();
    if (!question) return res.status(400).json({ message: "Question is required" });
    if (question.length > 500) return res.status(400).json({ message: "Question is too long" });

    const context = await buildAiContext();
    const answer = await askGemini(question, context);
    res.json({ answer });
  })
);

app.get(
  "/api/institutions",
  asyncHandler(async (_req, res) => {
    const result = await pool.query("SELECT * FROM institutions ORDER BY name");
    res.json(result.rows.map(rowToInstitution));
  })
);

app.post(
  "/api/institutions",
  asyncHandler(async (req, res) => {
    const payload = req.body;
    const institution = await insertInstitution({
      ...payload,
      id: nanoid(8),
      city: payload.city || "Cajamar",
      state: payload.state || "SP",
      address: `${payload.street}, ${payload.number}`,
      lastUpdate: new Date().toISOString().slice(0, 10),
    });
    res.status(201).json(institution);
  })
);

app.put(
  "/api/institutions/:id",
  asyncHandler(async (req, res) => {
    const current = await getInstitutionById(req.params.id);
    if (!current) return res.status(404).json({ message: "Institution not found" });

    const updated = await insertInstitution({
      ...current,
      ...req.body,
      id: req.params.id,
      address: `${req.body.street || current.street}, ${req.body.number || current.number}`,
      lastUpdate: new Date().toISOString().slice(0, 10),
    });

    await pool.query(
      `
        UPDATE activities
        SET institution_name = $1, neighborhood = $2
        WHERE institution_id = $3
      `,
      [updated.name, updated.neighborhood, updated.id]
    );

    res.json(updated);
  })
);

app.patch(
  "/api/institutions/:id/status",
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `
        UPDATE institutions
        SET status = $1, last_update = $2
        WHERE id = $3
        RETURNING *
      `,
      [req.body.status, new Date().toISOString().slice(0, 10), req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: "Institution not found" });
    res.json(rowToInstitution(result.rows[0]));
  })
);

app.get(
  "/api/activities",
  asyncHandler(async (_req, res) => {
    const result = await pool.query("SELECT * FROM activities ORDER BY name");
    res.json(result.rows.map(rowToActivity));
  })
);

app.post(
  "/api/activities",
  asyncHandler(async (req, res) => {
    const payload = req.body;
    const institution = await getInstitutionById(payload.institutionId);
    if (!institution) return res.status(400).json({ message: "Institution not found" });

    const activity = await insertActivity({
      ...payload,
      id: `a${nanoid(7)}`,
      institutionName: institution.name,
      neighborhood: institution.neighborhood,
    });
    res.status(201).json(activity);
  })
);

app.put(
  "/api/activities/:id",
  asyncHandler(async (req, res) => {
    const current = await pool.query("SELECT * FROM activities WHERE id = $1", [req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ message: "Activity not found" });

    const institution = await getInstitutionById(req.body.institutionId);
    if (!institution) return res.status(400).json({ message: "Institution not found" });

    const activity = await insertActivity({
      ...rowToActivity(current.rows[0]),
      ...req.body,
      id: req.params.id,
      institutionName: institution.name,
      neighborhood: institution.neighborhood,
    });
    res.json(activity);
  })
);

app.patch(
  "/api/activities/:id/status",
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      "UPDATE activities SET status = $1 WHERE id = $2 RETURNING *",
      [req.body.status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: "Activity not found" });
    res.json(rowToActivity(result.rows[0]));
  })
);

app.get(
  "/api/neighborhoods",
  asyncHandler(async (_req, res) => {
    const result = await pool.query(`
      WITH institution_stats AS (
        SELECT
          neighborhood,
          COUNT(*)::int AS institution_count,
          COUNT(*) FILTER (WHERE type = 'Escola')::int AS school_count,
          COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS average_rating
        FROM institutions
        WHERE neighborhood IS NOT NULL AND neighborhood <> ''
        GROUP BY neighborhood
      ),
      activity_stats AS (
        SELECT neighborhood, COUNT(*)::int AS activity_count
        FROM activities
        WHERE neighborhood IS NOT NULL AND neighborhood <> ''
        GROUP BY neighborhood
      )
      SELECT
        i.neighborhood AS name,
        i.school_count,
        i.institution_count,
        COALESCE(a.activity_count, 0)::int AS activity_count,
        i.average_rating,
        ROUND((i.school_count * 2 + i.institution_count * 1.5 + COALESCE(a.activity_count, 0))::numeric, 1)::float AS coverage_index
      FROM institution_stats i
      LEFT JOIN activity_stats a ON a.neighborhood = i.neighborhood
      ORDER BY i.neighborhood
    `);

    res.json(
      result.rows.map((row) => ({
        name: row.name,
        schoolCount: row.school_count,
        institutionCount: row.institution_count,
        activityCount: row.activity_count,
        averageRating: row.average_rating,
        coverageIndex: row.coverage_index,
      }))
    );
  })
);

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
