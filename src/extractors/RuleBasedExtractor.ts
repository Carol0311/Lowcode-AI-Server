import { KeyWords } from './keyWords'
export class RuleBasedExtractor {
  extract(text: string): { category?: string; brand?: string; product?: string } {
    const result: any = {}
    const lowerText = text.toLowerCase()

    for (let [key, entity] of Object.entries(KeyWords)) {
      for (const [type, value] of Object.entries(entity)) {
        if (value.some((keyword) => lowerText.includes(keyword.toLowerCase()))) {
          result[key] = type
        }
      }
    }

    return result
  }
}
