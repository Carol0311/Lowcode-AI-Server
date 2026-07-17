import type { Knex } from 'knex'
exports.seed = async (knex: Knex) => {
  //const env = process.env.NODE_ENV || 'development'
  //表存在且数据为空才允许插入种子数据
  //const isExist = await knex('product_categories').count('* as count').first()
  //const allowInsert = isExist && parseInt(isExist.count as string) === 0
  //if (env === 'development') {
  //if (allowInsert) {
  //测试期所有环境都允许插入种子数据
  await knex('product_categories').insert([
    {
      id: '手机',
      key: 'phone',
      name: '电子产品',
      description: '手机，电脑配件等',
      params: JSON.stringify([
        {
          key: 'model',
          label: '型号',
        },
        {
          key: 'color',
          label: '颜色',
        },
        {
          key: 'memory',
          label: '内存',
          options: ['8G', '12G', '16G'],
        },
        {
          key: 'storage',
          label: '存储',
          options: ['128GB', '256GBG', '512GB'],
        },
      ]),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: '服装',
      key: 'clothes',
      name: '服装',
      description: '服饰，配饰等',
      params: JSON.stringify([
        {
          key: 'size',
          label: '尺寸',
        },
        {
          key: 'color',
          label: '颜色',
        },
        {
          key: 'material',
          label: '材质',
        },
      ]),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: '食品',
      key: 'foods',
      name: '食品',
      description: '食品，零食等',
      params: JSON.stringify([
        {
          key: 'weight',
          label: '净含量',
        },
        {
          key: 'type',
          label: '产品类型',
        },
        {
          key: 'entity',
          label: '包装规格',
        },
      ]),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ])
  //}
  /** } else if (env === 'production') {
  } else if (env === 'test') {
  }*/
}
