/**
 * User service
 */

import prisma from '../prisma'
import { CreateUser } from '../types'

/**
 * Create user 
 */
export const createUser = async (data: CreateUser) => {
    return await prisma.user.create({
        data: data
    })
}