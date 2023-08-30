import dotenv from 'dotenv'
dotenv.config()
const config = {
  MONGODB: {
    URI: process.env.MONGODB_URI,
  },
  starkBank: {
    PRIVATE_KEY: process.env.STARK_BANK_PRIVATE_KEY,
    PROJECT_ID: process.env.STARK_BANK_PROJECT_ID,
    ENVIRONMENT: process.env.STARK_BANK_ENVIRONMENT,
  },
}

export default config
