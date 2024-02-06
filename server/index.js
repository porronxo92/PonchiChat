import express from 'express'
import logger from 'morgan'
import { joinPath, getDateNow } from './utils.js'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config() //para cargar el archivo .env
const PORT = process.env.PORT ?? 2222
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user_root:ruben.2409@localhost:5432/ponchichat'
const client = new pg.Client(DATABASE_URL)
await client.connect()

const app = express()
const server = createServer(app) //creacion del servidor HTTP nativo para pasarselo al socket
const io = new Server(server, {
  connectionStateRecovery: {},
  //objeto que indique el tiempo maximo de desconexion que queremos guardar los mensajes
}) //creacion del servidor Socket.io

app.use(logger('dev'))
app.use(express.static(process.cwd() + '/web'))
//logger para express para trazar las peticiones que se hacen desde el cliente al servidor
//Escribe en consola la peticion, el metodo, el error que ha respondido el servidor al cliente y los ms de tiempo que ha tardado

const getUsername = async (user) => {
  try {
    const userbbdd = await client.query('SELECT * from users where nombre = $1;', [user])
    if (userbbdd.rows.length == 0) {
      const {
        rows: [{ uuid }],
      } = await client.query('SELECT gen_random_uuid () as uuid;')
      await client.query(
        `
                  INSERT INTO users (id, nombre) values ($1, $2);`,
        [uuid, user]
      )
      return { id: uuid, nombre: user }
    }
    return userbbdd.rows[0]
  } catch (error) {
    console.error('Error user_connected:', error.message)
  }
}

io.on('connection', async (socket) => {
  console.log('Socket connected!!', socket.id)

  socket.on('disconnect', () => {
    console.log('user disconnected!!')
  })

  //socket es la comunicacion unicamente con un unico usuario
  //io es para la comunicacion con toda la "red" de usuarios a ese broadcast
  socket.on('user_connected', async (user) => {
    const usuario = await getUsername(user)
    console.log('Usuario conectado: ', usuario)

    socket.broadcast.emit('user_connected', usuario.nombre)
    socket.emit('user_connected', usuario.nombre)
    await emitAllMessages(socket, usuario.nombre)
  })

  socket.on('chat_message', async (message, user_connected) => {
    try {
      console.log('mensaje cliente: ' + message)
      console.log(user_connected)
      const {
        rows: [{ uuid }],
      } = await client.query('SELECT gen_random_uuid () as uuid;')
      const usuario = await getUsername(user_connected)
      const {
        rows: [{ timestamp }],
      } = await client.query('select CURRENT_TIMESTAMP as timestamp;')
      await client.query(
        `
        INSERT INTO messages (id, id_user, mensaje, fecha_creacion) values ($1, $2, $3, $4);`,
        [uuid, usuario.id, message, timestamp]
      )
      socket.broadcast.emit('chat_message', message, user_connected, getDateNow(timestamp), true)
      socket.emit('chat_message', message, user_connected, getDateNow(timestamp), false)
    } catch (error) {
      console.error('Error chat_message:', error)
    }
  })

  if (!socket.recovered) {
    //Whether the connection state was successfully recovered during the last reconnection.
    //recuperar los mensajes anteriores al ultimo
    console.log('Recuperar mensajes sin conexion')
    try {
      await emitAllMessages(socket)
    } catch (e) {
      console.error('Error recovered:', e.message)
    }
  }
})

async function emitAllMessages(socket, user_connected) {
  console.log('Socket connected para emitir los mensajes!!', socket.id)

  console.log('Emitir todos los mensajes')

  let isRecived = true
  const mensajes = await client.query(
    `select nombre, mensaje, fecha_creacion from messages m  
    join users u 
    on m.id_user = u.id 
    order by  m.fecha_creacion  asc;`
  )

  mensajes.rows.forEach((element) => {
    console.log(`Usuario del mensaje ${element.nombre} -- Usuario autenticado ${user_connected}`)
    if (element.nombre == user_connected) {
      isRecived = false
    }
    socket.emit('chat_message', element.mensaje, element.nombre, getDateNow(element.fecha_creacion), isRecived)
    isRecived = true
  })
}

app.get('/', (req, res) => {
  console.log(process.cwd()) //desde donde se esta ejecutando el proceso
  const pathindex = joinPath(process.cwd(), '/web/index.html')
  res.send(pathindex)
})

//La conexion seria: Express --> Servidor HTTP Nativo NodeJS --> Socket.oi
server.listen(PORT, () => {
  //escuchamos el servidor HTTP nativo que embebe el servidor express
  console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`)
})
