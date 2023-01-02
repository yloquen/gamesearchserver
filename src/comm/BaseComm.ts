import {GameData} from "../types";
import Util from "../util/Util";

const https = require("https");

export default class BaseComm
{


    public getData(searchString:string):Promise<GameData[]>
    {
        return new Promise<GameData[]>((resolve, reject) =>
        {
            const url = this.generateUrl(searchString);
            Util.loadUrlToBuffer(url).then((data:Buffer) =>
            {
                this.parseResults(String(data), searchString).then(data => { resolve(data) });
            });
        });
    }


    parseResults(data:string, query:string):Promise<GameData[]>
    {
        return Promise.resolve([]);
    }


    generateUrl(searchString:string)
    {
        return "";
    }
}