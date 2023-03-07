export interface ServerToClientEvents {
    showCup: (width: number, height: number) => void
    playerWaiting: (user: User) => void
    playerReady: (user: User) => void
    playersAnswered: (clicks: boolean) => void
}

export interface ClientToServerEvents {
    userJoin: (user: User) => void
    startGame: (positionX: number, positionY: number, callback: (result: GetGameroomResult) => void) => void
    cupClicked: (
        positionX: number,
        positionY: number,
        reactionTime: string,
        callback: (result: GetUserResult) => void
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
    users: User[] | null
}

export interface GetGameroomResult {
    success: boolean,
    data: GameRoom | null
}

export interface GetUserResult {
    success: boolean,
    data: User | null
}
