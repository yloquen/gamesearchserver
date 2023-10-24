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
import {ErrorData, SearchResult, SessionData} from "./types";
import {IncomingMessage, ServerResponse} from "http";
import {E_ErrorType, E_GenericError, E_LoginError, E_RegisterError} from "./const/enums";
import {Buffer} from "buffer";
import {generateHS256Token, verifyToken} from "./JWTUtil";
import OlxComm from "./comm/OlxComm";
import OlxCrawler from "./crawlers/OlxCrawler";
import TechnopolisCrawler from "./crawlers/TechnopolisCrawler";
import SessionManager from "./SessionManager";


const http = require('http');
const url = require('url');
const crypto = require('crypto');

console.log("Running in environment " + process.env.NODE_ENV);
console.log("Starting server at 8080");
http.createServer(onRequest).listen(8080);

const db = new DataBaseModule();

const sm = new SessionManager();

// const jwToken = generateHS256Token({sub:1});
// const result = verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjF9.VH0PNb2_RIc5BYsGqFBqgyhIQ7g2oPyxg75PUWOF2fQ");
// console.log(result);


function sendResponse(req:IncomingMessage, response:ServerResponse, data:any)
{
    const resp =
    {
        data:data,
        loggedIn:Boolean(sm.getUserSessionData(req))
    };

    response.write(JSON.stringify(resp));
    response.end();
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



async function onReqReceived(req:IncomingMessage, resp:ServerResponse, data:any = undefined)
{
    try
    {
        await processRequest(req, resp, data);
    }
    catch (e)
    {
        console.log("\n\nError:\n" + e);
        sendResponse(req, resp, {error:{type:E_ErrorType.GENERIC, id:E_GenericError.GENERAL}});
    }
}


type MethodName =
    "/search_history" |
    "/set_favorite" |
    "/favorites" |
    "/login" |
    "/search" |
    "/verify" |
    "/logout" |
    "/register";


async function processRequest(req:IncomingMessage, resp:ServerResponse, data:any = undefined)
{
    resp.setHeader('Content-Type', 'application/json');
    resp.setHeader('Access-Control-Allow-Origin', C_Config.BASE_WEB_URL);
    resp.setHeader('Access-Control-Allow-Credentials', 'true');

    const parsedUrl = url.parse(req.url, true);
    const queryObject = parsedUrl.query;

    console.log(parsedUrl.pathname + " @ " + new Date().getTime());
    console.log("Request data : " + JSON.stringify(data));

    const sessionData = sm.getUserSessionData(req);
    const sid = sm.getSID(req);
    let userId = sessionData?.id;

    let methodName:MethodName = parsedUrl.pathname;

    const methodsRequiringLogin:MethodName[] =
    [
        "/search_history",
        "/favorites",
        "/set_favorite"
    ];

    if (!userId && methodsRequiringLogin.indexOf(methodName) !== -1)
    {
        sendResponse(req, resp, {error:{type:E_ErrorType.GENERIC, id:E_GenericError.NOT_LOGGED_IN}});
    }
    else
    {
        userId = userId!;

        if (process.env.NODE_ENV === "production")
        {
            methodName = methodName.slice(4) as MethodName;
        }

        switch (methodName)
        {
            case "/login":
            {
                if (sessionData)
                {
                    sendResponse(req, resp, {email:sessionData.email});
                }
                else
                {
                    const d:any[] = await db.getUserData(data.email);
                    if (d.length === 1)
                    {
                        const hash = await Util.generatePassHash(data.pass, d[0].salt);

                        if (d[0].passhash === hash)
                        {
                            const sessionData = sm.createSession(resp, d[0]);
                            sendResponse(req, resp, {email:data.email});
                        }
                        else
                        {
                            sendResponse(req, resp, {error:{type:E_ErrorType.LOGIN, id:E_LoginError.WRONG_PASSWORD}});
                        }
                    }
                    else
                    {
                        sendResponse(req, resp, {type:E_ErrorType.LOGIN, id:E_LoginError.USER_NOT_FOUND});
                    }
                }

                break;
            }

            case "/search_history":
            {
                sendResponse(req, resp, await db.findUserSearches(userId));
                break;
            }

            case "/search":
            {
                if (queryObject.q)
                {
                    const queryString = queryObject.q.toLowerCase().slice(0, C_Config.MAX_SEARCH_STRING_SIZE);
                    try
                    {
                        await parseSearch(decodeURIComponent(queryString), userId, req, resp);
                    }
                    catch (e)
                    {
                        sendResponse(req, resp, {error:{type:E_ErrorType.GENERIC, id:E_GenericError.GENERAL}});
                    }
                }
                else
                {
                    sendResponse(req, resp, {error:{type:E_ErrorType.GENERIC, id:E_GenericError.SEARCH_QUERY_NOT_PROVIDED}});
                }

                break;
            }

            case "/set_favorite":
            {
                sendResponse(req, resp, await db.addFavorite(data.id, userId));
                break;
            }

            case "/favorites":
            {
                sendResponse(req, resp, await db.getFavorites(userId));
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
                sm.endSession(req);
                sendResponse(req, resp, {success:true});
                break;
            }

            case "/register":
            {
                if (!data.hasOwnProperty("email") || !data.hasOwnProperty("pass"))
                {
                    sendResponse(req, resp, {error:{type:E_ErrorType.REGISTER, id:E_RegisterError.INVALID_DATA}});
                }
                else if (!Util.validateEmail(data.email))
                {
                    sendResponse(req, resp, {error:{type:E_ErrorType.REGISTER, id:E_RegisterError.INVALID_EMAIL}});
                }
                else if (!Util.validatePass(data.pass))
                {
                    sendResponse(req, resp, {error:{type:E_ErrorType.REGISTER, id:E_RegisterError.INVALID_PASS}});
                }
                else
                {
                    const result = await createUser(data.email, data.pass);
                    sendResponse(req, resp, result);
                }

                break;
            }

            default:
            {
                sendResponse(req, resp, {error:{type:E_ErrorType.GENERIC, id:E_GenericError.UNKNOWN_METHOD}});
                break;
            }

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
                const url = C_Config.BASE_WEB_URL + "/verify?token=" + verifyToken;
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


async function parseSearch(queryString:string, userId:number|undefined, req:IncomingMessage, response:ServerResponse)
{
    let searchResults:SearchResult|undefined = await db.getCachedQuery(queryString);

    if (searchResults)
    {
        sendResponse(req, response, searchResults);
        return;
    }

    const searchWords = Util.toSearchWords(queryString);

    const gameData = await db.getGames(userId, searchWords);

    const pcPromise = new PriceChartingComm().getData(searchWords, queryString);
    const wikiPromise = new WikiComm().getData(searchWords, queryString);
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

    await db.addSearchResult(queryString, searchResult, userId);
    sendResponse(req, response, searchResult);
}






