import { getRooms, createRoom } from "../service/gameroom_service"
import { GameRoom, User } from "../types/shared/SocketTypes"
import Debug from "debug"
import { getUsersInGameroom, updateUser } from "../service/user_service"
const debug = Debug('chat:room_controller')

let roomNr = 1

/**
 * Create a new room in db and add to count
 * @param user: the user connected
 * @returns the id of the created room
 */
const addRoom = async (user: User) => {
    // Create a room object
    const newRoom: GameRoom = {
        name: `Gameroom #${roomNr}`,
        connectedUser: false,
        users: null
    }

    // Create a room in db
    const createdRoom = await createRoom(newRoom, user)

    // Add count on roomNr 
    roomNr++

    // Return the id of the createdRoom
    return createdRoom.id
}

/**
 * 
 * @param user 
 * @returns 
 */
//export let playerWaiting: boolean = false



/*
 * Check if room exists, or else, create a new room
 * Check if a user is waiting, if not, connect user to a new room
 */
export const checkAvailableRooms = async (user: User) => {
    // Look for rooms available
    const rooms = await getRooms()

    // If no rooms found, create a new room with users null
    if (rooms.length < 1) {
        // VÄNTAR PÅ SPELARE
        // Här blir man ensam spelare i ett rum
        debug('Room < 1, created new room with one user')
        return await addRoom(user)
    } else {
        // Check if there is a room with one user connected (waiting)
        const nrOfUsersInGameroom = rooms.map(room => room.users.length)
        const availableRoomFound = nrOfUsersInGameroom.find(room => room < 2)

        if (availableRoomFound) {
            const users = rooms.map(room => room.users)
            const singleUser = users.find(user => user.length < 2)

            if (singleUser) {
                // REDO 
                // Här kommer båda spelarna att vara redo
                debug('Found available room')
                return singleUser[0].gameroomId
            }
        } else {
            // VÄNTAR PÅ SPELARE
            // Här blir man ensam spelare i ett rum
            debug('Room full, created new room with one user')
            return await addRoom(user)
        }
    }
}

/**
 * 
 */
export const checkPlayerStatus = async () => {
    let playerWaiting: Boolean

    // Look for rooms available
    const rooms = await getRooms()

    // If no rooms found, create a new room with users null
    if (rooms.length < 1) {
        // VÄNTAR PÅ SPELARE
        // Här blir man ensam spelare i ett rum
        debug('Player waiting')
        return playerWaiting = true
    } else {
        // Check if there is a room with one user connected (waiting)
        const nrOfUsersInGameroom = rooms.map(room => room.users.length)
        const availableRoomFound = nrOfUsersInGameroom.find(room => room < 2)

        if (availableRoomFound) {
            const users = rooms.map(room => room.users)
            const singleUser = users.find(user => user.length < 2)

            if (singleUser) {
                // REDO 
                // Här kommer båda spelarna att vara redo
                debug('Player not waiting')
                return playerWaiting = false
            }
        } else {
            // VÄNTAR PÅ SPELARE
            // Här blir man ensam spelare i ett rum
            debug('Player waiting')
            return playerWaiting = true
        }
    }
}