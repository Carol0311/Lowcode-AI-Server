import type { Knex } from 'knex'
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('conversation_sessions', function (table) {
      table.string('session_id', 64).primary().notNullable().unique()
      table.string('user_id', 64).nullable()
      table.text('title').nullable()
      table.string('current_step', 32).defaultTo('init').checkIn(['init', 'collecting', 'generating', 'completed'], 'valid_step')
      table.string('product_category', 64).nullable().references('id').inTable('product_categories').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable()
      table.timestamp('last_active', { useTz: true }).defaultTo(knex.fn.now()).notNullable()
      table.boolean('is_completed').defaultTo(false)
      table.index(['is_completed', 'last_active'], 'idx_sessions_cleanup')
      table.index(['user_id'], 'idx_sessions_user')
      table.index(['product_category'], 'idx_sessions_category')
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('conversation_sessions')
  }