export interface ServerToClientEvents {

}

export interface ClientToServerEvents {
    userJoin: (user: User) => void
}

export type User = {
    id: string
    nickname: string
    roomId?: string
}

export type GameRoom = {
    id?: string
    name: string
    connectedUser: boolean
    users: User[] | null
}

