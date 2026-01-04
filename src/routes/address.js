/**
 * 地址级联数据查询请求
 */
const path = require('path')
const fs = require('fs').promises
const express = require('express')
const router = express.Router()

const addressCache = {}
//加载地址数据
const loadData = async (filePath, type) => {
  console.log(123)
  if (!addressCache[type]) {
    const dataPath = path.join(__dirname, filePath)
    const stat = await fs.stat(dataPath)
    const rawData = await fs.readFile(dataPath, 'utf-8')

    addressCache[type] = { lastModified: stat.mtime, data: JSON.parse(rawData) }
  }
  return addressCache[type]
}

//查询省份数据
router.get('/province', async (req, res) => {
  console.log('查询省份数据开始......')
  try {
    const { data, lastModified } = await loadData('../../data/province.json', 'province')

    //设置缓存头
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public,max-age=31536000',
      'Last-Modified': lastModified.toUTCString(),
    })

    res.status(200).json({ success: true, data })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('查询省份数据结束......')
})

//查询城市数据
router.get('/city/:provinceId', async (req, res) => {
  console.log(`查询${req.params.provinceId}下的城市数据开始......`)
  try {
    const { data, lastModified } = await loadData('../../data/city.json', 'city')

    //设置缓存头
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public,max-age=31536000',
      'Last-Modified': lastModified.toUTCString(),
    })

    const children = addressCache['province']['data'][req.params.provinceId].children
    const result = children.map((child) => data[child.id])

    res.status(200).json({ success: true, data: result })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('查询城市数据结束......')
})

//查询区｜县数据
router.get('/district/:cityId', async (req, res) => {
  console.log(`查询${req.params.cityId}下的区｜县数据开始......`)
  try {
    const { data, lastModified } = await loadData('../../data/district.json', 'district')

    //设置缓存头
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public,max-age=31536000',
      'Last-Modified': lastModified.toUTCString(),
    })

    const children = addressCache['city']['data'][req.params.cityId].children
    const result = children.map((child) => data[child.id])

    res.status(200).json({ success: true, data: result })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('查询区｜县数据结束......')
})

//查询街道|乡镇数据
router.get('/county/:districtId', async (req, res) => {
  console.log(`查询${req.params.districtId}下的街道|乡镇数据开始......`)
  try {
    const { data, lastModified } = await loadData('../../data/county.json', 'county')

    //设置缓存头
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public,max-age=31536000',
      'Last-Modified': lastModified.toUTCString(),
    })

    const children = addressCache['district']['data'][req.params.districtId].children
    const result = children.map((child) => data[child.id])

    res.status(200).json({ success: true, data: result })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('查询街道|乡镇数据结束......')
})

module.exports = router
