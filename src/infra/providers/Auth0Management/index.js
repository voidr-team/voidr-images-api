import config from '#src/config'
import slug from '#src/utils/transform/slug'
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

  /** @param {string} orgId */
  getInvitations = async (orgId) => {
    return this.api.get(`/api/v2/organizations/${orgId}/invitations`)
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
   * @param {string} inviteId
   */
  deleteInvite = async (orgId, inviteId) => {
    return this.api.delete(
      `/api/v2/organizations/${orgId}/invitations/${inviteId}`
    )
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

  /**
   * @param {string} orgId
   * @param {string} sub
   * @param {string[]} roles
   */
  addRolesInMember = async (orgId, sub, roles) => {
    return this.api.post(
      `/api/v2/organizations/${orgId}/members/${sub}/roles`,
      {
        roles: roles,
      }
    )
  }

  /**
   * @param {string} orgId
   * @param {string} sub
   * @param {string[]} roles
   */
  removeOrganizationMemberRoles = async (orgId, sub, roles) => {
    return this.api.delete(
      `/api/v2/organizations/${orgId}/members/${sub}/roles`,
      {
        data: {
          roles: roles,
        },
      }
    )
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

  getRoles = async () => {
    return this.api.get(`/api/v2/roles`)
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

  /** @param {{page: number?, take: number?, from: string?}} query */
  getOrganizations = async ({ page, take = 100, from }) => {
    return this.api.get('/api/v2/organizations', {
      params: {
        page,
        take,
        from,
        include_totals: true,
      },
    })
  }

  /** @param {string} name  */
  getOrganizationByName = async (name) => {
    return this.api
      .get(`/api/v2/organizations/name/${slug(name)}`)
      .catch((err) => {
        if (err.response.status === 404) return null
        else throw err
      })
  }

  getConnections = async () => {
    return this.api.get('/api/v2/connections')
  }

  /**
   * @param {{name: string, displayName: string, branding: { logoUrl: string, colors: any }}, metadata: any}} payload
   */
  createOrganization = async ({
    name,
    displayName,
    branding = {},
    metadata,
  }) => {
    const connectionsResponse = await this.getConnections()

    const enabledConnections = connectionsResponse?.data?.map((connection) => ({
      connection_id: connection.id,
      assign_membership_on_login: false,
    }))

    return this.api.post('/api/v2/organizations', {
      name,
      display_name: displayName,
      branding: {
        logo_url: branding.logoUrl,
        colors: branding.colors,
      },
      metadata,
      enabled_connections: enabledConnections,
    })
  }

  /**
   * @param {string} orgId
   * @param {string[]} members
   */
  addMembersToOrganization = async (orgId, members) => {
    return this.api.post(`/api/v2/organizations/${orgId}/members`, {
      members,
    })
  }
}

export default Auth0Management
