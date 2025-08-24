import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Webinar extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare topic: string

  @column()
  declare agenda: string

  @column()
  declare start_time: DateTime | string

  @column()
  declare cf_meeting_id: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}
