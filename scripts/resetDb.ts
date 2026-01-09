import { unlink, readdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

async function resetDatabase() {
  console.log('开始重置数据库')

  try {
    //删除数据库文件，断开数据库连接
    const dbPath = join(__dirname, '../data/lowcode.db')
    try {
      await unlink(dbPath)
      console.log('已删除数据库文件')
    } catch (e) {
      console.log('数据库文件不存在，跳过删除', e)
    }

    //删除所有迁移文件
    const migrations = join(__dirname, '../src/db/migrations')
    const files = await readdir(migrations)
    for (const file of files) {
      await unlink(join(migrations, file))
      console.log(`已删除迁移文件${file}`)
    }

    //生成新的迁移文件
    await execPromise('npx knex migrate:make create_pages --knexfile src/db/knexfile.ts')
    const migrationsFiles = await readdir(migrations)
    const newMigration = migrationsFiles.find((f) => f.includes('create_pages'))

    if (newMigration) {
      const migrationPath = join(migrations, newMigration)
      const migrationContent = `import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('pages', function (table) {
    table.string('id', 36).primary().notNullable().unique()
    table.string('name').notNullable()
    table.text('rootComponentIds').defaultTo('[]')
    table.json('components').defaultTo('{}')
    table.text('selectId').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}
      
exports.down = function (knex: Knex) {
  return knex.schema.dropTable('pages')
}`
      await writeFile(migrationPath, migrationContent.trim())
    }

    //运行迁移
    await execPromise('npx knex migrate:latest --knexfile src/db/knexfile.ts')

    console.log('数据库迁移完成，新数据库文件/data/lowcode.db')
    console.log('新迁移文件', newMigration)
  } catch (e) {
    console.log('重置失败', e)
    process.exit(1)
  }
}
resetDatabase()
