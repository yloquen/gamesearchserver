import BaseComm from "./comm/BaseComm";
import OzoneComm from "./comm/OzoneComm";
import TechnopolisComm from "./comm/TechnopolisComm";
import Util from "./util/Util";
import WikiComm from "./comm/WikiComm";
import PriceChartingComm from "./comm/PriceChartingComm";
import YouTubeComm from "./comm/YouTubeComm";
import BazarComm from "./comm/BazarComm";
import DataBaseModule from "./DataBaseModule";
import C_Config from "./C_Config";
import {ErrorData, SearchResult} from "./types";
import {IncomingMessage, ServerResponse} from "http";
import {E_ErrorType, E_GenericError, E_LoginError, E_RegisterError} from "./const/enums";
import {Buffer} from "buffer";
import {generateHS256Token, verifyToken} from "./JWTUtil";
import OlxComm from "./comm/OlxComm";
import OlxCrawler from "./crawlers/OlxCrawler";


const http = require('http');
const url = require('url');
const crypto = require('crypto');

console.log("Starting server at 8080");
http.createServer(onRequest).listen(8080);

const db = new DataBaseModule();
const activeSessions:Record<number, any> = {};


const olxCrawler = new OlxCrawler(db);
olxCrawler.run();

// const jwToken = generateHS256Token({sub:1});
// const result = verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjF9.VH0PNb2_RIc5BYsGqFBqgyhIQ7g2oPyxg75PUWOF2fQ");
// console.log(result);


function sendResponse(response:ServerResponse, data:any)
{
    response.write(JSON.stringify(data));
    response.end();
}


function parseCookies(req:IncomingMessage)
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
            onReqReceived(req, resp, JSON.parse(body));
        });
    }
    else
    {
        onReqReceived(req, resp);
    }
}



function onReqReceived(req:IncomingMessage, resp:ServerResponse, data:any = undefined)
{
    try
    {
        processRequest(req, resp, data);
    }
    catch (e)
    {
        sendResponse(resp, {error:{type:E_ErrorType.GENERIC, id:E_GenericError.GENERAL}});
    }
}



async function processRequest(req:IncomingMessage, resp:ServerResponse, data:any = undefined)
{
    resp.setHeader('Content-Type', 'application/json');
    resp.setHeader('Access-Control-Allow-Origin', 'http://192.168.0.152:8081');
    resp.setHeader('Access-Control-Allow-Credentials', 'true');

    const parsedUrl = url.parse(req.url, true);
    const queryObject = parsedUrl.query;

    console.log(parsedUrl.pathname + " @ " + new Date().getTime());

    const cookies = parseCookies(req);
    const sid = cookies.sid;
    let userId = null;
    if (sid && activeSessions[sid])
    {
        userId = activeSessions[sid].id;
    }

    switch (parsedUrl.pathname)
    {

        case "/login":
        {
            if (userId !== null)
            {
                sendResponse(resp, {email:activeSessions[sid].email});
            }
            else
            {
                const d:any[] = await db.getUserData(data.email);
                if (d.length === 1)
                {
                    const hash = await Util.generatePassHash(data.pass, d[0].salt);
                    if (d[0].passhash === hash)
                    {
                        const sid = crypto.randomBytes(32).toString('base64');
                        activeSessions[sid] = { id:d[0].id, email:data.email };
                        resp.setHeader("Set-Cookie", `sid=${sid}; Max-Age=3600; HttpOnly;`);
                        sendResponse(resp, {email:data.email});
                    }
                    else
                    {
                        sendResponse(resp, {error:{type:E_ErrorType.LOGIN, id:E_LoginError.WRONG_PASSWORD}});
                    }
                }
                else
                {
                    sendResponse(resp, {type:E_ErrorType.LOGIN, id:E_LoginError.USER_NOT_FOUND});
                }
            }

            break;
        }

        case "/search_history":
        {
            if (!userId)
            {
                sendResponse(resp, {error:{type:E_ErrorType.GENERIC, id:E_GenericError.NOT_LOGGED_IN}});
                break;
            }

            const result = await db.findUserSearches(userId);
            sendResponse(resp, result);

            break;
        }

        case "/search":
        {
            if (queryObject.q)
            {
                const queryString = queryObject.q.toLowerCase().slice(0, C_Config.MAX_SEARCH_STRING_SIZE);
                try
                {
                    parseSearch(decodeURIComponent(queryString), userId, resp);
                }
                catch (e)
                {
                    sendResponse(resp, {error:{type:E_ErrorType.GENERIC, id:E_GenericError.GENERAL}});
                }
            }
            else
            {
                sendResponse(resp, {error:{type:E_ErrorType.GENERIC, id:E_GenericError.SEARCH_QUERY_NOT_PROVIDED}});
                resp.end();
            }

            break;
        }


        case "/verify":
        {
            if (queryObject.token)
            {
                db.verifyUser(queryObject.token);
            }
            break;
        }

        case "/logout":
        {
            if (sid && activeSessions[sid])
            {
                delete activeSessions[sid];
            }

            sendResponse(resp, {success:true});

            break;
        }

        case "/register":
        {
            if (!data.hasOwnProperty("email") || !data.hasOwnProperty("pass"))
            {
                sendResponse(resp, {error:{type:E_ErrorType.REGISTER, id:E_RegisterError.INVALID_DATA}});
            }
            else if (!Util.validateEmail(data.email))
            {
                sendResponse(resp, {error:{type:E_ErrorType.REGISTER, id:E_RegisterError.INVALID_EMAIL}});
            }
            else if (!Util.validatePass(data.pass))
            {
                sendResponse(resp, {error:{type:E_ErrorType.REGISTER, id:E_RegisterError.INVALID_PASS}});
            }
            else
            {
                const result = await createUser(data.email, data.pass);
                sendResponse(resp, result);
            }

            break;
        }

        default:
        {
            sendResponse(resp, {error:{type:E_ErrorType.GENERIC, id:E_GenericError.UNKNOWN_METHOD}});
            break;
        }

    }
}


async function createUser(email:string, pass:string):Promise<any>
{
    let result, dBdata;

    try
    {
        dBdata = await db.getUserData(email);

        if (dBdata.length === 0)
        {
            const salt = crypto.randomBytes(16).toString('base64');
            let passHash;

            try
            {
                passHash = await Util.generatePassHash(pass, salt);

                const verifyToken = crypto.randomBytes(64).toString('base64');
                await db.createUser(email, passHash, salt, verifyToken);

                const url = "http://192.168.0.152/verify?token=" + verifyToken;

                const emailText = "Copy and paste this link in the browser address bar:\n" + url;

                await Util.sendEmail(email, "Verify your GameSleuth account", emailText);
                result = {success:true};
            }
            catch (e)
            {
                result = {error:{type:E_ErrorType.REGISTER, id:E_RegisterError.CREATE_USER, msg:e}};
            }
        }
        else
        {
            result = {error:{type:E_ErrorType.REGISTER, id:E_RegisterError.USER_EXISTS}};
        }
    }
    catch (e)
    {
        result = {error:{type:E_ErrorType.GENERIC, id:E_GenericError.DATABASE}};
    }

    return result;
}


async function parseSearch2(queryString:string, userId:number, response:ServerResponse)
{
    let searchResults:SearchResult|undefined = await db.getCachedQuery(queryString);

    if (searchResults)
    {
        sendResponse(response, searchResults);
        return;
    }

    const communicators:BaseComm[] =
    [
        new TechnopolisComm(),
        new OzoneComm(),
        new BazarComm(),
        new OlxComm()
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

    const results:any[] = await Promise.all(allPromises);

    const wikiResult = results[allPromises.indexOf(wikiPromise)];
    const ytResult = results[allPromises.indexOf(ytPromise)];

    const searchResult =
    {
        gameData:results.slice(0, commPromises.length).flat(),
        priceData:results[allPromises.indexOf(pcPromise)],
        wikiData:wikiResult,
        videoId:ytResult?.videoId
    };

    // await db.add(queryString, searchResult, userId);
    sendResponse(response, searchResult);
}


async function parseSearch(queryString:string, userId:number, response:ServerResponse)
{
    let searchResults:SearchResult|undefined = await db.getCachedQuery(queryString);

    if (searchResults)
    {
        sendResponse(response, searchResults);
        return;
    }

/*    const communicators:BaseComm[] =
    [
        new TechnopolisComm(),
        new OzoneComm(),
        new BazarComm(),
        new OlxComm()
    ];

    const commPromises:Promise<any>[] = communicators.map(comm =>
    {
        return comm.getData(queryString);
    });*/

    const searchWords = Util.toSearchWords(queryString);

    const gameData = await db.getGames(searchWords);

    const pcPromise = new PriceChartingComm().getData(searchWords, queryString);
    const wikiPromise = new WikiComm().getData(searchWords);
    const ytPromise = new YouTubeComm().getData(searchWords);

    const allPromises:Promise<any>[] = [pcPromise, wikiPromise, ytPromise];

    const results:any[] = await Promise.all(allPromises);

    const wikiResult = results[allPromises.indexOf(wikiPromise)];
    const ytResult = results[allPromises.indexOf(ytPromise)];

    const searchResult =
    {
        gameData:gameData,
        priceData:results[allPromises.indexOf(pcPromise)],
        wikiData:wikiResult,
        videoId:ytResult?.videoId
    };

    // await db.add(queryString, searchResult, userId);
    sendResponse(response, searchResult);
}






