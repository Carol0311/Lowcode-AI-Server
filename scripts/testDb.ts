import db from '../src/db/knex'

const generatePageId = (): string => {
  return 'Page_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

async function test() {
  try {
    const tables = await db.raw("SELECT name from sqlite_master WHERE type='table'")
    console.log(
      '现有表名',
      tables.map((t: any) => t.name)
    )

    //测试插入
    await db('pages').insert({
      id: generatePageId(),
      name: '测试页面',
      rootComponentIds: JSON.stringify([]),
      components: JSON.stringify({}),
    })

    //测试查询
    const pages = await db('pages').select('*')
    console.log('所有页面', pages)
  } catch (e) {
    console.log('数据库连接测试失败', e)
  } finally {
    db.destroy()
  }
}
test()
