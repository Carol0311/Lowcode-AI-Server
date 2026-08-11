import type { Knex } from 'knex'
import { generateUniqueId } from '../../utils/index'
import { createInsertTask } from '../../utils/tableTaskEmitter'
import { system_default_columns, SYSTEM_DEFAULT_TABLE_INSTANCE, SYSTEM_DEFAULT_TABLE_ROWS } from '../defaultData'

exports.seed = async (knex: Knex) => {
  //const env = process.env.NODE_ENV || 'development'

  //清空表
  await knex(SYSTEM_DEFAULT_TABLE_ROWS).del()
  await knex('table_columns').del()
  await knex('table_instance').del()
  await knex('pages_data').del()
  await knex('pages').del()

  //插入种子数据
  //创建系统默认的商品档案页面
  const id_goods = generateUniqueId('Page')
  await knex('pages').insert({
    id: id_goods,
    pageId: 'goods',
    name: '商品档案',
    rootComponentIds: JSON.stringify([]),
    components: JSON.stringify({}),
    isSystem: true,
    created_at: knex.fn.now(),
  })
  await knex('pages_data').insert({
    id: id_goods,
    pageId: 'goods',
    datas: '{}',
    created_at: knex.fn.now(),
  })

  //创建系统默认的商品档案列表页面
  const id_goodsList = generateUniqueId('Page')
  const tableId = generateUniqueId('Table')
  await knex('pages').insert({
    id: id_goodsList,
    pageId: 'goodsList',
    name: '商品档案列表',
    rootComponentIds: JSON.stringify([tableId]),
    components: JSON.stringify({
      [tableId]: {
        id: tableId,
        parentId: null,
        type: 'HybirdTable',
        props: {
          label: '分组表格',
          tableConfig: {
            name: '系统预置大数据分组表格',
            description: '用于测试大数据分组表格效果',
            instanceId: SYSTEM_DEFAULT_TABLE_INSTANCE,
            isGroup: true,
            isSystem: true,
            source: 'system',
            groupBy: {
              fields: [
                {
                  key: 'amount',
                  name: '单据金额',
                },
                {
                  key: 'date',
                  name: '到账日期',
                },
              ],
            },
          },
        },
        children: [],
      },
    }),
    isSystem: true,
    created_at: knex.fn.now(),
  })
  await knex('pages_data').insert({
    id: id_goodsList,
    pageId: 'goodsList',
    datas: '{}',
    created_at: knex.fn.now(),
  })

  //插入系统预置实例
  await knex('table_instance').insert({
    tableId,
    pageId: 'goodsList',
    name: '商品档案列表',
    instanceId: SYSTEM_DEFAULT_TABLE_INSTANCE,
    description: '系统预置:10万行数据分组列表',
    isGroup: true,
    isSystem: true,
    source: 'system',
    groupBy: JSON.stringify({
      fields: [
        {
          key: 'amount',
          name: '单据金额',
        },
        {
          key: 'date',
          name: '到账日期',
        },
      ],
    }),
    created_at: knex.fn.now(),
  })

  const columns = system_default_columns.map((column, index) => {
    column.instanceId = SYSTEM_DEFAULT_TABLE_INSTANCE
    return { ...column, sortOrder: index }
  })
  //插入与预置实例System_Default_Table_Instance相关的columns数据
  await knex('table_columns').insert(columns)

  //插入与预置实例System_Default_Table_Instance相关的行数据
  await createInsertTask()
}
