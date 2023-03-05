/**
 * Gameroom service
 */

import prisma from '../prisma'
import { GameRoom, User } from '../types/shared/SocketTypes'

/**
 * Get all rooms and their users 
 */
export const getRooms = async () => {
    return await prisma.gameroom.findMany({
        include: {
            users: true
        }
    })
}

/**
 * Get a specific room
 */
export const getRoom = async (gameroomId: string) => {
    return await prisma.gameroom.findUnique({
        where: {
            id: gameroomId
        }, include: {
            users: true
        }
    })
}

/**
 * Create room 
 */
export const createRoom = async (room: GameRoom, user: User) => {
    return await prisma.gameroom.create({
        data: {
            name: room.name,
            userConnected: true,
            users: {
                connectOrCreate: {
                    where: { id: user.id },
                    create: {
                        id: user.id,
                        nickname: user.nickname
                    }
                }
            }
        }
    })
}