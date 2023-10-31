import userRoutes from './user'
import organizationRoutes from './organization'
import imagesFetchRoutes from './images/fetch'
import imagesRoutes from './images'
import imageProcessRoutes from './images/process'
import projectsRouter from './projects'

export default [
  userRoutes,
  organizationRoutes,
  projectsRouter,
  imagesRoutes,
  imageProcessRoutes,
  imagesFetchRoutes,
]
