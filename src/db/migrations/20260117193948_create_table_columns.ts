import type { Knex } from 'knex'
  const columnTypes = ['Text', 'Date', 'DateRange', 'SSelect', 'Switch', 'Number', 'Price', 'Qty', 'SCheckbox', 'TextArea', 'Address', 'Image', 'Button', 'MenuButton', 'ButtonGroup', 'Operation']
  const defaultProps = {
    align: 'left',
    sortOrder: 0,
    hidden: false,
    require: false,
    disable: false,
    readonl: false,
    editable: true,
    resizable: true,
    sortable: true,
    filterable: true,
    minWidth: 60,
    inTable: true,
    isLowCode: false,
  }
  
  const defaultPropsStr = JSON.stringify(defaultProps)
  
  exports.up = function (knex: Knex) {
    return knex.schema.createTable('table_columns', function (table) {
      table.increments('id').primary() //列字段唯一标识
      table.string('instanceId', 64).notNullable().references('instanceId').inTable('table_instance').onDelete('CASCADE')
      table.string('key', 64).notNullable() //存放列字段id
      table.string('name', 64).notNullable() //存放列字段名称
      table.enu('type', columnTypes).notNullable()
  
      table.jsonb('props').defaultTo(defaultPropsStr)
  
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())
  
      table.index(['key'], 'idx_column_key')
      table.index(['instanceId'], 'idx_column_instanceId')
      table.unique(['instanceId', 'key'])
    })
  }
  
  exports.down = function (knex: Knex) {
    return knex.schema.dropTableIfExists('table_columns')
  }