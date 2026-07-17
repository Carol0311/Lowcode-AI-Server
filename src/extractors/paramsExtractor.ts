import { RuleBasedExtractor } from './RuleBasedExtractor'
import { LocalNlpExtractor } from './LocalNlpExtractor'
import { AIFallbackExtractor } from './AIFallbackExtractor'
export class ParamExtractor {
  private ruleExtractor: RuleBasedExtractor
  private nlpExtractor: LocalNlpExtractor
  private aiExtractor?: AIFallbackExtractor

  constructor() {
    this.ruleExtractor = new RuleBasedExtractor()
    this.nlpExtractor = new LocalNlpExtractor()
    this.aiExtractor = new AIFallbackExtractor()
  }

  async extract(
    sessionId: string,
    text: string,
    lastQuestion: string,
    askKeys: string[]
  ): Promise<{
    category?: string
    brand?: string
    sku?: string
    product_name?: string
    confidence: number
    method: 'rule' | 'nlp' | 'ai'
  }> {
    // 第一层：规则匹配
    if (['跳过', '无', 'skip'].includes(text)) {
      const ruleskip: Record<string, any> = {}
      askKeys.forEach((v: string) => (ruleskip[v] = null))
      return {
        ...ruleskip,
        confidence: 0.9,
        method: 'rule',
      }
    }
    const ruleResult = this.ruleExtractor.extract(text)
    if (this.isResultValid(askKeys, ruleResult)) {
      return {
        ...ruleResult,
        confidence: 0.9,
        method: 'rule',
      }
    }

    // 第二层：本地NLP
    /**const nlpResult = this.nlpExtractor.extract(text)
    if (this.isResultValid(nlpResult)) {
      return {
        ...nlpResult,
        confidence: 0.7,
        method: 'nlp',
      }
    }*/

    // 第三层：AI兜底
    if (this.aiExtractor) {
      try {
        const aiResult = await this.aiExtractor.extractWithAI(sessionId, text, lastQuestion, askKeys)
        return {
          ...aiResult,
          confidence: 0.95,
          method: 'ai',
        }
      } catch (error) {
        console.warn('AI提取失败，使用备用结果')
      }
    }

    // 返回默认结果
    return {
      category: '通用商品',
      product_name: this.extractGenericProductName(text),
      confidence: 0.3,
      method: 'rule',
    }
  }

  private isResultValid(askKeys: string[], result: any): boolean {
    //问题中的参数信息有效提取了
    let isCompleted = true
    for (let i = 0; i < askKeys.length; i++) {
      console.log(result.hasOwnProperty(askKeys[i]))
      if (!result.hasOwnProperty(askKeys[i])) {
        isCompleted = false
        break
      }
    }
    return isCompleted
  }

  private extractGenericProductName(text: string): string {
    // 简单的通用提取
    const match = text.match(/创建(?:一个|一款)?([^，。！？]+?)(?:商品|产品|的档案)/)
    return match ? match[1].trim() : '未命名商品'
  }
}
