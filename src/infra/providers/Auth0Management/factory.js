import Auth0Management from '.'

const auth0ManagementFactory = async () => {
  const accessToken = await Auth0Management.getAccessToken()
  const auth0Management = new Auth0Management(accessToken)
  return auth0Management
}

export default auth0ManagementFactory
