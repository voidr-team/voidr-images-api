import dotenv from 'dotenv'
dotenv.config()
const config = {
  MONGODB: {
    URI: process.env.MONGODB_URI,
  },
  API_KEY: process.env.API_KEY,
  NODE_ENV: process.env.NODE_ENV,
  IS_LOCAL: process.env.NODE_ENV === 'local',
}

export default config
