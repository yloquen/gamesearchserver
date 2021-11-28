import BaseComm from "./BaseComm";
import {GameData} from "./types";
import OzoneComm from "./OzoneComm";
import TechnopolisComm from "./TechnopolisComm";
import Util from "./Util";
import {parse} from "node-html-parser";
import {decode} from "html-entities";
import HTMLElement from "node-html-parser/dist/nodes/html";
import {monitorEventLoopDelay} from "perf_hooks";

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

    const wikipediaPromise =  new Promise<any>(resolve =>
    {
        const url = "https://en.wikipedia.org/w/index.php?search=" + searchWords.join("+") + "+video+game&ns0=1";
        Util.loadUrlToBuffer(url).then((data:Buffer) =>
        {
            const root = parse(data.toString());
            const gameLink:string|undefined = root.querySelector("div.mw-search-result-heading a")?.getAttribute("href");
            if (gameLink)
            {
                return Util.loadUrlToBuffer("https://en.wikipedia.org/" + gameLink).then((data:Buffer) =>
                {
                    const root = parse(data.toString());
                    const info:HTMLElement|null = root.querySelector("table.infobox.hproduct");
                    const reviews:HTMLElement|null = root.querySelector("div.video-game-reviews.vgr-single");
                    resolve({info:info?.toString(), reviews:reviews?.toString()})
                });
            }
            else
            {
                resolve({info:"",reviews:""});
            }
        });
    });

    let gameData:GameData[];

    let allPromises:Promise<any>[] = commPromises;
    allPromises = allPromises.concat([priceChartingPromise, wikipediaPromise]);

    Promise.all(allPromises).then((results:any[]) =>
    {
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Access-Control-Allow-Origin', '*');

        const wikiResult = results[allPromises.indexOf(wikipediaPromise)];

        const responseBody = JSON.stringify(
        {
            gameData:results.slice(0, commPromises.length).flat(),
            priceData:results[allPromises.indexOf(priceChartingPromise)],
            wikiData:wikiResult.info,
            wikiReviews:wikiResult.reviews
        });

        response.write(responseBody);
        response.end();
    });


}
