/**
 * 低代码平台AI创建表单服务
 */
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

class AIService {
  static apiKey: string
  static baseURL: string
  private static instance: AIService
  static getInstance() {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }
  constructor() {
    AIService.apiKey = process.env.DASHSCOPE_API_KEY || ''
    AIService.baseURL = 'https://dashscope.aliyuncs.com/api/v1'
  }

  async getSchemaFromDesc(desc: string) {
    const prompt = `你是一个低代码平台助手。请将以下需求转换为一个标准的JSON Schema配置，用于生成表单页面。
        要求：
        1. 只返回纯JSON，不要任何解释
        2. 使用以下字段类型：input, number, select, date, checkbox
        3. 包含字段的label、key、type和必要的options（如果是select）
        需求：${desc}
        返回格式示例：
        {
        "title": "表单标题",
        "fields": [
          { "label": "姓名", "key": "name", "type": "input" },
          { "label": "年龄", "key": "age", "type": "number" }
        ]
        }`

    try {
      const response = await axios.post(
        `${AIService.baseURL}/services/aigc/text-generation/generation`,
        {
          model: 'qwen-max',
          input: { message: [{ role: 'user', content: prompt }] },
          parameters: {
            result_format: 'text',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${AIService.apiKey}`,
            'Content-type': 'application/json',
          },
        }
      )
      const jsonstring = response.data.output.text
      const cleanJson = jsonstring.replace(/```json|```/g, '').trim()
      return JSON.parse(cleanJson)
    } catch (e) {
      console.log('AI调用失败', e)
      throw new Error('AI生成失败，请重试或手动配置')
    }
  }
}
export const aiService = AIService.getInstance()
