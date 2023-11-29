import dotenv from 'dotenv'
dotenv.config()
const config = {
  MONGODB: {
    URI: process.env.MONGODB_URI,
  },
  API_KEY: process.env.API_KEY,
  APP_URL: process.env.APP_URL,
  NODE_ENV: process.env.NODE_ENV,
  IS_LOCAL: process.env.NODE_ENV === 'local',
  AUTH: {
    AUDIENCE: process.env.AUTH_AUDIENCE,
    ISSUER_BASE_URL: process.env.AUTH_ISSUER_BASE_URL,
    APP_CLIENT_ID: process.env.AUTH_APP_CLIENT_ID,
  },
  AUTH_MANAGEMENT: {
    DOMAIN_URL: process.env.AUTH_MANAGEMENT_DOMAIN_URL,
    CLIENT_ID: process.env.AUTH_MANAGEMENT_CLIENT_ID,
    CLIENT_SECRET: process.env.AUTH_MANAGEMENT_CLIENT_SECRET,
    AUDIENCE: process.env.AUTH_MANAGEMENT_AUDIENCE,
  },
  LOGTAIL: {
    TOKEN: process.env.LOGTAIL_TOKEN,
  },
  ENCRYPT_SECRET: process.env.ENCRYPT_SECRET,
  GOOGLE_CLOUD: {
    PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    STORAGE_SERVICE_ACCOUNT: process.env.STORAGE_SERVICE_ACCOUNT,
  },
  IMAGES_QUEUE: {
    NAME: process.env.IMAGES_QUEUE_API_URL,
    LOCATION: process.env.IMAGES_QUEUE_NAME,
    API_URL: process.env.IMAGES_QUEUE_LOCATION,
  },
  STRIPE: {
    PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY,
    PRO_PLAN: process.env.STRIPE_PRO_PLAN,
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  },
  EMAIL: {
    EMAIL_SERVICE_KEY: process.env.EMAIL_SERVICE_KEY,
    EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL,
  },
  DISCORD: {
    WEBHOOK_ENTERPRISE_LEAD: process.env.DISCORD_WEBHOOK_ENTERPRISE_LEAD,
    WEBHOOK_REFERRAL: process.env.DISCORD_WEBHOOK_REFERRAL,
  },
}

export default config
