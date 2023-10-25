import 'express-async-errors'
import config from './config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import mongoose from 'mongoose'
import routes from './routes'
import morgan from 'morgan'
import apiKeyValidation from './middlewares/apiKeyValidation'
import authCheck from './middlewares/authCheck'
import errorHandling from './middlewares/errorHandling'
import authInjection from './middlewares/authInjection'
import logger from './domain/logger'
import getStorage from './utils/storage/getStorage'

const app = express()
const PORT = process.env.PORT || 3000

mongoose
  .connect(config.MONGODB.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info('MongoDB connected'))
  .catch((err) => logger.info('Could not connect to MongoDB', err))

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({ origin: '*' }))
app.use(express.json())

morgan.token('body', (req, res) => JSON.stringify(req.body))

const morganMiddleware = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      body: tokens.body(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      content_length: tokens.res(req, res, 'content-length'),
      response_time: Number.parseFloat(tokens['response-time'](req, res)),
    })
  },
  {
    stream: {
      write: (raw) => {
        const data = JSON.parse(raw)
        const message = `${data.method} ${data.status} ${data.url} ${data.response_time} ms`
        if (config.IS_LOCAL) {
          console.log(message, data)
          return
        }
        if (data.status > 399) {
          logger.error(`${message}`, data)
        } else if (data.status >= 300 && data.status <= 199) {
          logger.warn(`${message}`, data)
        } else {
          logger.info(`${message}`, data)
        }
      },
    },
  }
)
app.use(morganMiddleware)

app.get('/health', async (req, res) => {
  return res.send('ok')
})

// app.use(authCheck)

// app.use(authInjection)

app.use('/v1/', routes)

app.use(errorHandling)

app.all('*', function (req, res) {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  logger.info(`[REST API] Server is running on port ${PORT}`)
})
