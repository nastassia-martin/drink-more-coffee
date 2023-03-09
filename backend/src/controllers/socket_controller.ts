import Debug from 'debug'
const debug = Debug('chat:socket_controller')

import { ClientToServerEvents, ServerToClientEvents } from '../types/shared/SocketTypes'
import { Socket } from 'socket.io'
import { io } from '../../server'
import { createUser, getUser, disconnectUser, updateUser, updateReactionTime, updateScore } from '../service/user_service'
import { checkAvailableRooms, checkPlayerStatus, calculateReactionTime, randomiseDelay } from './room_controller'
import { getRoom, updateRounds, getRooms, getTenGames } from '../service/gameroom_service'
import { createResult } from '../service/result_service'
import { calculateTotalReactionTime } from './user_controller'
import { readSync } from 'fs'


export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    debug('A user connected', socket.id)

    // Listen for user created
    socket.on('userJoin', async (user) => {

        // Create the incoming user in the database 
        await createUser(user)

        // Get the id of the Gameroom user are supposed to enter
        const availableRoomId = await checkAvailableRooms(user)
        if (!availableRoomId) {
            return
        }

        // Connect user to gameroom 
        await updateUser(user, availableRoomId)

        // Add user to gameroom available
        socket.join(availableRoomId)

        // Check if there is an player waiting or not, returns true/false
        const playerWaiting = await checkPlayerStatus()
        if (playerWaiting && availableRoomId) {
            // Emit playerWaiting to the client
            io.in(availableRoomId).emit('playerWaiting', user)
        } else {
            // Emit playerReady to the client
            io.in(availableRoomId).emit('playerReady', user)
        }
    })

    socket.on('startGame', async (x, y, callback) => {
        // Get the current gameroomId
        const user = await getUser(socket.id)
        const gameroomId = user?.gameroomId

        if (gameroomId) {
            const room = await getRoom(gameroomId)

            if (room) {
                callback({
                    success: true,
                    data: {
                        name: room?.name,
                        users: room?.users,
                        rounds: room?.rounds
                    }
                })
            }

            let userArr = room?.users.filter(user => user.nickname)

            // Randomise position
            let width = Math.floor(Math.random() * x)
            let height = Math.floor(Math.random() * y)

            // Randomise delay 
            const delay = randomiseDelay()

            setTimeout(() => {
                io.in(gameroomId).emit('showCup', width, height, userArr!)
            }, delay * 1000)
        }
    })

    // Listen for cup clicked, recieve current time cup was clicked
    socket.on('cupClicked', async (x, y, reactionTime, rounds, callback) => {
        // Get the current gameroomId
        const user = await getUser(socket.id)
        const gameroomId = user?.gameroomId

        // Get rooms
        if (gameroomId) {
            // Measure reactiontime
            const reactionTimeTotal = calculateReactionTime(reactionTime)

            // Send reactionTime to database and update rounds
            await updateReactionTime(socket.id, reactionTimeTotal)
            await updateRounds(gameroomId, rounds)

            // Get the room and the users who answered
            const room = await getRoom(gameroomId)
            const usersAnswered = room?.users.filter(user => user.reactionTime)

            // If both users answered, send new positions if rounds != 11 
            if (usersAnswered?.length === 2) {
                let usersArr = usersAnswered?.filter(user => user.reactionTime)

                // Randomise position
                let width = Math.floor(Math.random() * x)
                let height = Math.floor(Math.random() * y)

                // Randomise delay 
                const delay = randomiseDelay()

                if (rounds <= 5) {
                    setTimeout(() => {
                        io.in(gameroomId).emit('showCup', width, height, usersArr)
                    }, delay * 1000)
                } else {
                    // If game is over (10 rounds), send back who won to the client
                    io.in(gameroomId).emit('bothAnswered', true, usersArr)
                    io.in(gameroomId).emit('gameOver', usersArr)
                    // Recieves objects with results from the client
                    socket.on('sendResults', async (player1, player2, callback) => {

                        // Gets the average reaction time of each player
                        const totalPlayer1 = calculateTotalReactionTime(player1.reactionTimeAvg)
                        const totalPlayer2 = calculateTotalReactionTime(player2.reactionTimeAvg)

                        // Create result in DB with both users
                        if (player1.users && player2.users) {
                            const resultPlayer1 = await createResult(totalPlayer1, player1.users)
                            const resultPlayer2 = await createResult(totalPlayer2, player2.users)

                            if (player1.users.score && player2.users.score) {
                                if (player1.users.score > player2.users.score) {
                                    callback({
                                        success: true,
                                        data: {
                                            reactionTimeAvg: resultPlayer1.reactionTimeAvg,
                                            users: player1.users
                                        }
                                    })
                                    debug('player 1 is the winner')
                                    // callback i gameover för att berätta vem som vann
                                } else if (player1.users.score < player2.users.score) {
                                    debug('player 2 is the winner')
                                    callback({
                                        success: true,
                                        data: {
                                            reactionTimeAvg: resultPlayer2.reactionTimeAvg,
                                            users: player2.users
                                        }
                                    })
                                } else {
                                    debug('det blev jämnt')
                                    callback({
                                        success: false,
                                        data: null,
                                        message: 'Det blev oavgjort'
                                    })
                                }
                            }
                        }
                    })

                }
                // Unset reactiontime in DB
                usersArr.forEach(async (user) => {
                    await updateReactionTime(user.id, 0)
                })

                // Send callback false, to let the client know it should pause timer
                callback({
                    success: true,
                    data: usersArr
                })

                // Emit that both has answered, so that timers can update
                io.in(gameroomId).emit('bothAnswered', true, usersArr)

            } else if (usersAnswered?.length === 1) {
                let user = usersAnswered?.find(user => user.nickname)
                let userArr = usersAnswered.map(user => user)

                if (user) {
                    if (user.score === null) {
                        user.score = 0
                    }
                    ++user.score
                    await updateScore(user.id, user.score)

                    // callback with user answered to stop their timer? 
                    callback({
                        success: true,
                        data: userArr
                    })
                }
            }
        }

        const rooms = await getRooms()

        if (rooms) {
            const result = {
                success: true,
                data: rooms

            }
            socket.broadcast.emit('getInfoToLobby', result)
        }
    })

    socket.on('getInfoToLobby', async (callback) => {
        // Get rooms and their users 
        const rooms = await getRooms()

        if (rooms) {
            callback({
                success: true,
                data: rooms
            })
        }
    })

    socket.on('disconnect', async () => {
        //await disconnectUser(socket.id)
    })
}
