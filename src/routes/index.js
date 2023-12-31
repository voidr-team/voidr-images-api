import userRoutes from './user'
import organizationRoutes from './organization'
import imagesFetchRoutes from './images/fetch'
import imagesRoutes from './images'
import imageProcessRoutes from './images/process'
import imageRelativesRoutes from './images/relatives'
import projectsRouter from './projects'
import dashboardRouter from './dashboard'
import usageRouter from './usage'
import webhookStripeRoutes from './webhook/stripe'
import cronBillingRoutes from './cron/billing'
import reminderFreePlan from './cron/reminderFreePlan'

export default [
  userRoutes,
  organizationRoutes,
  projectsRouter,
  dashboardRouter,
  imagesRoutes,
  imageRelativesRoutes,
  imageProcessRoutes,
  imagesFetchRoutes,
  usageRouter,
  webhookStripeRoutes,
  cronBillingRoutes,
  reminderFreePlan,
]
