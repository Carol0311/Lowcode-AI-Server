export interface CreateTableRequest {
  instanceId?: string
  tableId: string
  pageId: string
  columns: any[]
}
export interface UpdateTableRequest {
  instanceId: string
  tableId: string
  pageId: string
  columns: any[]
}
export interface TableResponse {
  success: boolean
  message?: string
  data?: Record<string, any>
}
export interface UpsertRowsRequest {
  rowData: Record<string, any>
  position?: number
}
export interface DeleteRowRequest {
  instanceId: string
  rowCode: string
  rowId: number
  sortOrder: number
}
export interface LoadTableRequest {
  instanceId: string
  start?: number
  limit?: number
}
export interface TargetGroupRequest {
  instanceId: string
  limit: number
  groupIndex: number
  groupBy: Record<string, any>
  targetGroup?: Record<string, any> //指定目标组,无指定，默认用第一条信息做第一个分组
}
