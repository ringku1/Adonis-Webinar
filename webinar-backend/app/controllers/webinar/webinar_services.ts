import { Exception } from '@adonisjs/core/exceptions'
import WebinarQuery from './webinar_query.js'
import { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'
import axios from 'axios'

export default class WebinarService {
  private webinarQuery: WebinarQuery

  constructor() {
    this.webinarQuery = new WebinarQuery()
  }

  public async createWebinar(payload: any) {
    // create webinar
    payload['cf_meeting_id'] = process.env.cf_meeting_id

    if (!payload.cf_meeting_id) {
      throw new Exception('Cf meeting id invalid / not found')
    }

    const webinar = await this.webinarQuery.createWebinar(payload)
    // get webinar ID
    const webinarId = webinar.id
    const joinUrl = `http://localhost:3000/register/${webinarId}`

    return { message: 'Webinar is created', webinar: webinar, join_url: joinUrl }
  }
  public async registerParticipant(payload: any, ctx: HttpContext) {
    const webinarId = ctx.params.webinarId
    //user registration
    payload['webinar_id'] = webinarId
    if (!payload.webinar_id) {
      throw new Exception('Webinar ID invalid / not found')
    }
    const webinar = await this.webinarQuery.findWebinar(webinarId)
    if (!webinar) {
      throw new Exception('Webinar not found')
    }
    const participantEmailWebinarId = { email: payload.email, webinar_id: webinarId }
    const existingParticipant = await this.webinarQuery.findParticipant(participantEmailWebinarId)
    if (existingParticipant) {
      throw new Exception('Email already registered for this webinar')
    }
    const secret = process.env.JWT_SECRET as string
    const token = jwt.sign({ email: payload.email, webinarId }, secret, { expiresIn: '24h' })
    payload['token'] = token
    payload['webinar_id'] = webinarId
    payload['login_type'] = 'registered'
    const participant = await this.webinarQuery.createParticipant(payload)
    if (!participant) {
      throw new Exception('Registration unsuccessful')
    }
    const joinUrl = `http://localhost:3000/verify-token?webinarId=${webinarId}&jwt=${token}`
    return { message: 'Registration successful', participant: participant, join_url: joinUrl }
  }
  public async getAllParticipants() {
    const participants = await this.webinarQuery.queryParticipants()
    return { message: 'Participants fetched successfully', participants: participants }
  }
  public async verifyToken(ctx: HttpContext) {
    const webinarId = ctx.request.qs().webinarId
    const token = ctx.request.qs().jwt

    if (!token || !webinarId) {
      throw new Exception('Token and webinarId required')
    }

    try {
      const secret = process.env.JWT_SECRET as string
      const decoded = jwt.verify(token, secret) as { email: string; webinarId: string }
      if (decoded.webinarId !== webinarId) {
        throw new Exception('Webinar ID mismatch')
      }
      const participantEmailWebinarId = { email: decoded.email, webinar_id: webinarId }
      const participant = await this.webinarQuery.findParticipant(participantEmailWebinarId)

      if (!participant) {
        throw new Exception('Participant not found')
      }
      return { message: 'Token is valid', participant: participant }
    } catch (error) {
      throw new Exception('Invalid or expired token')
    }
  }
  public async getMeetingDetails(ctx: HttpContext) {
    const webinarId = ctx.params.webinarId
    if (!webinarId) {
      throw new Exception('WebinarId is required')
    }
    const webinar = await this.webinarQuery.findWebinar(webinarId)
    if (!webinar) {
      throw new Exception('WebinarId not found')
    }
    return { message: 'Webinar details fetched successfully', webinar: webinar }
  }
  async joinWebinar(payload: any, ctx: HttpContext) {
    const webinarId = ctx.params.webinarId
    if (!webinarId) {
      throw new Exception('WebinarId is required')
    }
    // 1. Get webinar details
    const webinar = await this.webinarQuery.findWebinar(webinarId)
    if (!webinar) {
      throw new Exception('Webinar not found')
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
      return {
        status: 'waiting',
        message: "Meeting hasn't started yet",
        start_time: startTime.toISOString(),
        time_remaining_ms: timeRemaining,
        webinar: {
          id: webinar.id,
          topic: webinar.topic,
          agenda: webinar.agenda,
        },
      }
    }

    // 3. Meeting has started - check for existing participant
    const participantEmailWebinarId = { email: payload.email, webinar_id: webinarId }
    const existingParticipant = await this.webinarQuery.findParticipant(participantEmailWebinarId)

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
      name: payload.name.trim(),
      preset_name: 'webinar_viewer', // Default role for participants
      custom_participant_id: cloudflareParticipantId,
    }

    const cfApiBase = process.env.CF_API_BASE
    const cfAuthHeader = process.env.CF_AUTH_HEADER

    if (!cfApiBase || !cfAuthHeader) {
      throw new Error('Cloudflare configuration missing')
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

    // Debug: Log the Cloudflare response structure
    console.log('Cloudflare API Response:', JSON.stringify(cloudflareResponse.data, null, 2))

    // 5. Save or update participant in database
    // if (!existingParticipant) {
    //   await WebinarParticipant.create({
    //     name: payload.name,
    //     email: payload.email,
    //     webinar_id: webinarId,
    //     login_type: 'registered',
    //     //cloudflare_participant_id: cloudflareParticipantId,
    //     token: '', // No JWT token needed for direct join
    //   })
    // } else {
    //   // Update existing participant
    //   //existingParticipant.cloudflare_participant_id = cloudflareParticipantId
    //   existingParticipant.name = payload.name // Update name if changed
    //   await existingParticipant.save()
    // }

    // 6. Extract auth token from Cloudflare response for RTK
    const cfResponseData = cloudflareResponse.data

    // The auth token for RTK is typically in the Cloudflare response
    // Common locations: token, authToken, access_token, data.token
    const authToken =
      cfResponseData.token ||
      cfResponseData.authToken ||
      cfResponseData.access_token ||
      cfResponseData.data?.token ||
      cfResponseData.data?.authToken

    //console.log('Extracted auth token:', authToken ? 'Found' : 'Not found')
    //console.log('Auth token length:', authToken ? authToken.length : 'N/A')

    // Return success response with meeting details and auth token
    // return ctx.response.json({
    //   status: 'joined',
    //   message: 'Successfully joined the meeting',
    //   meeting_data: {
    //     ...cfResponseData,
    //     // Ensure auth token is available at top level for frontend
    //     token: authToken,
    //     authToken: authToken,
    //   },
    //   webinar: {
    //     id: webinar.id,
    //     topic: webinar.topic,
    //     agenda: webinar.agenda,
    //     start_time: webinar.start_time,
    //   },
    //   participant: {
    //     name: payload.name,
    //     email: payload.email,
    //     //cloudflare_participant_id: cloudflareParticipantId,
    //   },
    // })
    return {
      status: 'joined',
      message: 'Successfully joined the meeting',
      meeting_data: {
        ...cfResponseData,
        // Ensure auth token is available at top level for frontend
        token: authToken,
        authToken: authToken,
      },
      webinar: {
        id: webinar.id,
        topic: webinar.topic,
        agenda: webinar.agenda,
        start_time: webinar.start_time,
      },
      participant: {
        name: payload.name,
        email: payload.email,
        //cloudflare_participant_id: cloudflareParticipantId,
      },
    }
  }
}
