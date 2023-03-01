import './assets/scss/style.scss'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, User, ServerToClientEvents } from '@backend/types/shared/SocketTypes'

// Connect to Socket.IO server
const SOCKET_HOST = import.meta.env.VITE_APP_SOCKET_HOST
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST)

// Listen for connection
socket.on('connect', () => {
    console.log('Connected to the server', socket.id)
})

// Listen for disconnect
socket.on('disconnect', () => {
    console.log('Disconnected from the server')
})

// @todo Add listen for reconnect ?


/**
 * @todo WHEN 'gå vidare' is clicked, submit user to database
 * Put user in a room, max 2 users at once
 * validate nickname
 *  */
document.querySelector('#nickname-form')?.addEventListener('submit', (e) => {
    e.preventDefault()

    // Save nickname and emit to the server
    const user: User = {
        id: socket.id,
        nickname: (document.querySelector('#nickname-input') as HTMLInputElement).value
    }

    // If nothing was entered/created, tell user and return
    if (!user) {
        document.querySelector('.nickname-label')!.innerHTML = 'Skriv in ett nickname'
        return
    }

    // Emit user joined to the server
    socket.emit('userJoin', user)

    /**
     * When "gå vidare" button clicked, go to lobby
     */
    document.querySelector('.start-container')!.classList.add('hide')
})

document.querySelector('.go-back-btn')?.addEventListener('click', () => {
    document.querySelector('.start-container')!.classList.remove('hide')
})

/**
 * START GAME
 */
document.querySelector('.start-game-btn')?.addEventListener('click', e => {
    // Let the server know the game is started and players are ready
    socket.emit('startGame')
    console.log('startGame emitted to the server')

    // Listen for gameStarted, gives us delay and position
    socket.on('gameStarted', (delay) => {
        // Use delay from server to set the timeout
        setTimeout(() => {
            // INSERT COFFEE CUP 
            console.log('HEJ HEJ', delay)
        }, delay * 1000)
    })
})

// Listen for playerWaiting
socket.on('playerWaiting', (user) => {
    console.log('Player is waiting')
    document.querySelector('.heading-center')!.innerHTML =
        `<h2 class="lobby-heading">${user.nickname} väntar på motspelare...</h2>
    <div class="gif-img">
      <iframe src="https://giphy.com/embed/3oriNLCq45I9mdJK1y" class="gif-img" allowFullScreen></iframe>
    </div>
    <h2 class="lobby-heading2">Motpelare inte redo...</h2>
    <button type="submit" class="btn start-game-btn mt-4">Starta spel</button>
    `
})

// Listen for playerReady
socket.on('playerReady', (user) => {
    console.log('Player is ready')
    document.querySelector('.heading-center')!.innerHTML =
        `<h2 class="lobby-heading">${user.nickname} ready..</h2>
        <button type="submit" class="btn start-game-btn mt-4">Starta spel</button>
    `

})