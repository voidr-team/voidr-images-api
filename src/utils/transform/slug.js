import slugify from 'slugify'

const slug = (str = '', options = {}) =>
  slugify(str, { lower: true, strict: true, ...options })

export default slug
