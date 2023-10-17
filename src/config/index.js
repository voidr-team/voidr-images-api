import dotenv from 'dotenv'
dotenv.config()
const config = {
  MONGODB: {
    URI: process.env.MONGODB_URI,
  },
  API_KEY: process.env.API_KEY,
  NODE_ENV: process.env.NODE_ENV,
  // IS_LOCAL: false,
  IS_LOCAL: process.env.NODE_ENV === 'local',
  AUTH: {
    AUDIENCE: 'https://api.voidr.co/',
    ISSUER_BASE_URL: 'https://voidr-staging.us.auth0.com/',
    APP_CLIENT_ID: 'AC7hfmPWWOVcCQnOLvSkuAcJYNwHLAl7',
  },
  AUTH_MANAGEMENT: {
    DOMAIN_URL: 'https://voidr-staging.us.auth0.com/',
    CLIENT_ID: 'YN5FBum4o9aoCIAuNgZRlsdxcNdcRGhM',
    CLIENT_SECRET:
      'dl-l3N8NMObTYymssM204m2Jspt__PNUfdTItmTcKiJlj7A_wtq_QseoUiT52uBS',
    AUDIENCE: 'https://voidr-staging.us.auth0.com/api/v2/',
  },
  LOGTAIL: {
    TOKEN: 'wLrwxhNntYoAkUU34ejR7owi',
  },
  ENCRYPT_SECRET: process.env.ENCRYPT_SECRET,
}

export default config
