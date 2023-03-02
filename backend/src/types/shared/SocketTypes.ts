export interface ServerToClientEvents {
    showCup: (currentTime: string) => void
    playerWaiting: (user: User) => void
    playerReady: (user: User) => void
}

export interface ClientToServerEvents {
    userJoin: (user: User) => void
    startGame: (positionx: number, positiony: number) => void
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

