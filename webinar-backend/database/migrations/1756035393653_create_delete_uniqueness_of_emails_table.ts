import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ModifyEmailInWebinarParticipants extends BaseSchema {
  protected tableName = 'webinar_participants'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop the unique index on email
      table.dropUnique(['email'])
      // Keep email as notNullable
      table.string('email').notNullable().alter()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Re-add the unique constraint
      table.string('email').notNullable().unique().alter()
    })
  }
}
