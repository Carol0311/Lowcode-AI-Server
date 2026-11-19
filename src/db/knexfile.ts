// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
import { join } from 'path'

const baseConfig = {
  migrations: {
    directory: join(__dirname, '../../src/db/migrations'),
  },
}
const knex_file = {
  development: {
    ...baseConfig,
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'lowcode@20261115',
      database: process.env.DB_NAME || 'lowcodeAI',
      charset: 'utf8mb4',
    },
    pool: { min: 2, max: 10 },
  },
  production: {
    ...baseConfig,
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
    },
    pool: { min: 2, max: 10 },
  },
}
export default knex_file
