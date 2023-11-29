import Yup from 'yup'

const validateSchema = (schema) => async (req, res, next) => {
  try {
    req.rawBody = req.body
    const parsedBody = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })
    req.body = parsedBody
    next()
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors = error.inner.map((err) => ({
        path: err.path,
        message: err.message,
      }))
      return res.status(400).json({ errors })
    }
    next(error)
  }
}

export default validateSchema
