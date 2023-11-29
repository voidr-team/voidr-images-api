import config from '#src/config'
import logger from '#src/domain/logger'
import stripe from '#src/infra/providers/Stripe'
import projectRepository from '#src/infra/repositories/project'
import { projectConfig } from '#src/models/Project/projectConfig'
import express from 'express'
const router = express.Router()

const endpointSecret = config.STRIPE.WEBHOOK_SECRET

router.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret)
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        const projectId = invoice.subscription_details?.metadata?.projectId
        const customer = invoice.customer
        const subscriptionId = invoice.subscription

        if (
          invoice.status === 'paid' &&
          invoice.billing_reason === 'subscription_create' &&
          projectId
        ) {
          await projectRepository.updatePlan(projectId, {
            plan: projectConfig.plans.PRO,
            subscription: subscriptionId,
            customer,
          })

          logger.info('subscription confirmed via invoice.payment_succeeded', {
            projectId,
          })
        }
        break
      }
      case 'checkout.session.async_payment_succeeded':
      case 'checkout.session.completed': {
        const checkoutSessionCompleted = event.data.object
        const projectId = checkoutSessionCompleted.metadata?.projectId
        const subscriptionId = event.data.object.subscription
        const customer = event.data.object.customer

        if (
          checkoutSessionCompleted.payment_status === 'paid' &&
          checkoutSessionCompleted.status === 'complete' &&
          subscriptionId
        ) {
          await projectRepository.updatePlan(projectId, {
            plan: projectConfig.plans.PRO,
            subscription: subscriptionId,
            customer,
          })
          logger.info('subscription confirmed', { projectId })
        } else {
          logger.error('subscription failed', {
            projectId,
            checkoutSessionCompleted,
          })
        }
        break
      }
    }
  } catch (err) {
    logger.error(err)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  return res.send()
})

export default router
