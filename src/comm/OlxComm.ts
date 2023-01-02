import {GameData} from "../types";
import BaseComm from "./BaseComm";
import Util from "../util/Util";
import {Buffer} from "buffer";
import {parse} from "node-html-parser";

const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");

export default class OlxComm extends BaseComm
{


    parseResults(data:string, query:string):Promise<GameData[]>
    {
        const baseUrl = "https://www.olx.bg";
        const root = parse(data);
        const fullList = root.querySelectorAll(".listing-grid-container a").filter(n =>
        {
            const name = n.querySelector("h6")?.rawText;
            return (name && Util.filterFullyContained(Util.removeWhitespaces(name), query))
        });

        const promises:Promise<GameData>[] =
            fullList?.map(li =>
            {
                return new Promise<GameData>((resolve, reject) =>
                {
                    const imgUrl = li.querySelector("img")?.getAttribute("src")!;
                    Util.getImage(imgUrl)
                        .then((fileName:string) =>
                        {
                            resolve({
                                name:String(li.querySelector("h6")?.rawText),
                                price:Number(li.querySelector("p")?.rawText.match(/([0-9]+[\,\.]?[0-9]+)/gm)?.[0]),
                                provider:"OLX",
                                img:fileName,
                                link:baseUrl + li.getAttribute("href")
                            });
                        })
                        .catch((e) => {reject(e)});
                });
            }) || [];

        //return Promise.resolve() as any;
        return Promise.all(promises);
    }






    generateUrl(searchString:string)
    {
        return "https://www.olx.bg/elektronika/kompyutrni-aksesoari-chasti/q-" + searchString + "/";
    }


}