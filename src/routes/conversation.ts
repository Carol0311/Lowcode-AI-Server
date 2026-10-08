// server/routes/conversation.ts
import express, { Request, Response } from 'express'
import { sessionService } from '../services/sessionService'
import { aiService } from '../services/aiService'
import { ChatRequest, SessionRequest, ChatResponse, SessionResponse, SessionListResponse, ParamsRequest } from '../types/conversation'
import { PageSchema } from '../types/page'
import { ParamExtractor } from '../extractors/paramsExtractor'
import { getParamsSummary, extractCurrentField, checkIfInfoComplete, isBussinessState, calculateProgress, filterParams, getCategoryKey, getQuestionWithOptions } from '../utils/chatParams'
import { pageService } from '../services/pageService'

const router = express.Router()
const paramExtractor = new ParamExtractor()
let currentSku: Record<string, any> = {}
let isCategoryChanged = false
let currentCategory = ''

const completedOrNext = async (session: Record<string, any>, userId: string, collectedParams: Record<string, any>) => {
  // 5. 判断是否完成
  const { isComplete, question, currentStep } = await checkIfInfoComplete(collectedParams)
  const { session_id } = session
  if (isComplete) {
    // 生成最终schema
    const finalSchema = filterParams(collectedParams)

    const finalSummary = getParamsSummary(finalSchema)

    const finalReply = `✅ 商品档案已生成！最终参数信息如下：\n${finalSummary}`

    let title = session.title

    if (!session.title) {
      //调用ai生成标题摘要
      title = (await aiService.generateTitle(finalSummary)) || ''
    }

    const categoryKey = getCategoryKey(finalSchema.category)

    const templateExist = await pageService.getPageDetail({ pageId: `AI_GOODSFORM_CATEGORY_${categoryKey}` } as PageSchema)

    // 标记会话完成
    await sessionService.markSessionComplete(userId, session_id, finalSchema, { is_completed: isComplete, current_step: 'completed', product_category: collectedParams.category, title })

    await sessionService.addMessage(session_id, 'assistant', finalReply)

    return {
      success: true,
      data: {
        reply: finalReply,
        schema: finalSchema,
        progress: 100,
        completed: true,
        templateInit:
          templateExist === null
            ? {
                createTemplate: currentSku.model,
                categoryKey,
                formPageId: `AI_GOODSFORM_CATEGORY_${categoryKey}`,
                formName: `AI商品档案_${finalSchema.category}_品类`,
                listPageId: `AI_GOODSLIST_CATEGORY_${categoryKey}`,
                listName: `AI商品档案列表_${finalSchema.category}_品类`,
              }
            : { createTemplate: false, categoryKey, formPageId: `AI_GOODSFORM_CATEGORY_${categoryKey}`, listPageId: `AI_GOODSLIST_CATEGORY_${categoryKey}` },
      },
    }
  }
  return { isComplete, question, currentStep }
}

//开启新会话
router.post('/startChat', async (req: Request<{}, {}, ChatRequest>, res: Response<ChatResponse>) => {
  console.log('开启新会话开始......')
  const { userId, sessionId } = req.body
  try {
    const session = await sessionService.getOrCreateSession(userId, sessionId)
    res.status(200).json({
      success: true,
      data: {
        reply: session.initMessage,
        completed: false,
        progress: 0,
      },
    })
  } catch (e: any) {
    res.status(500).json({ success: false, message: `开启新会话出错\r\n${e.message}` })
  }
  console.log('开启新会话结束......')
})

// 核心对话接口
router.post('/continueChat', async (req: Request<{}, {}, ChatRequest>, res: Response<ChatResponse>) => {
  console.log(`进入会话开始......`)
  try {
    const { userId, sessionId, userInput = '' } = req.body

    // 1. 获取或创建会话
    const session = await sessionService.getOrCreateSession(userId, sessionId)

    // 2. 保存用户消息
    await sessionService.addMessage(sessionId, 'user', userInput)

    // 4. 获取对话历史
    const messageHistory = await sessionService.getMessageHistory(sessionId, 10)
    const lastQuestion = messageHistory?.reverse().find((message) => message.role === 'assistant')

    // 3. 从用户输入中提取参数
    let collectedParams = await sessionService.getCollectedParams(sessionId)
    //品类改变
    if (collectedParams['category'] && collectedParams['category']! == currentCategory) {
      currentCategory = collectedParams['category']
      isCategoryChanged = true
    } else {
      isCategoryChanged = false
    }
    //品类变化，重新取sku类型
    if (collectedParams['category'] && (Object.keys(currentSku).length === 0 || isCategoryChanged)) {
      currentSku = await sessionService.getSkuOfCategory(collectedParams['category'])
    }

    const askKeys = extractCurrentField(lastQuestion.content)
    const extractedParams = await paramExtractor.extract(sessionId, userInput, askKeys, currentSku.params)
    for (const [key, value] of Object.entries(extractedParams)) {
      await sessionService.saveCollectedParam(sessionId, key, value)
    }

    // 4. 已收集参数
    collectedParams = await sessionService.getCollectedParams(sessionId)

    const completeResult = await completedOrNext(session, userId, collectedParams)

    // 5. 判断是否完成
    if (completeResult?.success) {
      return res.status(200).json(completeResult)
    }
    const { question, currentStep } = completeResult
    const progress = calculateProgress(currentStep)

    // 6. 继续对话 - 生成下一个问题
    const isBussiness = await isBussinessState(sessionId, collectedParams, userInput, question, currentStep)
    //如果同一个问题问了三次，第四次降级提问，只提供固定选项给用户
    const assisHistory = messageHistory?.reverse().filter((message) => message.role === 'assistant')
    const lastThree = assisHistory?.slice(-3, assisHistory.length) || []
    let nextQuestion
    let questionWithPtions
    if (lastThree.length === 3 && lastThree[0].content === lastThree[1].content && lastThree[1].content === lastThree[2].content) {
      questionWithPtions = getQuestionWithOptions(askKeys, currentSku.params)
      nextQuestion = questionWithPtions.value
    } else {
      if (isBussiness.value) {
        //是业务逻辑，直接生成下一个问题
        //如果业务逻辑是'跳过',则生成的是下一个问题
        nextQuestion = isBussiness.question.value
      } else {
        //需要调用ai生成下一个问题
        nextQuestion = await aiService.generateNextQuestion(collectedParams, messageHistory, session.current_step)
      }
    }

    // 7. 保存AI回复
    let metadata = {}
    if (questionWithPtions && questionWithPtions.options) {
      metadata = { options: questionWithPtions?.options, optionKey: questionWithPtions?.key }
    }
    await sessionService.addMessage(sessionId, 'assistant', nextQuestion, metadata)

    // 8. 返回响应
    res.status(200).json({
      success: true,
      data: {
        reply: nextQuestion,
        completed: false,
        progress,
        collectedParams,
        options: questionWithPtions?.options,
        optionKey: questionWithPtions?.key,
      },
    })
  } catch (e: any) {
    res.status(500).json({ success: false, message: `对话处理失败\r\n${e.message}` })
  }
})

//获取会话历史记录列表
router.get('/getChatHistoryList', async (req: Request<{}, {}, {}, ChatRequest>, res: Response<SessionListResponse>) => {
  try {
    const { userId = '' } = req.query
    const result = await sessionService.getSessionHistoryList(userId)
    if (result) {
      res.status(200).json({ success: true, data: result })
    } else {
      res.status(404).json({ success: false, message: '该用户没有历史会话记录' })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: `查询会话历史记录失败:\r\n${e.message}` })
  }
})

// 获取会话历史（用于页面刷新后恢复）
router.get('/getChat', async (req: Request<{}, {}, {}, ChatRequest>, res: Response<SessionResponse>) => {
  const { userId, sessionId } = req.query

  try {
    const session = await sessionService.getOrCreateSession(userId, sessionId)
    const messages = await sessionService.getChatMessage(sessionId)
    const params = await sessionService.getCollectedParams(sessionId)

    const categoryKey = getCategoryKey(params.category)

    //const page = await pageService.getPageDetail({ pageId: `AI_GOODSFORM_CATEGORY_${categoryKey}` } as PageSchema)
    //const list = await pageService.getPageDetail({ pageId: `AI_GOODSLIST_CATEGORY_${categoryKey}` } as PageSchema)

    res.status(200).json({
      success: true,
      data: {
        session,
        messages: messages || [],
        params,
        formPageId: `AI_GOODSFORM_CATEGORY_${categoryKey}`,
        listPageId: `AI_GOODSLIST_CATEGORY_${categoryKey}`,
      },
    })
  } catch (e: any) {
    res.status(500).json({ success: false, message: `获取会话历史失败\r\n${e.message}` })
  }
})

//更新会话标题
router.post('/updateChatTitle', async (req: Request<{}, {}, SessionRequest>, res: Response<ChatResponse>) => {
  try {
    const { userId, sessionId, updateData } = req.body
    await sessionService.updateSession(userId, sessionId, updateData)
    res.status(200).json({ success: true })
  } catch (e: any) {
    res.status(500).json({ success: false, message: `更新会话标题出错\r\n${e.message}` })
  }
})

// 删除会话
router.delete('/deleteChat', async (req: Request<{}, {}, {}, ChatRequest>, res) => {
  console.log(`删除会话${req.query.sessionId}开始......`)
  try {
    const { userId, sessionId } = req.query
    //删除会话
    await sessionService.deleteConversation(userId, sessionId)
    res.status(200).json({ success: true, message: '删除成功', type: 'short' })
  } catch (e: any) {
    res.status(500).json({ success: false, message: `删除会话出错\r\n${e.message}` })
  }
  console.log(`删除会话${req.query.sessionId}结束......`)
})
router.post('/updateChatParams', async (req: Request<{}, {}, ParamsRequest>, res: Response<Record<string, any>>) => {
  console.log(`更新会话参数开始......`)
  try {
    const { sessionId, userId, params } = req.body
    //获取目标对话
    const session = await sessionService.getOrCreateSession(userId, sessionId)
    //保存降级选择的参数
    await sessionService.saveCollectedParam(sessionId, params.key, params.value)
    //查询出当前会话收集的所有参数
    const collectedParams = await sessionService.getCollectedParams(sessionId)
    //判断是否完成
    const completeResult = await completedOrNext(session, userId, collectedParams)
    if (completeResult?.success) {
      //若会话已经完成，返回对应的响应
      res.status(200).json(completeResult)
    }
    //若会话没有完成，继续问下一个问题
    const { question, currentStep } = completeResult
    const progress = calculateProgress(currentStep)

    // 保存AI回复
    await sessionService.addMessage(sessionId, 'assistant', question.value)

    // 返回响应
    res.status(200).json({
      success: true,
      data: {
        reply: question.value,
        completed: false,
        progress,
        collectedParams,
      },
    })
  } catch (e: any) {
    res.status(500).json({ success: false })
  }
  console.log(`更新参数结束......`)
})
export default router
