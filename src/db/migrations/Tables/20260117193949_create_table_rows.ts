import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('table_rows', function (table) {
    table.increments('rowId').primary()
    table.string('instanceId', 64).notNullable().references('instanceId').inTable('table_instance').onDelete('CASCADE')

    // AI相关
    //session对话删除，关联的数据session_id置空，数据不删除
    table.string('session_id', 64).nullable().references('session_id').inTable('conversation_sessions').onDelete('SET NULL')
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
}
