import { getRooms, createRoom } from "../service/gameroom_service"
import { GameRoom, User } from "../types/shared/SocketTypes"
import Debug from "debug"
import { getUsersInGameroom, updateUser } from "../service/user_service"
const debug = Debug('chat:room_controller')

let roomNr = 1

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

/*
 * Check if room exists, or else, create a new room
 * Check if a user is waiting, if not, connect user to a new room
 */
export const checkAvailableRooms = async (user: User) => {
    // Look for rooms available
    const rooms = await getRooms()
    debug('rooms found:', rooms)

    // If no rooms found, create a new room with users null
    if (rooms.length < 1) {
        debug('Room < 1, created new room with one user')
        addRoom(user)
    } else {
        // Check if there is a room with one user connected (waiting)
        const nrOfUsersInGameroom = rooms.map(room => room.users.length)
        const availableRoomFound = nrOfUsersInGameroom.find(room => room < 2)

        if (availableRoomFound) {
            const users = rooms.map(room => room.users)
            const singleUser = users.find(user => user.length < 2)

            if (singleUser) {
                return singleUser[0].gameroomId
            }
        } else {
            addRoom(user)
            debug('Room full, created new room with one user')
        }
    }
}

