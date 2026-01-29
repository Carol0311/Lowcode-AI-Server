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
    return {}
  }
  async generateNextQuestion(collectedParams: any, messageHistory: any, currentStep: string) {
    return ''
  }
}
export const aiService = AIService.getInstance()
