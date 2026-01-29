import Jieba from '@node-rs/jieba'
const jieba = new Jieba.Jieba()
const { cut, tag } = jieba
const { extractKeywords } = new Jieba.TfIdf()

export class LocalNlpExtractor {
  // 品牌词库
  private brandWords = new Set(['华为', '苹果', '小米', '三星', '耐克', '阿迪'])

  // 品类词库
  private categoryWords = new Set(['手机', '电脑', '服装', '食品', '家具'])

  // 停用词
  private stopWords = new Set(['一个', '一款', '商品', '产品', '档案', '创建', '想', '要', '的'])

  extract(text: string) {
    // 1. 分词
    const words = cut(text, false)

    // 2. 词性标注（可选）
    const tagged = tag(text)
    console.log('词性标注:', tagged)
    // 输出：[['华为', 'ns'], ['手机', 'n'], ...]

    // 3. 过滤和分类
    const result: any = {}

    for (const word of words) {
      if (this.stopWords.has(word)) continue

      if (this.brandWords.has(word)) {
        result.brand = word
      } else if (this.categoryWords.has(word)) {
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
      const keywords = extractKeywords(jieba, text, 3)
      keywords.forEach(({ keyword: k }) => {
        if (!result.brand && this.brandWords.has(k)) {
          result.brand = k
        }
        if (!result.category && this.categoryWords.has(k)) {
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
