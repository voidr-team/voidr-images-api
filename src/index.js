// app.js
import 'express-async-errors'
import config from './config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import mongoose from 'mongoose'
import routes from './routes'
import morgan from 'morgan'
import path from 'path'
import HttpException from '#domain/exceptions/HttpException'
import passport from 'passport'
import passportHttp from 'passport-http'
import validateBasicAuthentication from '#middlewares/validateBasicAuthentication'
import apiKeyValidation from './middlewares/apiKeyValidation'
const BasicStrategy = passportHttp.BasicStrategy

const app = express()
const PORT = process.env.PORT || 3000

passport.use(new BasicStrategy(validateBasicAuthentication))

mongoose
  .connect(config.MONGODB.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Could not connect to MongoDB', err))

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use(passport.initialize())

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(
  morgan(':method :url :status :response-time ms \n:body ', { immediate: true })
)

app.use(apiKeyValidation)

app.use('/v1/', routes)

app.use((err, req, res, next) => {
  if (err.isAxiosError) {
    if (err.response) {
      console.error(err.response.data)
      console.error(err.response.status)
    } else if (err.request) {
      console.error(err.request)
    } else if (err.message) {
      console.error('err', err.message)
    } else {
      console.error(err)
    }
    return res.status(500).json({ error: 'Integration server error' })
  }

  if (err instanceof HttpException) {
    return res
      .status(err.status)
      .json({ error: err.error, details: err.details })
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.all('*', function (req, res) {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`[REST API] Server is running on port ${PORT}`)
})
