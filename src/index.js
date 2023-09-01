// app.js
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

const app = express()
const PORT = process.env.PORT || 3000

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

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(
  morgan(':method :url :status :response-time ms \n:body ', { immediate: true })
)

app.use(apiKeyValidation)

app.get('/health', async (req, res) => {
  return res.send('ok')
})

app.use(authCheck)

app.use('/v1/', routes)

app.use(errorHandling)

app.all('*', function (req, res) {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`[REST API] Server is running on port ${PORT}`)
})
