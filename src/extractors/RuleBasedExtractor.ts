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
    //sku参数规则提取
    if (askKeys.includes('sku') && userInput.length > 0) {
      if (['跳过', '不需要'].includes(userInput)) {
        obj['sku'] = 'skip'
        return obj
      }
      if (['不知道', '无', '否', '不', 'ok', 'true', 'false', 'yes', 'no', 'n', 'y'].includes(userInput)) {
        return obj
      }
      const inputArr = userInput.split(/-| |,/)
      const skuResult = this.extractSku(inputArr, skuArr)
      if (skuResult.skuSummary.length > 0) {
        obj['sku'] = skuResult
      }
      console.log('sku参数是', obj['sku'])
      return obj
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
        obj['minOrderQuantity'] = null
        obj['incrementUnit'] = null
        obj['maxOrderQuantity'] = null
      } else if (askKeys.includes('isLaunch')) {
        obj['isLaunch'] = false
        obj['rebate'] = null
      } else if (askKeys.includes('additionInfo')) {
        obj['additionInfo'] = '无'
      } else {
        askKeys.forEach((key) => {
          obj[key] = false
        })
      }
    } else if (!Number.isNaN(Number(userInput)) && askKeys.length === 0 && ['rebate', 'minOrderQuantity', 'incrementUnit', 'maxOrderQuantity'].includes(askKeys[0])) {
      //是合法数字
      if (askKeys[0] === 'rebate') {
        obj['rebate'] = `${userInput}%`
      } else {
        obj[askKeys[0]] = Number(userInput)
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
    for (const { key, label, regx } of categoryArr) {
      for (const item of inputSet) {
        if (['跳过', '不知道', '不需要', '无', '否', '不', 'ok', 'true', 'false', 'yes', 'no', 'n', 'y'].includes(item)) {
          inputSet.delete(item)
          continue
        }
        if (regx && regx.test(item)) {
          result[key] = item
          result['skuSummary'] += `${label}:${item}|`
          inputSet.delete(item)
        }
      }
    }
    return result
  }
}
