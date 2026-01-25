import express from 'express'
import cors from 'cors'
const app = express()
import type { Request, Response } from 'express'
import { Router } from 'express'
import campaignRouter from './routers/campaignRouter.js'
import { db } from './lib/db.js'
import webhookRouter from './webhooks/emailWebhooks.js'

// Enable CORS for frontend
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', campaignRouter)
app.use('/api', webhookRouter)

const router = Router()

router.get("/health", (req: Request, res: Response) => {
    res.status(200).send("Health point. The server is running correctly")
})

app.use('/api', router)
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});




