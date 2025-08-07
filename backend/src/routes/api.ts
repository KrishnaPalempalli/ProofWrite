import { Request, Response } from 'express'
import { Router } from 'express'
import { app } from '..'

type DocumentCommit = {
  text: string
  timestamp: number // unix ms
  cid: string
}

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
    const cid = 'TODO'
    const data = app.locals.data
    if (!data[name]) {
      data[name] = []
    }
    const commit: DocumentCommit = { text, timestamp, cid }
    data[name].push(commit)
    console.log(data)
    res.status(200).send({
      message: 'successfully uploaded',
      cid,
    })
  } else {
    res.status(400).json({
      message: 'bad request, fix your parameters dingus',
    })
  }
})

export { router }
