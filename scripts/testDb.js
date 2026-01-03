const db = require('../src/db/knex')

async function test(){
    try{
        const tables = await db.raw("SELECT name from sqlite_master WHERE type='table'")
        console.log('现有表名',tables.map(t=>t.name))

        //测试插入
        const [id] = await db('pages').insert({
            name:'测试页面',
            description:'描述',
            schema:JSON.stringify({fields:[]})
        })
        console.log('插入id',id)

        //测试查询
        const pages = await db('pages').select('*')
        console.log('所有页面',pages)
    }catch(e){
        console.log('数据库连接测试失败',e)
    }finally{
        db.destroy()
    }
}
test()