import './assets/scss/style.scss'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, User, ServerToClientEvents } from '@backend/types/shared/SocketTypes'

// Connect to Socket.IO server
const SOCKET_HOST = import.meta.env.VITE_APP_SOCKET_HOST
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST)

// Get the coordinates for the grid
const gameGrid = document.querySelector('#game-grid') as HTMLDivElement
let y = gameGrid.offsetHeight
let x = gameGrid.offsetWidth

// Listen for connection
socket.on('connect', () => {
    console.log('Connected to the server', socket.id)
})

// Listen for disconnect
socket.on('disconnect', () => {
    console.log('Disconnected from the server')
})

// Listen for if player waiting
socket.on('playerWaiting', (user) => {
    // Display waiting page
    displayPlayerWaiting(user)
})

// Listen for if player is ready
socket.on('playerReady', () => {
    // Display ready page
    displayPlayerReady()

    // Get the coordinates and send to the server, to randomise position
    y = gameGrid.offsetHeight
    x = gameGrid.offsetWidth

    // Emit to server that the game is ready to start
    socket.emit('startGame', x, y, (gameroom) => {
        const users = gameroom.data?.users
        if (users) {
            // Display players name
            document.querySelector('#player-1-name')!.innerHTML = `${users[0].nickname}`
            document.querySelector('#player-2-name')!.innerHTML = `${users[1].nickname}`
        }
    })
    console.log('startgame emitted')
})

// Listen for when cup should show
socket.on('showCup', (width, height) => {
    resetTimer()
    // Show coffee cup on randomised position and start timer
    document.querySelector('#game-grid')!.innerHTML = `<img src="./src/assets/images/pngegg.png" alt="coffee-cup" id="coffee-virus" class="coffee">`
    let coffee = document.querySelector('.coffee') as HTMLImageElement
    coffee.style.left = width + 'px'
    coffee.style.top = height + 'px'
    startTimer()

    // Listen for clicks on coffee cup
    document.querySelector('#coffee-virus')?.addEventListener('click', () => {
        // Get the reaction time from each player
        const reactionTime = document.querySelector('#player-1-clock')!.innerHTML

        pauseTimer()
        y = gameGrid.offsetHeight
        x = gameGrid.offsetWidth

        // Emit that the cup is clicked
        socket.emit('cupClicked', x, y, reactionTime)

        document.querySelector('#game-grid')!.innerHTML = ``
    })
})

// ** Display waiting page **
const displayPlayerWaiting = (user: User) => {
    document.querySelector('.waiting-page')!.innerHTML =
        `<h2 class="search-lobby-heading">${user.nickname} väntar på motspelare...</h2>
    <div class="gif-img">
      <iframe src="https://giphy.com/embed/3oriNLCq45I9mdJK1y" class="gif-img" allowFullScreen></iframe>
    </div>
    <h2 class="search-lobby-heading2">Motpelare inte redo...</h2>
    `
}

// ** Display ready page **
const displayPlayerReady = () => {
    document.querySelector('.waiting-page')!.innerHTML =
        `<h2 class="search-lobby-heading">Hittade motspelare! Laddar spel.....</h2>
        <div class="gif-img">
      <iframe src="https://giphy.com/embed/3oriNLCq45I9mdJK1y" class="gif-img" allowFullScreen></iframe>
    </div>
    `

    // Hide the lobby & show the game room after 4sec delay
    setTimeout(() => {
        document.querySelector('.game-room-container')!.classList.remove('hide')
        document.querySelector('.search-lobby-container')!.classList.add('hide')
    }, 4000)
}

// ** Get username and emit to server ** 
document.querySelector('#nickname-form')?.addEventListener('submit', (e) => {
    e.preventDefault()

    // Save nickname and emit to the server
    const user: User = {
        id: socket.id,
        nickname: (document.querySelector('#nickname-input') as HTMLInputElement).value.trim(),
        reactionTime: null
    }

    // If nothing was entered/created, tell user and return
    if (!user) {
        document.querySelector('.nickname-label')!.innerHTML = 'Skriv in ett nickname'
        return
    }

    // Emit user joined to the server
    socket.emit('userJoin', user)

    // When "gå vidare" button clicked, go to lobby
    document.querySelector('.start-container')!.classList.add('hide')
    document.querySelector('.search-lobby-container')!.classList.remove('hide')
})

// ** Hide start-view and display lobby **
document.querySelector('.to-lobby-btn')!.addEventListener('click', () => {
    document.querySelector('.lobby-container')!.classList.remove('hide')
    document.querySelector('.start-container')!.classList.add('hide')
})

// ** If 'tillbaka till start' pressed, hide lobby and show start-view ** 
document.querySelector('.go-back-btn')?.addEventListener('click', () => {
    document.querySelector('.start-container')!.classList.remove('hide')
    document.querySelector('.lobby-container')!.classList.add('hide')
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

const pauseTimer = () => {
    clearInterval(int)
}

const resetTimer = () => {
    // Clear timer
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

