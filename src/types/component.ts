//component schema
export type ComponentType =
  | 'FormItem'
  | 'Text'
  | 'Date'
  | 'DateRange'
  | 'SSelect'
  | 'Switch'
  | 'Info'
  | 'Number'
  | 'Price'
  | 'Qty'
  | 'Radio'
  | 'RadioGroup'
  | 'SCheckbox'
  | 'CheckboxGroup'
  | 'TextArea'
  | 'Upload'
  | 'Address'
  | 'Image'
  | 'Search'
  | 'CategorySearch'
  | 'AdvanceForm'
  | 'Container'
  | 'EvelatorForm'
  | 'Form'
export interface ComponentProps {
  /**表单项参数 smart-form-item级别*/
  cid: string // 不可变，用于定位页面组件节点
  parent: string //不可变，用于定位页面组件直接父节点节点
  name: string //组件类型名称
  col?: 1 | 2 | 3 | 4 //占父级容器的列数对应["一列","二列","三列","四列"]
  label: string //label done
  //switchChild?:boolean,//是否开启子表单
  errTip?: string //校验错误提示done
  helpTip?: string //帮助提示done
  validateStatus?: 0 | 1 | 2 | 3 //校验状态对应["error","success","loading","warning"]done
  size: 0 | 1 | 2 //尺寸对应["small","medium","large"]
  tip?: boolean //开启后标题旁边会有圆圈tip,内容是label名称done
  device: 0 | 1 | 2 //当前表单项用于哪个设备，对应["phone","tablet","desktop"]
  require?: boolean //是否必填done
  //fullWidth:boolean,//没看懂，待定
  preview?: boolean //是否在设计器中预览即时样式
  autoValidate?: boolean //是否自动校验

  /**组件参数 针对如input层级*/
  //preLabel?:string,//label在左或者上时，输入框内部左侧的文本
  defaultVal?: string //默认值
  placeholder?: string //输入提示done
  maxLength?: number //输入框的maxLength done
  clear?: boolean //输入框focus时内部右侧显示清除图标done
  disable?: boolean //输入框显示禁用 done
  //keepAll?:boolean,//输入框内容超出maxLength限制时是否显示
  //breakWord?:boolean,//输入框内容超出maxLength限制时是否截断不显示
  readonly?: boolean //是否只读
  hover?: boolean //综合hover disable readonly使用
  trim?: boolean //是否自动去除头尾空字符串 pending
  border: boolean //是否显示输入框边框done
  focus?: boolean //输入框是否自动聚焦done
  showIcon?: boolean //输入框内部右侧是否显示选择的图标done
  //beforeTxt?:string,//输入框内部左侧文字
  //afterTxt?:string,//输入框内部右侧文字
  //beforeBox?:string,//输入框外部左侧文字
  //afterBox?:string,//输入框外部右侧文字

  /**表单项直接父级容器设置参数*/
  tabTitle?: string
  direct?: number //flex-direction column row
  flexDirect?: string
  showAnchor?: boolean
  tabStatus?: 0 | 1 //容器整体设置表单项状态 ["只读态","编辑态"]done
  tabLayout?: 1 | 2 | 3 | 4 //容器整体设置一行有几列表单项，对应["一列","二列","三列","四列"]
  labelPos: 'left' | 'top' | 'inner' //表单项的标签位置done
  labelAlign: 0 | 1 //容器整体设置表单项标签对齐位置标签["left","right"]done

  isContainer?: boolean //是否是容器组件
  parentDirect?: string //容器flex-direction   row | column

  /**表单项inputBox层级的样式*/
  inlineStyle: Record<string, any> //设计器样式面板设置的样式最终会以字符串的形式拼接起来done
}
export interface ComponentSchema {
  id: string
  parentId: string | null
  type: ComponentType
  props: ComponentProps
  children: string[] //保存子节点id
}
