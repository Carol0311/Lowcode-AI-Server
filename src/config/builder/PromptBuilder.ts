// builders/PromptBuilder.ts
import fs from 'fs/promises'
import path from 'path'

type PromptContext = {
  // 用户输入
  userInput: string
  // 已收集参数
  collectedParams: Record<string, any>
  // Schema要求
  targetSchema: string
  // 业务规则
  businessRules: string[]
}

class PromptBuilder {
  private templatesDir: string

  constructor(templatesDir = './config/prompts') {
    this.templatesDir = templatesDir
  }

  // 1. 动态加载模板片段
  async loadTemplate(templateName: string): Promise<string> {
    const filePath = path.join(this.templatesDir, `${templateName}.md`)
    try {
      return await fs.readFile(filePath, 'utf-8')
    } catch (error: any) {
      throw new Error(`模板 ${templateName} 加载失败: ${error.message}`)
    }
  }

  // 2. 智能选择模板片段
  private async selectTemplatesByContext(context: PromptContext): Promise<string[]> {
    const templates = ['system/role']

    // 根据场景选择模板
    /**if (context.collectedParams.productCategory) {
      templates.push('templates/category-specific-rules')
    }

    if (Object.keys(context.collectedParams).length > 10) {
      templates.push('templates/complex-form-rules')
    }*/

    templates.push('templates/component-rules')
    templates.push('templates/schema-definition')
    templates.push('examples/good-form')

    return templates
  }

  // 3. 动态填充变量
  private fillTemplateVariables(template: string, context: PromptContext): string {
    const variables = {
      // 组件库
      componentTypes: this.getAvailableComponentTypes(context),
      // 业务规则
      businessRules: context.businessRules.join('\n'),
      // 已收集参数
      collectedSummary: this.formatCollectedParams(context.collectedParams),
      // 目标Schema
      targetSchema: context.targetSchema,
    }

    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key as keyof typeof variables] || `{{${key}}}`)
  }

  // 4. 构建完整Prompt
  async build(context: PromptContext): Promise<string> {
    // 选择需要的模板
    const templateNames = await this.selectTemplatesByContext(context)

    // 加载并合并模板
    const templatePromises = templateNames.map((name) => this.loadTemplate(name))
    const templates = await Promise.all(templatePromises)

    // 填充变量
    const filledTemplates = templates.map((template) => this.fillTemplateVariables(template, context))

    // 添加当前任务上下文
    const taskContext = this.buildTaskContext(context)

    // 拼接最终Prompt
    return ['# 系统指令\n', ...filledTemplates, '\n# 当前任务\n', taskContext, '\n# 用户需求\n', context.userInput, '\n\n请生成符合要求的PageSchema JSON：'].join('\n')
  }

  // 5. 构建任务上下文
  private buildTaskContext(context: PromptContext): string {
    return `
## 任务信息
- **场景类型**: ${this.detectScenarioType(context)}
- **字段数量**: ${Object.keys(context.collectedParams).length}
- **布局复杂度**: ${this.calculateComplexity(context)}
- **特殊要求**: ${this.extractSpecialRequirements(context)}

## 已收集参数
${this.formatParamsForPrompt(context.collectedParams)}

## 预期输出格式
\`\`\`json
{
  "id": "表单唯一ID",
  "name": "表单名称",
  "rootComponentIds": ["..."],
  "components": { /* 组件树 */ }
}
\`\`\`
`
  }
  // 6. 工具方法
  private getAvailableComponentTypes(context: PromptContext): string {
    const baseTypes = [
      'Text',
      'SSelect',
      'CheckboxGroup',
      'RadioGroup',
      'SCheckbox',
      'Radio',
      'Switch',
      'Date',
      'DateRange',
      'Number',
      'Price',
      'Qty',
      'TextArea',
      'Upload',
      'Address',
      'Image',
      'Search',
      'CategorySearch',
      'AdvanceForm',
      'Container',
      'EvelatorForm',
      'Form',
    ]

    if (context.collectedParams.hasDateFields) {
      baseTypes.push('DatePicker', 'TimePicker')
    }

    if (context.collectedParams.hasRichText) {
      baseTypes.push('RichTextEditor')
    }

    return baseTypes.map((type) => `- ${type}`).join('\n')
  }

  private formatCollectedParams(params: Record<string, any>): string {
    return Object.entries(params)
      .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
      .join('\n')
  }
  private formatParamsForPrompt(params: Record<string, any>) {
    return params
  }
  private calculateComplexity(context: PromptContext) {
    return context
  }
  private extractSpecialRequirements(context: PromptContext) {
    return context
  }

  private detectScenarioType(context: PromptContext): string {
    if (context.userInput.includes('商品')) return '商品配置'
    if (context.userInput.includes('用户')) return '用户管理'
    if (context.userInput.includes('订单')) return '订单处理'
    return '通用表单'
  }
}

export default PromptBuilder
