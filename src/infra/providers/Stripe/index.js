import config from '#src/config'
import Stripe from 'stripe'

const stripe = new Stripe(config.STRIPE.PRIVATE_KEY)

export default stripe
