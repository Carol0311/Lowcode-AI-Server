/**
 * 地址级联数据查询请求
 */
import { fileURLToPath as toPath } from 'url'
import { join, dirname as getDirname } from 'path'
import { stat, readFile } from 'fs/promises'
import express, { Request, Response } from 'express'
import { AddressResponse, CityRequest, DistrictRequest, CountyRequest, AddressType, AddressCacheObj } from '../types/address'

const router = express.Router()

const addressCache = {} as AddressCacheObj
//加载地址数据
const loadData = async (filePath: string, type: AddressType) => {
  if (!addressCache[type]) {
    const dataPath = join(__dirname, filePath)
    const statInfo = await stat(dataPath)
    const rawData = await readFile(dataPath, 'utf-8')

    addressCache[type] = { lastModified: statInfo.mtime, data: JSON.parse(rawData) }
  }
  return addressCache[type]
}

//查询省份数据
router.get('/province', async (req: Request<{}, {}, {}, {}>, res: Response<AddressResponse>) => {
  console.log('查询省份数据开始......')
  try {
    const { data, lastModified } = await loadData('../../data/province.json', 'province')

    //设置缓存头
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public,max-age=31536000',
      'Last-Modified': lastModified.toUTCString(),
    })

    res.status(200).json({ success: true, data: Object.values(data) })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('查询省份数据结束......')
})

//查询城市数据
router.get('/city', async (req: Request<{}, {}, {}, CityRequest>, res: Response<AddressResponse>) => {
  console.log(`查询${req.query.provinceId}下的城市数据开始......`)
  try {
    const { data, lastModified } = await loadData('../../data/city.json', 'city')

    //设置缓存头
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public,max-age=31536000',
      'Last-Modified': lastModified.toUTCString(),
    })

    const children = addressCache.province?.data?.[req.query.provinceId].children || []
    const result = children.map((child: string) => data[child])

    res.status(200).json({ success: true, data: result })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('查询城市数据结束......')
})

//查询区｜县数据
router.get('/district', async (req: Request<{}, {}, {}, DistrictRequest>, res: Response<AddressResponse>) => {
  console.log(`查询${req.query.cityId}下的区｜县数据开始......`)
  try {
    const { data, lastModified } = await loadData('../../data/district.json', 'district')

    //设置缓存头
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public,max-age=31536000',
      'Last-Modified': lastModified.toUTCString(),
    })

    const children = addressCache.city?.data?.[req.query.cityId].children || []
    const result = children.map((child: string) => data[child])

    res.status(200).json({ success: true, data: result })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('查询区｜县数据结束......')
})

//查询街道|乡镇数据
router.get('/county', async (req: Request<{}, {}, {}, CountyRequest>, res: Response<AddressResponse>) => {
  console.log(`查询${req.query.districtId}下的街道|乡镇数据开始......`)
  try {
    const { data, lastModified } = await loadData('../../data/county.json', 'county')

    //设置缓存头
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public,max-age=31536000',
      'Last-Modified': lastModified.toUTCString(),
    })

    const children = addressCache.district?.data?.[req.query.districtId].children || []
    const result = children.map((child: string) => data[child])

    res.status(200).json({ success: true, data: result })
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message })
  }
  console.log('查询街道|乡镇数据结束......')
})

export default router
