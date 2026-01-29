import { unlink, readdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import util from 'util'
import { migrateList, migrateTemplate } from './migrateMap'

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
    const migrationsDir = join(__dirname, '../src/db/migrations')
    const files = await readdir(migrationsDir)
    for (const file of files) {
      await unlink(join(migrationsDir, file))
      console.log(`已删除迁移文件${file}`)
    }

    //按顺序生成新的迁移文件
    const timestamp = 20260117193940
    migrateList
      .sort((a, b) => a.priority - b.priority)
      .forEach(async (migrate) => {
        const name = migrate.name
        try {
          const fileName = `${timestamp + migrate.priority}_create_${name}.ts`
          const filePath = join(migrationsDir, fileName)
          const fileContent = migrateTemplate[name]
          await writeFile(filePath, fileContent.trim())
          console.log('新迁移文件', fileName)
        } catch (e: any) {
          console.log(`创建迁移文件${name}失败`, e.message)
        }
      })

    //运行迁移
    await execPromise('npx knex migrate:latest --knexfile src/db/knexfile.ts')

    console.log('数据库迁移完成，新数据库文件/data/lowcode.db')
  } catch (e) {
    console.log('重置失败', e)
    process.exit(1)
  }
}
resetDatabase()
