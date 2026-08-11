import { unlink } from 'fs/promises'
import { join } from 'path'
import knex from 'knex'
import { moduleMapping } from './resetMigrate'

//重置所有模块迁移
async function resetAllModule(force?: boolean) {
  //删除数据库文件，断开数据库连接
  const dbPath = join(__dirname, '../data/lowcode.db')
  try {
    await unlink(dbPath)
    console.log('已删除数据库文件')
  } catch (e) {
    console.log('数据库文件不存在，跳过删除', e)
  }

  //按照迁移文件的顺序排序迁移操作，避免依赖异常
  const mList = Object.entries(moduleMapping).sort(([_, v], [__, vv]) => {
    return v.index - vv.index
  })

  for (let [name, _] of mList) {
    await resetModule(name, force)
  }
}
//重置目标模块迁移
async function resetModule(moduleName: string, force?: boolean) {
  const { _, ...config } = moduleMapping[moduleName]
  const db = knex(config)

  try {
    const tableName = config.migrations.tableName
    // 检查迁移记录表是否存在
    const hasTable = await db.schema.hasTable(tableName)

    if (!hasTable) {
      console.log(`迁移记录表 ${tableName} 不存在，首次初始化 ${moduleName} 模块...`)
      await db.migrate.latest({
        directory: config.migrations.directory,
        tableName: tableName,
      })
      console.log(`${moduleName}模块首次初始化完成`)
    }

    // 获取已执行的迁移列表
    const executedMigrations = await db(tableName).select('batch').groupBy('batch').orderBy('batch', 'desc')

    if (executedMigrations.length === 0) {
      console.log(`${moduleName} 模块没有已执行的迁移，跳过回滚`)
    } else {
      console.log(`开始重置${moduleName}模块 ${force ? '强制模式' : ''}`)

      //循环回滚所有批次
      console.log(`回滚${moduleName}模块迁移...`)
      let hasRollback = true
      while (hasRollback) {
        try {
          //batch是当前模块下的迁移批次，mlist是该批次关联的迁移列表
          const [batch, mlist] = await db.migrate.rollback()
          if (batch && mlist && mlist.length > 0) {
            console.log(`${moduleName} 模块当前回滚的迁移列表是${JSON.stringify(mlist)}`)
          } else {
            hasRollback = false
          }
        } catch (error: any) {
          hasRollback = false
          console.log(`回滚${moduleName}模块失败`, error.message)
        }
      }

      //重新运行迁移
      console.log(`重新运行${moduleName}模块迁移...`)
      await db.migrate.latest()
      console.log(`${moduleName}模块迁移完成`)
    }
  } catch (error: any) {
    console.error(`分区 ${moduleName} 重置失败:`, error.message)
    throw error
  } finally {
    await db.destroy()
  }
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const result: { module?: string; force?: boolean; help?: boolean } = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--help' || arg === '-h') {
      result.help = true
    } else if (arg === '--force' || arg === '-f') {
      result.force = true
    } else if (arg === '--module' || arg === '-m') {
      result.module = args[++i]
    } else if (!arg.startsWith('--')) {
      result.module = arg
    }
  }
  return result
}

async function main() {
  const options = parseArgs()

  if (options.help) {
    console.log(`
        使用方法:
        npm run db:reset -- [module] [options]
        
        参数:
        module              要重置的分区名称 (如: module-a, module-b)
        --module, -m        指定分区名称
        --force, -f         强制模式（跳过确认）
        --help, -h          显示帮助信息
        
        示例:
        npm run db:reset -- module-a
        npm run db:reset -- --module=module-b --force
        npm run db:reset -- -m module-c -f
    `)
    process.exit(0)
  }

  const moduleName = options.module || 'all'
  if (options.module === 'all' || !options.module) {
    await resetAllModule(options.force)
  } else {
    await resetModule(moduleName, options.force)
  }
}

main().catch(console.error)
