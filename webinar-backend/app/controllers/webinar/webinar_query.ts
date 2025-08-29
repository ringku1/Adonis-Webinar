import Webinar from '#models/webinar'
import WebinarParticipant from '#models/webinar_participant'

export default class WebinarQuery {
  // Create a new webinar
  public async create(payload: any) {
    return await Webinar.create(payload)
  }
  public async find(webinarId: number) {
    return await Webinar.find(webinarId)
  }
  public async query(email: string, webinarId: number) {
    return await WebinarParticipant.query()
      .where('email', email)
      .andWhere('webinar_id', webinarId)
      .first()
  }
  public async queryParticipants() {
    return await WebinarParticipant.query().orderBy('created_at', 'desc')
  }
  public async queryParticipant(email: string, webinarId: number) {
    return await WebinarParticipant.query()
      .where('email', email)
      .andWhere('webinar_id', webinarId)
      .first()
  }
}
