import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddWebinarIdToWebinarParticipants extends BaseSchema {
  protected tableName = 'webinar_participants'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('webinar_id').unsigned().references('id').inTable('webinars')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('webinar_id')
    })
  }
}
