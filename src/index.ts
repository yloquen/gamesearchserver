import BaseComm from "./BaseComm";
import {GameData} from "./types";
import OzoneComm from "./OzoneComm";
import TechnopolisComm from "./TechnopolisComm";
import Util from "./Util";
import {parse} from "node-html-parser";

import HTMLElement from "node-html-parser/dist/nodes/html";
import {monitorEventLoopDelay} from "perf_hooks";
import WikiComm from "./WikiComm";
import PriceChartingComm from "./PriceChartingComm";

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
    const searchWords = Util.toSearchWords(queryString);

    const commPromises:Promise<GameData[]>[] = communicators.map(comm =>
    {
        return comm.getData(queryString);
    });

    const priceChartingPromise = new PriceChartingComm().getData(searchWords, queryString);
    const wikipediaPromise = new WikiComm().getData(searchWords);

    const allPromises:Promise<any>[] = commPromises.concat([priceChartingPromise, wikipediaPromise]);

    Promise.all(allPromises).then((results:any[]) =>
    {
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Access-Control-Allow-Origin', '*');

        const wikiResult = results[allPromises.indexOf(wikipediaPromise)];

        const responseBody = JSON.stringify(
        {
            gameData:results.slice(0, commPromises.length).flat(),
            priceData:results[allPromises.indexOf(priceChartingPromise)],
            wikiData:wikiResult
        });

        response.write(responseBody);
        response.end();
    });


}
