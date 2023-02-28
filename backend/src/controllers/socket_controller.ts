import Debug from 'debug'
const debug = Debug('chat:socket_controller')

import { ClientToServerEvents, ServerToClientEvents } from '../types/shared/SocketTypes'
import { Socket } from 'socket.io'
import { createUser } from '../service/user_service'
import { getRooms, createRoom } from '../service/gameroom_service'
import { checkAvailableRooms } from './room_controller'
import { Gameroom } from '@prisma/client'

export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    debug('A user connected', socket.id)

    // Listen for user created
    socket.on('userJoin', async (user) => {
        debug('User incoming:', user)

        const availableRoom = await checkAvailableRooms(user)

        // Create the incoming user in the database
        await createUser(user, availableRoom)

        // i could save the "available room" from that function, and use that to create the user 
    })
}