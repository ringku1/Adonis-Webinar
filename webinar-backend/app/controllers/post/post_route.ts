import router from '@adonisjs/core/services/router'
import PostController from './post_controller.js'

router
  .group(() => {
    router.post('create', [PostController, 'create'])
  })
  .prefix('/posts')
