/**
 * User service
 */

import prisma from '../prisma'
import { User } from '../types/shared/SocketTypes'


/**
 * Create user 
 */
export const createUser = async (data: User) => {
    return await prisma.user.create({
        data: data
    })
}

