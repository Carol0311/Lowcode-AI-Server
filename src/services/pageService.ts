/**
 * 低代码平台页面创建，更新，保存，删除,查询服务
 */
import { PageSchema, PageEntity, FieldsSchema, FieldsEntity } from '@/types/page'
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
      pageId: page.pageId,
      name: page.name,
      rootComponentIds: JSON.stringify(page.rootComponentIds),
      components: JSON.stringify(page.components),
      selectId: page.selectId,
      created_at: page.created_at,
      updated_at: page.updated_at,
    }
  }
  //反序列化
  private deserialize(entity: PageEntity): PageSchema {
    return {
      id: entity.id,
      pageId: entity.pageId,
      name: entity.name,
      rootComponentIds: JSON.parse(entity.rootComponentIds),
      components: JSON.parse(entity.components),
      selectId: entity.selectId,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    }
  }
  //序列化
  private serializeFields(fields: FieldsSchema): FieldsEntity {
    return {
      id: fields.id,
      pageId: fields.pageId,
      datas: fields.datas ? JSON.stringify(fields.datas) : '{}',
      created_at: fields.created_at,
      updated_at: fields.updated_at,
    }
  }
  //反序列化
  private deserializeFields(entity: FieldsEntity): FieldsSchema {
    return {
      id: entity.id,
      pageId: entity.pageId,
      datas: entity.datas ? JSON.parse(entity.datas) : {},
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    }
  }
  async createOrUpdate(pageData: PageSchema, type: string) {
    const { id, pageId, name, rootComponentIds, components, selectId } = this.serialize(pageData)
    const pageEntity = await db('pages').where({ id }).first()
    if (pageEntity && pageEntity.id) {
      //update 已有页面
      await db('pages').where({ id }).update({
        pageId,
        name,
        rootComponentIds,
        components,
        selectId,
        updated_at: db.fn.now(),
      })
      return pageData
    } else {
      //create新页面
      const newId = this.generatePageId()
      await db('pages').insert({
        id: newId,
        pageId: pageId || newId,
        name,
        rootComponentIds,
        components,
        selectId,
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
    const { id, pageId, name, rootComponentIds, components, selectId } = this.serialize(pageData)
    const pageEntity = await db('pages').where({ id }).first()
    if (pageEntity && pageEntity.id) {
      //update 已有页面pages
      await db('pages').where({ id }).update({
        pageId,
        name,
        rootComponentIds,
        components,
        selectId,
        updated_at: db.fn.now(),
      })
      //update pages_data
      await db('pages_data').where({ id }).update({
        pageId,
        updated_at: db.fn.now(),
      })
      const result = await db('pages').where({ id }).first()
      return this.deserialize(result)
    }
    return null
  }

  //获取页面列表
  async getPageList(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize
    const [list, total] = await Promise.all([
      db('pages').select('id', 'pageId', 'name', 'rootComponentIds', 'components', 'selectId').orderBy('created_at', 'desc').limit(pageSize).offset(offset),
      db('pages').count('* as count').first(),
    ])
    const resultList = list.map((item: PageEntity) => this.deserialize(item))
    return {
      currentPage: resultList.length > 0 ? resultList[0]['id'] : '',
      totalPage: total?.count,
      pageList: resultList,
    }
  }

  //获取单个页面详情
  async getPageDetail(pageData: PageSchema) {
    const { id, pageId } = pageData
    let pageEntity
    if (id) {
      pageEntity = await db('pages').where({ id }).first()
    } else {
      pageEntity = await db('pages').where({ pageId }).first()
    }
    if (pageEntity) {
      return this.deserialize(pageEntity)
    }
    return null
  }

  //删除页面
  async deletePage(id: string) {
    return await db('pages').where({ id }).del()
  }

  //获取页面字段数据
  async loadPageData(fields: FieldsSchema) {
    const { id, pageId } = this.serializeFields(fields)
    let dataEntity
    if (id) {
      dataEntity = await db('pages_data').where({ id }).first()
    } else {
      dataEntity = await db('pages_data').where({ pageId }).first()
    }
    if (dataEntity) {
      return this.deserializeFields(dataEntity)
    }
    return null
  }

  //更新页面字段
  async updateValue(fields: FieldsSchema) {
    const { id, pageId, datas } = this.serializeFields(fields)
    const dataEntity = await db('pages_data').where({ id }).first()
    if (dataEntity && dataEntity.id && datas) {
      //update 已有页面
      await db('pages_data')
        .where({ id })
        .update({
          pageId,
          datas: JSON.stringify({ ...JSON.parse(dataEntity.datas), ...JSON.parse(datas) }),
          updated_at: db.fn.now(),
        })
      return fields
    } else {
      //create新页面
      const pageId = this.generatePageId()
      await db('pages_data').insert({
        id: pageId,
        pageId,
        datas,
        created_at: db.fn.now(),
      })
      return { ...fields, id: pageId, pageId }
    }
  }
}
export const pageService = PageService.getInstance()
