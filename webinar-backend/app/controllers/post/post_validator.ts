import vine from '@vinejs/vine'

export const createPostCreateValidator = vine.compile(
  vine.object({
    topic: vine.string().trim().minLength(5).maxLength(50),
    agenda: vine.string().trim().minLength(5).maxLength(500), // agenda usually longer
    start_time: vine
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/), // YYYY-MM-DD HH:MM:SS
  })
)
