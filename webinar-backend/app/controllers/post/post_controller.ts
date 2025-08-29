import { HttpContext } from '@adonisjs/core/http'
import { createPostCreateValidator } from './post_validator.js'
import PostService from './post_service.js'

export default class PostController {
  private postService: PostService

  constructor() {
    this.postService = new PostService()
  }

  public async create(ctx: HttpContext) {
    try {
      const validatedData = await createPostCreateValidator.validate(ctx.request.all())
      return await this.postService.create(validatedData)
    } catch (error) {
      // if validation fails, Adonis will throw an exception
      return ctx.response.status(400).json({ message: error.message || 'Validation failed' })
    }
  }
}
