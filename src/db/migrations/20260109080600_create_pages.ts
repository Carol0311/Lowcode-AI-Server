import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('pages', function (table) {
    table.string('id', 36).primary().notNullable().unique()
    table.string('name').notNullable()
    table.text('rootComponentIds').defaultTo('[]')
    table.json('components').defaultTo('{}')
    table.text('selectId').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}
      
exports.down = function (knex: Knex) {
  return knex.schema.dropTable('pages')
}