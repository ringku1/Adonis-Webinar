import Webinar from '#models/webinar'
import WebinarParticipant from '#models/webinar_participant'

export default class WebinarQuery {
  // Create a new webinar
  public async createWebinar(payload: any) {
    return await Webinar.create(payload)
  }
  public async findWebinar(webinar_id: number) {
    return await Webinar.find(webinar_id)
  }
  public async findParticipant(payload: any) {
    return await WebinarParticipant.query()
      .where('email', payload.email)
      .andWhere('webinar_id', payload.webinar_id)
      .first()
  }
  public async createParticipant(payload: any) {
    return await WebinarParticipant.create(payload)
  }
  public async queryParticipants() {
    return await WebinarParticipant.query().orderBy('created_at', 'desc')
  }
  // public async queryParticipant(email: string, webinarId: number) {
  //   return await WebinarParticipant.query()
  //     .where('email', email)
  //     .andWhere('webinar_id', webinarId)
  //     .first()
  // }
}
