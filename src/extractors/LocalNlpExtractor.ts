import { Jieba, TfIdf } from '@node-rs/jieba'
import { dict, idf } from '@node-rs/jieba/dict'
import { KeyWords } from './keyWords'

const jieba = Jieba.withDict(dict)
const tfIdf = TfIdf.withDict(idf)

export class LocalNlpExtractor {
  // 品牌词库
  private brandWords = KeyWords.brand

  // 品类词库
  private categoryWords = KeyWords.category

  // 停用词
  private stopWords = new Set(['一个', '一款', '商品', '产品', '档案', '创建', '想', '要', '的'])

  isInclude(data: Record<string, any>, text: string) {
    for (let k in data) {
      if (data[k].includes(text)) return true
    }
    return false
  }
  extract(text: string) {
    // 1. 分词
    const words = jieba.cut(text, false)

    // 2. 词性标注（可选）
    const tagged = jieba.tag(text)
    console.log('词性标注:', tagged)
    // 输出：[['华为', 'ns'], ['手机', 'n'], ...]

    // 3. 过滤和分类
    const result: any = {}

    for (const word of words) {
      if (this.stopWords.has(word)) continue

      if (this.isInclude(this.brandWords, word)) {
        result.brand = word
      } else if (this.isInclude(this.categoryWords, word)) {
        result.category = word
      } else if (word.length >= 2 && !result.product_name) {
        // 可能是商品名（名词性判断简化）
        const isNoun = tagged.some(({ tag: t, word: w }) => w === word && w.startsWith('n'))
        if (isNoun) {
          result.product_name = word
        }
      }
    }

    // 4. 提取关键词（备用）
    if (!result.category || !result.brand) {
      const keywords = tfIdf.extractKeywords(jieba, text, 3)
      keywords.forEach(({ keyword: k }) => {
        if (!result.brand && this.isInclude(this.brandWords, k)) {
          result.brand = k
        }
        if (!result.category && this.isInclude(this.categoryWords, k)) {
          result.category = k
        }
      })
    }

    return result
  }
}

/**
const extractor = new JiebaParamExtractor()
const params = extractor.extract('我想创建一个华为手机的商品档案')
console.log(params)
// { brand: '华为', category: '手机', product_name: '手机' }*/
