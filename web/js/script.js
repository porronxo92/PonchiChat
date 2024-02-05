import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js'

const form = document.getElementById('form')
const input = document.getElementById('input')
const messages = document.getElementById('messages')
const username = document.getElementById('username')
const modal = document.getElementById('myModal')
const modalform = document.getElementById('userForm')
const usuarios_conected = document.getElementById('users_connected')
const user = localStorage.getItem('username')
const socket = io()

document.addEventListener('DOMContentLoaded', function () {
  console.log('Cookie usuario: ', user)
  if (user) {
    modal.style.display = 'none'
    socket.emit('user_connected', user)
  }
})

// Cuando se envíe el formulario, cerrar la modal si el campo de usuario está relleno
modalform.addEventListener('submit', (e) => {
  e.preventDefault()
  if (!username.value) {
    alert('Por favor, rellene el campo de usuario.')
  } else {
    localStorage.setItem('username', username.value)
    socket.emit('user_connected', username.value)
    modal.style.display = 'none'
  }
})

// Cuando se haga clic fuera de la modal, no hacer nada
window.onclick = function (event) {
  if (event.target == modal) {
    return false
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  let username_connected = username.value ? username.value : user
  console.log('User connected:', username_connected)
  if (input.value) {
    socket.emit('chat_message', input.value, username_connected)
    input.value = '' //resetear el mensaje
  }
})

socket.on('chat_message', (msg, usuario, fecha_creacion, isRecived) => {
  if (isRecived) {
    // const item = `<li class="chat-bubble chat-bubble-received">
    //  <small>${usuario}</small>
    //  <p>${msg}</p>
    //  <small>${fecha_creacion}</small>
    //  </li>`

    const item_mensaje = `
      <div class="messages_row">
        <div class="chat-bubble chat-bubble-received">
          <span class="chat-bubble_user">${usuario}</span>
          <p class="chat-bubble_texto">
          ${msg}
          </p>
          <span class="chat-bubble_hora">${fecha_creacion}</span>
        </div>
        </div>
    `
    messages.insertAdjacentHTML('beforeend', item_mensaje)
  } else {
    const item_mensaje = `
    <div class="messages_row">
        <div class="chat-bubble chat-bubble-sent">
          <span class="chat-bubble_user">${usuario}</span>
          <p class="chat-bubble_texto">
          ${msg}
          </p>
          <span class="chat-bubble_hora">${fecha_creacion}</span>
        </div>
        </div>
    `
    messages.insertAdjacentHTML('beforeend', item_mensaje)
    messages.scrollTop = messages.scrollHeight
  }
})
socket.on('user_connected', (username) => {
  usuarios_conected.innerHTML = `${username} `
  console.log(username)
})
