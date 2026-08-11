// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
import { join } from 'path'

const baseConfig = {
  migrations: {
    directory: join(__dirname, '../../src/db/migrations'),
  },
  pool: {
    afterCreate: (conn: any, done: any) => {
      //开启外键约束
      conn.run('PRAGMA foreign_keys = ON', done)
    },
  },
}
const knex_file = {
  development: {
    ...baseConfig,
    client: 'sqlite3',
    connection: {
      filename: join(__dirname, '../../data/lowcode.db'),
    },
    useNullAsDefault: true,
  },
  production: {
    ...baseConfig,
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
  },
}
export default knex_file
