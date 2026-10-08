import type { Knex } from 'knex'
exports.seed = async (knex: Knex) => {
  //const env = process.env.NODE_ENV || 'development'
  //表存在且数据为空才允许插入种子数据
  //const isExist = await knex('product_categories').count('* as count').first()
  //const allowInsert = isExist && parseInt(isExist.count as string) === 0
  //if (env === 'development') {
  //if (allowInsert) {
  //测试期所有环境都允许插入种子数据

  //通用标准字段模版
  const standardModel: Record<string, any> = {
    product_name: { type: 'Text', index: 0, label: '商品名称', layout_group: 'basic' },
    category: { type: 'SSelect', index: 1, label: '商品分类', layout_group: 'basic' },
    brand: { type: 'Text', index: 2, label: '品牌', layout_group: 'basic' },
    price: { type: 'Price', index: 3, label: '销售价', layout_group: 'basic' },
    sku: { type: 'Text', index: 4, label: '规格信息', layout_group: 'basic' },
    b2bOrderUnit: { type: 'SSelect', index: 5, label: 'B2B订货单位', layout_group: 'b2b' },
    b2bOrderCtrl: { type: 'SCheckbox', index: 6, label: 'B2B订货控制', layout_group: 'b2b' },
    minOrderQuantity: { type: 'Number', index: 7, label: '最小订货量', layout_group: 'b2b' },
    incrementUnit: { type: 'Number', index: 8, label: '单位增量', layout_group: 'b2b' },
    maxOrderQuantity: { type: 'Number', index: 9, label: '最大订货量', layout_group: 'b2b' },
    isLaunch: { type: 'SCheckbox', index: 10, label: '是否上架', layout_group: 'b2c' },
    rebate: { type: 'Number', index: 11, label: '折扣', layout_group: 'b2c' },
    pictureDetail: { type: 'Image', index: 12, label: '图片详情', layout_group: 'detail' },
    descDetail: { type: 'TextArea', index: 13, label: '商品详情', layout_group: 'detail' },
    additionInfo: { type: 'TextArea', index: 14, label: '补充信息', layout_group: 'detail' },
  }
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
          regx: new RegExp('色|color|colour', 'g'),
          options: ['白色', '黑色', '银色', '金色', '红色', '黄色', '蓝色', '其他'],
        },
        {
          key: 'memory',
          label: '内存',
          regx: new RegExp('^16gb?|^12GB?|^8GB?', 'gi'),
          options: ['8GB', '12GB', '16GB'],
        },
        {
          key: 'storage',
          label: '存储',
          regx: new RegExp('^128gb?|^256GB?|^512GB?|^1TB', 'gi'),
          options: ['128GB', '256GBG', '512GB'],
        },
      ]),
      model: JSON.stringify(standardModel),
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
          regx: new RegExp('XS|S|M|L|XL|XXL', 'gi'),
          options: ['S', 'M', 'L'],
        },
        {
          key: 'color',
          label: '颜色',
          regx: new RegExp('色|color|colour', 'g'),
          options: ['白色', '黑色', '红色', '黄色', '蓝色', '其他'],
        },
        {
          key: 'material',
          label: '材质',
          options: ['全棉', '聚酯纤维', '真丝', '莱塞尔', '混纺', '其他'],
        },
      ]),
      model: JSON.stringify(standardModel),
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
          regx: new RegExp('g|kg', 'gi'),
          options: ['100g', '200g', '300g', '500g', '大于500g'],
        },
        {
          key: 'type',
          label: '产品类型',
          options: ['膨化食品', '奶制品', '肉类产品', '坚果', '其他'],
        },
        {
          key: 'entity',
          label: '包装规格',
          regx: new RegExp('包|箱|袋|杯', 'g'),
          options: ['1包', '1箱', '1杯', '1袋'],
        },
      ]),
      model: JSON.stringify(standardModel),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ])
  //}
  /** } else if (env === 'production') {
  } else if (env === 'test') {
  }*/
}
