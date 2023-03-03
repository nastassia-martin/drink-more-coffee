import Debug from 'debug'
const debug = Debug('chat:socket_controller')

import { ClientToServerEvents, ServerToClientEvents } from '../types/shared/SocketTypes'
import { Socket } from 'socket.io'
import { createUser, updateUser } from '../service/user_service'
import { checkAvailableRooms, checkPlayerStatus } from './room_controller'

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
        const reactionTime1 = calculateReactionTime(reactionPlayer1)
        const reactionTime2 = calculateReactionTime(reactionPlayer2)

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
    // Get the values from 00 : 00 : 00 format
    const min = time.slice(0, 3)
    const sec = time.slice(5, 8)
    const tenth = time.slice(10)

    // Add the values to total
    let total: number = 0
    if (min) total = 600 * Number(min)
    if (sec) total = total + (60 * Number(sec))
    if (tenth) total = total + (Number(tenth))

    return total
}

/**
 * Randomise a number to use as delay in setTimeouts
 * @returns a random number between 1 - 5
 */
const randomiseDelay = () => {
    return Math.floor(Math.random() * 6) + 1
}

