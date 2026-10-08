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

  async extract(sessionId: string, userText: string, askKeys: string[], currentSku: any[]): Promise<Record<string, any>> {
    // 清理可能包含的markdown代码块标记
    let userInput = userText.replace(/```json\s*/g, '')
    userInput = userInput.replace(/```\s*/g, '')
    userInput = userInput.trim()
    // 移除所有换行符和制表符
    userInput = userInput.replace(/[\n\r\t]/g, '')
    //避免空回答浪费token
    if (userInput.length === 0) {
      return {}
    }

    //关键字匹配
    const ruleResult = this.ruleExtractor.extract(userInput)
    //规则匹配
    const matchResult = this.ruleExtractor.extractMore(userInput, askKeys, currentSku)
    const collectedResult = { ...matchResult, ...ruleResult }
    const restAskKeys = this.isResultValid(askKeys, collectedResult)
    if (restAskKeys.length === 0) {
      return {
        ...collectedResult,
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
        const aiResult = await this.aiExtractor.extractWithAI(sessionId, userInput, restAskKeys)
        return {
          ...collectedResult,
          confidence: 0.95,
          method: 'ai',
          ...aiResult,
        }
      } catch (error) {
        console.warn('AI提取失败，使用备用结果')
      }
    }

    // 返回默认结果
    return {
      category: '通用商品',
      product_name: this.extractGenericProductName(userInput),
      confidence: 0.3,
      method: 'rule',
    }
  }

  private isResultValid(askKeys: string[], result: any): any[] {
    //问题中的参数信息有效提取了
    let isCompleted = []
    for (let i = 0; i < askKeys.length; i++) {
      if (!result.hasOwnProperty(askKeys[i])) {
        isCompleted.push(askKeys[i])
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
