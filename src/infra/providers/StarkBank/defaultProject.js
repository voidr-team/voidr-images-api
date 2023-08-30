import config from '#src/config'
import { base64decode } from '#src/utils/transform/base64'
import starkbank from 'starkbank'

const defaultProject = new starkbank.Project({
  environment: config.starkBank.ENVIRONMENT,
  id: config.starkBank.PROJECT_ID,
  privateKey: base64decode(config.starkBank.PRIVATE_KEY),
})

export default defaultProject
