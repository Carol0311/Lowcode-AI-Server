import type { Knex } from 'knex'
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
}
