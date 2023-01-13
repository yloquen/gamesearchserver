export enum E_ErrorType
{
    LOGIN,
    REGISTER,
    GENERIC,
    DATABASE
}

export enum E_RegisterError
{
    CREATE_USER,
    INVALID_DATA,
    INVALID_EMAIL,
    INVALID_PASS,
    USER_EXISTS
}

export enum E_LoginError
{
    WRONG_PASSWORD,
    USER_NOT_FOUND
}

export enum E_GenericError
{
    GENERAL,
    UNKNOWN_METHOD,
    SEARCH_QUERY_NOT_PROVIDED,
    NOT_LOGGED_IN,
    DATABASE,
    CRYPTO
}

export enum E_DatabaseError
{
    ADD_FAVORITE_ERROR
}