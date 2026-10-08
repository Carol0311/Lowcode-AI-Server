import { aiService } from '../services/aiService'
import { promptConfig } from './prompt'
const { paramName } = promptConfig

export class AIFallbackExtractor {
  //跳过关键词
  /**private skipKeywords = ['跳过', '不需要', '暂不', '不用', '不填', '否', 'no', 'n', '跳过此项']

  //提取目标参数
  extractTargetParams(question: string): string[] {
    const regex = /【([^】]+)】/g
    const matches: string[] = []
    let match

    while ((match = regex.exec(question)) !== null) {
      const chineseParam = match[1]
      const englishParam = paramName[chineseParam as keyof typeof paramName] || chineseParam
      matches.push(englishParam)
    }

    return matches
  }*/

  constructor(apiKey?: string) {}

  async extractWithAI(
    sessionId: string,
    text: string,
    askKeys: string[]
  ): Promise<{
    category?: string
    brand?: string
    product_name?: string
    specs?: string[]
  }> {
    try {
      const result = await aiService.getParamsFromInput(sessionId, text, askKeys)
      return result
    } catch (error) {
      console.error('AI提取失败:', error)
      return {}
    }
  }
}
