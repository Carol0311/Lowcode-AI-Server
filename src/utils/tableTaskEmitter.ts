import { EventEmitter } from 'events'
import db from '../db/knex'
import { system_default_large_data, SYSTEM_DEFAULT_TABLE_ROWS } from '../db/defaultData'

const taskEmitter = new EventEmitter()

// 任务队列
const taskQueue: Array<{
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  error?: string
  resolve: any
  reject: any
}> = []

// 创建插入任务
export async function createInsertTask() {
  return new Promise((resolve, reject) => {
    const taskId = `task_${Date.now()}`

    taskQueue.push({
      taskId,
      status: 'pending',
      progress: 0,
      resolve,
      reject,
    })

    // 触发后台处理
    taskEmitter.emit('process-task', taskId)
  })

  //return taskId
}

// 后台处理器
taskEmitter.on('process-task', async (taskId: string) => {
  const task = taskQueue.find((t) => t.taskId === taskId)
  if (!task) return

  const system_rows = await system_default_large_data

  const totalCount = system_rows.length

  task.status = 'processing'

  try {
    const BATCH_SIZE = 300 //不要超过500，500以上对sqlite太多了
    const totalBatches = Math.ceil(totalCount / BATCH_SIZE)

    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE
      const end = Math.min(start + BATCH_SIZE, totalCount)

      const batchData = system_rows.slice(start, end)

      await db.transaction(async (trx) => {
        await trx(SYSTEM_DEFAULT_TABLE_ROWS).insert(batchData)
      })

      task.progress = ((i + 1) / totalBatches) * 100
      console.log(`系统表格数据插入任务 ${taskId}: ${task.progress.toFixed(1)}%`)

      // 释放内存
      batchData.length = 0
    }

    task.status = 'completed'
    task.progress = 100
    console.log(`系统表格数据插入任务 ${taskId} 完成！`)

    if (task.resolve) {
      task.resolve()
    }
  } catch (error: any) {
    task.status = 'failed'
    task.error = error.message
    console.error(`系统表格数据插入任务 ${taskId} 失败:`, error)
    if (task.reject) {
      task.reject(new Error(error.message))
    }
  }
})

// 获取任务状态
function getTaskStatus(taskId: string) {
  return taskQueue.find((t) => t.taskId === taskId)
}
