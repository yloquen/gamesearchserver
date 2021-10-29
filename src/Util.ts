import {GameData} from "./types";
import {Buffer} from "buffer";
const https = require("https");

export default class Util
{

    public static loadUrlToBuffer(url:string):Promise<Buffer>
    {
        const buffers:Buffer[] = [];

        return new Promise<Buffer>((resolve, reject) =>
        {
            https.get(url,
                (resp:any) =>
                {
                    let data = '';

                    resp.on('data', (chunk:any) =>
                    {
                        buffers.push(chunk);
                    });

                    resp.on('end', () =>
                    {
                        resolve(Buffer.concat(buffers));
                    });

                })
                .on("error", (err:Error) =>
                {
                    console.log("Error loading " + url + "\n" + err.message);
                });
        });
    }

}