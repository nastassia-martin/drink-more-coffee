export interface ServerToClientEvents {

}

export interface ClientToServerEvents {
    userJoin: (user: CreateUser) => void
}

export type CreateUser = {
    nickname: string
}