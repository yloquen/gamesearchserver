import {GameData, WikiData} from "./types";
import BaseComm from "./BaseComm";
import Util from "./Util";
import {Buffer} from "buffer";
import HTMLElement from "node-html-parser/dist/nodes/html";
import {parse} from "node-html-parser";
import {decode} from "html-entities";

const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");

export default class PriceChartingComm
{


    getData(searchWords:string[], queryString:string):Promise<any>
    {
        return new Promise<GameData[]>(resolve =>
        {
            const results:GameData[] = [];
            const url = "https://www.pricecharting.com/search-products?q=" + searchWords.join("+")  + "+PAL&type=prices";
            return Util.loadUrlToBuffer(url)
                .then((data:Buffer) =>
                {
                    const root = parse(data.toString());
                    const gamesData = root.querySelectorAll("#games_table tbody tr");
                    gamesData?.forEach((gameData) =>
                    {
                        const a = gameData.querySelector(".title a");
                        const console = gameData.querySelector(".console")?.rawText || "";
                        const title = decode(((a?.rawText || "") + console));

                        results.push(
                            {
                                name:title.replace(/\n/g,"").replace(/^ +| +$/g, "").replace(/ +/g, " "),
                                price:Number(gameData.querySelector(".cib_price span")?.rawText.replace(/\$/g, "")) || 0,
                                link:a?.getAttribute("href") || "",
                                img:"",
                                provider:""
                            });
                    });
                    const filteredResults =
                        results.filter((result:GameData) =>
                        {
                            return Util.filterFullyContained(result.name, queryString)
                        });
                    resolve(filteredResults.slice(0,8));
                });
        });
    }




}