import Debug from 'debug'
const debug = Debug('chat:socket_controller')

import { ClientToServerEvents, ServerToClientEvents } from '../types/shared/SocketTypes'
import { Socket } from 'socket.io'
import { createUser, updateUser } from '../service/user_service'
import { getRooms, createRoom } from '../service/gameroom_service'
import { checkAvailableRooms, checkPlayerStatus } from './room_controller'
import { Gameroom } from '@prisma/client'

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

        const playerWaiting = await checkPlayerStatus()
        debug(playerWaiting)

        if (playerWaiting) {
            // Emit playerWaiting
            socket.emit('playerWaiting')
            debug('emitted playerWaiting to client')
        } else {
            // Emit playerReady
            socket.emit('playerReady')
            debug('emitted playerReady to clieten')
        }
    })

    // Listen for game starting
    socket.on('startGame', () => {
        // Randomise delay and emit to client
        const delay = Math.floor(Math.random() * (6 - 1) + 1)
        socket.emit('gameStarted', (delay))

        // Randomise position

    })
}