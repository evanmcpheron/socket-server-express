import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'
import connectSockets from "./v1/Config/connectSockets";

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
})
app.io = io
app.set('trust proxy', true)
const PORT = process.env.PORT || 8080

const application = {
  app,
}

const origin =
  process.env.NODE_ENV === 'production'
    ? 'https://www.example.com'
    : 'http://localhost:3000'

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(
  cors({
    credentials: true,
    origin,
  })
)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header(
    'Access-Control-Allow-Methods',
    'GET,PUT,POST,DELETE,UPDATE,OPTIONS'
  )
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
  )
  next()
})

connectSockets(app, server, io);

app.use('/v1', require('./v1/Routes/index')(application))

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, async () => {
    // await connectDB()
    console.log(`Server listening on http://localhost:${PORT}`)
  })
}

module.exports = app
