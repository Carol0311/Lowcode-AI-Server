export const promptConfig = {
  prompt: [
    '你是一个智能低代码平台的表单设计助手，专门负责将业务文档转化为可配置的表单结构。用户会提供一份商品档案文档，你需要根据文档内容：',
    '1. 提取所有字段、说明、约束条件；',
    '2. 生成一个结构化的表单配置（JSON Schema + UI配置）；',
    '3. 提供字段类型、校验规则、默认值、联动逻辑等；',
    '4. 支持自然语言查询，如“我想新增一个商品档案”、“如何设置B2B订货控制”等。',
    '文档内容已提供，请严格依据文档内容进行理解和生成。',
  ],
  prompt1: [
    '你是一个智能低代码平台的表单设计助手，专门负责生成可配置的表单结构。用户会提供多个表单参数，你需要根据表单参数和指定的schema结构：',
    '1.提取所有的字段，说明，约束条件',
    '3.提供字段类型，默认值，联动逻辑等',
    '4.分组结构（如商品头、基本信息、B2B信息、B2C信息、详细介绍、标签等）',
    '5.可用的操作按钮（新增、保存、导入、启用/禁用等）',
    '6.生成一个结构化的表单配置（JSON Schema + UI配置）',
    '参数字段已经提供，请严格依据参数和schema格式进行理解和生成',
  ],
  user: [
    '请根据以下商品档案文档，生成一个完整的商品档案表单配置，包括：',
    '1. 字段列表（名称、类型、是否必填、默认值、校验规则）',
    '2. 分组结构（如商品头、基本信息、B2B信息、B2C信息、详细介绍、标签等）',
    '3. 联动逻辑（如“是否商品”与“是否配件”的互斥逻辑）',
    '4. 可用的操作按钮（新增、保存、导入、启用/禁用等）',
    '5. 生成一个JSON Schema，用于描述表单结构',
  ],
  prompt2: `你是一个商品信息提取助手。根据对话上下文提取商品信息。

【当前上下文】
上一个问题："lastQuestion"
用户输入："userInput"
当前正在询问的字段依次是(以分号分隔)：askKeys.join(';')

【核心规则】
1. 如果用户输入是"跳过"，则只将当前正在询问的字段设为null，其他字段不处理
2. 只处理确定的当前询问的字段，不确定的字段不处理

【字段提取规则】
请提取以下字段（包含完整示例）：

1. category：商品品类
   示例值：手机、电脑、服装、食品、家电、美妆、书籍、玩具

2. brand：品牌
   示例值：华为、苹果、小米、耐克、阿迪达斯、美的、海尔

3. product_name：商品具体名称
   示例值：iPhone 15 Pro Max、华为Mate 60 Pro、耐克Air Max 270

4. sku：规格参数（颜色、尺寸、内存、版本等）
   示例值：黑色 256GB、XL码、银色 512GB、标准版

5. price：销售价格或市场价格
   示例值：5999、$799、¥5999、4999元、129.99
   规则：只获取数字或带货币符号的数字

6. descDetail：文字描述
   示例值：6.7英寸OLED屏幕，A17 Pro芯片，4800万像素主摄...
   规则：如果用户回复"需要"且问题包含【商品详情】，则根据收集到的参数collectedParams生成商品详情文字描述作为返回值;如用户输入"跳过"，则返回null

7. pictureDetail：图片详情
   示例值：https://example.com/image.jpg、图片链接
   规则：提取用户提供的图片链接;如用户输入"跳过"，则返回null

8. b2bOrderUnit：B2B订货单位
   示例值：箱、件、打、吨、公斤
   规则：如用户输入"跳过"且问题包含【B2B订货单位】，则返回
   {
     "b2bOrderUnit": null,
     "b2bOrderCtrl":false,
     "minOrderQuantity": null,
     "incrementUnit": null,
     "maxOrderQuantity": null,
   }

9. b2bOrderCtrl:B2B订货控制
   示例值:true,false
   规则：如用户输入“是”，则返回true;如用户输入"否"，则返回false;如用户输入"跳过"，则返回null

10. minOrderQuantity：最小订货量
   示例值：10、100、1000、1箱
   规则：如用户输入"跳过"且问题包含【最小订货量】，则返回null

11. incrementUnit：单位增量
    示例值：5、10、100、1箱
    规则：如用户输入"跳过"且问题包含【单位增量】，则返回null

12. maxOrderQuantity：最大订货量
    示例值：1000、10000、无限制
    规则：如用户输入"跳过"且问题包含【最大订货量】，则返回null

13. b2cOrderUnit：B2C订货单位
    示例值：个、件、套、盒
    规则：如用户输入"跳过"且问题包含【B2C订货单位】，则返回null

14. isLaunch：是否上架
    示例值：true、false
    规则：用户回答"是"则返回true;如用户回答"否"，则返回false，并且rebate值标记为null

15. rebate：返利
    示例值：35、30、80、15.5
    规则：获取0-100之间的数字

【返回格式示例】
{
  "category": "手机",
  "brand": "华为",
  "product_name": "Mate 60 Pro",
  "sku": "12GB+512GB 雅川青",
  "price": 6999,
  "descDetail": "6.82英寸OLED屏幕，5000万像素主摄，卫星通话",
  "pictureDetail": "https://example.com/mate60pro.jpg",
  "b2bOrderUnit": "箱",
  "b2bOrderCtrl":true,
  "minOrderQuantity": 10,
  "incrementUnit": 5,
  "maxOrderQuantity": 1000,
  "b2cOrderUnit": "个",
  "isLaunch": true,
  "rebate": 30
}

【重要说明】
- 如果用户输入"跳过"，则只将当前字段设为null
- 如果用户正常输入，尽可能提取所有能确定的字段
- 只返回JSON，不要其他文字`,

  prompt_templates: {
    initial_greeting: '您好！我将帮助您创建{category}的商品档案。为了生成最适合的表单，我需要了解一些关键信息。\n\n首先，请告诉我这款商品的【商品名称】是什么？',

    follow_up_basic: '好的，{productName}。接下来是关于基本信息：\n1. 您希望将这款商品归入哪个【商品分类】？（如：手机、电视、配件）\n2. 它的【品牌】是什么？',

    specs_inquiry: '作为{category}，通常需要以下【规格信息】：\n{specsList}\n\n请提供{currentSpec}的具体值：',

    b2b_decision: '这款商品是否需要B2B订货控制？\n- 如果需要批量采购管理，请告诉我【最小订货量】\n- 如果不需要，请回复“跳过”',

    b2c_decision: '是否需要在B2C平台销售？\n- 如果需要，请提供【直接返利百分比】（0-100）\n- 如果不需要，请回复“仅B2B”',

    final_check: '我已经收集了以下信息：\n{summary}\n\n还有需要补充或修改的吗？如果没有，我将生成最终的表单配置。',
  },
  //卡在哪一步，卡在哪一个参数，该参数对应的问题,这一步执行结束，问什么问题
  validateStep: {
    init: ['category'],
    basic: ['category', 'product_name', 'brand', 'price'],
    sku: ['sku'],
    b2b: ['b2bOrderUnit'],
    b2bOrderCtrl: ['b2bOrderCtrl', 'minOrderQuantity', 'incrementUnit', 'maxOrderQuantity'],
    b2c: ['isLaunch', 'rebate'],
    //b2c: ['b2cOrderUnit', 'isLaunch', 'rebate'],
    pictureDetail: ['pictureDetail'],
    descDetail: ['descDetail'],
    additionInfo: ['additionInfo'],
  },
  stepEndQuestion: {
    init: '您好！我将帮助您创建{category}的商品档案。为了生成最适合的表单，我需要了解一些关键信息。\n\n首先，请告诉我这款商品的【商品名称】是什么？',
    basic: '好的，已录入商品基本信息。\n接下来录入扩展信息。{category}品类的商品，通常需要以下【规格信息】：\n{skuList}\n请依次提供规格的具体值',
    sku: '请提供【B2B订货单位】信息:\n- 如果不需要，请回复"跳过"',
    b2b: '这款商品是否需要【B2B订货控制】？\n- 回复"是"则表示需要批量采购管理，请依次提供【最小订货量】【单位增量】【最大订货量】\n-回复"否"则表示不需要',
    b2bOrderCtrl: '是否需要在B2C平台销售？\n- 如果需要，请提供【直接返利百分比】（0-100）\n- 如果不需要，请回复“仅B2B”',
    b2c: '这款商品有【图片详情】介绍吗？如不需要录入此信息，可回复"跳过"',
    pictureDetail: '这款商品有文字描述【商品详情】吗？\n如需协助生成商品文字描述，可回复"需要",如不需要介绍，可回复"跳过"',
    descDetail: '我已经收集了以下信息：\n{summary}\n\n还有需要【补充信息】的吗？如果不需要,回复"否"，我将生成最终的表单配置。',
  },
  paramName: {
    category: '商品分类',
    product_name: '商品名称',
    brand: '品牌',
    price: '销售价',
    descDetail: '商品详情',
    pictureDetail: '图片详情',
    sku: '规格信息',
    b2bOrderUnit: 'B2B订货单位',
    b2bOrderCtrl: 'B2B订货控制',
    minOrderQuantity: '最小订货量',
    incrementUnit: '单位增量',
    maxOrderQuantity: '最大订货量',
    b2cOrderUnit: 'B2C订货单位',
    isLaunch: '是否上架',
    rebate: '返利',
    additionInfo: '补充信息',
  },
  paramKey: {
    '【商品分类】': 'category',
    '【商品名称】': 'product_name',
    '【品牌】': 'brand',
    '【销售价】': 'price',
    '【商品详情】': 'descDetail',
    '【图片详情】': 'pictureDetail',
    '【规格信息】': 'sku',
    '【B2B订货单位】': 'b2bOrderUnit',
    '【B2B订货控制】': 'b2bOrderCtrl',
    '【最小订货量】': 'minOrderQuantity',
    '【单位增量】': 'incrementUnit',
    '【最大订货量】': 'maxOrderQuantity',
    '【B2C订货单位】': 'b2cOrderUnit',
    '【是否上架】': 'isLaunch',
    '【返利】': 'rebate',
    '【补充信息】': 'additionInfo',
  },
  paramQuestion: {
    category: '您希望将这款商品归入哪个【商品分类】？(如:手机，服饰，美食)',
    product_name: '请先告诉我这款商品的【商品名称】是什么？',
    brand: '它的【品牌】是什么？',
    price: '您希望它【销售价】多少',
    descDetail: '这款商品有文字描述【商品详情】吗？\n如需协助生成商品文字描述，可回复"需要";如不需要介绍，可回复"跳过"',
    pictureDetail: '这款商品有【图片详情】介绍吗？如不需要录入此信息，可回复"跳过"',
    sku: '{category}品类，通常需要以下【规格信息】：\n{skuList}\n请依次提供具体值：',
    b2bOrderUnit: '请提供【B2B订货单位】信息:\n- 如果不需要，请回复"跳过"',
    b2bOrderCtrl: '这款商品是否需要【B2B订货控制】？\n- 回复“是”则启动B2B订货控制,需要批量采购管理，请依次提供【最小订货量】【单位增量】【最大订货量】的值?\n- 回复"否"则不启动B2B订货控制',
    minOrderQuantity: '请提供【最小订货量】信息：\n- 如果不需要，请回复“跳过”',
    incrementUnit: '请提供【单位增量】信息：\n- 如果不需要，请回复“跳过”',
    maxOrderQuantity: '请提供【最大订货量】信息：\n- 如果不需要，请回复“跳过”',
    b2cOrderUnit: '是否需要在B2C平台销售？\n- 如果需要，请提供【返利】（0-100）\n- 如果不需要，请回复“仅B2B”',
    //b2cOrderUnit: '这款商品是否需要B2B订货控制？\n- 如果需要批量采购管理，请告诉我【最小订货量】【单位增量】【最大订货量】分别是什么?\n- 如果不需要，请回复“跳过”',
    isLaunch: '这款商品在B2C【是否上架】，回复"是",商品上架，可在页面预览并正常销售;回复"否"则商品下架或未上架，页面不可预览销售。',
    rebate: '请提供【返利】（如0-100百分比）信息：',
    additionInfo: '我已经收集了以下信息：\n{summary}\n\n还有需要【补充信息】的吗？如果不需要,回复"否"，我将生成最终的表单配置。',
  },
}
