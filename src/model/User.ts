
// - username is chosen by user
// - userId is uuid (if needed?)
// - once token is set, password should be reset to null?
// - accessStatus determines which permission levels should
//   be used for retrieving annotations
export default interface User {
    username: null | string,
    password: null | string,
    token: null | string,
    userId: null | string,
    accessStatus: Array<AccessLevel>
}

export enum AccessLevel {
    PRIVATE = 'private',
    SHARED = 'shared',
    PUBLIC = 'public'
}