import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('pages_data', function (table) {
    table.string('id', 36).primary().notNullable().references('id').inTable('pages').onDelete('CASCADE')
    table.string('pageId', 36).notNullable().references('pageId').inTable('pages').onDelete('CASCADE').onUpdate('CASCADE')
    table.json('datas').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())

    table.index(['pageId'], 'idx_datas_pageId')
    table.index(['id'], 'idx_datas_id')
  })
}

exports.down = function (knex: Knex) {
  return knex.schema.dropTable('pages_data')
}
