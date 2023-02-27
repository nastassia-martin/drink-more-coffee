/**
 * User service
 */

import prisma from '../prisma'
import { CreateUser } from '../types/shared/SocketTypes'


/**
 * Create user 
 */
export const createUser = async (data: CreateUser) => {
    return await prisma.user.create({
        data: data
    })
}