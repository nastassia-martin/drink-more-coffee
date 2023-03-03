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
        nickname: (document.querySelector('#nickname-input') as HTMLInputElement).value.trim()
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
    document.querySelector('.lobby-container')!.classList.remove('hide')
})

/**
 * When "Gå tillbaka till start" btn clicked, go to start view
 */
document.querySelector('.go-back-btn')?.addEventListener('click', () => {
    document.querySelector('.start-container')!.classList.remove('hide')
})

/**
 * If no other user connected, show "väntar på spelare"
 */
socket.on('playerWaiting', (user) => {
    console.log('Player is waiting')
    document.querySelector('.heading-center')!.innerHTML =
        `<h2 class="lobby-heading">${user.nickname} väntar på motspelare...</h2>
    <div class="gif-img">
      <iframe src="https://giphy.com/embed/3oriNLCq45I9mdJK1y" class="gif-img" allowFullScreen></iframe>
    </div>
    <h2 class="lobby-heading2">Motpelare inte redo...</h2>
    <button disabled type="submit" class="btn start-game-btn mt-4">Starta spel</button>
    `
})

/**
 * If another user connected, show "spelare redo"
 */
socket.on('playerReady', (user) => {
    console.log('Player is ready')
    document.querySelector('.heading-center')!.innerHTML =
        `<h2 class="lobby-heading">${user.nickname} ready..</h2>
        <button type="submit" class="btn start-game-btn mt-4">Starta spel</button>
    `

    /**
     * START GAME
     */
    document.querySelector('.start-game-btn')?.addEventListener('click', () => {
        const gameGrid = document.querySelector('#game-grid') as HTMLDivElement
        let y = gameGrid.offsetHeight
        let x = gameGrid.offsetWidth

        // Let the server know the game is started and players are ready
        socket.emit('startGame', x, y)

        // Hide the lobby & show the game room
        document.querySelector('.lobby-container')!.classList.add('hide')
        document.querySelector('.game-room-container')!.classList.remove('hide')

        // Listen for when cup should show, gives us the current time
        socket.on('showCup', (width, height) => {
            // INSERT COFFEE CUP 
            document.querySelector('#game-grid')!.innerHTML = `<img src="./src/assets/images/pngegg.png" alt="coffee-cup" id="coffee-virus" class="coffee">`
            let coffee = document.querySelector('.coffee') as HTMLImageElement
            coffee.style.left = width + 'px'
            coffee.style.top = height + 'px'
            startTimer()

            // Listen for clicks on coffee cup
            document.querySelector('#coffee-virus')?.addEventListener('click', () => {
                y = gameGrid.offsetHeight
                x = gameGrid.offsetWidth
                // Emit that the cup is clicked
                socket.emit('cupClicked', x, y)
                document.querySelector('#game-grid')!.innerHTML = ``
                resetTimer()
            })
        })
    })
})

// ** Measure reaction time and display timer ** 
let [tenth, seconds, minutes] = [0, 0, 0]
let player1Clock = document.querySelector('#player-1-clock')
let player2Clock = document.querySelector('#player-2-clock')
let int: any = null

const startTimer = () => {
    if (int !== null) {
        clearInterval(int)
    }
    int = setInterval(displayTimer, 100)
}

const resetTimer = () => {
    clearInterval(int);
    [tenth, seconds, minutes] = [0, 0, 0]
    player1Clock!.innerHTML = '00 : 00 : 00'
    player2Clock!.innerHTML = '00 : 00 : 00'
}

const displayTimer = () => {
    tenth += 10;
    if (tenth == 100) {
        tenth = 0;
        seconds++;
        if (seconds == 60) {
            seconds = 0;
            minutes++;
        }
    }

    let m: string | number = minutes < 10 ? '0' + minutes : minutes
    let s: string | number = seconds < 10 ? '0' + seconds : seconds
    let t: string | number = tenth < 10 ? '0' + tenth : tenth < 100 ? + tenth : tenth
    player1Clock!.innerHTML = ` ${m} : ${s} : ${t}`
    player2Clock!.innerHTML = ` ${m} : ${s} : ${t}`
}

