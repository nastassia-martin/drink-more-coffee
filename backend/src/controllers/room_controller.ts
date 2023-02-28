import { getRooms, createRoom } from "../service/gameroom_service"
import { GameRoom, User } from "../types/shared/SocketTypes"
import Debug from "debug"
import { getUsersInGameroom, updateUser } from "../service/user_service"
const debug = Debug('chat:room_controller')

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
        let roomNr = 1

        // Create a room object
        const newRoom: GameRoom = {
            name: `Gameroom #${roomNr}`,
            connectedUser: false,
            users: null
        }

        // Create a room in db
        const createdRoom = await createRoom(newRoom, user)

        // Return the id of the createdRoom
        return createdRoom.id
    }

    // Check if there is a room with one user connected (waiting)
    const usersInGameroom = rooms.map(room => room.users)
    debug('Users in gameroom:', usersInGameroom)


    // find rooms med användare färre än 2
}


