import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('conversation_messages', function (table) {
      table.increments('id').primary()
      table.string('session_id', 64).notNullable().references('session_id').inTable('conversation_sessions').onDelete('CASCADE')
      table.enum('role', ['system', 'user', 'assistant']).notNullable()
      table.text('content')
      table.text('metadata').defaultTo('{}')
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
      table.index(['session_id'], 'idx_messages_session')
      table.index(['created_at'], 'idx_messages_created_at')
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('conversation_messages')
  }