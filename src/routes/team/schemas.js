import { teamConfig } from '#src/infra/models/Team/teamConfig'
import * as yup from 'yup'

export const teamSchema = yup.object().shape({
  name: yup.string().required(),
  company: yup.object({
    name: yup.string(),
    url: yup.string().url(),
  }),
  avatar: yup.string().url().optional(),
  collaborationTool: yup
    .string()
    .oneOf(Object.values(teamConfig.collaborationTool))
    .required(),
})
