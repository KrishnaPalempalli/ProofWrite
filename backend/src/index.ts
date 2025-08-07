import express from 'express'
import fs from 'fs'
import cors from 'cors'

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
// CORS, for frontend to be able to see responses
app.use(cors())

// Add endpoints
import { router as apiRouter, DB_PATH } from './api'
app.use('/api', apiRouter)

const init = async () => {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    app.locals.data = JSON.parse(raw)
  } catch {
    // if file doesn't exist or is invalid, start empty
    app.locals.data = {}
    fs.writeFileSync(DB_PATH, JSON.stringify(app.locals.data, null, 2))
  }
  app.listen(port, () => {
    console.info('Express server listening on http://127.0.0.1:' + port)
  })
}
init()

export { app }
