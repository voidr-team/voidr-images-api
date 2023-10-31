import config from '#src/config'
import logger from '#src/domain/logger'
import { CloudTasksClient } from '@google-cloud/tasks'
const client = new CloudTasksClient()

// Informações da fila
const project = config.GOOGLE_CLOUD.PROJECT_ID
const location = 'us-central1' // Exemplo: us-central1
const queue = 'voidr-image-process'
const url = 'https://api.voidr.co/v1/images/process' // URL do Cloud Function que você implantou
const parent = client.queuePath(project, location, queue)

/**  @param {string} imageId   */
async function addImageToQueue(imageId) {
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: url,
      body: Buffer.from(JSON.stringify({ imageId })).toString('base64'),
      headers: {
        'Content-Type': 'application/json',
      },
    },
  }

  const [response] = await client.createTask({ parent, task })
  logger.info('Task created', response)
  return response
}

export default addImageToQueue
