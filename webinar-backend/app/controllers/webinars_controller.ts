import Webinar from '#models/webinar'
import WebinarParticipant from '#models/webinar_participant'
import { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'
import { createCreateWebinarValidator, createUserRegistrationValidator } from '#validators/webinar'
import axios from 'axios'

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

  // Join webinar - Check meeting status and join directly if started
  async joinWebinar(ctx: HttpContext) {
    try {
      const { webinarId } = ctx.params
      const data = ctx.request.only(['name', 'email'])
      const validatedData = await createUserRegistrationValidator.validate(data)

      // 1. Get webinar details
      const webinar = await Webinar.find(webinarId)
      if (!webinar) {
        return ctx.response.status(404).json({ message: 'Webinar not found' })
      }

      // 2. Check if meeting has started
      const now = new Date()
      let startTime: Date

      // Handle different start_time formats
      if (typeof webinar.start_time === 'string') {
        startTime = new Date(webinar.start_time)
      } else if (webinar.start_time && typeof webinar.start_time.toJSDate === 'function') {
        // Luxon DateTime object
        startTime = webinar.start_time.toJSDate()
      } else if (webinar.start_time instanceof Date) {
        // Already a Date object
        startTime = webinar.start_time
      } else if (webinar.start_time && typeof webinar.start_time.toISO === 'function') {
        // Another Luxon DateTime check with null safety
        const isoString = webinar.start_time.toISO()
        if (isoString) {
          startTime = new Date(isoString)
        } else {
          throw new Error('Invalid start_time: Unable to convert to ISO string')
        }
      } else if (webinar.start_time) {
        // Try to convert to string first, then to Date
        startTime = new Date(String(webinar.start_time))
      } else {
        // No valid start_time found
        throw new Error('Invalid start_time: No valid date format found')
      }

      if (now < startTime) {
        // Meeting hasn't started - return waiting status
        const timeRemaining = startTime.getTime() - now.getTime()
        return ctx.response.json({
          status: 'waiting',
          message: "Meeting hasn't started yet",
          start_time: startTime.toISOString(),
          time_remaining_ms: timeRemaining,
          webinar: {
            id: webinar.id,
            topic: webinar.topic,
            agenda: webinar.agenda,
          },
        })
      }

      // 3. Meeting has started - check for existing participant
      let existingParticipant = await WebinarParticipant.query()
        .where('email', validatedData.email)
        .andWhere('webinar_id', webinarId)
        .first()

      let cloudflareParticipantId: string

      if (existingParticipant) {
        // Use existing participant's cloudflare ID if available
        cloudflareParticipantId =
          existingParticipant.cloudflare_participant_id || `participant_${Date.now()}`
      } else {
        cloudflareParticipantId = `participant_${Date.now()}`
      }

      // 4. Join participant to Cloudflare meeting
      const participantData = {
        name: validatedData.name.trim(),
        preset_name: 'webinar_viewer', // Default role for participants
        custom_participant_id: cloudflareParticipantId,
      }

      const cfApiBase = process.env.CF_API_BASE
      const cfAuthHeader = process.env.CF_AUTH_HEADER

      if (!cfApiBase || !cfAuthHeader) {
        return ctx.response.status(500).json({
          message: 'Cloudflare configuration missing',
        })
      }

      const cloudflareResponse = await axios.post(
        `${cfApiBase}/meetings/${process.env.cf_meeting_id}/participants`,
        participantData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': cfAuthHeader,
          },
        }
      )

      // 5. Save or update participant in database
      if (!existingParticipant) {
        await WebinarParticipant.create({
          name: validatedData.name,
          email: validatedData.email,
          webinar_id: webinarId,
          login_type: 'registered',
          cloudflare_participant_id: cloudflareParticipantId,
          token: '', // No JWT token needed for direct join
        })
      } else {
        // Update existing participant
        existingParticipant.cloudflare_participant_id = cloudflareParticipantId
        existingParticipant.name = validatedData.name // Update name if changed
        await existingParticipant.save()
      }

      // 6. Return success response with meeting details
      return ctx.response.json({
        status: 'joined',
        message: 'Successfully joined the meeting',
        meeting_data: cloudflareResponse.data,
        webinar: {
          id: webinar.id,
          topic: webinar.topic,
          agenda: webinar.agenda,
          start_time: webinar.start_time,
        },
        participant: {
          name: validatedData.name,
          email: validatedData.email,
          cloudflare_participant_id: cloudflareParticipantId,
        },
      })
    } catch (error: any) {
      console.error('Join webinar error:', error.response?.data || error.message)

      // Handle Cloudflare API errors specifically
      if (error.response?.status) {
        return ctx.response.status(error.response.status).json({
          message: error.response.data?.message || 'Failed to join meeting',
          error: error.response.data,
        })
      }

      // Handle validation errors
      if (error.messages) {
        return ctx.response.status(400).json({
          message: 'Validation failed',
          errors: error.messages,
        })
      }

      return ctx.response.status(500).json({
        message: 'Internal server error',
        error: error.message,
      })
    }
  }
}
