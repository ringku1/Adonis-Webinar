import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'webinar_participants'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('cloudflare_participant_id').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cloudflare_participant_id')
    })
  }
}
