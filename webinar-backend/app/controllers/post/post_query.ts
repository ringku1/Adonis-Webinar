import Webinar from '#models/webinar'

export default class PostQuery {
  // Create a new webinar
  public async create(payload: any) {
    return await Webinar.create(payload)
  }
}
