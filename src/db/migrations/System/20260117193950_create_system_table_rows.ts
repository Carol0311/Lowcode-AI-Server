import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('system_table_rows', function (table) {
      table.increments('rowId').primary()
      table.string('instanceId', 64).notNullable()
  
      //行数据值
      table.jsonb('data').defaultTo('{}')
  
      table.string('rowCode', 128).notNullable()
      table.string('rowName', 255).notNullable()
  
      table.integer('sortOrder').defaultTo(0)
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())
  
      table.index(['rowCode'], 'idx_system_rowCode')
      table.index(['instanceId'], 'idx_system_instanceId')
      table.index(['instanceId', 'sortOrder'])
      table.unique(['instanceId', 'rowCode'])
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('system_table_rows')
  }