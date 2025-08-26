import Webinar from '#models/webinar'
import WebinarParticipant from '#models/webinar_participant'
import { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'
import { createCreateWebinarValidator, createUserRegistrationValidator } from '#validators/webinar'

export default class WebinarController {
  // Create a new webinar
  async create(ctx: HttpContext) {
    try {
      // Validate the request body using webinarSchema
      const data = ctx.request.only(['topic', 'agenda', 'start_time'])
      const validatedData = await createCreateWebinarValidator.validate(data)

      // create webinar
      const cf_meeting_id = process.env.cf_meeting_id
      const webinar = await Webinar.create({ ...validatedData, cf_meeting_id })

      // get webinar ID
      const webinarId = webinar.id
      const joinUrl = `http://localhost:3000/register/${webinarId}`

      return { message: 'Meeting Created successfully', webinar, joinUrl }
    } catch (error) {
      // if validation fails, Adonis will throw an exception
      return ctx.response.status(400).json({ message: error.message || 'Validation failed' })
    }
  }

  // register a participant for a webinar
  async registerParticipant(ctx: HttpContext) {
    try {
      // Validate participant input
      const data = ctx.request.only(['name', 'email'])
      const validatedData = await createUserRegistrationValidator.validate(data)

      const webinarId = ctx.params.webinarId
      const webinar = await Webinar.find(webinarId)
      if (!webinar) {
        return ctx.response.status(404).json({ message: 'Webinar not found' })
      }

      // check if email is already registered
      const existingParticipant = await WebinarParticipant.query()
        .where('email', validatedData.email)
        .andWhere('webinar_id', webinarId)
        .first()
      if (existingParticipant) {
        return ctx.response
          .status(409)
          .json({ message: 'Email already registered for this webinar' })
      }

      // generate JWT token
      const secret = process.env.JWT_SECRET as string
      const token = jwt.sign({ email: validatedData.email, webinarId }, secret, { expiresIn: '8h' })

      const participant = await WebinarParticipant.create({
        ...validatedData,
        token,
        login_type: 'registered',
        webinar_id: webinarId,
      })

      const joinUrl = `http://localhost:3000/verify-token?webinarId=${webinarId}&jwt=${token}`

      return { message: 'Participant registered successfully', participant, joinUrl }
    } catch (error) {
      return ctx.response.status(400).json({ message: error.messages || 'Validation failed' })
    }
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

  async getMeetingDetails(ctx: HttpContext) {
    const webinarId = ctx.params.webinarId
    if (!webinarId) {
      return ctx.response.status(400).json({ message: 'webinarId is required' })
    }

    const webinar = await Webinar.find(webinarId)
    if (!webinar) {
      return ctx.response.status(404).json({ message: 'Webinar not found' })
    }

    return ctx.response.json({ message: 'Webinar is ready', webinar })
  }
}
