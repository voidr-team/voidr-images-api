import config from '#src/config'
import axios from 'axios'
import { path } from 'ramda'

class Auth0Management {
  /** @type {axios} */
  api = null

  /**  @param {string} accessToken */
  constructor(accessToken) {
    if (!accessToken) throw new Error('Cannot construct without accessToken')
    this.api = axios.create({
      baseURL: config.AUTH_MANAGEMENT.DOMAIN_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  static getAccessToken = async () => {
    const response = await axios({
      method: 'POST',
      url: `${config.AUTH_MANAGEMENT.DOMAIN_URL}oauth/token`,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.AUTH_MANAGEMENT.CLIENT_ID,
        client_secret: config.AUTH_MANAGEMENT.CLIENT_SECRET,
        audience: config.AUTH_MANAGEMENT.AUDIENCE,
      }),
    })
    const accessToken = path(['data', 'access_token'], response)
    return accessToken
  }

  /** @param {string} orgId */
  getOrganizationMembers = async (orgId) => {
    return this.api.get(`/api/v2/organizations/${orgId}/members`)
  }

  /**
   * @param {string} orgId
   * @param {{inviterName: string, inviteeEmail: string, roles: string[], inviteeName: string, }} invite
   */
  createInvite = async (
    orgId,
    {
      inviterName,
      inviteeEmail,
      roles,
      inviteeName,
      // connection,
    }
  ) => {
    const payload = {
      inviter: {
        name: inviterName,
      },
      invitee: {
        email: inviteeEmail,
      },
      client_id: config.AUTH.APP_CLIENT_ID,
      user_metadata: {
        invitee_name: inviteeName,
      },
      // connection_id: connection,
      roles,
    }

    return this.api.post(`/api/v2/organizations/${orgId}/invitations`, payload)
  }

  /**
   * @param {string} orgId
   * @param {string[]} subs
   */
  removeOrganizationMembers = async (orgId, subs) => {
    return this.api.delete(`/api/v2/organizations/${orgId}/members`, {
      data: {
        members: subs,
      },
    })
  }

  /** @param {string} orgId */
  getOrganizationMembersWithRoles = async (orgId) => {
    const { data: members } = await this.getOrganizationMembers(orgId)
    return await Promise.all(
      members.map(async (member) => {
        const { data: roles } = await this.getOrganizationUserRoles(
          orgId,
          member.user_id
        )
        return { ...member, roles: roles ?? [] }
      })
    )
  }

  /**
   * @param {string} orgId
   * @param {string} sub
   */
  getOrganizationUserRoles = async (orgId, sub) => {
    return this.api.get(`/api/v2/organizations/${orgId}/members/${sub}/roles`)
  }

  /** @param {string} orgId */
  getOrganizationById = async (orgId) => {
    return this.api.get(`/api/v2/organizations/${orgId}`)
  }
}

export default Auth0Management
