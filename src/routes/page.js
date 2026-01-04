/**
 * 页面路由
 */
const express = require('express')
const router = express.Router()
const pageService = require('../services/pageService')

//获取页面列表
router.get('/pages', async (req, res) => {
  console.log('获取页面列表开始......')
  try {
    const { page = 1, pageSize = 10 } = req
    const result = await pageService.getPageList(parseInt(page), parseInt(pageSize))
    res.status(200).json({ success: true, data: result })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('获取页面列表结束......')
})

//保存页面配置
router.post('/pages', async (req, res) => {
  console.log('保存或创建页面开始......')
  try {
    const pageData = req.body
    const result = await pageService.createOrUpdate(pageData)
    res.status(200).json({ success: true, data: result })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('保存或创建页面结束......')
})

//获取单个页面详情
router.get('/pages/:id', async (req, res) => {
  console.log(`获取页面${req.params.id}详情开始......`)
  try {
    const page = await pageService.getPageDetail(req.params.id)
    if (!page) {
      res.status(404).json({ success: false, message: '页面不存在' })
    }
    res.status(200).json({ success: true, data: page })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log(`获取页面${req.params.id}详情结束......`)
})

//删除页面
router.delete('/pages/:id', async (req, res) => {
  console.log(`删除页面${req.params.id}开始......`)
  try {
    await pageService.deletePage(req.params.id)
    res.status(200).json({ success: true, message: '删除成功' })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log(`删除页面${req.params.id}结束......`)
})

module.exports = router
