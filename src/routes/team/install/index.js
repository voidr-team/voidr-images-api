import express from 'express'
import { Team } from '#models/Team'
import HttpException from './utils/HttpException'
import providerInstallService from '#domain/providerInstallService'
import { teamConfig } from '#models/Team/teamConfig'

const router = express.Router()

router.get('/api/teams/:teamId/install/:provider', async (req, res) => {
  const { teamId, provider } = req.params

  if (!Object.values(teamConfig.collaborationTool).includes(provider)) {
    throw new HttpException(400, 'Invalid chat provider.')
  }

  const redirectUrl = await providerInstallService.startOAuth(teamId, provider)
  return res.redirect(redirectUrl)
})

router.get('/api/teams/:teamId/oauth-callback', async (req, res) => {
  const { teamId } = req.params
  const { code } = req.query

  const installationData = await providerInstallService.handleOAuthCallback(
    teamId,
    code
  )

  await Team.findByIdAndUpdate(teamId, { installation: installationData })

  res.status(200).json({ message: 'Installation successful' })
})

export default router
