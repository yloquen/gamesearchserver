import {GameData} from "./types";
import BaseComm from "./BaseComm";
const http = require("http");
const https = require("https");

import { parse } from 'node-html-parser';

export default class TechnopolisComm extends BaseComm
{


    parseResults(data:string)
    {
        const root = parse(data);
        const list = root.querySelector(".products-grid-list")?.querySelectorAll(".list-item");
        const results = list?.map(li =>
        {
            return {
                name:li.querySelector(".modal-header")?.childNodes[1]?.childNodes[0]?.rawText || "",
                price:Number(li.querySelector(".price-value")?.childNodes[0]?.rawText),
                provider:"Technopolis"
            };
        });
        return results || [];
    }


    generateUrl(searchString:string)
    {
        return "https://www.technopolis.bg/bg/search/?query=" +
        searchString +
        "&query_autocomplete=&search_main_category=ALL";
    }


}