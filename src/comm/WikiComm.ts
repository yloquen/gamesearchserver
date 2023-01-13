import {GameData, WikiData} from "../types";
import BaseComm from "./BaseComm";
import Util from "../util/Util";
import {Buffer} from "buffer";
import HTMLElement from "node-html-parser/dist/nodes/html";
import {parse} from "node-html-parser";

const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");

export default class WikiComm
{


    async getData(searchWords:string[], queryString:string):Promise<WikiData>
    {
        const result = {link:"", imgURL:"", textInfo:[]};

        // do not delete url suffix
        const url =
            "https://en.wikipedia.org/w/index.php?search=" + searchWords.join("+") +
            "+video+game&title=Special:Search&profile=advanced&fulltext=1&ns0=1";

        let data:Buffer = await Util.loadUrlToBuffer(url);
        const root = parse(data.toString());

        const linkPaths:(string|undefined)[] = [];
        const linkWords:string[][] = [];
        root.querySelectorAll("div.mw-search-result-heading a")?.forEach(d =>
        {
            linkPaths.push(d.getAttribute("href"));
            linkWords.push(d.querySelectorAll("span").map(s => s.innerHTML.toLowerCase()));
        });

        let linkPath;
        for (let linkWordIdx = 0; linkWordIdx < linkWords.length; linkWordIdx++)
        {
            const lw = linkWords[linkWordIdx];
            let contained = true;
            searchWords.forEach(word =>
            {
                if (lw.indexOf(word) === -1)
                {
                    contained = false;
                    return;
                }
            });

            if (contained)
            {
                linkPath = linkPaths[linkWordIdx];
                break;
            }
        }

        if (!linkPath)
        {
            return result;
        }

        const link = "https://en.wikipedia.org" + linkPath;
        result.link = link;
        data = await Util.loadUrlToBuffer(link);
        const resultPage = parse(data.toString());

        const imgUrl:string|undefined =
            resultPage.querySelector("table.infobox.hproduct .infobox-image a img")?.getAttribute("src");

        if (imgUrl)
        {
            result.imgURL = await Util.getImage("https:" + imgUrl, 300);
        }

        const fieldsToExtract =
        [
            "Developer(s)",
            "Publisher(s)",
            "Platform(s)",
            "Release",
            "Genre(s)"
        ];

        const textInfo:any = [];

        const separator = "®";
        const referenceRegEx = /(&#91;[\dA-Za-z]+&#93;)+/g;

        const rows = resultPage.querySelectorAll("table.infobox.hproduct tbody tr");
        rows?.forEach((row:any) =>
        {
            const fieldName:string|undefined = row.querySelector("th a")?.rawText;
            if (fieldName && fieldsToExtract.indexOf(fieldName) !== -1)
            {
                let td = row.querySelectorAll("td a");
                if (td.length === 0)
                {
                    td = row.querySelectorAll("td");
                }
                const textNodes = td.filter((c:any) => c.getAttribute && c?.getAttribute("class") !== "reference");
                const texts = textNodes.map((c:any) => c?.innerHTML?.replace(referenceRegEx, "") || "");
                textInfo.push({name:fieldName, value:texts.join(separator)});
            }
        });

        const aggregatorScoreRows = resultPage.querySelectorAll(".vgr-aggregators.wikitable tr");
        aggregatorScoreRows.forEach((score:any) =>
        {
            const tds = score.querySelectorAll("td");
            const name =  tds[0]?.rawText;
            const value =  tds[1]?.rawText;
            if (name && value)
            {
                textInfo.push({name:name, value:value.replace(referenceRegEx, separator)});
            }
        });

        result.textInfo = textInfo;

        return result;
    }


}