import express from 'express'
import { teamSchema } from './schemas'
import { Team } from '#src/infra/models/Team'
import validateSchema from '#src/middlewares/validateSchema'
import verifyTeamAccess from '#src/middlewares/verifyTeamAccess'
const router = express.Router()

// Create a team
router.post('/', validateSchema(teamSchema), async (req, res) => {
  const user = req.user.id
  const team = new Team({
    ...req.body,
    creator: user,
    admins: [user],
    members: [user],
  })
  const result = await team.save()
  return res.status(201).json(result)
})

// Get all teams
router.get('/', async (req, res) => {
  const userId = req.user.id

  const teams = await Team.find({
    members: { $in: [userId] },
  }).exec()

  res.status(200).json(teams)
})

// Get a team by ID
router.get('/:teamId', verifyTeamAccess(), async (req, res) => {
  if (!req.params.teamId)
    return res.status(404).json({ error: 'Team not found' })

  const userId = req.user.id

  const team = await Team.findOne({
    _id: req.params.teamId,
    members: { $in: [userId] },
  }).exec()

  if (!team) return res.status(404).json({ error: 'Team not found' })

  return res.status(200).json(team)
})

// Update a team
router.put(
  '/:teamId',
  verifyTeamAccess(['admin']),
  validateSchema(teamSchema),
  async (req, res) => {
    if (!req.params.teamId)
      return res.status(404).json({ error: 'Team not found' })

    const team = await Team.findByIdAndUpdate(req.params.teamId, req.body, {
      new: true,
    }).exec()

    if (!team) return res.status(404).json({ error: 'Team not found' })

    return res.status(200).json(team)
  }
)

// Delete a team
router.delete('/:teamId', verifyTeamAccess(['admin']), async (req, res) => {
  if (!req.params.teamId)
    return res.status(404).json({ error: 'Team not found' })

  const team = await Team.findByIdAndDelete(req.params.teamId).exec()

  if (!team) return res.status(404).json({ error: 'Team not found' })

  return res.status(200).json({ message: 'Team deleted successfully' })
})

export default router
