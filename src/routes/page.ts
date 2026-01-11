/**
 * 页面路由
 */
import express, { Request, Response } from 'express'
import { pageService } from '../services/pageService'
import { PageListRequest, PageListResponse, PageSchema, PageResponse, CreatePageRequest, PageDetlRequest, PageDeleteRequest, PageDeleteResponse } from '../types/page'

const router = express.Router()

//获取页面列表
router.get('/getPageList', async (req: Request<{}, {}, {}, PageListRequest>, res: Response<PageListResponse>) => {
  console.log('获取页面列表开始......')
  try {
    const { page = '1', pageSize = '10' } = req.query
    const result = await pageService.getPageList(parseInt(page), parseInt(pageSize))
    res.status(200).json({ success: true, data: result })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('获取页面列表结束......')
})

//创建页面配置
router.post('/createPage', async (req: Request<{}, {}, {}, CreatePageRequest>, res: Response<PageResponse>) => {
  console.log('创建页面开始......')
  try {
    const pageData = req.body as PageSchema
    const result = await pageService.createOrUpdate(pageData, 'create')
    res.status(200).json({ success: true, data: result })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('创建页面结束......')
})
//保存页面配置
router.post('/savePage', async (req: Request<{}, {}, {}, PageSchema>, res: Response<PageResponse>) => {
  console.log('保存页面开始......')
  try {
    const pageData = req.body as PageSchema
    const result = await pageService.createOrUpdate(pageData, 'save')
    res.status(200).json({ success: true, data: result })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('保存页面结束......')
})
//更新页面配置
router.post('/updatePage', async (req: Request<{}, {}, {}, PageSchema>, res: Response<PageResponse>) => {
  console.log('更新页面开始......')
  try {
    const pageData = req.body as PageSchema
    const result = await pageService.createOrUpdate(pageData, 'update')
    res.status(200).json({ success: true, data: result })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('更新页面结束......')
})

//获取单个页面详情
router.get('/getPageDetail', async (req: Request<{}, {}, {}, PageDetlRequest>, res: Response<PageResponse>) => {
  console.log(`获取页面${req.query.id}详情开始......`)
  try {
    const page = await pageService.getPageDetail(req.query.id)
    if (page) {
      res.status(200).json({ success: true, data: page })
    } else {
      res.status(404).json({ success: false, message: '页面不存在' })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log(`获取页面${req.query.id}详情结束......`)
})

//删除页面
router.delete('/deletePage', async (req: Request<{}, {}, {}, PageDeleteRequest>, res: Response<PageDeleteResponse>) => {
  console.log(`删除页面${req.query.id}开始......`)
  try {
    await pageService.deletePage(req.query.id)
    res.status(200).json({ success: true, message: '删除成功', type: 'short' })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message, type: 'short' })
  }
  console.log(`删除页面${req.query.id}结束......`)
})

export default router
