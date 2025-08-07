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
  res.send('Hello World!')
})

router.post('/doc/upload', async (req: Request, res: Response) => {
  if ('name' in req.body && 'text' in req.body) {
    // name is the name of the doc, text is the content
    const name = req.body.name
    const text = req.body.text
    const timestamp = Date.now()
    const file = new File([text], `HACKATHON ${name}`, { type: 'text/plain' })
    try {
      const upload = await pinata.upload.private.file(file)
      const cid = upload.cid
      const data = app.locals.data
      if (!data[name]) {
        data[name] = []
      }
      const commit: DocumentCommit = { text, timestamp, cid }
      data[name].push(commit)
      console.log(`uploaded file ${name} at ${timestamp}`, data)
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
  } else {
    res.status(400).json({
      message: 'bad request, fix your parameters dingus',
    })
  }
})

export { router }
