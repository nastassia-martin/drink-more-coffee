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

// Get the elements for stopwatches
const player1NameEl = document.querySelector('#player-1-name')
const player2NameEl = document.querySelector('#player-2-name')
let player1Clock = document.querySelector('#player-1-clock') as HTMLElement
let player2Clock = document.querySelector('#player-2-clock') as HTMLElement
let player1AnswerClock = document.querySelector('#player-1-answer-clock') as HTMLElement
let player2AnswerClock = document.querySelector('#player-2-answer-clock') as HTMLElement

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
})

let rounds = 1
let roundsTotal = 10
const roundsDisplay = document.querySelector(".rounds-div")

// Show current round
const showRounds = () => {
    roundsDisplay!.textContent = `Runda: ${rounds} / ${roundsTotal}`
}

// Listen for when cup should show
socket.on('showCup', (width, height) => {
    // Remove the answered time and set elements back
    player1AnswerClock.classList.add('hide-timer')
    player1Clock.classList.remove('hide-timer')
    player2AnswerClock.classList.add('hide-timer')
    player2Clock.classList.remove('hide-timer')

    resetTimer()
    // Show coffee cup on randomised position and start timer
    document.querySelector('#game-grid')!.innerHTML = `<img src="./src/assets/images/pngegg.png" alt="coffee-cup" id="coffee-virus" class="coffee">`
    let coffee = document.querySelector('.coffee') as HTMLImageElement
    coffee.style.left = width + 'px'
    coffee.style.top = height + 'px'

    // Start timer for both players
    startTimer()
    showRounds()

    // Listen for clicks on coffee cup
    document.querySelector('#coffee-virus')?.addEventListener('click', () => {
        // Get the reaction time from each player
        const reactionTime = document.querySelector('#player-1-clock')!.innerHTML

        document.querySelector('#game-grid')!.innerHTML = ``
        y = gameGrid.offsetHeight
        x = gameGrid.offsetWidth
        rounds++

        // Emit that the cup is clicked, get back result of who answered first
        socket.emit('cupClicked', x, y, reactionTime, rounds, (userAnswered) => {
            if (player1NameEl?.innerHTML === `${userAnswered.data?.nickname}`) {
                // change regular timer to hide
                player1Clock.classList.add('hide-timer')

                // change innertext to reactiontime on answerclock
                player1AnswerClock.classList.remove('hide-timer')
                player1AnswerClock.innerText = `${reactionTime}`

            } else if (player2NameEl?.innerHTML === `${userAnswered.data?.nickname}`) {
                // change regular timer to hide
                player2Clock.classList.add('hide-timer')

                // change innertext to reactiontime on answerclock
                player2AnswerClock.classList.remove('hide-timer')
                player2AnswerClock.innerText = `${reactionTime}`
            } else if (!userAnswered.success) {
                // If both answered, pause timer
                pauseTimer()
            }
        })
    })
})

/**
 * LOBBY SECTION
 * @param user 
 */
document.querySelector('.to-lobby-btn')!.addEventListener('click', () => {
    // ** Hide start-view and display lobby **
    document.querySelector('.lobby-container')!.classList.remove('hide')
    document.querySelector('.start-container')!.classList.add('hide')

    socket.emit('goToLobby', (result) => {
        // Get the users reactiontimes

        result.data?.forEach(room => {
            if (room.users) {
                // Write out ongoing games with nicknames and scores
                document.querySelector('.ongoing-games-column')!.innerHTML += `
                    <li class="ongoing-list">
                        <span>${room.users[0].nickname} | ${room.users[1].nickname}</span>
                        <span>SCORE 1 | SCORE 2</span>
                    </li>
                `
                // Write out highscores
                document.querySelector('.highscore-column')!.innerHTML += `
                    <li class="highscore-list">
                        <span>NAME 1 | NAME 2</span>
                        <span>SCORE 1 | SCORE 2</span>
                    </li>
                `
            }
        })

        // Check that the scores updates in realtime

    })

})

const gameOver = document.querySelector('.gameover-container')

socket.on('gameOver', (user) => {
    gameOver!.classList.remove('hide')
    document.querySelector('.game-room-container')!.classList.add('hide')

    gameOver!.innerHTML = `
    <button class="play-again">Play again!</button>
    
    <div class='content'>
        <h2>AND THE WINNER IS......</h2>
        <h4>↓ HOVER ME ↓</h4>
        <div class="letter-image">
            <div class="animated-mail">
                <div class="back-fold"></div>
                <div class="letter">
                    <div class="letter-title">
                        <h3>${user.nickname}</h3>
                    </div>
                </div>
                <div class="top-fold"></div>
                <div class="body"></div>
                <div class="left-fold"></div>
            </div>
            <div class="shadow"></div>
        </div>  
    </div>  
    `
    // ** If 'tillbaka till start' pressed, hide lobby and show start-view ** 
    document.querySelector('.play-again')?.addEventListener('click', () => {
        document.querySelector('.gameover-container')!.classList.add('hide')
        document.querySelector('.start-container')!.classList.remove('hide')
        console.log('click')
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

    // When "Gå till Lobby" button clicked, go to lobby
    document.querySelector('.start-container')!.classList.add('hide')
    document.querySelector('.search-lobby-container')!.classList.remove('hide')
})

// ** If 'tillbaka till start' pressed, hide lobby and show start-view ** 
document.querySelector('.go-back-btn')?.addEventListener('click', () => {
    document.querySelector('.start-container')!.classList.remove('hide')
    document.querySelector('.lobby-container')!.classList.add('hide')
})

// ** Measure reaction time and display timer ** 
let [tenth, seconds, minutes] = [0, 0, 0]

let int: any = null

const startTimer = () => {
    if (int !== null) {
        clearInterval(int)
    }
    int = setInterval(displayTimer, 100)
}

// When timer is paused, replace the li elements with new ones so that timer doesnt updates
const pauseTimer = () => {
    clearInterval(int)
}

const resetTimer = () => {
    // Clear timer
    clearInterval(int);
    [tenth, seconds, minutes] = [0, 0, 0]
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

    let m: string | number = minutes < 10 ? '0' + minutes : minutes;
    let s: string | number = seconds < 10 ? '0' + seconds : seconds;
    let t: string | number = tenth < 10 ? '0' + tenth : tenth < 100 ? + tenth : tenth;

    if (player1Clock) player1Clock.innerHTML = ` ${m} : ${s} : ${t}`;
    if (player2Clock) player2Clock.innerHTML = ` ${m} : ${s} : ${t}`;
}




