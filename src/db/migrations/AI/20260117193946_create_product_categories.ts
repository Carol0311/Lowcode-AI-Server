import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('product_categories', function (table) {
    table.string('id', 64).primary()
    table.string('key', 64).notNullable()
    table.string('name', 100).notNullable()
    table.text('description').nullable()
    table.jsonb('params').nullable()
    table.jsonb('model').nullable()
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())
    table.index(['id'], 'idx_categories_id')
  })
}

exports.down = function (knex: Knex) {
  return knex.schema.dropTableIfExists('product_categories')
}
