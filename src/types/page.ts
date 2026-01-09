import { ComponentSchema } from './component'
// project schema
export interface ProjectSchema {
  id: string
  name: string
  pages: Record<string, PageSchema>
  homePageId: string
}
//反序列化PageSchema
export interface PageSchema {
  id: string
  name: string
  rootComponentIds: string[] //页面根节点id
  components: Record<string, ComponentSchema> //存放id-->nodes映射
  selectId?: string //当前选中组件id
  create_at?: Date
  update_at?: Date
}
//序列化PageSchema
export interface PageEntity {
  id: string
  name: string
  rootComponentIds: string
  components: string
  selectId?: string
  create_at?: Date
  update_at?: Date
}
//获取页面列表
export interface PageListRequest {
  page?: string
  pageSize?: string
}
export interface PageListResponse {
  success: boolean
  message?: string
  data?: {
    currentPage: string
    totalPage: number | string | undefined
    pageList: PageSchema[]
  }
}
//新增页面
export interface CreatePageRequest {
  id?: string
  name: string
  rootComponentIds?: string[]
  components?: Record<string, ComponentSchema>
  selectId?: string
  create_at?: Date
  update_at?: Date
}
export interface PageResponse {
  success: boolean
  message?: string
  data?: PageSchema
}
//获取页面详情
export interface PageDetlRequest {
  id: string
}
//删除页面
export interface PageDeleteRequest {
  id: string
}
export interface PageDeleteResponse {
  success: boolean
  message?: string
}
