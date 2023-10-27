import dotenv from 'dotenv'
dotenv.config()
const config = {
  MONGODB: {
    URI: process.env.MONGODB_URI,
  },
  API_KEY: process.env.API_KEY,
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
    TOKEN: 'wLrwxhNntYoAkUU34ejR7owi',
  },
  ENCRYPT_SECRET: process.env.ENCRYPT_SECRET,
}

export default config
