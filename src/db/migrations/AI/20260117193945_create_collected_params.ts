import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('collected_params', function (table) {
      table.increments('id').primary()
      table.string('session_id', 64).notNullable().references('session_id').inTable('conversation_sessions').onDelete('CASCADE')
      table.string('param_key', 64).notNullable()
      table.text('param_value').defaultTo('{}')
      table.string('param_type', 32).checkIn(['string', 'number', 'boolean', 'array'], 'valid_param_type').defaultTo('string')
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable()
      table.index(['session_id'], 'idx_params_session')
      table.index(['param_key'], 'idx_params_key')
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('collected_params')
  }