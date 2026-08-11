/**
 * 低代码平台页面创建，更新，保存，删除,查询服务
 */
import { PageSchema, FieldsSchema, PageDetlRequest } from '@/types/page'
import db from '../db/knex'
import { serialize, deserialize, generateUniqueId } from '../utils/index'

class PageService {
  private static instance: PageService
  static getInstance() {
    if (!PageService.instance) {
      PageService.instance = new PageService()
    }
    return PageService.instance
  }
  async createOrUpdate(pageData: PageSchema, type: string) {
    const { id, pageId, name, rootComponentIds, components, selectId, isSystem } = serialize(pageData)
    const pageEntity = await db('pages').where({ id }).first()
    if (pageEntity && pageEntity.id) {
      //update 已有页面
      await db('pages').where({ id }).update({
        pageId,
        name,
        rootComponentIds,
        components,
        selectId,
        isSystem,
        updated_at: db.fn.now(),
      })
      return pageData
    } else {
      //create新页面
      const newId = generateUniqueId('Page')
      await db('pages').insert({
        id: newId,
        pageId: pageId || newId,
        name,
        rootComponentIds,
        components,
        selectId,
        isSystem,
        created_at: db.fn.now(),
      })
      //create 新页面对应的pages_data
      await db('pages_data').insert({
        id: newId,
        pageId: pageId || newId,
        datas: '{}',
        created_at: db.fn.now(),
      })
      return { ...pageData, id: newId, pageId: pageId || newId }
    }
  }

  //更新页面信息
  async updatePageInfo(pageData: PageSchema, type: string) {
    const { id, pageId, name, rootComponentIds, components, selectId, isSystem } = serialize(pageData)
    const pageEntity = await db('pages').where({ id }).first()
    if (pageEntity && pageEntity.id) {
      //update 已有页面pages
      await db('pages').where({ id }).update({
        pageId,
        name,
        rootComponentIds,
        components,
        selectId,
        isSystem,
        updated_at: db.fn.now(),
      })
      //update pages_data
      await db('pages_data').where({ id }).update({
        pageId,
        updated_at: db.fn.now(),
      })
      const result = await db('pages').where({ id }).first()
      return deserialize(result)
    }
    return null
  }

  //获取页面列表
  async getPageList(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize
    const [list, total] = await Promise.all([
      db('pages').select('id', 'pageId', 'name', 'rootComponentIds', 'components', 'selectId', 'isSystem').orderBy('created_at', 'desc').limit(pageSize).offset(offset),
      db('pages').count('* as count').first(),
    ])
    const resultList = list.map((item: PageSchema) => {
      const result = deserialize(item)
      result.isSystem = Boolean(result.isSystem)
      return result
    })
    return {
      currentPage: resultList.length > 0 ? resultList[0]['id'] : '',
      totalPage: total?.count,
      pageList: resultList,
    }
  }

  //获取单个页面详情
  async getPageDetail(pageData: PageDetlRequest) {
    const { id, pageId } = pageData
    let pageEntity
    if (id) {
      pageEntity = await db('pages').where({ id }).first()
    } else {
      pageEntity = await db('pages').where({ pageId }).first()
    }
    if (pageEntity) {
      const result = deserialize(pageEntity)
      result.isSystem = Boolean(result.isSystem)
      return result
    }
    return null
  }

  //删除页面
  async deletePage(id: string) {
    return await db('pages').where({ id }).del()
  }

  //获取页面字段数据
  async loadPageData(fields: FieldsSchema) {
    const { id, pageId } = fields
    let dataEntity
    if (id) {
      dataEntity = await db('pages_data').where({ id }).first()
    } else {
      dataEntity = await db('pages_data').where({ pageId }).first()
    }
    if (dataEntity) {
      return deserialize(dataEntity)
    }
    return null
  }

  //更新页面字段
  async updateValue(fields: FieldsSchema) {
    const { id, pageId, datas } = fields
    const result = await db('pages_data').where({ id }).first()
    const dataEntity = deserialize(result)
    if (dataEntity && dataEntity.id && datas) {
      //update 已有页面
      await db('pages_data')
        .where({ id })
        .update({
          pageId,
          datas: serialize({ ...dataEntity.datas, ...datas }),
          updated_at: db.fn.now(),
        })
      return fields
    } else {
      //create新页面
      const pageId = generateUniqueId('Page')
      await db('pages_data').insert({
        id: pageId,
        pageId,
        datas: serialize(datas || {}),
        created_at: db.fn.now(),
      })
      return { ...fields, id: pageId, pageId }
    }
  }
}
export const pageService = PageService.getInstance()
