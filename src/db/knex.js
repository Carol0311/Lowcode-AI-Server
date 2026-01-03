const knex = require('knex')
const config = require('../../knexfile').development

//创建数据库连接实例
const db = knex(config)

//测试连接
db.raw('SELECT 1').then(()=>console.log('数据库连接成功')).catch(error=>console.log('数据库连接失败',error))

module.exports = db