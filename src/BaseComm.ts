import {GameData} from "./types";

const https = require("https");

export default class BaseComm
{


    public getData(searchString:string):Promise<GameData[]>
    {
        return new Promise<GameData[]>((resolve, reject) =>
        {
            const url = this.generateUrl(searchString);
            https.get(url,
                (resp:any) =>
                {
                    let data = '';

                    resp.on('data', (chunk:any) =>
                    {
                        data += chunk;
                    });

                    resp.on('end', () =>
                    {
                        resolve(this.parseResults(data));
                    });

                })
                .on("error", (err:Error) =>
                {
                    console.log("Error: " + err.message);
                });
        });
    }


    parseResults(data:string):GameData[]
    {
        return [];
    }


    generateUrl(searchString:string)
    {
        return "";
    }
}