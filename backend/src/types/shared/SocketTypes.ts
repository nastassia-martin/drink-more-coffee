export interface ServerToClientEvents {
    gameStarted: (delay: number) => void
}

export interface ClientToServerEvents {
    userJoin: (user: User) => void
    startGame: () => void
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

