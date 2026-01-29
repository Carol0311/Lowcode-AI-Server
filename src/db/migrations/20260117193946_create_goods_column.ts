import type { Knex } from 'knex'
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
}