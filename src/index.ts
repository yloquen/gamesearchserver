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
import YouTubeComm from "./YouTubeComm";

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

    const pcPromise = new PriceChartingComm().getData(searchWords, queryString);
    const wikiPromise = new WikiComm().getData(searchWords);
    const ytPromise = new YouTubeComm().getData(searchWords);

    const allPromises:Promise<any>[] = commPromises.concat([pcPromise, wikiPromise, ytPromise]);

    Promise.all(allPromises).then((results:any[]) =>
    {
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Access-Control-Allow-Origin', '*');

        const wikiResult = results[allPromises.indexOf(wikiPromise)];
        const ytResult = results[allPromises.indexOf(ytPromise)];

        const responseBody = JSON.stringify(
        {
            gameData:results.slice(0, commPromises.length).flat(),
            priceData:results[allPromises.indexOf(pcPromise)],
            wikiData:wikiResult,
            videoId:ytResult.videoId
        });

        response.write(responseBody);
        response.end();
    });


}
