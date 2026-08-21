import { getCloudflareBindings, getDatabaseUrl } from "../lib/runtime-env";

export type DatabaseDialect = "d1" | "postgres";

export interface AppStatement {
  bind(...values: unknown[]): AppStatement;
  all<T extends Record<string, unknown>>(): Promise<{ results: T[] }>;
  first<T extends Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface AppDatabase {
  dialect: DatabaseDialect;
  prepare(query: string): AppStatement;
  batch(statements: AppStatement[]): Promise<unknown>;
}

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("No database is configured. Set DATABASE_URL on Node or provide the Cloudflare D1 DB binding.");
    this.name = "DatabaseUnavailableError";
  }
}

type PostgresClient = {
  unsafe(query: string, values?: readonly unknown[]): Promise<readonly Record<string, unknown>[]>;
};

function postgresQuery(source: string) {
  const ignoresConflict = /^\s*INSERT\s+OR\s+IGNORE\s+INTO\b/i.test(source);
  let parameter = 0;
  let query = source
    .replace(/^\s*INSERT\s+OR\s+IGNORE\s+INTO\b/i, "INSERT INTO")
    .replace(/date\('now'\)/gi, "(CURRENT_DATE::text)")
    .replace(/\bCURRENT_TIMESTAMP\b/gi, "(CURRENT_TIMESTAMP::text)")
    .replace(/\?/g, () => `$${++parameter}`);
  if (ignoresConflict) query += " ON CONFLICT DO NOTHING";
  return query;
}

class PostgresStatement implements AppStatement {
  constructor(
    private readonly client: PostgresClient,
    private readonly query: string,
    private readonly values: unknown[] = [],
  ) {}

  bind(...values: unknown[]) {
    return new PostgresStatement(this.client, this.query, values);
  }

  private execute() {
    return this.client.unsafe(postgresQuery(this.query), this.values);
  }

  async all<T extends Record<string, unknown>>() {
    const rows = await this.execute();
    return { results: [...rows] as T[] };
  }

  async first<T extends Record<string, unknown>>() {
    const rows = await this.execute();
    return (rows[0] as T | undefined) ?? null;
  }

  async run() {
    await this.execute();
  }
}

class PostgresDatabase implements AppDatabase {
  readonly dialect = "postgres" as const;

  constructor(private readonly client: PostgresClient) {}

  prepare(query: string) {
    return new PostgresStatement(this.client, query);
  }

  async batch(statements: AppStatement[]) {
    for (const statement of statements) await statement.run();
  }
}

class D1DatabaseAdapter implements AppDatabase {
  readonly dialect = "d1" as const;

  constructor(private readonly database: D1Database) {}

  prepare(query: string) {
    return this.database.prepare(query) as unknown as AppStatement;
  }

  batch(statements: AppStatement[]) {
    return this.database.batch(statements as unknown as D1PreparedStatement[]);
  }
}

let postgresDatabase: Promise<AppDatabase> | null = null;

async function connectPostgres(url: string) {
  const nodePostgresPackage = "postgres";
  const postgres = (await import(/* @vite-ignore */ nodePostgresPackage)).default;
  const hostname = new URL(url).hostname;
  const useTls = !["localhost", "127.0.0.1", "::1"].includes(hostname);
  const client = postgres(url, {
    max: 5,
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 20,
    ssl: useTls ? "require" : false,
  }) as unknown as PostgresClient;
  return new PostgresDatabase(client);
}

export async function getRuntimeDatabase(): Promise<AppDatabase> {
  const url = getDatabaseUrl();
  if (url) {
    postgresDatabase ??= connectPostgres(url).catch((error) => {
      postgresDatabase = null;
      throw error;
    });
    return postgresDatabase;
  }

  const { DB } = await getCloudflareBindings();
  if (!DB) throw new DatabaseUnavailableError();
  return new D1DatabaseAdapter(DB);
}

export function isDatabaseUnavailable(error: unknown): error is DatabaseUnavailableError {
  return error instanceof DatabaseUnavailableError;
}
