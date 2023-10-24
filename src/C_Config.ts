export default class C_Config
{
    public static BASE_SERVER_URL:string = process.env.NODE_ENV === 'production' ?
        "http://35.156.32.98" : "http://192.168.0.152";

    public static BASE_WEB_URL:string = process.env.NODE_ENV === 'production' ?
        "http://35.156.32.98" : "http://192.168.0.152:8081";

    public static MAX_SEARCH_STRING_SIZE:number = 60;
    public static CACHE_DURATION_SECONDS:number = 0;
}