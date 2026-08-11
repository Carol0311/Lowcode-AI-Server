import { ComponentSchema } from './component'
// project schema
export interface ProjectSchema {
  id: string
  name: string
  pages: Record<string, PageSchema>
  homePageId: string
}
export interface PageSchema {
  id: string
  pageId: string
  name: string
  rootComponentIds: string[] //页面根节点id
  components: Record<string, ComponentSchema> //存放id-->nodes映射
  selectId?: string //当前选中组件id
  service?: string
  changeData?: Record<string, any>
  isSystem: boolean
  created_at?: Date
  updated_at?: Date
}
export interface FieldsSchema {
  id: string
  pageId: string
  datas?: Record<string, any> //存放页面字段数据
  created_at?: Date
  updated_at?: Date
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
export interface PageResponse {
  success: boolean
  message?: string
  data?: PageSchema
  type?: string
}
export interface PageDataResponse {
  success: boolean
  message?: string
  data?: FieldsSchema
  type?: string
}
//获取页面详情
export interface PageDetlRequest {
  pageId: string
  id?: string
}
//删除页面
export interface PageDeleteRequest {
  pageId?: string
  id: string
}
export interface PageDeleteResponse {
  success: boolean
  message: string
  type: string
}
//按钮点击事件
export interface ButtonClickRequest {
  id: string
  pageId: string
  service: string
  datas?: Record<string, any>
}
