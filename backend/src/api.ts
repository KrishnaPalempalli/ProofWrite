import { Request, Response } from 'express'
import { Router } from 'express'
import { app } from '..'
import { config } from 'dotenv'
import { PinataSDK } from 'pinata'

type DocumentCommit = {
  text: string
  timestamp: number // unix ms
  cid: string
}

config()
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
})
const router = Router()

router.get('/hello', async (req: Request, res: Response) => {
  res.send(`Hello World!<br>${JSON.stringify(app.locals.data)}`)
})

router.get('/doc', async (req: Request, res: Response) => {
  if (!('name' in req.query)) {
    return res.status(400).json({
      message: 'bad request, fix your parameters dingus',
    })
  }
  const name = req.query.name as string
  if (name in app.locals.data) {
    res.status(200).json({
      message: 'successfully retrieved file history',
      history: app.locals.data[name],
    })
  } else {
    res.status(404).json({
      message: 'file not found',
    })
  }
})

router.post('/doc/upload', async (req: Request, res: Response) => {
  if (!('name' in req.body && 'text' in req.body)) {
    res.status(400).json({
      message: 'bad request, fix your parameters dingus',
    })
  }
  // name is the name of the doc, text is the content
  const { name, text } = req.body
  const timestamp = Date.now()
  const file = new File([text], `HACKATHON ${name}`, { type: 'text/plain' })
  try {
    const upload = await pinata.upload.private.file(file)
    const cid = upload.cid
    if (!app.locals.data[name]) {
      app.locals.data[name] = []
    }
    const commit: DocumentCommit = { text, timestamp, cid }
    if (!('is_duplicate' in upload && upload.is_duplicate)) {
      app.locals.data[name].push(commit)
    }
    console.log(`uploaded file ${name} at ${timestamp}`, app.locals.data[name])
    res.status(200).send({
      message: 'successfully uploaded',
      cid,
    })
  } catch (error) {
    res.status(400).json({
      message: 'failed to upload to pinata',
      error: `${error}`,
    })
  }
})

export { router }
