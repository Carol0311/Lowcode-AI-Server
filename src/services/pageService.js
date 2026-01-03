/**
 * 低代码平台页面创建，更新，保存，删除,查询服务
*/
const db = require('../db/knex')
class PageService{
    async createOrUpdate(pageData){
        const {id,name,description,schema} = pageData
        if(id){
            //update 已有页面
            await db('pages').where({id}).update({
                name,
                description,
                schema,
                update_at:db.fn.now()
            })
            return {id,...pageData}
        }else{
            //create新页面
            const [newId] = await db('pages').insert({
                name,
                description,
                schema:JSON.stringify(schema)
            })
            return {id:newId,name,description,schema}
        }
    }

    //获取页面列表
    async getPageList(page=1,pageSize=10){
        const offset = (page -1) * pageSize
        const [list,total] = await Promise.all([
            db('pages')
            .select('id','name','description','created_at')
            .orderBy('created_at','desc')
            .limit(pageSize)
            .offset(offset),
            db('pages').count('* as count').first()
        ])
        return {
            list,
            pagination:{
                page,
                pageSize,
                total:total.count
            }
        }
    }

    //获取单个页面详情
    async getPageDetail(id){
        const page = await db('pages').where({id}).first()
        if(page){
            page.schema = JSON.parse(page.schema)
        }
        return page
    }

    //删除页面
    async deletePage(id){
        return await db('pages').where({id}).del()
    }
}
module.exports = new PageService()