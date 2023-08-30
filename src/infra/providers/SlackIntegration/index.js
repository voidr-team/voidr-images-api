import config from '#src/config'
import axios from 'axios'

class SlackIntegration {
  botToken = null
  clientId = config.SLACK.CLIENT_ID
  clientSecret = config.SLACK.CLIENT_SECRET
  redirectUri = config.SLACK.REDIRECT_URI
  axiosInstance = axios.create({
    baseURL: 'https://slack.com/api',
  })

  constructor(_botToken) {
    if (!_botToken) throw new Error('Cannot construct without bot token')
    this.botToken = _botToken
    this.axiosInstance.interceptors.request.use(this.requestInterceptor)
  }

  requestInterceptor = (config) => {
    config.headers.Authorization = `Bearer ${this.botToken}`
    return config
  }

  async apiCall(requestConfig) {
    const response = await this.axiosInstance(requestConfig)

    if (!response.data.ok) {
      throw response
    }

    return response
  }

  static async getAccessToken(code) {
    try {
      const body = {
        client_id: config.SLACK.CLIENT_ID,
        client_secret: config.SLACK.CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: config.SLACK.REDIRECT_URI,
      }

      const response = await axios({
        url: 'https://slack.com/api/oauth.v2.access',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams(body).toString(),
      })

      if (!response.data.ok) throw response

      return response
    } catch (error) {
      console.error('[Slack] - Error get access token:')
      throw error
    }
  }

  async getUserInfo(userId) {
    try {
      return await this.apiCall({
        method: 'get',
        url: '/users.info',
        params: { user: userId },
      })
    } catch (error) {
      console.error('[Slack] - Error getting user info:')
      throw error
    }
  }

  async sendCustomMessage(channelId, text, username, avatar) {
    try {
      return await this.apiCall({
        method: 'post',
        url: '/chat.postMessage',
        data: {
          channel: channelId,
          text: text,
          username: username,
          icon_url: avatar,
        },
      })
    } catch (error) {
      console.error('[Slack] - Error sending custom message:')
      throw error
    }
  }

  async joinChannel(channelId) {
    try {
      return await this.apiCall({
        method: 'post',
        url: '/conversations.join',
        data: {
          channel: channelId,
        },
      })
    } catch (error) {
      console.error('[Slack] - Error joining channel:')
      throw error
    }
  }

  async getTeamInfo() {
    try {
      return await this.apiCall({
        method: 'get',
        url: '/team.info',
      })
    } catch (error) {
      console.error('[Slack] - Error get team info:')
      throw error
    }
  }
}

export default SlackIntegration
