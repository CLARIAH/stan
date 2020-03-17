import User, { AccessLevel } from "./User";

export interface Query {
    iris: boolean,
    accessStatus: Array<AccessLevel>,
    targetId: string | null,
    collectionId: string | null,
    includePermissions: boolean
}

export interface Params {
    accessStatus?: Array<AccessLevel>,
    targetId?: string,
    collectionId?: string,
    includePermissions?: boolean
}

// iris should be false, otherwise you only get the annotation IDs instead the whole annotations
// by default, permission information is included in the annotations, so that
//     a viewer can show their permission status
// the default access status is private, meaning you only get your own annotations
export const defaultQuery: Query = {
    iris: false,
    accessStatus: [AccessLevel.PRIVATE],
    includePermissions: true,
    targetId: null,
    collectionId: null
}

export const makeQueryString = (params: Params) => {
    const accessStatus = (params.accessStatus) ? params.accessStatus : [AccessLevel.PRIVATE]
    const includePermissions = (params.includePermissions) ? params.includePermissions : false;
    let queryString = '?iris=0&access_status=' + accessStatus.join(',')
                + '&include_permissions=' + includePermissions;
    if (params.targetId)
        queryString += '&target_id=' + params.targetId;
    if (params.collectionId)
        queryString += '&collection_id=' + params.collectionId
    return queryString;
}