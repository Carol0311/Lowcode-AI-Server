exports.up = function(knex) {
    return knex.schema.createTable('pages', function(table) {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.string('description')
        table.json('schema').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now())
        table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('pages')
}