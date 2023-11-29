import yup from 'yup'

export const uploadSchema = yup.object().shape({
  file: yup
    .string()
    .required('file is required')
    .max(255, 'File name must be at most 255 characters long'),

  contentType: yup
    .string()
    .required('Content type is required')
    .matches(/^[\w-]+\/[\w-]+$/, 'Invalid content type'),
})
