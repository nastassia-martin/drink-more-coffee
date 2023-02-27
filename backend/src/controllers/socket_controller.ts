import Debug from 'debug'
const debug = Debug('chat:socket_controller')

import { ClientToServerEvents, ServerToClientEvents } from '../types/shared/SocketTypes'
import { Socket } from 'socket.io'
import { createUser } from '../service/user_service'
import { getRooms, createRoom } from '../service/gameroom_service'

export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    debug('A user connected', socket.id)

    // Listen for user created
    socket.on('userJoin', async (user) => {
        debug('User incoming:', user)

        // Get rooms, if no rooms, create a new with users null 
        const rooms = await getRooms()

        // Create user in database
        const connectedUser = await createUser(user)

        if (!connectedUser.gameroomId) {
            await createRoom(connectedUser)
        }

        debug(rooms)
    })
}