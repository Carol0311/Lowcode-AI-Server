export interface AddressList {
  id: string
  parentid: string
  name: string
  children?: []
}
export interface AddressCache {
  lastModified: Date
  data: Record<string, AddressList>
}
export type AddressType = 'province' | 'city' | 'district' | 'county'
export interface AddressCacheObj {
  province?: AddressCache
  city?: AddressCache
  district?: AddressCache
  county?: AddressCache
}
/**
 * 响应数据类型 地址级联查询
 */
export interface AddressResponse {
  success: boolean
  data?: AddressList[]
  message?: string
}
/**
 * 请求数据类型 查询对应省份下的城市
 */
export interface CityRequest {
  provinceId: string
}

/**
 * 请求数据类型 查询对应城市下的区县
 */
export interface DistrictRequest {
  cityId: string
}

/**
 * 请求数据类型 查询对应区县下的街道乡镇
 */
export interface CountyRequest {
  districtId: string
}
