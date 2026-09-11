import type { Knex } from 'knex'
exports.up = function (knex: Knex) {
  return knex.schema.createTable('table_instance', function (table) {
    // ========== 主键 ==========
    table.string('instanceId', 64).primary()

    // ========== 关联信息 ==========
    table.string('tableId', 64).notNullable() // 关联table组件id
    table.string('pageId', 36).notNullable().references('pageId').inTable('pages').onDelete('CASCADE').onUpdate('CASCADE') // 关联页面id

    // ========== 基本信息 ==========
    table.string('name', 128).notNullable()
    table.string('description', 255).nullable()

    // ========== 大数据表格配置 ==========
    // 虚拟滚动配置
    table.jsonb('virtualScroll').defaultTo('{"enabled":true,"rowHeight":40,"bufferSize":20,"overscan":5,"useWebWorker":true}')

    // 分页配置（预留扩展，但大数据场景可能禁用）
    table.jsonb('pagination').defaultTo('{"enabled":false,"pageSize":100,"currentPage":1}')

    // 过滤和搜索
    table.jsonb('filter').defaultTo('{}')
    table.jsonb('search').defaultTo('{}')

    //分组
    table.boolean('isGroup').defaultTo(false) //是否为分组表格
    table.jsonb('groupBy').defaultTo('{}') //后续根据需要扩展

    // 排序配置
    table.jsonb('sort').defaultTo('{"field":"","order":"asc"}')

    // ========== 状态 ==========
    table.boolean('isActive').defaultTo(true)
    table.boolean('isSystem').defaultTo(false)

    // ========== 来源 ==========
    table.string('source', 32).defaultTo('system') // 'system' | 'ai' | 'user'
    //session对话删除，关联的数据session_id置空，数据不删除
    table.string('session_id', 64).nullable().references('session_id').inTable('conversation_sessions').onDelete('SET NULL') // AI对话会话ID

    // ========== 元数据 ==========
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now())

    // ========== 10. 索引 ==========
    table.index(['pageId'], 'idx_instance_pageId')
    table.index(['isActive', 'source'])
    table.index(['isGroup'], 'idx_instance_group') // 分组查询优化
    table.unique(['tableId']) // 唯一索引本身就能加速查询
  })
}

exports.down = function (knex: Knex) {
  return knex.schema.dropTableIfExists('table_instance')
}
