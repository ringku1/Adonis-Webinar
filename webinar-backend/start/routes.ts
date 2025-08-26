import router from '@adonisjs/core/services/router'
const WebinarController = () => import('#controllers/webinars_controller')

router.post('/webinar/create', [WebinarController, 'create'])
router.post('/webinar/:webinarId/register_participant', [WebinarController, 'registerParticipant'])
router.post('/webinar/:webinarId/join', [WebinarController, 'joinWebinar'])
router.get('/participants', [WebinarController, 'getAllParticipants'])
router.get('/verify-token', [WebinarController, 'verifyToken'])
router.get('/meeting/:webinarId', [WebinarController, 'getMeetingDetails'])
