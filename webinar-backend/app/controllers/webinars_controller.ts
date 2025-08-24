import Webinar from '#models/webinar'
import WebinarParticipant from '#models/webinar_participant'
import { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'

export default class WebinarController {
  // Create a new webinar
  async create(ctx: HttpContext) {
    let data = ctx.request.only(['topic', 'agenda', 'start_time'])
    //date validation
    const startTime = new Date(data.start_time).getTime()
    const currentTime = Date.now()
    if (isNaN(startTime) || startTime <= currentTime) {
      return { message: 'Start time must be a valid future date' }
    }
    //create webinar
    const cf_meeting_id = process.env.cf_meeting_id
    const webinar = await Webinar.create({ ...data, cf_meeting_id })
    console.log(webinar)
    //get webinar ID
    const webinarId = webinar.id
    const joinUrl = `http://localhost:3000/register/${webinarId}`

    return { message: 'Meeting Created successfully', webinar, joinUrl }
  }

  // register a participant for a webinar
  async registerParticipant(ctx: HttpContext) {
    const data = ctx.request.only(['name', 'email'])
    //get webinar ID from link
    const webinarId = ctx.params.webinarId
    // Find the webinar by ID
    const webinar = await Webinar.find(webinarId)
    if (!webinar) {
      return { message: 'Webinar not found' }
    }
    //check email already registered
    const existingParticipant = await WebinarParticipant.query()
      .where('email', data.email)
      .andWhere('webinar_id', webinarId)
      .first()
    if (existingParticipant) {
      return { message: 'Email already registered for this webinar' }
    }

    // Generate JWT token with email and expiration
    const secret = process.env.JWT_SECRET as string

    const token = jwt.sign(
      { email: data.email, webinarId }, // payload
      secret, // secret key
      { expiresIn: '8h' } // token expires in 1 hour
    )
    const participant = await WebinarParticipant.create({
      ...data,
      token,
      login_type: 'registered',
      webinar_id: webinarId,
    })
    const joinUrl = `https://www.ezymeeeting.com/?webinarId=${webinarId}&jwt=${token}`

    return { message: 'Participant registered successfully', participant, joinUrl }
  }

  // Get all participants
  async getAllParticipants() {
    const participants = await WebinarParticipant.query().orderBy('created_at', 'desc')
    return { participants }
  }
}
