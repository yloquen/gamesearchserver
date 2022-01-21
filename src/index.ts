import BaseComm from "./comm/BaseComm";
import OzoneComm from "./comm/OzoneComm";
import TechnopolisComm from "./comm/TechnopolisComm";
import Util from "./misc/Util";
import WikiComm from "./comm/WikiComm";
import PriceChartingComm from "./comm/PriceChartingComm";
import YouTubeComm from "./comm/YouTubeComm";
import BazarComm from "./comm/BazarComm";
import DataBaseModule from "./DataBaseModule";
import C_Config from "./C_Config";

const http = require('http');
const url = require('url');


http.createServer(onRequest).listen(8080);

const db = new DataBaseModule();

function onRequest(request:any, response:any)
{

    const queryObject = url.parse(request.url, true).query;

    if (!queryObject.q)
    {
        response.end();
        return
    }
    const queryString = queryObject.q.toLowerCase().slice(0, C_Config.MAX_SEARCH_STRING_SIZE);

    db.checkQuery(queryString).then((results:any[]) =>
    {
        console.log(results);
    });

    const communicators:BaseComm[] =
    [
        new TechnopolisComm(),
        new OzoneComm(),
        new BazarComm()
    ];

    const searchWords = Util.toSearchWords(queryString);

    const commPromises:Promise<any>[] = communicators.map(comm =>
    {
        return comm.getData(queryString);
    });

    const pcPromise = new PriceChartingComm().getData(searchWords, queryString);
    const wikiPromise = new WikiComm().getData(searchWords);
    const ytPromise = new YouTubeComm().getData(searchWords);

    const allPromises:Promise<any>[] = commPromises.concat([pcPromise, wikiPromise, ytPromise]);

    Promise.all(allPromises).then((results:any[]) =>
    {
        const wikiResult = results[allPromises.indexOf(wikiPromise)];
        const ytResult = results[allPromises.indexOf(ytPromise)];

        const resp =
        {
            gameData:results.slice(0, commPromises.length).flat(),
            priceData:results[allPromises.indexOf(pcPromise)],
            wikiData:wikiResult,
            videoId:ytResult.videoId
        };

        // db.add(queryString, resp);

        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Access-Control-Allow-Origin', '*');

        const responseBody = JSON.stringify(resp);

        response.write(responseBody);
        response.end();
    });


}
