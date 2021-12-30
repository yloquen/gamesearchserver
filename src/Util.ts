import {GameData} from "./types";
import {Buffer} from "buffer";

const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const sharp = require("sharp");

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


    public static getImage(url:string, size:number = 160):Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            const shaHash = crypto.createHash("sha256").update(url).digest("hex");
            const fileName = shaHash + ".png";
            const filePath = "./cache/" + fileName;

            fs.promises.access(filePath, fs.F_OK)
                .then(()=>
                {
                    console.log("File " + fileName + " is cached");
                    resolve(fileName);
                })
                .catch(() =>
                {
                    console.log("Fetching " + fileName);
                    Util.loadUrlToBuffer(url)
                        .then((result:Buffer) =>
                        {
                            return sharp(result)
                                .resize(size, size, {fit:'contain', background:{r:255, g:255, b:255, alpha:1}})
                                .png()
                                .toBuffer();
                        })
                        .then((b:Buffer) =>
                        {

                            fs.writeFile(filePath, b,
                                ()=>
                                {
                                    resolve(fileName);
                                });
                        })
                        .catch((e) =>
                        {
                            resolve(fileName);
                        });
                });
        });
    }


    static toSearchWords(s:string):string[]
    {
        return s.toLocaleLowerCase().replace(/[^a-zа-я0-9]/g, " ").replace(/\s+/g, " ").split(" ");
    }


    // Returns true only if all words in query are contained in name
    static filterFullyContained(name:string, query:string)
    {
        const nameWords = Util.toSearchWords(name);
        const queryWords = Util.toSearchWords(query);

        for (let wordIdx = 0; wordIdx < queryWords.length; wordIdx++)
        {
            const word = queryWords[wordIdx];
            if (nameWords.indexOf(word) === -1)
            {
                return false;
            }
        }

        return true;
    }


}