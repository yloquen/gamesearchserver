import {GameData, WikiData} from "./types";
import BaseComm from "./BaseComm";
import Util from "./Util";
import {Buffer} from "buffer";
import HTMLElement from "node-html-parser/dist/nodes/html";
import {parse} from "node-html-parser";

const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");

export default class WikiComm
{


    getData(searchWords:string[]):Promise<WikiData>
    {
        return new Promise<any>((resolve, reject) =>
        {
            const url = "https://en.wikipedia.org/w/index.php?search=" + searchWords.join("+") + "+video+game&ns0=1";

            let wikiResponse:any;

            Util.loadUrlToBuffer(url)
                .then((data:Buffer) =>
                {
                    return parse(data.toString());
                })
                .then((root:any) =>
                {
                    const gameLink:string|undefined = root.querySelector("div.mw-search-result-heading a")?.getAttribute("href");
                    if (gameLink)
                    {
                        return Util.loadUrlToBuffer("https://en.wikipedia.org/" + gameLink);
                    }
                })
                .then((data:any) =>
                {
                    wikiResponse = parse(data.toString());
                    const imgUrl:string|undefined =
                        wikiResponse.querySelector("table.infobox.hproduct .infobox-image a img")?.getAttribute("src");

                    if (imgUrl)
                    {
                        return Util.getImage("https:" + imgUrl);
                    }
                    else
                    {
                        return;
                    }
                })
                .then((imgURL:string|undefined) =>
                {
                    const fieldsToExtract = ["Developer(s)", "Platform(s)"];

                    const textInfo:any = [];

                    const rows = wikiResponse.querySelectorAll("table.infobox.hproduct tbody tr");
                    rows?.forEach((row:any) =>
                    {
                        const fieldName:string|undefined = row.querySelector("th a")?.rawText;
                        if (fieldName && fieldsToExtract.indexOf(fieldName) !== -1)
                        {
                            textInfo.push({name:fieldName, value:row.querySelector("td a")?.rawText});
                        }
                    });

                    // reviews = root.querySelector("div.video-game-reviews.vgr-single");

                    resolve(
                    {
                        imgURL:"http://localhost/" + imgURL,
                        textInfo:textInfo
                    });
                })
                .catch((data) =>
                {
                    resolve({});
                });
        });
    }


}