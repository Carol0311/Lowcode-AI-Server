import { OpenAI } from 'openai'

export class AIFallbackExtractor {
  private openai: OpenAI

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey })
  }

  async extractWithAI(text: string): Promise<{
    category?: string
    brand?: string
    product_name?: string
    specs?: string[]
  }> {
    const prompt = `从以下用户输入中提取商品信息。请以JSON格式返回：
    
输入："${text}"

提取以下字段：
1. category：商品品类（如：手机、电脑、服装、食品）
2. brand：品牌（如：华为、苹果、耐克）
3. product_name：商品具体名称
4. specs：可能的规格参数（如：颜色、尺寸、内存）

如果某个字段无法确定，请设为null。

只返回JSON，不要其他文字。`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
      })

      const content = response.choices[0].message.content || ''
      // 提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return {}
    } catch (error) {
      console.error('AI提取失败:', error)
      return {}
    }
  }
}
