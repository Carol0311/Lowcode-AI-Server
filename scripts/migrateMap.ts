export const migrateList = [
  { name: 'pages', priority: 1 },
  { name: 'pages_data', priority: 2 },
  { name: 'conversation_sessions', priority: 3 },
  { name: 'conversation_messages', priority: 4 },
  { name: 'collected_params', priority: 5 },
  { name: 'product_categories', priority: 6 },
  { name: 'table_instance', priority: 7 },
  { name: 'table_columns', priority: 8 },
  { name: 'table_rows', priority: 9 },
  { name: 'system_table_rows', priority: 10 },
]
export const migrateTemplate: Record<string, string> = {
  pages: `import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('pages', function (table) {
      table.string('id', 36).primary().notNullable()
      table.string('pageId', 36).notNullable().unique()
      table.string('name').notNullable()
      table.text('rootComponentIds').defaultTo('[]')
      table.jsonb('components').defaultTo('{}')
      table.text('selectId').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTable('pages')
  }`,
  pages_data: `import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('pages_data', function (table) {
      table.string('id', 36).primary().notNullable().references('id').inTable('pages').onDelete('CASCADE')
      table.string('pageId', 36).notNullable().unique().references('pageId').inTable('pages').onDelete('CASCADE').onUpdate('CASCADE')
      table.jsonb('datas').defaultTo('{}')
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())
  
      table.index(['pageId'], 'idx_datas_pageId')
      table.index(['id'], 'idx_datas_id')
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTable('pages_data')
  }`,
  conversation_sessions: `import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('conversation_sessions', function (table) {
      table.string('session_id', 64).primary().notNullable().unique()
      table.string('user_id', 64).nullable()
      table.text('title').nullable()
      table.string('current_step', 32).defaultTo('init').checkIn(['init', 'collecting', 'generating', 'completed'], 'valid_step')
      table.string('product_category', 64).nullable().references('id').inTable('product_categories').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable()
      table.timestamp('last_active', { useTz: true }).defaultTo(knex.fn.now()).notNullable()
      table.boolean('is_completed').defaultTo(false)
      table.index(['is_completed', 'last_active'], 'idx_sessions_cleanup')
      table.index(['user_id'], 'idx_sessions_user')
      table.index(['product_category'], 'idx_sessions_category')
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('conversation_sessions')
  }`,
  conversation_messages: `import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('conversation_messages', function (table) {
      table.increments('id').primary()
      table.string('session_id', 64).notNullable().references('session_id').inTable('conversation_sessions').onDelete('CASCADE')
      table.enum('role', ['system', 'user', 'assistant']).notNullable()
      table.text('content')
      table.text('metadata').defaultTo('{}')
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
      table.index(['session_id'], 'idx_messages_session')
      table.index(['created_at'], 'idx_messages_created_at')
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('conversation_messages')
  }`,
  collected_params: `import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('collected_params', function (table) {
      table.increments('id').primary()
      table.string('session_id', 64).notNullable().references('session_id').inTable('conversation_sessions').onDelete('CASCADE')
      table.string('param_key', 64).notNullable()
      table.text('param_value').defaultTo('{}')
      table.string('param_type', 32).checkIn(['string', 'number', 'boolean', 'array'], 'valid_param_type').defaultTo('string')
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable()
      table.index(['session_id'], 'idx_params_session')
      table.index(['param_key'], 'idx_params_key')
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('collected_params')
  }`,
  product_categories: `import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('product_categories', function (table) {
      table.string('id', 64).primary()
      table.string('key', 64).notNullable()
      table.string('name', 100).notNullable()
      table.text('description').nullable()
      table.jsonb('params').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())
      table.index(['id'], 'idx_categories_id')
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('product_categories')
  }`,
  table_instance: `import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('table_instance', function (table) {
      // ========== 主键 ==========
      table.string('instanceId', 64).primary()
  
      // ========== 关联信息 ==========
      table.string('tableId', 64).notNullable() // 关联table组件id
      table.string('pageId', 36).notNullable().references('pageId').inTable('pages').onDelete('CASCADE').onUpdate('CASCADE') // 关联页面id
  
      // ========== 基本信息 ==========
      table.string('name', 128).notNullable()
      table.string('description', 255).nullable()
  
      // ========== 大数据表格配置 ==========
      // 虚拟滚动配置
      table.jsonb('virtualScroll').defaultTo('{"enabled":true,"rowHeight":40,"bufferSize":20,"overscan":5,"useWebWorker":true}')
  
      // 分页配置（预留扩展，但大数据场景可能禁用）
      table.jsonb('pagination').defaultTo('{"enabled":false,"pageSize":100,"currentPage":1}')
  
      // 过滤和搜索
      table.jsonb('filter').defaultTo('{}')
      table.jsonb('search').defaultTo('{}')
  
      //分组
      table.boolean('isGroup').defaultTo(false) //是否为分组表格
      table.jsonb('groupBy').defaultTo('{}') //后续根据需要扩展
  
      // 排序配置
      table.jsonb('sort').defaultTo('{"field":"","order":"asc"}')
  
      // ========== 状态 ==========
      table.boolean('isActive').defaultTo(true)
      table.boolean('isSystem').defaultTo(false)
  
      // ========== 来源 ==========
      table.string('source', 32).defaultTo('system') // 'system' | 'ai' | 'user'
      table.string('session_id', 64).nullable().references('session_id').inTable('conversation_sessions').onDelete('CASCADE') // AI对话会话ID
  
      // ========== 元数据 ==========
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())

  
      // ========== 10. 索引 ==========
      table.index(['pageId'], 'idx_instance_pageId')
      table.index(['isActive', 'source'])
      table.index(['isGroup'], 'idx_instance_group') // 分组查询优化
      table.unique(['tableId']) // 唯一索引本身就能加速查询
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('table_instance')
  }`,
  table_columns: `import type { Knex } from 'knex'
  const columnTypes = ['Text', 'Date', 'DateRange', 'SSelect', 'Switch', 'Number', 'Price', 'Qty', 'SCheckbox', 'TextArea', 'Address', 'Image', 'Button', 'MenuButton', 'ButtonGroup', 'Operation']
  const defaultProps = {
    align: 'left',
    sortOrder: 0,
    hidden: false,
    require: false,
    disable: false,
    readonl: false,
    editable: true,
    resizable: true,
    sortable: true,
    filterable: true,
    minWidth: 60,
    inTable: true,
    isLowCode: false,
  }
  
  const defaultPropsStr = JSON.stringify(defaultProps)
  
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('table_columns', function (table) {
      table.increments('id').primary() //列字段唯一标识
      table.string('instanceId', 64).notNullable().references('instanceId').inTable('table_instance').onDelete('CASCADE')
      table.string('key', 64).notNullable() //存放列字段id
      table.string('name', 64).notNullable() //存放列字段名称
      table.enu('type', columnTypes).notNullable()
  
      table.jsonb('props').defaultTo(defaultPropsStr)
  
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())
  
      table.index(['key'], 'idx_column_key')
      table.index(['instanceId'], 'idx_column_instanceId')
      table.unique(['instanceId', 'key'])
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('table_columns')
  }`,
  table_rows: `import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('table_rows', function (table) {
      table.increments('rowId').primary()
      table.string('instanceId', 64).notNullable().references('instanceId').inTable('table_instance').onDelete('CASCADE')
  
      // AI相关
      table.string('session_id', 64).nullable().references('session_id').inTable('conversation_sessions').onDelete('CASCADE')
      table.boolean('isAIGenerated').defaultTo(false)
  
      //行数据值
      table.jsonb('data').defaultTo('{}')
  
      table.string('rowCode', 128).notNullable()
      table.string('rowName', 255).notNullable()
  
      table.integer('sortOrder').defaultTo(0)
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())
  
      table.index(['rowCode'], 'idx_rows_rowCode')
      table.index(['instanceId'], 'idx_rows_instanceId')
      table.index(['instanceId', 'sortOrder'])
      table.unique(['instanceId', 'rowCode'])
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('table_rows')
  }`,
  system_table_rows: `import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('system_table_rows', function (table) {
      table.increments('rowId').primary()
      table.string('instanceId', 64).notNullable()
  
      //行数据值
      table.jsonb('data').defaultTo('{}')
  
      table.string('rowCode', 128).notNullable()
      table.string('rowName', 255).notNullable()
  
      table.integer('sortOrder').defaultTo(0)
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())
  
      table.index(['rowCode'], 'idx_system_rowCode')
      table.index(['instanceId'], 'idx_system_instanceId')
      table.index(['instanceId', 'sortOrder'])
      table.unique(['instanceId', 'rowCode'])
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('system_table_rows')
  }`,
}
