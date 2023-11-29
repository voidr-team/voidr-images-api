import config from '#src/config'
import logger from '#src/domain/logger'
import { CloudTasksClient } from '@google-cloud/tasks'
const client = new CloudTasksClient()

// Informações da fila
const project = config.GOOGLE_CLOUD.PROJECT_ID
const location = config.IMAGES_QUEUE.LOCATION
const queue = config.IMAGES_QUEUE.NAME
const url = config.IMAGES_QUEUE.API_URL
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
