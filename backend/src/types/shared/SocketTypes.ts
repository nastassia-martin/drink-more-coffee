export interface ServerToClientEvents {
    showCup: (width: number, height: number) => void
    playerWaiting: (user: User) => void
    playerReady: (user: User) => void
}

export interface ClientToServerEvents {
    userJoin: (user: User) => void
    startGame: (positionX: number, positionY: number) => void
    cupClicked: (positionX: number, positionY: number) => void
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

