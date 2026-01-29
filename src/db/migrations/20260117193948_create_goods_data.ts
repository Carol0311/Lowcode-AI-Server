import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('goods_data', function (table) {
    table.increments('data_id').primary()
    table.string('table_id', 64).notNullable()
    table.integer('column_id').notNullable().references('column_id').inTable('goods_column').onDelete('CASCADE')
    table.integer('instance_id').notNullable().references('instance_id').inTable('goods_instance').onDelete('CASCADE')

    table.text('value_text').nullable()
    table.decimal('value_number', 15, 4).nullable()
    table.boolean('value_boolean').nullable()
    table.jsonb('value_object').nullable()
    table.timestamp('value_date').nullable()

    table.unique(['instance_id', 'column_id'])

    table.index(['instance_id'], 'idx_data_instance')
    table.index(['column_id'], 'idx_data_config')
    table.index(['instance_id', 'column_id'], 'idx_data_instance_config')
  })
}
      
exports.down = function (knex: Knex) {
  return knex.schema.dropTableIfExists('goods_data')
}