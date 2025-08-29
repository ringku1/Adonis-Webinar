import router from '@adonisjs/core/services/router'
import WebinarController from './webinar_controller.js'

router
  .group(() => {
    router.post('/create', [WebinarController, 'createWebinar'])
    router.post('/:webinarId/register_participant', [WebinarController, 'registerParticipant'])
    router.post('/:webinarId/join', [WebinarController, 'joinWebinar'])
    router.get('/participants', [WebinarController, 'getAllParticipants'])
    router.get('/verify-token', [WebinarController, 'verifyToken'])
    router.get('/meeting/:webinarId', [WebinarController, 'getMeetingDetails'])
  })
  .prefix('/webinars')
