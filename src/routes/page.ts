/**
 * 页面路由
 */
import express, { Request, Response } from 'express'
import { pageService } from '../services/pageService'
import { PageListRequest, PageListResponse, PageSchema, FieldsSchema, PageResponse, PageDataResponse, PageDetlRequest, PageDeleteRequest, PageDeleteResponse } from '../types/page'

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
router.post('/createPage', async (req: Request<{}, {}, PageSchema>, res: Response<PageResponse>) => {
  console.log('创建页面开始......')
  try {
    const pageData = req.body
    const result = await pageService.createOrUpdate(pageData, 'create')
    res.status(200).json({ success: true, data: result })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('创建页面结束......')
})
//保存页面配置
router.post('/savePage', async (req: Request<{}, {}, PageSchema>, res: Response<PageResponse>) => {
  console.log('保存页面开始......')
  try {
    const pageData = req.body
    const result = await pageService.createOrUpdate(pageData, 'save')
    res.status(200).json({ success: true, data: result, message: ' 保存成功', type: 'short' })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('保存页面结束......')
})
//更新页面配置
router.post('/updatePageInfo', async (req: Request<{}, {}, PageSchema>, res: Response<PageResponse>) => {
  console.log('更新页面信息开始......')
  try {
    const pageData = req.body
    const result = await pageService.updatePageInfo(pageData, 'update')
    if (result) {
      res.status(200).json({ success: true, data: result })
    } else {
      res.status(404).json({ success: false, message: '页面不存在' })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('更新页面信息结束......')
})

//获取单个页面详情
router.post('/getPageDetail', async (req: Request<{}, {}, PageDetlRequest>, res: Response<PageResponse>) => {
  console.log(`获取页面${req.body.id}详情开始......`)
  try {
    const pageData = req.body
    const page = await pageService.getPageDetail(pageData)
    if (page) {
      res.status(200).json({ success: true, data: page })
    } else {
      res.status(404).json({ success: false, message: '页面不存在' })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log(`获取页面${req.body.id}详情结束......`)
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

//获取页面数据
router.post('/loadPageData', async (req: Request<{}, {}, FieldsSchema>, res: Response<PageDataResponse>) => {
  console.log(`获取页面${req.query.id}数据开始......`)
  try {
    const pageData = req.body
    const data = await pageService.loadPageData(pageData)
    if (data) {
      res.status(200).json({ success: true, data })
    } else {
      res.status(404).json({ success: false, message: '页面不存在' })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log(`获取页面${req.query.id}数据结束......`)
})

//更新页面字段数据
router.post('/updateValue', async (req: Request<{}, {}, FieldsSchema>, res: Response<PageDataResponse>) => {
  console.log(`更新页面${req.query.id}数据开始......`)
  try {
    const pageData = req.body
    const data = await pageService.updateValue(pageData)
    if (data) {
      res.status(200).json({ success: true, data })
    } else {
      res.status(404).json({ success: false, message: '页面不存在' })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log(`更新页面${req.query.id}数据结束......`)
})

//按钮点击事件
router.post('/buttonClick', async (req: Request<{}, {}, PageSchema>, res: Response<PageResponse>) => {
  console.log('按钮点击开始......')
  try {
    const pageData = req.body
    if (pageData.service === 'save') {
      //保存组件数据
      const result = await pageService.createOrUpdate(pageData, 'save')
      //保存字段数据
      const result2 = await pageService.updateValue({ id: pageData.id, pageId: pageData.pageId, datas: pageData.changeData })
      res.status(200).json({ success: true, data: result, message: ' 保存成功', type: 'short' })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('按钮点击结束......')
})

export default router
