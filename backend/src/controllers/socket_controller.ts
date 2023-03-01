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
            // Emit playerReady to the client
            socket.emit('playerReady', user)
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