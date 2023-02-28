/**
 * Gameroom service
 */

import prisma from '../prisma'
import { GameRoom, User } from '../types/shared/SocketTypes'

/**
 * Create room 
 */
export const createRoom = async (room: GameRoom) => {
    return await prisma.gameroom.create({
        data: {
            name: room.name
        }
    })
}

/**
 * Connect user to room
 */
/* export const connectUser = async(user: User) => {
    return await prisma.user.update({
        data: {
            gameroomId: 
        }
    })
} */

/**
 * Get all rooms and their users 
 */
export const getRooms = async () => {
    return await prisma.gameroom.findMany()
}