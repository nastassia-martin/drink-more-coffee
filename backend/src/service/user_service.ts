/**
 * User service
 */

import prisma from '../prisma'
import { GameRoom, User } from '../types/shared/SocketTypes'


/**
 * Create user 
 */
export const createUser = async (data: User, gameroomId: string) => {
    return await prisma.user.create({
        data: {
            nickname: data.nickname,
            gameroomId
        }
    })
}

