import { Exception } from '@adonisjs/core/exceptions'
import PostQuery from './post_query.js'

export default class PostService {
  private postQuery: PostQuery

  constructor() {
    this.postQuery = new PostQuery()
  }

  public async create(payload: any) {
    // create webinar
    payload['cf_meeting_id'] = process.env.cf_meeting_id

    if (!payload.cf_meeting_id) {
      throw new Exception('Cf meeting id invalid / not found')
    }

    const webinar = await this.postQuery.create(payload)
    // get webinar ID
    const webinarId = webinar.id
    const joinUrl = `http://localhost:3000/register/${webinarId}`

    return { join_url: joinUrl }
  }
}
