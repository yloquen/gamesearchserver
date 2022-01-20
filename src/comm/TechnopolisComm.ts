import {GameData} from "../types";
import BaseComm from "./BaseComm";
const http = require("http");
const https = require("https");

import { parse } from 'node-html-parser';
import Util from "../misc/Util";
const sharp = require("sharp");

export default class TechnopolisComm extends BaseComm
{


    parseResults(data:string, query:string):Promise<GameData[]>
    {
        const baseUrl = "https://www.technopolis.bg";
        const root = parse(data);
        const list = root.querySelector(".products-grid-list")?.querySelectorAll(".list-item");

        const promises:Promise<GameData>[] =
            list?.filter((li:any) =>
            {
                const name = li.querySelector(".modal-header")?.querySelector("strong")?.rawText || "";
                return Util.filterFullyContained(name, query);
            })
            .map(li =>
            {
                return new Promise<GameData>((resolve, reject) =>
                {
                    const imgUrl = baseUrl + (li.querySelector(".lazyload")?.getAttribute("data-src") || "");
                    Util.getImage(imgUrl)
                        .then((fileName:string) =>
                        {
                            resolve({
                                name:li.querySelector(".modal-header")?.querySelector("strong")?.rawText || "",
                                price:Number(li.querySelector(".price-value")?.rawText),
                                provider:"Technopolis",
                                img:fileName,
                                link:baseUrl + (li.querySelector(".preview")?.querySelector("a")?.getAttribute("data-src") || "")
                            });
                        })
                        .catch((e) => {reject(e)});
                });
            }) || [];

        return Promise.all(promises);
    }


    generateUrl(searchString:string)
    {
        return "https://www.technopolis.bg/bg/search/?query=" +
        searchString +
        "&query_autocomplete=&search_main_category=ALL";
    }


}