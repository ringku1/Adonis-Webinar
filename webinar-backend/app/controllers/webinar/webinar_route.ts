import WebinarController from '#controllers/webinars_controller'
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.post('/create', [WebinarController, 'create'])
    router.post('/:webinarId/register_participant', [WebinarController, 'registerParticipant'])
    router.post('/:webinarId/join', [WebinarController, 'joinWebinar'])
    router.get('/participants', [WebinarController, 'getAllParticipants'])
    router.get('/verify-token', [WebinarController, 'verifyToken'])
    router.get('/meeting/:webinarId', [WebinarController, 'getMeetingDetails'])
  })
  .prefix('/webinars')
