//模块分区迁移配置文件
import { join } from 'path'

const baseConfig = {
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'lowcode@20261115',
    database: 'lowcodeAI',
  },
  pool: {
    min: 2,
    max: 10,
  },
}

export const moduleMapping = {
  pages: {
    ...baseConfig,
    migrations: {
      directory: join(__dirname, '../src/db/migrations/Pages'),
      tableName: 'knex_migrations_pages',
    },
    index: 0,
  },
  ai: {
    ...baseConfig,
    migrations: {
      directory: join(__dirname, '../src/db/migrations/AI'),
      tableName: 'knex_migrations_ai',
    },
    index: 1,
  },
  tables: {
    ...baseConfig,
    migrations: {
      directory: join(__dirname, '../src/db/migrations/Tables'),
      tableName: 'knex_migrations_tables',
    },
    index: 2,
  },
  system: {
    ...baseConfig,
    migrations: {
      directory: join(__dirname, '../src/db/migrations/System'),
      tableName: 'knex_migrations_system',
    },
    index: 3,
  },
} as Record<string, any>
