//模块分区迁移配置文件
import { join } from 'path'

const baseConfig = {
  client: 'sqlite3',
  connection: {
    filename: join(__dirname, '../data/lowcode.db'),
  },
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn: any, done: any) => {
      conn.run('PRAGMA foreign_keys = ON', done)
    },
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
