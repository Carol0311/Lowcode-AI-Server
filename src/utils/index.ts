export const generateUniqueId = (type: string): string => {
  // 采用当前时间戳+随机数的方式生成唯一字符串
  return type + '_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}
//序列化，将object类型参数转化为字符串形式
export const serialize = <T extends Record<string, any>>(params: T): T => {
  if (!params) return params
  let result = {} as Record<string, any>
  for (let key in params) {
    const value = params[key]
    if (typeof value === 'object' && value !== null) {
      result[key] = JSON.stringify(value)
    } else {
      result[key] = value
    }
  }
  return result as T
}

//反序列化，将json字符串类型参数转化为object形式
export const deserialize = <T extends Record<string, any>>(params: T): T => {
  if (!params) return params
  let result = {} as Record<string, any>
  for (let key in params) {
    const value = params[key]
    if (typeof value === 'string') {
      try {
        result[key] = JSON.parse(value)
      } catch (e: any) {
        result[key] = value
      }
    } else {
      result[key] = value
    }
  }
  return result as T
}
