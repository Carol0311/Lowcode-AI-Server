import db from '../db/knex'
import { system_default_columns, SYSTEM_DEFAULT_TABLE_INSTANCE, SYSTEM_TABLE_INSTANCE_LIST, SYSTEM_DEFAULT_TABLE_ROWS } from '../db/defaultData'
import { createInsertTask } from '../utils/tableTaskEmitter'
import { serialize, deserialize } from '../utils/index'
class TableService {
  private static instance: TableService
  static getInstance() {
    if (!TableService.instance) {
      TableService.instance = new TableService()
    }
    return TableService.instance
  }
  //创建或更新表格实例
  async createOrUpdateTableInstance(instanceData: any) {
    const { instanceId, tableId, pageId, name, instanceKey } = instanceData
    const additional = ['description', 'virtualScroll', 'pagination', 'filter', 'search', 'isGroup', 'groupBy', 'sort', 'isActive', 'isSystem', 'source', 'session_id']

    let insertData = {
      tableId,
      pageId,
      name,
    } as Record<string, any>

    if (instanceId) {
      insertData['instanceId'] = instanceId
      insertData['updated_at'] = db.fn.now()
    } else {
      insertData['instanceId'] = `${instanceKey}_instance`
      insertData['created_at'] = db.fn.now()
    }

    additional.forEach((key) => {
      if (instanceData.hasOwnProperty(key)) {
        insertData[key] = instanceData[key]
      }
    })

    //插入更新配置数据
    const test = await db('table_instance').insert(insertData).onConflict(['tableId']).merge()

    //获取配置数据
    const result = await db('table_instance').where({ tableId }).select('*').first()

    const final_config = deserialize(result)

    const table_name = SYSTEM_TABLE_INSTANCE_LIST.includes(result.instanceId) ? SYSTEM_DEFAULT_TABLE_ROWS : 'table_rows'
    const actual_instance_id = SYSTEM_TABLE_INSTANCE_LIST.includes(result.instanceId) ? SYSTEM_DEFAULT_TABLE_INSTANCE : result.instanceId
    //取出总条数
    const total = await db(table_name).where({ instanceId: actual_instance_id }).count('* as count').first()

    return { ...final_config, totalCounts: Number(total?.count) || 0 }
  }
  async setDefaultTableData(instanceId: string) {
    const is_Columns_Exist = await db('table_columns').where({ instanceId }).count('* as count').first()
    if (is_Columns_Exist && Number(is_Columns_Exist.count as string) === 0) {
      //table_columns存在并且默认数据为空，则插入系统预置数据
      const columns = system_default_columns.map((column) => {
        column.instanceId = instanceId
        return column
      })
      await db('table_columns').insert(columns)
    }

    const is_Rows_Exist = await db(SYSTEM_DEFAULT_TABLE_ROWS).where({ instanceId: SYSTEM_DEFAULT_TABLE_INSTANCE }).count('* as count').first()
    if (is_Rows_Exist && Number(is_Rows_Exist.count as string) === 0) {
      //system_table_rows表格存在并且默认数据为空，则插入系统预置数据
      createInsertTask()
    }

    const result = await db('table_columns').where({ instanceId }).select('*')
    const final_columns = result.map((column) => deserialize(column))
    return final_columns
  }
  //创建或更新关联表格实例的列配置表
  async initTableColumns(instanceId: string, columns: any) {
    const finalColumns = columns.map((item: Record<string, any>) => {
      let result = { instanceId: instanceId } as Record<string, any>
      item.key ? (result['updated_at'] = db.fn.now()) : (result['created_at'] = db.fn.now())
      return { ...result, ...item }
    })

    await db('table_columns').insert(finalColumns).onConflict(['instanceId', 'key']).merge(['name', 'type', 'props'])

    const result = await db('table_columns').where({ instanceId }).select('*')

    const final_columns = result.map((column) => deserialize(column))
    return final_columns
  }

  //更新插入表格行数据
  async upsertRow(rowData: Record<string, any>, position?: number) {
    const { rowId, instanceId, rowCode, rowName, ...data } = rowData
    if (!instanceId) {
      throw new Error('instanceId is required')
    }
    if (!rowCode) {
      throw new Error('rowCode is required')
    }

    const table_name = SYSTEM_TABLE_INSTANCE_LIST.includes(instanceId) ? SYSTEM_DEFAULT_TABLE_ROWS : 'table_rows'
    const actual_instance_id = SYSTEM_TABLE_INSTANCE_LIST.includes(instanceId) ? SYSTEM_DEFAULT_TABLE_INSTANCE : instanceId

    const lastRow = await db(table_name).where({ instanceId: actual_instance_id }).count('* as count').first()
    const maxOrder = Number(lastRow?.count) || 0
    //默认是末尾插入
    let sortOrder = maxOrder + 1

    if (position || position === 0) {
      //目标位置插入
      sortOrder = position
      //目标位置之后的行后移一位
      await db(table_name).where({ instanceId: actual_instance_id }).whereRaw('sortOrder>=?', position).increment('sortOrder', 1)
    }

    let insertData = {
      instanceId: actual_instance_id,
      rowCode: `${rowCode}_${sortOrder}`,
      rowName: `${rowName}_${sortOrder}` || `${rowCode}_${sortOrder}`,
      data,
      sortOrder,
    } as Record<string, any>

    if (rowId || rowId === 0) {
      insertData['updated_at'] = db.fn.now()
    } else {
      insertData['created_at'] = db.fn.now()
    }

    const additional = ['session_id', 'isAIGenerated']
    additional.forEach((key) => {
      if (rowData.hasOwnProperty(key)) {
        insertData[key] = rowData[key]
      }
    })

    await db(table_name).insert(insertData).onConflict(['instanceId', 'rowCode']).merge()

    return {
      action: 'afterAddRow',
      start: sortOrder,
    }
  }

  //删除行数据
  async deleteRow(instanceId: string, rowCode: string) {
    //找到目标删除行
    const table_name = SYSTEM_TABLE_INSTANCE_LIST.includes(instanceId) ? SYSTEM_DEFAULT_TABLE_ROWS : 'table_rows'
    const actual_instance_id = SYSTEM_TABLE_INSTANCE_LIST.includes(instanceId) ? SYSTEM_DEFAULT_TABLE_INSTANCE : instanceId

    const deleteRow = await db(table_name).where({ instanceId, rowCode }).first()
    if (!deleteRow) {
      throw new Error(`Row with rowcode ${rowCode} not found`)
    }
    const delete_sortOrder = deleteRow.sortOrder
    //删除目标行
    await db(table_name).where({ instanceId: actual_instance_id, rowCode }).del()
    //目标行后面的数据前移一位
    await db(table_name).where({ instanceId: actual_instance_id }).whereRaw('sortOrder>', delete_sortOrder).decrement('sortOrder', 1)

    return {
      action: 'afterDeleteRow',
      start: delete_sortOrder - 1,
    }
  }

  //查询表格配置数据
  async getTableConfig(instanceId: string, tableId: string, pageId: string) {
    const [config, columns] = await Promise.all([db('table_instance').where({ instanceId, pageId, tableId }).select('*').first(), db('table_columns').where({ instanceId }).select('*')])

    const final_config = deserialize(config)
    const final_columns = columns.map((column) => deserialize(column))

    return {
      tableConfig: final_config,
      columns: final_columns,
    }
  }

  //获取表格行数据
  async getTableData(instanceId: string, start: number = 0, limit: number = 3000) {
    const table_name = SYSTEM_TABLE_INSTANCE_LIST.includes(instanceId) ? SYSTEM_DEFAULT_TABLE_ROWS : 'table_rows'
    const actual_instance_id = SYSTEM_TABLE_INSTANCE_LIST.includes(instanceId) ? SYSTEM_DEFAULT_TABLE_INSTANCE : instanceId
    const result = await db(table_name)
      .where({ instanceId: actual_instance_id })
      .whereRaw('sortOrder>=?', start)
      .select('data', 'rowCode', 'rowName', 'sortOrder')
      .orderBy('sortOrder', 'asc')
      .limit(limit)
    //result再处理
    let total
    const final_result = result.map((item) => {
      const ditem = deserialize(item)
      //此处的rowId为前端处理使用
      return { ...ditem.data, rowCode: ditem.rowCode, rowName: ditem.rowName, sortOrder: ditem.sortOrder, rowId: ditem.sortOrder }
    })
    if (start === 0) {
      //首次请求数据时返回数据的总行数
      total = await db(table_name).where({ instanceId: actual_instance_id }).count('* as count').first()
    }
    return { rows: final_result, total: Number(total?.count) || 0 }
  }
  //获取目标分组的行数据
  async getTargetGroupData(instanceId: string, limit: number = 0, groupIndex: number = 0, groupBy: Record<string, any>) {
    if (!groupBy || (groupBy && Object.keys(groupBy).length === 0)) return { rows: [], total: 0 }

    const table_name = SYSTEM_TABLE_INSTANCE_LIST.includes(instanceId) ? SYSTEM_DEFAULT_TABLE_ROWS : 'table_rows'
    const actual_instance_id = SYSTEM_TABLE_INSTANCE_LIST.includes(instanceId) ? SYSTEM_DEFAULT_TABLE_INSTANCE : instanceId

    const firstRow = await db(table_name).where('instanceId', actual_instance_id).orderBy('sortOrder').first()

    if (!firstRow) {
      return { rows: [], total: 0 }
    }

    const row = deserialize(firstRow)
    const groupValues = {} as Record<string, any>
    //目标分组的表头信息值
    groupBy.fields.forEach((field: any) => {
      groupValues[field.key] = row.data?.[field.key] ?? null
    })

    let query = db(table_name).where('instanceId', actual_instance_id)
    for (const field of groupBy.fields) {
      query = query.whereRaw(`data->>'${field.key}' = ?`, [groupValues[field.key]])
    }

    /**
     * limit=0取出目标分组所有行数据
     * limit>0取出目标分组limit条数的行数据
     */
    const [result, counts] = await Promise.all([limit > 0 ? query.clone().orderBy('sortOrder').limit(limit) : query.clone().orderBy('sortOrder'), query.clone().count('* as count').first()])

    //result再处理
    const final_result = result.map((item) => {
      const ditem = deserialize(item)
      //此处的rowId为前端使用
      return { ...ditem.data, rowCode: ditem.rowCode, rowName: ditem.rowName, sortOrder: ditem.sortOrder, rowId: ditem.sortOrder }
    })

    return { rows: final_result, total: Number(counts?.count) || 0 }
  }
}
export const tableService = TableService.getInstance()
