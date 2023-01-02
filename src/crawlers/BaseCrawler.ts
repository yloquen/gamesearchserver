import DataBaseModule from "../DataBaseModule";

export default class BaseCrawler
{
    protected provider:string;
    protected db:DataBaseModule;

    constructor(provider:string, db:DataBaseModule)
    {
        this.provider = provider;
        this.db = db;
    }

}