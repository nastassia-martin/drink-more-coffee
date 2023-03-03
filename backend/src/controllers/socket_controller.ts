import Debug from 'debug'
const debug = Debug('chat:socket_controller')

import { ClientToServerEvents, ServerToClientEvents } from '../types/shared/SocketTypes'
import { Socket } from 'socket.io'
import { createUser, updateUser } from '../service/user_service'
import { checkAvailableRooms, checkPlayerStatus } from './room_controller'
import { Stopwatch } from "ts-stopwatch";

const stopwatch = new Stopwatch()

export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    debug('A user connected', socket.id)

    // Listen for user created
    socket.on('userJoin', async (user) => {
        debug('User incoming from client:', user)

        // Create the incoming user in the database 
        await createUser(user)

        // Get the id of the Gameroom user are supposed to enter
        const availableRoomId = await checkAvailableRooms(user)

        if (availableRoomId) {
            // Connect user to gameroom 
            await updateUser(user, availableRoomId)

            // Add user to gameroom available
            socket.join(availableRoomId)
        }

        // Check if there is an player waiting or not, returns true/false
        const playerWaiting = await checkPlayerStatus()

        if (playerWaiting) {
            // Emit playerWaiting to the client
            socket.emit('playerWaiting', user)
        } else {
            socket.emit('playerReady', user)
            // Emit playerReady to the client
            socket.broadcast.emit('playerReady', user)
        }
    })

    socket.on('startGame', (x, y) => {
        debug('startGame recieved from the client')

        // Randomise position
        let width = Math.floor(Math.random() * x)
        let height = Math.floor(Math.random() * y)

        // Randomise delay 
        const delay = randomiseDelay()

        // After delay, get the current time and emit to client
        setTimeout(() => {
            socket.emit('showCup', width, height)
        }, delay * 1000)
    })

    // Listen for cup clicked, recieve current time cup was clicked
    socket.on('cupClicked', (x, y, reactionPlayer1, reactionPlayer2) => {
        // Measure reactiontime
        calculateReactionTime(reactionPlayer1)
        calculateReactionTime(reactionPlayer2)

        // Randomise position
        let width = Math.floor(Math.random() * x)
        let height = Math.floor(Math.random() * y)

        // Randomise delay 
        const delay = randomiseDelay()

        // After delay, get the current time and emit to client
        setTimeout(() => {
            socket.emit('showCup', width, height)
        }, delay * 1000)
    })
}

/**
 * Calculate reaction time in tenth seconds
 */
const calculateReactionTime = (time: string) => {
    const tenth1 = time.slice(10)
    const sec1 = time.slice(5, 8)
    const min1 = time.slice(0, 3)
    let total: number

    if (min1) {
        // en minut = 60 sekunder
        // 60 sekunder = 600 tenth
        total = 600 * Number(min1)
    }
}

/**
 * Randomise a number to use as delay in setTimeouts
 * @returns a random number between 1 - 5
 */
const randomiseDelay = () => {
    return Math.floor(Math.random() * 6) + 1
}

/**
 * Get the current time
 * @returns time in 00:00:00 format
 */


