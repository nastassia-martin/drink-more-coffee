import { getRooms, createRoom } from "../service/gameroom_service"
import { GameRoom } from "../types/shared/SocketTypes"
import Debug from "debug"
const debug = Debug('chat:room_controller')

/**
 * Check if room exists, or else, create a new room
 * Check if a user is waiting, if not, connect user to a new room
 */
export const checkAvailableRooms = async () => {
    // Look for rooms available
    const rooms = await getRooms()

    // If no rooms found, create a new room with users null
    if (rooms.length < 1) {
        let roomNr = 1

        // Create a room object
        const newRoom: GameRoom = {
            name: `Gameroom #${roomNr}`,
            users: null
        }

        const createdRoom = await createRoom(newRoom)
        debug('Created room:', createdRoom)
    }

    // Check if there is a room with one user connected (waiting)
    // find rooms med användare färre än 2


    // If there is no user waiting, connect the first user to the room

}


