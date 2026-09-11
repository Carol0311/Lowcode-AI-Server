import { fileURLToPath } from 'node:url'
import { promptConfig } from '../extractors/prompt'
import { sessionService } from '../services/sessionService'

const { validateStep, stepEndQuestion, paramQuestion, paramName, paramKey } = promptConfig as Record<string, any>

//从问题中获取参数字段
export const extractCurrentField = (question: string) => {
  const matches = question.match(/【(.*?)】/g)
  if (!matches) return []
  return matches?.map((name) => paramKey[name])
}

//检查预置基本信息是否都录入完毕
export const checkIfInfoComplete = async (collect: any) => {
  //根据参数判断current step
  let current = <Record<string, any>>{}
  for (let step in validateStep) {
    const params = validateStep[step]
    for (let i = 0; i < params.length; i++) {
      const param = params[i]
      if (!collect.hasOwnProperty(param)) {
        //找到未录入参数及step，结束寻找
        current = {
          param,
          isComplete: false,
          currentStep: step,
        }
        break
      } else {
        if (i === params.length - 1) {
          current = {
            isComplete: step === 'additionInfo',
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
    question.value = paramQuestion[param]
  }
  if (step) {
    question.value = stepEndQuestion[step]
  }
  //最后一步没有下一个问题
  if (!question.value) {
    return question
  }
  if (question.value.match('category')) {
    question.value = question.value.replace('{category}', collect['category'])
  }
  if (question.value.match('skuList')) {
    question.type = 'select'
    const result = await sessionService.getSkuOfCategory(collect['category'])
    question.options = result
    question.value = question.value.replace('{skuList}', result.join('-'))
  }
  if (question.value.match('summary')) {
    let filterCollect = filterParams(collect)
    let summary = getParamsSummary(filterCollect)
    question.value = question.value.replace('{summary}', summary)
  }
  return question
}

export const calculateProgress = (currentStep: string) => {
  switch (currentStep) {
    case 'init':
      return 5
    case 'basic':
      return 30
    case 'sku':
      return 40
    case 'b2b':
      return 50
    case 'b2bOrderCtrl':
      return 60
    case 'b2c':
      return 70
    case 'pictureDetail':
      return 80
    case 'descDetail':
      return 90
    case 'additionInfo':
      return 100
    default:
      return 0
  }
}

//判断是否为系统业务问题
export const isBussinessState = async (sessionId: string, collect: Record<string, any>, userInput: string, nextQuestion: Record<string, any>, step: string | null) => {
  //根据 current step决定如何生成下一个问题
  const text = userInput.trim().toLowerCase()
  const simple = ['是', '对', '错', 'yes', 'no', 'y', 'n']
  if (simple.includes(text)) {
    return { value: true, question: nextQuestion }
  }
  if (['跳过', 'skip', '否'].includes(text)) {
    //标记询问参数为跳过
    if (step) {
      const { question } = await checkIfInfoComplete(collect)
      return { value: true, question }
    }
    return { value: true, question: nextQuestion }
  }
  //用户输入为纯数字
  if (/^\d+$/.test(text)) {
    return { value: true, question: nextQuestion }
  }
  if (nextQuestion.type === 'select') {
    const options = nextQuestion.options
    if (options.includes(text)) {
      return { value: true, question: nextQuestion }
    }
  }
  if (text.includes('?') || text.includes('重复') || text.includes('再说一遍')) {
    return { value: true, question: nextQuestion }
  }

  if (nextQuestion.value) {
    //预置问题还没有问完
    return { value: true, question: nextQuestion }
  }
  return { value: false, question: nextQuestion }
}

//过滤不需要显示到页面的数据
export const filterParams = (collectedParams: any) => {
  const finalParams = <any>{}
  for (let k in collectedParams) {
    const value = collectedParams[k]
    if (value !== 'skip' && value !== 'null') {
      finalParams[k] = value === true ? '是' : value === false ? '否' : value
    }
  }
  return finalParams
}

//获取参数信息摘要
export const getParamsSummary = (params: Record<string, any>) => {
  let summary = ''
  for (let k in params) {
    const value = params[k]
    if (!['confidence', 'method'].includes(k) && value && value !== 'null') {
      summary += `${paramName[k]}:${value}\r\n`
    }
  }
  return summary
}

export const getCategoryKey = (category: string) => {
  switch (category) {
    case '手机':
      return '3C'
    case '服装':
      return 'CLOTHES'
    case '食品':
      return 'FOODS'
  }
}
