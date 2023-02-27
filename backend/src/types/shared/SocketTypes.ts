export interface ServerToClientEvents {

}

export interface ClientToServerEvents {
    userJoin: (user: User) => void
}

export type User = {
    nickname: string
}

export type GameRoom = {
    name: string
    users: User[] | null
}

