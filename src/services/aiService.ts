import OpenAI from 'openai'
import PromptBuilder from '../config/builder/PromptBuilder'
import {} from '../types/conversation'
import db from '../db/knex'
import { sessionService } from './sessionService'
import { promptConfig } from '../extractors/prompt'
const { paramKey, paramName } = promptConfig
import { getParamsSummary } from '../utils/chatParams'

export interface PromptContext {
  userInput: string
  collectedParams: Record<string, any>
  targetSchema: string
  businessRules: string[]
}
const promptBuilder = new PromptBuilder()

class AIService {
  private static apiKey: string
  private static baseURL: string
  private static instance: AIService
  private static openai: OpenAI
  constructor() {
    AIService.apiKey = 'sk-6be572db650b4af09ebe917c2b1836cb'
    AIService.baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    AIService.openai = new OpenAI({
      apiKey: 'sk-6be572db650b4af09ebe917c2b1836cb',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    })
  }
  static getInstance() {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }
  async generateNextQuestion(collectedParams: any, messageHistory: any, currentStep: string) {
    return ''
  }
  extractAskKeys(userInput: string, askKeys: string[]) {
    let obj = {} as Record<string, any>
    if (askKeys.includes('sku')) {
      // 清理可能包含的markdown代码块标记
      let param = userInput.replace(/```json\s*/g, '')
      param = param.replace(/```\s*/g, '')
      param = param.trim()

      // 移除所有换行符和制表符
      param = param.replace(/[\n\r\t]/g, '')

      obj['sku'] = param.trim().split(' ')
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
    if (userInput === '是') {
      if (askKeys.includes('b2bOrderCtrl')) {
        obj['b2bOrderCtrl'] = true
      } else if (askKeys.includes('isLaunch')) {
        obj['isLaunch'] = true
      } else {
        askKeys.forEach((key) => {
          obj[key] = true
        })
      }
    } else if (userInput === '否') {
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

    if (userInput === '需要') {
    }
    return obj
  }
  async generateTitle(summary: string) {
    const prompt = `
    请根据以下内容摘要，生成一个商品档案标题。

    要求：
    - 长度控制在 10-20 个字符以内
    - 简洁明了，概括核心主题
    - 直接输出标题，不要包含引号或额外说明

    对话内容：
    ${summary}`

    const response = await AIService.openai.chat.completions.create({
      model: 'qwen3.8-flash',
      messages: [
        { role: 'system', content: '你是一个专业的电商文案写手，只输出商品档案标题摘要。' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    })
    return response.choices[0].message.content?.trim()
  }
  async generateDetlText(params: Record<string, any>, style: string) {
    const { brand, category, price, product_name, sku, rebate } = params
    const summary = getParamsSummary({ brand, category, price, product_name, sku, rebate })
    const styleMap = {
      professional: '使用专业、客观的语气，突出产品规格和技术参数',
      marketing: '使用有吸引力、营销化的语气，突出产品卖点和用户价值',
      simple: '使用简洁、直接的语气，只列出核心信息',
    } as any
    const prompt = `
    你是一个电商商品详情文案生成助手。

    请根据以下信息，生成一段品类为${paramName.category}的商品详情描述。

    参数信息如下:${summary}

    写作要求：
    - ${styleMap[style] || styleMap.professional}
    - 只能根据提供的参数${params}生成详情描述，不要编造用户未提供的信息
    - 描述应连贯自然，不要分点列举
    - 控制在50-100字之间
    - 只返回描述文本，不要有任何额外说明或格式标记

    请直接输出商品描述：`

    const response = await AIService.openai.chat.completions.create({
      model: 'qwen3.8-flash',
      messages: [
        { role: 'system', content: '你是一个专业的电商文案写手，只输出商品描述文本。' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    })
    return response.choices[0].message.content?.trim()
  }
  async getParamsFromInput(sessionId: string, userInput: string, lastQuestion: string, askKeys: string[]) {
    let collectedParams: Record<string, any> = { method: 'ai' }

    const simpleParams = this.extractAskKeys(userInput, askKeys)
    collectedParams = { ...collectedParams, ...simpleParams }

    //逻辑处理已经满足了参数处理要求，不再调用ai
    if (!(Object.keys(simpleParams).length < askKeys.length)) {
      console.log('简单逻辑参数处理', simpleParams)
      collectedParams['method'] = 'rules'
      return collectedParams
    }

    if (!collectedParams['descDetail'] && askKeys.includes('descDetail')) {
      //获取当前收集的所有参数
      const pp = await sessionService.getCollectedParams(sessionId)
      const detl = await this.generateDetlText(pp, '')
      console.log('商品详情:', detl)
      return { descDetail: detl || '' }
    }

    const prompt = `你是一个商品信息提取助手。请根据用户输入，提取以下商品信息，只返回 JSON。
          
          需要提取的字段：${askKeys.join(', ')}
          用户输入: "${userInput}"

          示例格式:
          {
            "category": "手机",
            "brand": "华为",
            "price": 5999
          }
            
          【重要说明】
           - 如果需要提取的字段是price,答案要携带货币符号
           - 如果需要提取的字段是additionInfo,答案为${userInput.trim()}
           - 只提取需要提取的字段对应的答案
           - 只返回JSON，不要其他文字
           - 只返回纯JSON对象，不要包含任何解释文字
           - 不要使用markdown代码块（不要用\`\`\`json）
           - JSON必须是紧凑格式，不要换行和缩进
           - 只返回能确定的字段，不确定的字段不要返回`

    const response = await AIService.openai.chat.completions.create({
      model: 'qwen3.8-flash',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userInput },
      ],
      max_tokens: 500,
      temperature: 0.1, // 提取信息用低温度，更快更确定
    })
    let params = response.choices[0].message.content || ''
    // 清理可能包含的markdown代码块标记
    params = params.replace(/```json\s*/g, '')
    params = params.replace(/```\s*/g, '')
    params = params.trim()

    // 移除所有换行符和制表符
    params = params.replace(/[\n\r\t]/g, '')

    try {
      const parsedParams = JSON.parse(params)
      const resultParams = { ...collectedParams, ...parsedParams }
      console.log('处理后的参数', resultParams)
      return resultParams
    } catch (e: any) {
      console.error('AI返回的原始内容:', response.choices[0].message.content)
      console.error('清理后的内容:', params)
      throw new Error(`JSON解析失败: ${e.message}`)
    }
  }
}
export const aiService = AIService.getInstance()
