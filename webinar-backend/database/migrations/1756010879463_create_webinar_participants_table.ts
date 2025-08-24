import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'webinar_participants' // fixed typo

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('email').notNullable().unique()
      table.string('token').notNullable()
      table.integer('webinar_id').unsigned().references('id').inTable('webinars')
      table.enum('login_type', ['registered', 'guest']).notNullable().defaultTo('guest')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
