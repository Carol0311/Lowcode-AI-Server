import type { Knex } from 'knex'
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
}