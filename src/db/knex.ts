import knex from 'knex'
import knex_file from './knexfile'
const config = knex_file.development
//创建数据库连接实例
const db = knex(config)
//测试连接
db.raw('SELECT 1')
  .then(() => console.log('数据库连接成功'))
  .catch((error: any) => console.log('数据库连接失败', error))

export default db //新增页面
