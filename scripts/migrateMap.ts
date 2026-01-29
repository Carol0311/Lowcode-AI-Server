export const migrateList = [
  { name: 'pages', priority: 1 },
  { name: 'conversation_sessions', priority: 2 },
  { name: 'conversation_messages', priority: 3 },
  { name: 'collected_params', priority: 4 },
  { name: 'product_categories', priority: 5 },
  { name: 'goods_column', priority: 6 },
  { name: 'goods_instance', priority: 7 },
  { name: 'goods_data', priority: 8 },
]
export const migrateTemplate: Record<string, string> = {
  pages: `import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('pages', function (table) {
    table.string('id', 36).primary().notNullable().unique()
    table.string('name').notNullable()
    table.text('rootComponentIds').defaultTo('[]')
    table.json('components').defaultTo('{}')
    table.text('selectId').nullable()
    table.timestamp('create_at').defaultTo(knex.fn.now())
    table.timestamp('update_at').defaultTo(knex.fn.now())
  })
}
      
exports.down = function (knex: Knex) {
  return knex.schema.dropTable('pages')
}`,
  conversation_sessions: `import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('conversation_sessions', function (table) {
    table.string('session_id', 64).primary().notNullable().unique()
    table.string('user_id', 64).nullable()
    table.string('current_step', 32).defaultTo('init').checkIn(['init', 'collecting', 'generating', 'completed'], 'valid_step')
    table.string('product_category', 64).nullable().references('id').inTable('product_categories').onDelete('SET NULL')
    table.timestamp('create_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable()
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
    table.timestamp('create_at', { useTz: true }).defaultTo(knex.fn.now())
    table.index(['session_id'], 'idx_messages_session')
    table.index(['create_at'], 'idx_messages_create_at')
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
    table.timestamp('create_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable()
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
    table.string('name', 100).notNullable()
    table.text('description').nullable()
    table.jsonb('params').nullable()
    table.timestamp('create_at', { useTz: true }).defaultTo(knex.fn.now())
    table.timestamp('update_at', { useTz: true }).defaultTo(knex.fn.now())
    table.index(['id'], 'idx_categories_id')
  })
}
      
exports.down = function (knex: Knex) {
  return knex.schema.dropTableIfExists('product_categories')
}`,
  goods_column: `import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('goods_column', function (table) {
    table.increments('column_id').primary() //列字段唯一标识
    table.string('table_id', 64).notNullable()
    table.string('field_id', 64).notNullable() //存放列字段id
    table.string('field_name', 64).notNullable() //存放列字段名称
    table.enu('field_type', ['text', 'textarea', 'select', 'checkbox', 'date', 'daterange', 'number', 'price', 'qty', 'switch', 'img', 'address']).notNullable()

    table.integer('sort_order').defaultTo(0)
    table.boolean('hidden').defaultTo(false)
    table.boolean('require').defaultTo(false)
    table.boolean('disable').defaultTo(false)
    table.boolean('readonly').defaultTo(false)
    table.jsonb('options').defaultTo('{}')

    table.timestamp('create_at', { useTz: true }).defaultTo(knex.fn.now())
    table.timestamp('update_at', { useTz: true }).defaultTo(knex.fn.now())

    table.unique(['table_id', 'field_id'])
  })
}
      
exports.down = function (knex: Knex) {
  return knex.schema.dropTableIfExists('goods_column')
}`,
  goods_instance: `import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('goods_instance', function (table) {
    table.increments('instance_id').primary() //商品实例唯一标识
    table.string('table_id', 64).notNullable()
    table.string('product_id', 128).notNullable() //商品id
    table.string('product_name', 255).notNullable() //商品名称
    table.boolean('status').defaultTo(1) //启用或禁用

    table.timestamp('create_at', { useTz: true }).defaultTo(knex.fn.now())
    table.timestamp('update_at', { useTz: true }).defaultTo(knex.fn.now())

    table.unique(['table_id', 'instance_id'])
    table.index(['table_id', 'status'], 'idx_instance_status')
  })
}
      
exports.down = function (knex: Knex) {
  return knex.schema.dropTableIfExists('goods_instance')
}`,
  goods_data: `import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('goods_data', function (table) {
    table.increments('data_id').primary()
    table.string('table_id', 64).notNullable()
    table.integer('column_id').notNullable().references('column_id').inTable('goods_column').onDelete('CASCADE')
    table.integer('instance_id').notNullable().references('instance_id').inTable('goods_instance').onDelete('CASCADE')

    table.text('value_text').nullable()
    table.decimal('value_number', 15, 4).nullable()
    table.boolean('value_boolean').nullable()
    table.jsonb('value_object').nullable()
    table.timestamp('value_date').nullable()

    table.unique(['instance_id', 'column_id'])

    table.index(['instance_id'], 'idx_data_instance')
    table.index(['column_id'], 'idx_data_config')
    table.index(['instance_id', 'column_id'], 'idx_data_instance_config')
  })
}
      
exports.down = function (knex: Knex) {
  return knex.schema.dropTableIfExists('goods_data')
}`,
}
