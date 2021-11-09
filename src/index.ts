import BaseComm from "./BaseComm";
import {GameData, PriceData} from "./types";
import OzoneComm from "./OzoneComm";
import TechnopolisComm from "./TechnopolisComm";
import Util from "./Util";
import {parse} from "node-html-parser";
import {decode} from "html-entities";

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
    const queryString = queryObject.q.toLowerCase();

    const promises:Promise<GameData[]>[] = communicators.map(comm =>
    {
        return comm.getData(queryString);
    });

    const searchWords = Util.toSearchWords(queryString);

    const p = new Promise<PriceData[]>(resolve =>
    {
        const results:PriceData[] = [];
        const url = "https://www.pricecharting.com/search-products?q=" + searchWords.join("+")  + "+PAL&type=prices";
        return Util.loadUrlToBuffer(url)
            .then((data:Buffer) =>
            {
                const root = parse(data.toString());
                const gamesData = root.querySelectorAll("#games_table tbody tr");
                gamesData?.forEach((gameData) =>
                {
                    const title = decode(gameData.querySelector(".title a")?.rawText || "");
                    results.push(
                    {
                        name:title.replace(/\n/g,"").replace(/^ +| +$/g, ""),
                        price:gameData.querySelector(".cib_price span")?.rawText || "",
                    });
                });
                const filteredResults =
                    results.filter((result:PriceData) =>
                    {
                        return Util.filterFullyContained(result.name, queryString)
                    });
                resolve(filteredResults.slice(8));
            });
    });

    p.then( (priceData:PriceData[]) =>
    {
        Promise.all(promises).then((values)=>
        {
            response.setHeader('Content-Type', 'application/json');
            response.setHeader('Access-Control-Allow-Origin', '*');

            const gameData:GameData[] = values.flat();

            const responseBody = JSON.stringify(
            {
                priceData:priceData,
                gameData:gameData
            });

            response.write(responseBody);
            response.end();
        });
    })



}
