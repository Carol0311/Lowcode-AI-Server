// server/routes/conversation.ts
import express, { Request, Response } from 'express'
import { sessionService } from '../services/sessionService'
import { aiService } from '../services/aiService'
import { ChatRequest, ChatResponse } from '../types/conversation'
import { ParamExtractor } from '../extractors/paramsExtractor'
import { promptConfig } from '../extractors/prompt'

const router = express.Router()
const paramExtractor = new ParamExtractor()
const { validateStep, stepEndQuestion, paramQuestion, paramName } = promptConfig

//检查预置基本信息是否都录入完毕
const checkIfInfoComplete = async (collect: any) => {
  //根据参数判断current step
  let current = <Record<string, any>>{}
  for (let step in validateStep) {
    const params = validateStep[step as keyof typeof validateStep]
    for (let i = 0; i < params.length; i++) {
      const param = params[i]
      if (!collect[param]) {
        //找到未录入参数及step，结束寻找
        current = {
          param,
          isComplete: false,
          currentStep: step,
        }
        break
      } else {
        if (i > 0 && i === params.length - 1) {
          current = {
            isComplete: step === 'detail',
            currentStep: step,
          }
        }
      }
    }
    //跳出validateStep遍历
    if (current.param) {
      break
    }
  }
  if (current.param) {
    current.question = await formatQuestion(collect, current.param, null)
  } else {
    current.question = await formatQuestion(collect, null, current.currentStep)
  }
  return current
}
//生成带参数的问题
const formatQuestion = async (collect: any, param: string | null, step: string | null) => {
  let question = <Record<string, any>>{}
  if (param) {
    question.value = paramQuestion[param as keyof typeof paramQuestion]
  }
  if (step) {
    question.value = stepEndQuestion[step as keyof typeof stepEndQuestion]
  }
  if (question.value.match('category')) {
    question.value = question.value.replace('category', collect['category'])
  }
  if (question.value.match('skuList')) {
    question.type = 'select'
    const result = await sessionService.getSkuOfCategory(collect['category'])
    question.options = result
    question.value = question.value.replace('{skuList}', result.join('-'))
  }
  if (question.value.match('summary')) {
    let summary = ''
    for (let k in collect) {
      summary += `${paramName[k as keyof typeof paramName]}:${collect[k as keyof typeof collect]}\n`
    }
    question.value = question.value.replace('{summary}', summary)
  }
  return question
}

const calculateProgress = (collect: any) => {
  return 10
}
//判断是否为系统业务问题
const isBussinessState = (sessionId: string, collect: Record<string, any>, userInput: string, question: Record<string, any>) => {
  //根据 current step决定如何生成下一个问题
  const text = userInput.trim().toLowerCase()
  const simple = ['是', '否', '对', '错', 'yes', 'no', 'y', 'n']
  if (simple.includes(text)) {
    return true
  }
  if (['跳过'].includes(text)) {
    //标记询问参数为跳过
    return true
  }
  //用户输入为纯数字
  if (/^\d+$/.test(text)) {
    return true
  }
  if (question.type === 'select') {
    const options = question.options
    if (options.includes(text)) {
      return true
    }
  }
  if (text.includes('?') || text.includes('重复') || text.includes('再说一遍')) {
    return true
  }

  if (question.value) {
    //预置问题还没有问完
    return true
  }
  return false
}
//开启新会话
router.post('/startChat', async (req: Request<{}, {}, {}, ChatRequest>, res: Response<ChatResponse>) => {
  console.log('开启新会话开始......')
  const { sessionId } = req.body as ChatRequest
  try {
    const session = await sessionService.getOrCreateSession(sessionId)
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
router.post('/continueChat', async (req: Request<{}, {}, {}, ChatRequest>, res: Response<ChatResponse>) => {
  console.log(`进入会话开始......`)
  try {
    const { sessionId, userInput = '' } = req.body as ChatRequest

    // 1. 获取或创建会话
    const session = await sessionService.getOrCreateSession(sessionId)

    // 2. 保存用户消息
    await sessionService.addMessage(sessionId, 'user', userInput)

    // 3. 从用户输入中提取参数
    const extractedParams = await paramExtractor.extract(userInput)
    for (const [key, value] of Object.entries(extractedParams)) {
      await sessionService.saveCollectedParam(sessionId, key, value)
    }

    // 4. 获取对话历史和已收集参数
    const messageHistory = await sessionService.getMessageHistory(sessionId, 10)
    const collectedParams = await sessionService.getCollectedParams(sessionId)

    // 5. 判断是否完成
    const { isComplete, question } = await checkIfInfoComplete(collectedParams)
    if (isComplete) {
      // 生成最终schema
      const finalSchema = await aiService.generateFormSchema(collectedParams, messageHistory)

      // 标记会话完成
      await sessionService.markSessionComplete(sessionId, finalSchema)

      return res.status(200).json({
        success: true,
        data: {
          reply: '✅ 商品档案已生成！',
          schema: finalSchema,
          progress: 100,
          completed: true,
        },
      })
    }
    // 6. 继续对话 - 生成下一个问题
    const isBussiness = isBussinessState(sessionId, collectedParams, userInput, question)
    let nextQuestion
    if (isBussiness) {
      //是业务逻辑，直接生成下一个问题
      nextQuestion = question.value
    } else {
      //需要调用ai生成下一个问题
      nextQuestion = await aiService.generateNextQuestion(collectedParams, messageHistory, session.current_step)
    }

    // 7. 保存AI回复
    await sessionService.addMessage(sessionId, 'assistant', nextQuestion)

    // 8. 返回响应
    res.status(200).json({
      success: true,
      data: {
        reply: nextQuestion,
        completed: false,
        progress: calculateProgress(collectedParams),
        collectedParams,
      },
    })
  } catch (e: any) {
    res.status(500).json({ success: false, message: `对话处理失败\r\n${e.message}` })
  }
})

// 获取会话历史（用于页面刷新后恢复）
router.get('/getChat', async (req: Request<{}, {}, {}, ChatRequest>, res) => {
  const { sessionId } = req.query

  try {
    const session = await sessionService.getOrCreateSession(sessionId)
    const messages = await sessionService.getMessageHistory(sessionId)
    const params = await sessionService.getCollectedParams(sessionId)

    res.status(200).json({
      success: true,
      data: {
        session,
        messages,
        params,
        exists: true,
      },
    })
  } catch (e: any) {
    res.status(500).json({ success: false, message: `获取会话历史失败\r\n${e.message}` })
  }
})

// 删除会话
router.delete('/deleteChat', async (req: Request<{}, {}, {}, ChatRequest>, res) => {
  console.log(`删除会话${req.query.sessionId}开始......`)
  try {
    const { sessionId } = req.query
    await sessionService.deleteConversation(sessionId)
    res.status(200).json({ success: true, message: '删除成功', type: 'short' })
  } catch (e: any) {
    res.status(500).json({ success: false, message: `删除会话出错\r\n${e.message}` })
  }
  console.log(`删除会话${req.query.sessionId}结束......`)
})
export default router
