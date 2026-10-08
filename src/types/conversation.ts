export interface ChatRequest {
  userInput?: string
  sessionId: string
  userId: string
}
export interface SessionRequest {
  sessionId: string
  userId: string
  updateData: Record<string, any>
}
export interface ReplyData {
  reply: string
  completed: boolean
  progress: number
  schema?: Record<string, any>
  collectedParams?: Record<string, any>
  templateInit?: Record<string, any> | null
  options?: any[]
  optionKey?: string
}
export interface SessionListResponse {
  success: boolean
  message?: string
  data?: {
    list: any[]
    total: number
  }
}
export interface SessionResponse {
  success: boolean
  message?: string
  data?: {
    session: Record<string, any>
    messages: any[]
    params?: Record<string, any>
    formPageId: string | null
    listPageId?: string | null
  }
}
export interface ChatResponse {
  success: boolean
  message?: string
  data?: ReplyData
}
export interface SessionData {
  currentStep: 'init' | 'collecting' | 'generating' | 'completed'
  productCategory: string // 如“电子产品”、“服装”
  collectedParams: {
    // 从用户那里收集到的参数
    basic?: {
      productName?: string
      brand?: string
      classification?: string
    }
    b2b?: {
      needOrderControl?: boolean
      minOrderQuantity?: number
    }
    b2c?: {
      needShelf?: boolean
      directRebate?: number
    }
    specs?: Record<string, any> // 动态规格
  }
  pendingQuestions: string[] // 待询问的问题队列
}
export interface ConversationSession {
  sessionId: string
  // 固定不变的系统指令
  systemPrompt: string
  // 完整的对话历史（用于AI理解上下文）
  messageHistory: Array<{ role: string; content: string }>
  // 独立管理的参数状态（用于业务逻辑判断）
  collectedParams: Record<string, any>
  // 待询问的问题队列
  pendingQuestions: string[]
}
export interface ParamsRequest {
  sessionId: string
  userId: string
  params: Record<string, any>
}
