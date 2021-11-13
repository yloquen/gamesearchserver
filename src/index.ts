import BaseComm from "./BaseComm";
import {GameData} from "./types";
import OzoneComm from "./OzoneComm";
import TechnopolisComm from "./TechnopolisComm";
import Util from "./Util";
import {parse} from "node-html-parser";
import {decode} from "html-entities";
import HTMLElement from "node-html-parser/dist/nodes/html";

const http = require('http');
const url = require('url');

http.createServer(onRequest).listen(8080);

function onRequest(request:any, response:any)
{
    const communicators:BaseComm[] =
    [
        new TechnopolisComm(),
        new OzoneComm()
    ];

    const queryObject = url.parse(request.url, true).query;

    if (!queryObject.q)
    {
        response.end();
        return
    }

    const queryString = queryObject.q.toLowerCase();

    const commPromises:Promise<GameData[]>[] = communicators.map(comm =>
    {
        return comm.getData(queryString);
    });

    const searchWords = Util.toSearchWords(queryString);

    const priceChartingPromise = new Promise<GameData[]>(resolve =>
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

    const wikipediaPromise =  new Promise<string>(resolve =>
    {
        const url = "https://en.wikipedia.org/wiki/Resident_Evil_2_(2019_video_game)";
        return Util.loadUrlToBuffer(url).then((data:Buffer) =>
        {
            const root = parse(data.toString());
            const e1:HTMLElement|null = root.querySelector("table.infobox.hproduct");
            resolve(e1!.toString());
        });
    });


    let gameData:GameData[];

    let allPromises:Promise<any>[] = commPromises;
    allPromises = allPromises.concat([priceChartingPromise, wikipediaPromise]);

    Promise.all(allPromises).then((results:any[]) =>
    {
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Access-Control-Allow-Origin', '*');

        const responseBody = JSON.stringify(
        {
            priceData:results.slice(0, commPromises.length).flat(),
            gameData:results[allPromises.indexOf(priceChartingPromise)],
            wiki:results[allPromises.indexOf(wikipediaPromise)]
        });

        response.write(responseBody);
        response.end();
    });


}
