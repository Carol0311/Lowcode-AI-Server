/**
 * 低代码平台页面创建，更新，保存，删除,查询服务
 */
import { PageSchema, PageEntity } from '@/types/page'
import db from '../db/knex'
class PageService {
  private static instance: PageService
  static getInstance() {
    if (!PageService.instance) {
      PageService.instance = new PageService()
    }
    return PageService.instance
  }
  private generatePageId = (): string => {
    // 采用当前时间戳+随机数的方式生成唯一字符串
    return 'Page_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
  }
  //序列化
  private serialize(page: PageSchema): PageEntity {
    return {
      id: page.id,
      name: page.name,
      rootComponentIds: JSON.stringify(page.rootComponentIds),
      components: JSON.stringify(page.components),
      selectId: page.selectId,
      create_at: page.create_at,
      update_at: page.update_at,
    }
  }
  //反序列化
  private deserialize(entity: PageEntity): PageSchema {
    return {
      id: entity.id,
      name: entity.name,
      rootComponentIds: JSON.parse(entity.rootComponentIds),
      components: JSON.parse(entity.components),
      selectId: entity.selectId,
      create_at: entity.create_at,
      update_at: entity.update_at,
    }
  }
  async createOrUpdate(pageData: PageSchema, type: string) {
    const { id, name, rootComponentIds, components, selectId } = this.serialize(pageData)
    const pageEntity = await db('pages').where({ id }).first()
    if (pageEntity && pageEntity.id) {
      //update 已有页面
      await db('pages').where({ id }).update({
        name,
        rootComponentIds,
        components,
        selectId,
        update_at: db.fn.now(),
      })
      return pageData
    } else {
      //create新页面
      const pageId = this.generatePageId()
      await db('pages').insert({
        id: pageId,
        name,
        rootComponentIds,
        components,
        selectId,
        create_at: db.fn.now(),
      })
      return { ...pageData, id: pageId }
    }
  }

  //获取页面列表
  async getPageList(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize
    const [list, total] = await Promise.all([db('pages').select('id', 'name', 'rootComponentIds', 'components', 'selectId').orderBy('create_at', 'desc').limit(pageSize).offset(offset), db('pages').count('* as count').first()])
    const resultList = list.map((item: PageEntity) => this.deserialize(item))
    return {
      currentPage: resultList.length > 0 ? resultList[0]['id'] : '',
      totalPage: total?.count,
      pageList: resultList,
    }
  }

  //获取单个页面详情
  async getPageDetail(id: string) {
    const pageEntity = await db('pages').where({ id }).first()
    if (pageEntity) {
      return this.deserialize(pageEntity)
    }
    return null
  }

  //删除页面
  async deletePage(id: string) {
    return await db('pages').where({ id }).del()
  }
}
export const pageService = PageService.getInstance()
