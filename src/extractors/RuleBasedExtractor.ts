import { KeyWords } from './keyWords'
export class RuleBasedExtractor {
  extract(text: string): { category?: string; brand?: string; product?: string } {
    const result: any = {}
    const lowerText = text.toLowerCase()

    for (let [key, entity] of Object.entries(KeyWords)) {
      for (const [type, value] of Object.entries(entity)) {
        if (value.some((keyword) => lowerText.includes(keyword.toLowerCase()))) {
          result[key] = type
        }
      }
    }

    return result
  }
  extractMore(userInput: string, askKeys: string[], skuArr: any[]) {
    let obj = {} as Record<string, any>
    if (askKeys.includes('sku') && userInput.length > 0) {
      const inputArr = userInput.trim().split('-')
      obj['sku'] = this.extractSku(inputArr, skuArr)
      console.log('sku参数是', obj['sku'])
    }
    if (userInput.match(/跳过/)) {
      if (askKeys.includes('b2bOrderUnit')) {
        obj = {
          b2bOrderUnit: null,
          b2bOrderCtrl: false,
          minOrderQuantity: null,
          incrementUnit: null,
          maxOrderQuantity: null,
        }
      } else {
        askKeys.forEach((key) => {
          obj[key] = 'skip'
        })
      }
    }
    if (userInput === '是' || userInput === 'yes' || userInput === 'ok' || userInput === 'y') {
      if (askKeys.includes('b2bOrderCtrl')) {
        obj['b2bOrderCtrl'] = true
      } else if (askKeys.includes('isLaunch')) {
        obj['isLaunch'] = true
      } else {
        askKeys.forEach((key) => {
          obj[key] = true
        })
      }
    } else if (userInput === '否' || userInput === 'no' || userInput === '不' || userInput === 'n') {
      if (askKeys.includes('b2bOrderCtrl')) {
        obj['b2bOrderCtrl'] = false
      } else if (askKeys.includes('isLaunch')) {
        obj['isLaunch'] = false
        obj['rebate'] = null
      } else {
        askKeys.forEach((key) => {
          obj[key] = false
        })
      }
    }

    if (askKeys.includes('descDetail') && userInput === '不需要') {
      askKeys.forEach((key) => {
        obj[key] = null
      })
    }
    return obj
  }
  extractSku(inputArr: any[], categoryArr: any[]) {
    const inputSet = new Set(inputArr)
    const result = {} as Record<string, any>
    result['skuSummary'] = ''
    let restKey = ''
    let restLable = ''
    for (const { key, label, regx } of categoryArr) {
      for (const item of inputSet) {
        if (regx) {
          if (item.match(regx)) {
            result[key] = item
            result['skuSummary'] += `${label}:${item}|`
            inputSet.delete(item)
          }
        } else {
          restKey = key
          restLable = label
        }
      }
    }
    const rest = [...inputSet].join('')
    result[restKey] = rest
    result['skuSummary'] += `${restLable}:${rest}`
    return result
  }
}
