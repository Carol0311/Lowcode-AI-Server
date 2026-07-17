export const SYSTEM_TABLE_INSTANCE_LIST = ['System_Default_Table_Instance', 'System_Default_Edit_Table_Instance', 'System_Default_Group_Table_Instance']
export const SYSTEM_DEFAULT_TABLE_ROWS = 'system_table_rows'
export const SYSTEM_DEFAULT_TABLE_INSTANCE = 'System_Default_Table_Instance'
export const system_default_columns = [
  {
    instanceId: SYSTEM_DEFAULT_TABLE_INSTANCE,
    name: '公司',
    type: 'Text',
    key: 'company',
  },
  {
    instanceId: SYSTEM_DEFAULT_TABLE_INSTANCE,
    key: 'amount',
    name: '单据金额',
    type: 'Number',
  },
  {
    instanceId: SYSTEM_DEFAULT_TABLE_INSTANCE,
    key: 'currency',
    name: '币种',
    type: 'Text',
  },
  {
    instanceId: SYSTEM_DEFAULT_TABLE_INSTANCE,
    key: 'progress',
    name: '完成进度',
    type: 'Text',
  },
  {
    instanceId: SYSTEM_DEFAULT_TABLE_INSTANCE,
    key: 'date',
    name: '到账日期',
    type: 'Date',
  },
  {
    instanceId: SYSTEM_DEFAULT_TABLE_INSTANCE,
    key: 'operation',
    name: '操作',
    type: 'Operation',
  },
]
const generateLargeData = async (largeCount: number) => {
  const chunkSize = 1000
  const chunks: any[] = []

  for (let start = 0; start < largeCount; start += chunkSize) {
    await new Promise((resolve) => {
      const chunk = Array.from({ length: Math.min(chunkSize, largeCount - start) }, (_, i) => ({
        instanceId: SYSTEM_DEFAULT_TABLE_INSTANCE,
        rowCode: `System_default_data_${start + i}`,
        rowName: `大数据表格预置数据_${start + i}`,
        sortOrder: start + i,
        data: JSON.stringify({
          company: `XXXX技术有限公司${start + i}`,
          amount: 3456.0 + i,
          currency: 'CNY',
          progress: '100%',
          date: '2025-3-25',
          operation: ['edit', 'delete'],
        }),
      }))
      chunks.push(...chunk)
      resolve(1)
    })
  }
  return chunks
}
export const system_default_large_data = generateLargeData(100000)
