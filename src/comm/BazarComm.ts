import {GameData} from "../types";
import BaseComm from "./BaseComm";
import Util from "../util/Util";
import {Buffer} from "buffer";
import {parse} from "node-html-parser";

const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");

export default class BazarComm extends BaseComm
{


    parseResults(data:string, query:string):Promise<GameData[]>
    {
        // const baseUrl = "https://www.technopolis.bg";
        const root = parse(data);
        const list = root.querySelectorAll(".listItemContainer");

        const promises:Promise<GameData>[] =
            list?.filter((li:any) =>
            {
                const name = li.querySelector("div.title span.title").rawText;
                if (name)
                {
                    return Util.isFullyContained(Util.removeWhitespaces(name), query);
                }
                return false;
            })
            .map(li =>
            {
                return new Promise<GameData>((resolve, reject) =>
                {
                    const imgUrl = "https://" + li.querySelector(".cover")?.getAttribute("src");
                    Util.getImage(imgUrl)
                        .then((fileName:string) =>
                        {
                            resolve({
                                name:Util.removeWhitespaces(li.querySelector("div.title span.title")?.rawText!),
                                price:Number(Util.cleanPrice(li.querySelector(".price")?.rawText || "0")),
                                provider:"Bazar",
                                img:fileName,
                                link:li.querySelector("a")?.getAttribute("href")!
                            });
                        })
                        .catch((e) => {reject(e)});
                });
            }) || [];

        return Promise.all(promises);
    }






    generateUrl(searchString:string)
    {
        return "https://bazar.bg/obiavi/igri-konzoli?q=" + encodeURIComponent(searchString);
    }


}