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
import {debug} from "util";


const http = require('http');
const url = require('url');
const crypto = require('crypto');

console.log("Starting server at 8080");
http.createServer(onRequest).listen(8080);

const db = new DataBaseModule();
const activeSessions:Record<number, any> = {};


function sendResponse(response:ServerResponse, data:any)
{
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.write(JSON.stringify(data));
    response.end();
}


function parseCookies (req:IncomingMessage)
{
    const list:any = {};
    const cookieHeader = req.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach((cookie) =>
    {
        let [ name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        const value = rest.join(`=`).trim();
        if (name && value)
        {
            list[name] = decodeURIComponent(value);
        }
    });

    return list;
}

function onRequest(req:IncomingMessage, resp:ServerResponse)
{
    let body = '';
    if (req.method === 'POST')
    {
        req.on('data', chunk =>
        {
            body += chunk.toString();
        });

        req.on('end', () =>
        {
            processRequest(req, resp, JSON.parse(body));
        });
    }
    else
    {
        processRequest(req, resp);
    }
}

function processRequest(req:IncomingMessage, resp:ServerResponse, data:any = undefined)
{
    const parsedUrl = url.parse(req.url, true);
    const queryObject = parsedUrl.query;

    switch (parsedUrl.pathname)
    {
        case "/login":
        {
            const cookies = parseCookies(req);
            const sid = cookies.sid;
            if (sid && activeSessions[sid])
            {
                sendResponse(resp, {email:activeSessions[sid].email});
            }
            else
            {
                db.getUserData(data.email).then((d:any[]) =>
                {
                    return new Promise((resolve:Function, reject:Function) =>
                    {
                        if (d.length === 1)
                        {
                            crypto.pbkdf2(data.pass, d[0].salt, 100000, 64,
                                'sha512', (err:any, derivedKey:Buffer) => {

                                    if (err)
                                    {
                                        reject(new Error("LOGIN_ERROR_2"));
                                    }
                                    // Prints derivedKey
                                    const h = derivedKey.toString('base64');

                                    if (d[0].passhash === h)
                                    {
                                        // sm.createSession();
                                        const sid = crypto.randomBytes(32).toString('base64');
                                        activeSessions[sid] = { id:d[0].id, email:data.email };
                                        resp.setHeader("Set-Cookie", `sid=${sid}; Max-Age=3600`);
                                        resolve({email:data.email});
                                    }
                                    else
                                    {
                                        reject(new Error("LOGIN_ERROR_3"));
                                    }
                                });
                        }
                        else
                        {
                            reject(new Error("LOGIN_ERROR_1"));
                        }
                    });


                })
                .then(loginResponse =>
                {
                    sendResponse(resp, loginResponse);
                })
                .catch((e:Error) =>
                {
                    sendResponse(resp, {error:e.message});
                });
            }

            break;
        }

        case "/search":
        {
            if (queryObject.q)
            {
                const queryString = queryObject.q.toLowerCase().slice(0, C_Config.MAX_SEARCH_STRING_SIZE);
                parseSearch(queryString, resp);
            }
            else
            {
                resp.end();
            }

            break;
        }
    }
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
