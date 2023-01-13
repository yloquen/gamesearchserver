import {GameData} from "../types";
import BaseComm from "./BaseComm";
const http = require("http");
const https = require("https");

import { parse } from 'node-html-parser';
import Util from "../util/Util";
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
                return Util.isFullyContained(name, query);
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
                                price:Number(li.querySelector(".product-box__price-value")?.rawText),
                                provider:"Technopolis",
                                img:fileName,
                                link:baseUrl + (li.querySelector(".product-box__title a")?.attributes.href || "")
                            });
                        })
                        .catch((e) => {reject(e)});
                });
            }) || [];

        return Promise.all(promises);
    }


    generateUrl(searchString:string)
    {
        return "https://www.technopolis.bg/bg/search?text=" +
        searchString +
        "&pageselect=30&pricerange=&attr-0-1=%d0%98%d0%b3%d1%80%d0%b8&layout=Grid&sort=relevance&q=" +
        searchString +
        "%3Arelevance%3Acategory%3AP11030301";
    }


}