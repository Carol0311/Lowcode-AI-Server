import OpenAI from 'openai'
import PromptBuilder from '../config/builder/PromptBuilder'
import {} from '../types/conversation'
import db from '../db/knex'

export interface PromptContext {
  userInput: string
  collectedParams: Record<string, any>
  targetSchema: string
  businessRules: string[]
}
const promptBuilder = new PromptBuilder()

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
})

const context: PromptContext = {
  userInput: '',
  collectedParams: {},
  targetSchema: '',
  businessRules: [],
}

class AIService {
  private static apiKey: string
  private static baseURL: string
  private static instance: AIService
  private static openai: OpenAI
  constructor() {
    AIService.apiKey = process.env.DASHSCOPE_API_KEY || ''
    AIService.baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    AIService.openai = new OpenAI({
      apiKey: AIService.apiKey,
      baseURL: AIService.baseURL,
    })
  }
  static getInstance() {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async getSchemaFromDesc(desc: string) {
    const context: PromptContext = {
      userInput: '',
      collectedParams: {},
      targetSchema: '',
      businessRules: [],
    }
    const prompt = await promptBuilder.build(context)

    const completions = await AIService.openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: '' },
        { role: 'user', content: '' },
      ],
    })
    return JSON.stringify(completions)
  }
  async generateFormSchema(collectedParams: any, messageHistory: any) {
    const finalParams = <any>{}
    for (let k in collectedParams) {
      if (collectedParams[k] !== 'skip') {
        finalParams[k] = collectedParams[k]
      }
    }

    return {}
  }
  async generateNextQuestion(collectedParams: any, messageHistory: any, currentStep: string) {
    return ''
  }
  async getParamsFromInput(userInput: string, lastQuestion: string) {
    const response = await AIService.openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        {
          role: 'system',
          content: `结合上一个问题中询问的参数和以下用户输入提取商品信息。请以JSON格式返回：
    上一个问题:"${lastQuestion}"
    输入："${userInput}"
    提取以下字段：
    1. category：商品品类（如：手机、电脑、服装、食品）
    2. brand：品牌（如：华为、苹果、耐克）
    3. product_name：商品具体名称
    4. sku：可能的规格参数（如：颜色、尺寸、内存）
    5. price:销售价格或者市场价格,只获取数字或带货币符号的数字(如：123.00 $123.00 ¥123.00 123元)
    6. descDetail: 商品详情文字描述,
    7. pictureDetail: 商品图片详情（如：图片连接）,
    9. b2bOrderUnit: B2B订货单位,
    10.minOrderQuantity: 最小订货量,
    11.incrementUnit: 单位增量,
    12.maxOrderQuantity: 最大订货量,
    13.b2cOrderUnit: B2C订货单位,
    14.isLaunch: 是否上架,
    15.rebate: 返利,
    问题中用【】括起来的为目标参数 (如:问题中含有【商品名称】，则提取用户输入中商品名称信息返回 product_name:xxx;如用户输入为“跳过”,则返回 product_name:"skip")
    如果某个字段无法确定,则忽略此参数。
    只返回JSON，不要其他文字。`,
        },
        { role: 'user', content: userInput },
      ],
    })
    const params = response.choices[0].message.content || ''
    return JSON.parse(params)
  }
}
export const aiService = AIService.getInstance()
