import type { Knex } from 'knex'
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
}