export interface ChatRequest {
  userInput?: string
  sessionId: string
}
export interface ReplyData {
  reply: string
  completed: boolean
  progress: number
  schema?: Record<string, any>
  collectedParams?: Record<string, any>
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
const categorySpecsTemplates: Record<string, string[]> = {
  电子产品: ['型号', '颜色', '内存', '存储空间', '屏幕尺寸', '电池容量'],
  服装: ['尺码', '颜色', '材质', '季节', '适用人群'],
  食品: ['净含量', '保质期', '口味', '生产日期', '储存方式'],
  家具: ['尺寸', '材质', '颜色', '风格', '组装方式'],
  // 可扩展更多品类
}
// 不要一次性问所有问题，而是分组询问
const questionGroups = {
  basic: ['商品名称', '商品分类', '品牌'],
  specs: ['规格参数'], // 根据品类动态变化
  b2b: ['最小订货量', '最大订货量', '单位增量'],
  b2c: ['上架状态', '返利设置'],
}

// 根据用户身份智能调整问题优先级
function prioritizeQuestions(userType: '供应商' | '零售商' | '管理员') {
  if (userType === '供应商') return ['b2b', 'basic', 'specs']
  if (userType === '零售商') return ['b2c', 'basic', 'specs']
  return ['basic', 'specs', 'b2b', 'b2c']
}
// 在引导提问时提供选项
const suggestedBrands = {
  电子产品: ['苹果', '华为', '小米', '三星', '其他'],
  服装: ['耐克', '阿迪达斯', '优衣库', 'ZARA', '其他'],
}

// AI引导时可以这样说：
;('这款电子产品的【品牌】是什么？\n（建议：苹果/华为/小米/三星/其他）')
