import passport from 'passport'

export const basicAuthCheck = passport.authenticate('basic', {
  session: false,
  userProperty: 'account',
})
