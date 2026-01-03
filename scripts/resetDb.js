const fs = require('fs').promises
const path = require('path')
const {exec} = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)

async function resetDatabase(){
    console.log('开始重置数据库')

    try{
        //删除数据库文件，断开数据库连接
        const dbPath = path.join(__dirname,'../data/lowcode.db')
        try{
            await fs.unlink(dbPath)
            console.log('已删除数据库文件')
        }catch(e){
            console.log('数据库文件不存在，跳过删除',e)
        }

        //删除所有迁移文件
        const migrations = path.join(__dirname,'../src/db/migrations')
        const files = await fs.readdir(migrations)
        for(const file of files){
            await fs.unlink(path.join(migrations,file))
            console.log(`已删除迁移文件${file}`)
        }

        //生成新的迁移文件
        await execPromise('npx knex migrate:make create_pages --knexfile knexfile.js')

        const migrationsFiles = await fs.readdir(migrations)
        const newMigration = migrationsFiles.find(f=>f.includes('create_pages'))

        if(newMigration){
            const migrationPath = path.join(migrations,newMigration)
            const migrationContent = `exports.up = function(knex) {
    return knex.schema.createTable('pages', function(table) {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.string('description')
        table.json('schema').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now())
        table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('pages')
}`
          await fs.writeFile(migrationPath,migrationContent.trim())
        }

        //运行迁移
        await execPromise('npx knex migrate:latest --knexfile knexfile.js')

        console.log('数据库迁移完成，新数据库文件/data/lowcode.db')
        console.log('新迁移文件',newMigration)

    }catch(e){
        console.log('重置失败',e)
        process.exit(1)
    }
}
resetDatabase()