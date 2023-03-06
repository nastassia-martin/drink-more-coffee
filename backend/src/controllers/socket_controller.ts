import Debug from 'debug'
const debug = Debug('chat:socket_controller')

import { ClientToServerEvents, ServerToClientEvents } from '../types/shared/SocketTypes'
import { Socket } from 'socket.io'
import { io } from '../../server'
import { createUser, getUser, getUsersInGameroom, updateUser, updateReactionTime } from '../service/user_service'
import { checkAvailableRooms, checkPlayerStatus } from './room_controller'
import { getRoom } from '../service/gameroom_service'
import { check } from 'express-validator'

export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    debug('A user connected', socket.id)

    // Listen for user created
    socket.on('userJoin', async (user) => {
        // Create the incoming user in the database 
        await createUser(user)

        // Get the id of the Gameroom user are supposed to enter
        const availableRoomId = await checkAvailableRooms(user)
        if (!availableRoomId) {
            return
        }

        // Connect user to gameroom 
        await updateUser(user, availableRoomId)

        // Add user to gameroom available
        socket.join(availableRoomId)

        // Check if there is an player waiting or not, returns true/false
        const playerWaiting = await checkPlayerStatus()
        if (playerWaiting && availableRoomId) {
            // Emit playerWaiting to the client
            io.in(availableRoomId).emit('playerWaiting', user)
        } else {
            // Emit playerReady to the client
            io.in(availableRoomId).emit('playerReady', user)
        }
    })

    socket.on('startGame', async (x, y, callback) => {
        // Get the current gameroomId
        const user = await getUser(socket.id)
        const gameroomId = user?.gameroomId

        if (gameroomId) {
            const room = await getRoom(gameroomId)
            const usersInRoom = room?.users.filter(user => user.reactionTime)

            if (room) {
                debug('hittade room')
                callback({
                    success: true,
                    data: {
                        name: room?.name,
                        users: room?.users
                    }
                })
            }

            // Randomise position
            let width = Math.floor(Math.random() * x)
            let height = Math.floor(Math.random() * y)

            // Randomise delay 
            const delay = randomiseDelay()

            // After delay, get the current time and emit to clien  
            setTimeout(() => {
                io.in(gameroomId).emit('showCup', width, height)
            }, delay * 1000)
        }
    })

    // Listen for cup clicked, recieve current time cup was clicked
    socket.on('cupClicked', async (x, y, reactionTime) => {
        // Get the current gameroomId
        const user = await getUser(socket.id)
        const gameroomId = user?.gameroomId

        // Get rooms
        if (gameroomId) {
            const room = await getRoom(gameroomId)
            const usersInRoom = room?.users.filter(user => user.reactionTime)

            // Measure reactiontime
            const reactionTimeTotal = calculateReactionTime(reactionTime)

            // Send reactionTime to database 
            const updatedUser = await updateReactionTime(socket.id, reactionTimeTotal)
            debug('users', usersInRoom)

            if (usersInRoom?.length === 2) {
                // Get room the game is in
                if (gameroomId) {
                    // Randomise position
                    let width = Math.floor(Math.random() * x)
                    let height = Math.floor(Math.random() * y)

                    // Randomise delay 
                    const delay = randomiseDelay()

                    // After delay, get the current time and emit to clien  
                    setTimeout(() => {
                        io.in(gameroomId).emit('showCup', width, height)
                    }, delay * 1000)
                }
            } else {
                return
            }
        }
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

