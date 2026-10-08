import db from '../db/knex'

export interface SessionData {
  title: string
  current_step: string
  product_category: string
  is_completed: boolean
}
class SessionService {
  private static instance: SessionService
  constructor() {}

  static getInstance() {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService()
    }
    return SessionService.instance
  }

  // 获取或创建会话
  async getOrCreateSession(userId: string, sessionId: string, initialData?: Partial<SessionData>) {
    // 检查是否存在
    const existing = await db('conversation_sessions').where({ user_id: userId, session_id: sessionId }).first()

    if (existing) {
      // 更新最后活动时间
      await db('conversation_sessions').where({ user_id: userId, session_id: sessionId }).update({
        last_active: db.fn.now(),
      })
      return existing
    }

    // 创建新会话
    await db('conversation_sessions').insert({
      user_id: userId,
      session_id: sessionId,
      current_step: 'init',
      product_category: null,
    })

    // 插入系统初始消息
    await this.addMessage(sessionId, 'system', '你是商品配置助手...')
    await this.addMessage(sessionId, 'assistant', '您好！请告诉我您想创建什么品类的商品？')
    return { session_id: sessionId, current_step: 'init', initMessage: '您好！我是智能商品助手\n请告诉我您想创建什么品类的商品？' }
  }
  //更新会话信息
  async updateSession(userId: string, sessionId: string, updateData: Partial<SessionData>) {
    try {
      await db('conversation_sessions').where({ user_id: userId, session_id: sessionId }).update(updateData)
    } catch (e: any) {
      console.log('更新会话信息出错', e.message)
    }
  }

  // 添加消息
  async addMessage(sessionId: string, role: 'system' | 'user' | 'assistant', content: string, metadata?: any) {
    try {
      await db('conversation_messages').insert({
        session_id: sessionId,
        role,
        content,
        metadata: JSON.stringify(metadata || {}),
      })
    } catch (e: any) {
      console.log('添加消息出错', e.message)
    }
  }

  async getSessionHistoryList(userId: string) {
    const [list, total] = await Promise.all([
      db('conversation_sessions').where({ user_id: userId }).select('session_id', 'user_id', 'title').orderBy('last_active', 'desc'),
      db('conversation_sessions').where({ user_id: userId }).count('* as count').first(),
    ])
    return {
      list,
      total: Number(total?.count) || 0,
    }
  }

  // 获取对话历史（最近N条）
  async getMessageHistory(sessionId: string, limit: number = 20) {
    try {
      const message = await db('conversation_messages').where({ session_id: sessionId }).select('id', 'role', 'content', 'metadata').orderBy('created_at', 'desc').orderBy('id', 'desc').limit(limit)
      return message.reverse()
    } catch (e: any) {
      console.log('查询消息历史出错', e.message)
    }
  }
  //获取目标对话记录
  async getChatMessage(sessionId: string) {
    try {
      const message = await db('conversation_messages').where({ session_id: sessionId }).select('role', 'content', 'metadata').orderBy('created_at', 'asc').orderBy('id', 'asc')
      return message
    } catch (e: any) {
      console.log('查询消息历史出错', e.message)
    }
  }

  // 保存收集的参数
  async saveCollectedParam(sessionId: string, key: string, value: any, type: string = 'string') {
    try {
      const paramValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
      await db('collected_params').insert({
        session_id: sessionId,
        param_key: key,
        param_value: paramValue,
        param_type: type,
      })
    } catch (e: any) {
      console.log('保存参数出错', e.message)
    }
  }

  // 获取所有已收集参数
  async getCollectedParams(sessionId: string) {
    try {
      const params = await db('collected_params').where({ session_id: sessionId }).select('param_key', 'param_value', 'param_type')
      return params.reduce((acc, row) => {
        let value: any = row.param_value
        if (row.param_type === 'json' || row.param_key === 'specs') {
          value = JSON.parse(row.param_value)
        } else if (row.param_type === 'number') {
          value = Number(row.param_value)
        } else if (row.param_type === 'boolean') {
          value = row.param_value === 'true'
        }
        acc[row.param_key] = value
        return acc
      }, {})
    } catch (e: any) {
      console.log('获取已收集参数出错', e.message)
    }
  }

  // 标记会话完成
  async markSessionComplete(userId: string, sessionId: string, finalSchema: any, sessionInfo: Record<string, any>) {
    try {
      await db('conversation_sessions')
        .where({ user_id: userId, session_id: sessionId })
        .update({
          last_active: db.fn.now(),
          ...sessionInfo,
        })

      // 保存最终schema作为最后一条消息
      await this.addMessage(sessionId, 'system', 'CONVERSATION_COMPLETE', { final_schema: finalSchema })
    } catch (e: any) {
      console.log('标记会话完成出错', e.message)
    }
  }

  // 清理过期会话
  async cleanupExpiredSessions(days: number = 30) {
    try {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      await db('conversation_sessions').where({ is_completed: 1 }).whereRaw('last_active < ?', [cutoff]).del()
    } catch (e: any) {
      console.log('清理过期会话出错', e.message)
    }
  }
  //删除指定会话
  async deleteConversation(userId: string, sessionId: string) {
    try {
      await db('conversation_sessions').where({ user_id: userId, session_id: sessionId }).del()
    } catch (e: any) {
      console.log('删除指定会话出错', e.message)
    }
  }
  //获取商品分类对应的规格列表
  async getSkuOfCategory(category: string) {
    try {
      let spec = <any>[]
      const result = await db('product_categories').where({ id: category }).first()
      if (result) {
        spec = JSON.parse(result.params) || []
        //return spec.map((spec: any) => `${spec.label}`)
        return { params: spec, model: JSON.parse(result.model) || {} }
      }
      return spec
    } catch (e: any) {
      console.log('获取规格列表参数出错', e.message)
    }
  }
}

export const sessionService = SessionService.getInstance()
