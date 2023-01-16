import {IncomingMessage, ServerResponse} from "http";
import {SessionData} from "./types";

const crypto = require('crypto');



export default class
{
    private activeSessions:Record<string, SessionData> = {};

    constructor()
    {
        this.activeSessions = {};
    }

    createSession(resp:ServerResponse, userData:{id:number, email:string})
    {
        const sid = crypto.randomBytes(32).toString('base64');
        this.activeSessions[sid] = { id:userData.id, email:userData.email };
        resp.setHeader("Set-Cookie", `sid=${sid}; Max-Age=3600; HttpOnly;`);

        return this.activeSessions[sid];
    }


    getUserSessionData(req:IncomingMessage):SessionData|undefined
    {
        let sessionData;
        const sid = this.getSID(req);
        if (sid)
        {
            sessionData = this.activeSessions[sid];
        }
        return sessionData;
    }


    getSID(req:IncomingMessage):string|undefined
    {
        return this.parseCookies(req).sid;
    }


    parseCookies(req:IncomingMessage)
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


    endSession(req:IncomingMessage)
    {
        const sid = this.getSID(req);
        if (sid && this.activeSessions[sid])
        {
            delete this.activeSessions[sid];
        }
    }


}