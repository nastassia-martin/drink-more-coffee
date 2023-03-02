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
            // Emit playerReady to the client
            socket.emit('playerReady', user)
        }
    })

    // Listen for game starting, recieve positions
    socket.on('startGame', () => {
        // Randomise position

        // Set start time
        const reactionTime = `00:00:00`

        // Randomise delay 
        const delay = randomiseDelay()

        // After delay, get the current time and emit to client
        setTimeout(() => {
            socket.emit('showCup', reactionTime)
            stopwatch.start()
        }, delay * 1000)
    })

    // Listen for cup clicked, recieve current time cup was clicked
    socket.on('cupClicked', () => {
        // Measure reactiontime
        stopwatch.stop()
        let reactionTime = Math.floor(stopwatch.getTime()).toString()
        console.log("Reaction time:", reactionTime)
        stopwatch.reset()

        // Randomise position

        // Randomise delay 
        const delay = randomiseDelay()

        // After delay, get the current time and emit to client
        setTimeout(() => {
            socket.emit('showCup', reactionTime)
            stopwatch.start()
        }, delay * 1000)
    })
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


