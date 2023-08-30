export default class HttpException extends Error {
  constructor(status, error, details = null) {
    super(error)
    this.status = status
    this.error = error
    this.details = details
  }
}
