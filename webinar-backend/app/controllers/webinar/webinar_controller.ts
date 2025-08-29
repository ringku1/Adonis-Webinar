import { HttpContext } from '@adonisjs/core/http'
import WebinarService from './webinar_services.js'
import { createWebinarValidator, createUserRegistrationValidator } from './webinar_validator.js'

export default class WebinarController {
  private webinarService: WebinarService

  constructor() {
    this.webinarService = new WebinarService()
  }

  public async create(ctx: HttpContext) {
    try {
      const validatedData = await createWebinarValidator.validate(
        ctx.request.only(['topic', 'agenda', 'start_time'])
      )
      return await this.webinarService.create(validatedData)
    } catch (error) {
      // if validation fails, Adonis will throw an exception
      return ctx.response.status(400).json({ message: error.message || 'Validation failed' })
    }
  }
  public async registerParticipant(ctx: HttpContext) {
    try {
      const validatedData = await createUserRegistrationValidator.validate(
        ctx.request.only(['name', 'email'])
      )
      return await this.webinarService.registerParticipant(validatedData, ctx)
    } catch (error) {
      // if validation fails, Adonis will throw an exception
      return ctx.response.status(400).json({ message: error.message || 'Validation failed' })
    }
  }

  public async getAllParticipants(ctx: HttpContext) {
    try {
      return await this.webinarService.getAllParticipants()
    } catch (error) {
      // if validation fails, Adonis will throw an exception
      return ctx.response.status(400).json({ message: error.message || 'Validation failed' })
    }
  }
  public async verifyToken(ctx: HttpContext) {
    try {
      return await this.webinarService.verifyToken(ctx)
    } catch (error) {
      // if validation fails, Adonis will throw an exception
      return ctx.response.status(400).json({ message: error.message || 'Validation failed' })
    }
  }
  public async getMeetingDetails(ctx: HttpContext) {
    try {
      return await this.webinarService.getMeetingDetails(ctx)
    } catch (error) {
      // if validation fails, Adonis will throw an exception
      return ctx.response.status(400).json({ message: error.message || 'Validation failed' })
    }
  }
  public async joinWebinar(ctx: HttpContext) {
    try {
      const validatedData = await createUserRegistrationValidator.validate(
        ctx.request.only(['name', 'email'])
      )
      return await this.webinarService.joinWebinar(validatedData, ctx)
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
