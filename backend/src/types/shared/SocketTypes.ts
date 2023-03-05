export interface ServerToClientEvents {
    showCup: (width: number, height: number) => void
    playerWaiting: (user: User) => void
    playerReady: (user: User) => void
}

export interface ClientToServerEvents {
    userJoin: (user: User) => void
    startGame: (positionX: number, positionY: number) => void
    cupClicked: (
        positionX: number,
        positionY: number,
        reactionTime: string
    ) => void
}

export type User = {
    id: string
    nickname: string
    reactionTime: number | null
    gameroomId?: string | null
}

export type GameRoom = {
    id?: string
    name: string
    connectedUser: boolean
    users: User[] | null
}

