import express, { Request, Response } from 'express'
import { CreateTableRequest, UpdateTableRequest, LoadTableRequest, TableResponse, UpsertRowsRequest, DeleteRowRequest, TargetGroupRequest } from '../types/table'
import { tableService } from '../services/tableService'
import { SYSTEM_TABLE_INSTANCE_LIST } from '../db/defaultData'

const router = express.Router()

router.post('/initTable', async (req: Request<{}, {}, CreateTableRequest>, res: Response<TableResponse>) => {
  console.log('创建列表实例开始...')
  try {
    let instance_result
    const instanceData = req.body
    //创建表格实例
    instance_result = await tableService.createOrUpdateTableInstance(instanceData)
    if (instanceData.columns) {
      //初始化表格实例对应的列字段配置
      await tableService.initTableColumns(instance_result.instanceId, instanceData.columns)
    }
    const result = await tableService.getTableConfig(instance_result.instanceId, instance_result.tableId, instance_result.pageId)
    res.status(200).json({ success: true, data: result })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('创建列表实例结束...')
})

router.post('/upsertRow', async (req: Request<{}, {}, UpsertRowsRequest>, res: Response<TableResponse>) => {
  console.log('添加表格行数据开始...')
  try {
    const { rowData, position } = req.body
    const result = await tableService.upsertRow(rowData, position)
    if (result) {
      res.status(200).json({ success: true, data: result })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('添加表格行数据结束...')
})

router.post('deleteRow', async (req: Request<{}, {}, DeleteRowRequest>, res: Response<TableResponse>) => {
  console.log('删除表格行数据开始...')
  try {
    const { instanceId, rowCode } = req.body
    const result = await tableService.deleteRow(instanceId, rowCode)
    if (result) {
      res.status(200).json({ success: true, data: result })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('删除表格行数据结束...')
})

router.post('/updateTableConfig', async (req: Request<{}, {}, UpdateTableRequest>, res: Response<TableResponse>) => {
  console.log('更新表格配置开始...')
  try {
    const instanceData = req.body
    //更新表格实例
    if (instanceData.tableConfig) {
      const { tableConfig, ...others } = instanceData
      await tableService.createOrUpdateTableInstance({ ...others, ...tableConfig })
    }
    if (instanceData.columns) {
      //更新列配置
      await tableService.initTableColumns(instanceData.instanceId, instanceData.columns)
    }
    const result = await tableService.getTableConfig(instanceData.instanceId, instanceData.tableId, instanceData.pageId)
    res.status(200).json({ success: true, data: result })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('更新表格配置结束...')
})

router.post('/loadTableConfig', async (req: Request<{}, {}, UpdateTableRequest>, res: Response<TableResponse>) => {
  console.log('加载列表配置开始...')
  try {
    const { instanceId, tableId, pageId } = req.body
    const result = await tableService.getTableConfig(instanceId, tableId, pageId)
    if (result) {
      res.status(200).json({ success: true, data: result })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('加载列表配置结束...')
})

router.post('/loadTableData', async (req: Request<{}, {}, LoadTableRequest>, res: Response<TableResponse>) => {
  console.log('加载列表数据开始...')
  try {
    const { instanceId, start, limit } = req.body
    const result = await tableService.getTableData(instanceId, start, limit)
    if (result) {
      res.status(200).json({ success: true, data: result })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('加载列表数据结束...')
})
router.post('/loadTargetGroup', async (req: Request<{}, {}, TargetGroupRequest>, res: Response<TableResponse>) => {
  //指定目标组,无指定，默认用第一条信息做第一个分组
  console.log('加载目标分组数据开始...')
  try {
    const { instanceId, limit = 100, groupIndex = 0, groupBy } = req.body
    const result = await tableService.getTargetGroupData(instanceId, limit, groupIndex, groupBy)
    if (result) {
      res.status(200).json({ success: true, data: result })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('加载目标分组的数据结束...')
})
export default router
