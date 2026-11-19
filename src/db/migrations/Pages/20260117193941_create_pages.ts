import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('pages', function (table) {
    table.string('id', 36).primary().notNullable()
    table.string('pageId', 36).notNullable().unique()
    table.string('name').notNullable()
    table.json('rootComponentIds').nullable()
    table.json('components').nullable()
    table.text('selectId').nullable()
    //是否为系统预置页面
    table.boolean('isSystem').defaultTo(0)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex: Knex) {
  return knex.schema.dropTable('pages')
}
