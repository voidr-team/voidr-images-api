import yup from 'yup'

export const uploadSchema = yup.object().shape({
  file: yup
    .string()
    .required('file is required')
    .matches(/^[a-zA-Z0-9-_]+(\.[a-zA-Z0-9]+)?$/, 'Invalid file name')
    .max(255, 'File name must be at most 255 characters long'),

  contentType: yup
    .string()
    .required('Content type is required')
    .matches(/^[\w-]+\/[\w-]+$/, 'Invalid content type'),
})
