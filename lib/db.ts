import { neon } from "@neondatabase/serverless";

// Reads the Postgres connection string from whichever env var your
// provider sets. Vercel's Postgres/Neon marketplace integration sets
// DATABASE_URL (and often POSTGRES_URL as an alias) automatically once
// you provision the database from your Vercel project's Storage tab.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

export function isDbConfigured() {
  return Boolean(connectionString);
}

// Lazily created — avoids throwing at import time (e.g. during local
// `npm run build`) when the env var isn't set yet.
let sqlClient: ReturnType<typeof neon> | null = null;
function getSql() {
  if (!connectionString) {
    throw new Error(
      "No database connection string found. Set DATABASE_URL (or POSTGRES_URL) in your environment."
    );
  }
  if (!sqlClient) sqlClient = neon(connectionString);
  return sqlClient;
}

let schemaReady: Promise<void> | null = null;
function ensureSchema() {
  if (!schemaReady) {
    const sql = getSql();
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS submissions (
          id SERIAL PRIMARY KEY,
          category TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          data JSONB NOT NULL DEFAULT '{}'::jsonb,
          read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS pageviews (
          id SERIAL PRIMARY KEY,
          path TEXT NOT NULL,
          referrer TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'In Development',
          progress INTEGER NOT NULL DEFAULT 0,
          engine TEXT NOT NULL DEFAULT '',
          genre TEXT NOT NULL DEFAULT '',
          platform TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          color TEXT NOT NULL DEFAULT 'purple',
          image TEXT NOT NULL DEFAULT '',
          link TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS portfolio_items (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'Published',
          image TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          link TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS admin_settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          studio_name TEXT NOT NULL DEFAULT 'BLAKASH',
          tagline TEXT NOT NULL DEFAULT 'Ideas Never Die',
          description TEXT NOT NULL DEFAULT '',
          seo_title TEXT NOT NULL DEFAULT '',
          seo_description TEXT NOT NULL DEFAULT '',
          social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
          preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
          notifications JSONB NOT NULL DEFAULT '{}'::jsonb,
          profile_name TEXT NOT NULL DEFAULT 'Arun Kumar',
          profile_email TEXT NOT NULL DEFAULT 'connect@blakash.com',
          profile_role TEXT NOT NULL DEFAULT 'Founder & Creative Director',
          profile_avatar TEXT NOT NULL DEFAULT '',
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT admin_settings_single_row CHECK (id = 1)
        )
      `;
      await sql`INSERT INTO admin_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
    })();
  }
  return schemaReady;
}

export type Submission = {
  id: number;
  category: string;
  name: string;
  email: string;
  data: Record<string, string>;
  read: boolean;
  created_at: string;
};

export async function insertSubmission(input: {
  category: string;
  name: string;
  email: string;
  data: Record<string, string>;
}): Promise<Submission> {
  const sql = getSql();
  await ensureSchema();
  const rows = (await sql`
    INSERT INTO submissions (category, name, email, data)
    VALUES (${input.category}, ${input.name}, ${input.email}, ${JSON.stringify(input.data)}::jsonb)
    RETURNING id, category, name, email, data, read, created_at
  `) as Submission[];
  return rows[0];
}

export async function getSubmissions(): Promise<Submission[]> {
  const sql = getSql();
  await ensureSchema();
  const rows = await sql`
    SELECT id, category, name, email, data, read, created_at
    FROM submissions
    ORDER BY created_at DESC
    LIMIT 200
  `;
  return rows as Submission[];
}

export async function markSubmissionRead(id: number, read: boolean) {
  const sql = getSql();
  await ensureSchema();
  await sql`UPDATE submissions SET read = ${read} WHERE id = ${id}`;
}

export async function deleteSubmission(id: number) {
  const sql = getSql();
  await ensureSchema();
  await sql`DELETE FROM submissions WHERE id = ${id}`;
}

export async function trackPageview(path: string, referrer: string | null) {
  const sql = getSql();
  await ensureSchema();
  await sql`INSERT INTO pageviews (path, referrer) VALUES (${path}, ${referrer})`;
}

export type AnalyticsSummary = {
  totalViews: number;
  uniquePaths: number;
  last7Days: { day: string; views: number }[];
  topPages: { path: string; views: number; percentage: number }[];
};

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const sql = getSql();
  await ensureSchema();

  const totalRows = (await sql`SELECT COUNT(*)::int AS count FROM pageviews`) as { count: number }[];
  const totalViews = totalRows[0]?.count ?? 0;

  const dailyRows = await sql`
    SELECT to_char(date_trunc('day', created_at), 'Dy') AS day,
           date_trunc('day', created_at) AS day_start,
           COUNT(*)::int AS views
    FROM pageviews
    WHERE created_at > now() - interval '7 days'
    GROUP BY day_start, day
    ORDER BY day_start ASC
  `;
  const last7Days = (dailyRows as { day: string; views: number }[]).map((r) => ({
    day: r.day,
    views: r.views,
  }));

  const topRows = await sql`
    SELECT path, COUNT(*)::int AS views
    FROM pageviews
    GROUP BY path
    ORDER BY views DESC
    LIMIT 8
  `;
  const topPages = (topRows as { path: string; views: number }[]).map((r) => ({
    path: r.path,
    views: r.views,
    percentage: totalViews > 0 ? Math.round((r.views / totalViews) * 1000) / 10 : 0,
  }));

  const uniqueRows = (await sql`SELECT COUNT(DISTINCT path)::int AS count FROM pageviews`) as { count: number }[];
  const uniquePaths = uniqueRows[0]?.count ?? 0;

  return { totalViews, uniquePaths, last7Days, topPages };
}

export type Project = {
  id: number;
  name: string;
  status: string;
  progress: number;
  engine: string;
  genre: string;
  platform: string;
  description: string;
  color: string;
  image: string;
  link: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectInput = {
  name: string;
  status: string;
  progress: number;
  engine: string;
  genre: string;
  platform: string;
  description: string;
  color: string;
  image: string;
  link: string;
};

export async function getProjects(): Promise<Project[]> {
  const sql = getSql();
  await ensureSchema();
  const rows = await sql`SELECT * FROM projects ORDER BY sort_order ASC, id ASC`;
  return rows as Project[];
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const sql = getSql();
  await ensureSchema();
  const rows = (await sql`
    INSERT INTO projects (name, status, progress, engine, genre, platform, description, color, image, link)
    VALUES (${input.name}, ${input.status}, ${input.progress}, ${input.engine}, ${input.genre}, ${input.platform}, ${input.description}, ${input.color}, ${input.image}, ${input.link})
    RETURNING *
  `) as Project[];
  return rows[0];
}

export async function updateProject(id: number, input: Partial<ProjectInput>): Promise<Project | undefined> {
  const sql = getSql();
  await ensureSchema();
  const current = (await sql`SELECT * FROM projects WHERE id = ${id}`) as Project[];
  if (!current[0]) return undefined;
  const merged = { ...current[0], ...input };
  const rows = (await sql`
    UPDATE projects SET
      name = ${merged.name}, status = ${merged.status}, progress = ${merged.progress},
      engine = ${merged.engine}, genre = ${merged.genre}, platform = ${merged.platform},
      description = ${merged.description}, color = ${merged.color}, image = ${merged.image},
      link = ${merged.link}, updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as Project[];
  return rows[0];
}

export async function deleteProject(id: number) {
  const sql = getSql();
  await ensureSchema();
  await sql`DELETE FROM projects WHERE id = ${id}`;
}

export type PortfolioItem = {
  id: number;
  title: string;
  category: string;
  status: string;
  image: string;
  description: string;
  link: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PortfolioItemInput = {
  title: string;
  category: string;
  status: string;
  image: string;
  description: string;
  link: string;
};

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const sql = getSql();
  await ensureSchema();
  const rows = await sql`SELECT * FROM portfolio_items ORDER BY sort_order ASC, id ASC`;
  return rows as PortfolioItem[];
}

export async function createPortfolioItem(input: PortfolioItemInput): Promise<PortfolioItem> {
  const sql = getSql();
  await ensureSchema();
  const rows = (await sql`
    INSERT INTO portfolio_items (title, category, status, image, description, link)
    VALUES (${input.title}, ${input.category}, ${input.status}, ${input.image}, ${input.description}, ${input.link})
    RETURNING *
  `) as PortfolioItem[];
  return rows[0];
}

export async function updatePortfolioItem(id: number, input: Partial<PortfolioItemInput>): Promise<PortfolioItem | undefined> {
  const sql = getSql();
  await ensureSchema();
  const current = (await sql`SELECT * FROM portfolio_items WHERE id = ${id}`) as PortfolioItem[];
  if (!current[0]) return undefined;
  const merged = { ...current[0], ...input };
  const rows = (await sql`
    UPDATE portfolio_items SET
      title = ${merged.title}, category = ${merged.category}, status = ${merged.status},
      image = ${merged.image}, description = ${merged.description}, link = ${merged.link},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as PortfolioItem[];
  return rows[0];
}

export async function deletePortfolioItem(id: number) {
  const sql = getSql();
  await ensureSchema();
  await sql`DELETE FROM portfolio_items WHERE id = ${id}`;
}

export type AdminSettings = {
  id: number;
  studio_name: string;
  tagline: string;
  description: string;
  seo_title: string;
  seo_description: string;
  social_links: Record<string, string>;
  preferences: Record<string, boolean>;
  notifications: Record<string, boolean>;
  profile_name: string;
  profile_email: string;
  profile_role: string;
  profile_avatar: string;
  updated_at: string;
};

export async function getSettings(): Promise<AdminSettings> {
  const sql = getSql();
  await ensureSchema();
  const rows = (await sql`SELECT * FROM admin_settings WHERE id = 1`) as AdminSettings[];
  return rows[0];
}

export async function updateSettings(input: Partial<Omit<AdminSettings, "id" | "updated_at">>): Promise<AdminSettings> {
  const sql = getSql();
  await ensureSchema();
  const current = await getSettings();
  const merged = { ...current, ...input };
  const rows = (await sql`
    UPDATE admin_settings SET
      studio_name = ${merged.studio_name}, tagline = ${merged.tagline}, description = ${merged.description},
      seo_title = ${merged.seo_title}, seo_description = ${merged.seo_description},
      social_links = ${JSON.stringify(merged.social_links)}::jsonb,
      preferences = ${JSON.stringify(merged.preferences)}::jsonb,
      notifications = ${JSON.stringify(merged.notifications)}::jsonb,
      profile_name = ${merged.profile_name}, profile_email = ${merged.profile_email},
      profile_role = ${merged.profile_role}, profile_avatar = ${merged.profile_avatar},
      updated_at = now()
    WHERE id = 1
    RETURNING *
  `) as AdminSettings[];
  return rows[0];
}
