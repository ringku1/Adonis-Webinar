import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'webinars'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('topic', 50).notNullable()
      table.text('agenda').notNullable()
      table.timestamp('start_time').notNullable()
      table.string('cf_meeting_id', 100).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
