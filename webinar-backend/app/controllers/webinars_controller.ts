import Webinar from '#models/webinar'
import WebinarParticipant from '#models/webinar_participant'
import { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'

export default class WebinarController {
  // Create a new webinar
  async create(ctx: HttpContext) {
    const data = ctx.request.only(['topic', 'agenda', 'start_time'])
    //date validation
    const startTime = new Date(data.start_time).getTime()
    const currentTime = Date.now()
    if (isNaN(startTime) || startTime <= currentTime) {
      return { message: 'Start time must be a valid future date' }
    }
    //create webinar
    const cf_meeting_id = process.env.cf_meeting_id
    const webinar = await Webinar.create({ ...data, cf_meeting_id })
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
    const joinUrl = `http://localhost:3000/verify-token?webinarId=${webinarId}&jwt=${token}`

    return { message: 'Participant registered successfully', participant, joinUrl }
  }

  // Get all participants
  async getAllParticipants() {
    const participants = await WebinarParticipant.query().orderBy('created_at', 'desc')
    return { participants }
  }
  // app/Controllers/Http/WebinarController.ts
  async verifyToken(ctx: HttpContext) {
    const webinarId = ctx.request.qs().webinarId
    const token = ctx.request.qs().jwt

    if (!token || !webinarId) {
      return ctx.response.status(400).json({ message: 'Token and webinarId required' })
    }

    try {
      const secret = process.env.JWT_SECRET as string

      // 1️⃣ Verify token
      const decoded = jwt.verify(token, secret) as { email: string; webinarId: string }

      // 2️⃣ Webinar ID match
      if (decoded.webinarId !== webinarId) {
        return ctx.response.status(403).json({ message: 'Webinar ID mismatch' })
      }

      // 3️⃣ Participant exists
      const participant = await WebinarParticipant.query()
        .where('email', decoded.email)
        .andWhere('webinar_id', webinarId)
        .first()

      if (!participant) {
        return ctx.response.status(404).json({ message: 'Participant not found' })
      }

      return ctx.response.json({ message: 'Token is valid', participant })
    } catch (err) {
      return ctx.response.status(401).json({ message: 'Invalid or expired token' })
    }
  }
}
