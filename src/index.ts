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
import {SearchResult} from "./types";
import {IncomingMessage, ServerResponse} from "http";

const http = require('http');
const url = require('url');
const crypto = require('crypto');

http.createServer(onRequest).listen(8080);

const db = new DataBaseModule();


//crypto.pbkdf2("test", "lsudfkhsfjh", 100, 128, )

/*const salt = crypto.randomBytes(16).toString('base64');

crypto.pbkdf2('qwerty1234', salt, 100000, 64,
    'sha512', (err:any, derivedKey:Buffer) => {

        if (err)
        {
            // now handle it !
        }
        // Prints derivedKey
        const h = derivedKey.toString('base64');
        debugger;
    });*/


function sendResponse(response:any, results:SearchResult)
{
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');

    const responseBody = JSON.stringify(results);

    response.write(responseBody);
    response.end();
}

function onRequest(request:IncomingMessage, response:ServerResponse)
{
    const parsedUrl =  url.parse(request.url, true);
    const queryObject = parsedUrl.query;

    switch (parsedUrl.pathname)
    {
        case "/login":
        {
            login(request);
            break;
        }

        case "/search":
        {
            if (queryObject.q)
            {
                const queryString = queryObject.q.toLowerCase().slice(0, C_Config.MAX_SEARCH_STRING_SIZE);
                parseSearch(queryString, response);
            }
            else
            {
                response.end();
            }
            break;
        }
    }
}


function login(request:IncomingMessage)
{
    const data = request.read();
    console.log(data);
    debugger;
}


function parseSearch(queryString:string, response:ServerResponse)
{
    db.getCachedQuery(queryString)
        .then((searchResults:SearchResult) =>
        {
            sendResponse(response, searchResults);
        })
        .catch(() =>
        {
            const communicators:BaseComm[] =
                [
                    new TechnopolisComm(),
                    new OzoneComm(),
                    new BazarComm()
                ];

            const commPromises:Promise<any>[] = communicators.map(comm =>
            {
                return comm.getData(queryString);
            });

            const searchWords = Util.toSearchWords(queryString);

            const pcPromise = new PriceChartingComm().getData(searchWords, queryString);
            const wikiPromise = new WikiComm().getData(searchWords);
            const ytPromise = new YouTubeComm().getData(searchWords);

            const allPromises:Promise<any>[] = commPromises.concat([pcPromise, wikiPromise, ytPromise]);

            let searchResult:SearchResult;

            Promise.all(allPromises)
                .then((results:any[]) =>
                {
                    const wikiResult = results[allPromises.indexOf(wikiPromise)];
                    const ytResult = results[allPromises.indexOf(ytPromise)];

                    searchResult =
                        {
                            gameData:results.slice(0, commPromises.length).flat(),
                            priceData:results[allPromises.indexOf(pcPromise)],
                            wikiData:wikiResult,
                            videoId:ytResult.videoId
                        };
                })
                .then(() =>
                {
                    return db.add(queryString, searchResult);
                })
                .then(() =>
                {
                    sendResponse(response, searchResult);
                });
        });
}
