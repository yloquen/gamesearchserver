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

            let info:HTMLElement|null, reviews:HTMLElement|null;

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
                    const root = parse(data.toString());

                    info = root.querySelector("table.infobox.hproduct");
                    reviews = root.querySelector("div.video-game-reviews.vgr-single");

                    const imgUrl:string|undefined =
                        root.querySelector("table.infobox.hproduct .infobox-image a img")?.getAttribute("src");

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
                    resolve(
                    {
                        imgURL:"http://localhost/" + imgURL
                    });
                })
                .catch((data) =>
                {
                    resolve({});
                });
        });
    }


}