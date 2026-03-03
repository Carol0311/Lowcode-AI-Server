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
    text: string,
    lastQuestion: string
  ): Promise<{
    category?: string
    brand?: string
    sku?: string
    product_name?: string
    confidence: number
    method: 'rule' | 'nlp' | 'ai'
  }> {
    // 第一层：规则匹配
    const ruleResult = this.ruleExtractor.extract(text)
    if (this.isResultValid(ruleResult)) {
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
        const aiResult = await this.aiExtractor.extractWithAI(text, lastQuestion)
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

  private isResultValid(result: any): boolean {
    // 至少提取到一个关键信息
    return !!(result.category || result.brand || result.product_name)
  }

  private extractGenericProductName(text: string): string {
    // 简单的通用提取
    const match = text.match(/创建(?:一个|一款)?([^，。！？]+?)(?:商品|产品|的档案)/)
    return match ? match[1].trim() : '未命名商品'
  }
}
