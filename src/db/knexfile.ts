// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
import { join } from 'path'
const projectRoot = process.cwd()
const knex_file = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: join(__dirname, '../../data/lowcode.db'),
    },
    migrations: {
      directory: join(__dirname, '../../src/db/migrations'),
    },
    useNullAsDefault: true,
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
}
export default knex_file
