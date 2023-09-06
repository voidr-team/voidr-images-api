import slugify from 'slugify'

const slug = (str = '', options = {}) =>
  slugify(str, { lower: true, strict: true, replacement: '_', ...options })

export default slug
