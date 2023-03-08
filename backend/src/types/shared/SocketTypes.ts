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
        rounds: number,
        callback: (result: GetUserResult) => void
    ) => void
    goToLobby: (callback: (result: GetGameroomResultLobby) => void) => void
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
    rounds: number
}

export interface GetGameroomResult {
    success: boolean,
    data: GameRoom | null
}

export interface GetGameroomResultLobby {
    success: boolean,
    data: GameRoom[] | null
}

export interface GetUserResult {
    success: boolean,
    data: User | null
}
