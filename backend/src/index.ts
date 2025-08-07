import express from 'express'

const app = express()
const port = 7474

// Remove any trailing slashes with redirect
// https://stackoverflow.com/a/15773824
app.use((req, res, next) => {
  if (req.path.slice(-1) === '/' && req.path.length > 1) {
    const query = req.url.slice(req.path.length)
    const safepath = req.path.slice(0, -1).replace(/\/+/g, '/')
    res.redirect(301, safepath + query)
  } else {
    next()
  }
})

// support for json requests
app.use(express.json())

// Add endpoints
import { router as apiRouter } from './routes/api'
app.use('/api', apiRouter)

const init = async () => {
  app.locals.data = {} // this will store all user data in-memory cuz I don't wanna use a database lol
  app.listen(port, () => {
    console.info('Express server listening on http://127.0.0.1:' + port)
  })
}
init()

export { app }
