import {GameData, WikiData} from "./types";
import BaseComm from "./BaseComm";
import Util from "./Util";
import {Buffer} from "buffer";
import HTMLElement from "node-html-parser/dist/nodes/html";
import {parse} from "node-html-parser";

const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");

export default class YouTubeComm
{


    getData(searchWords:string[]):Promise<WikiData>
    {
        return new Promise<any>((resolve, reject) =>
        {
            const url = "https://www.youtube.com/results?search_query=" + searchWords.join("+") + "+walkthrough&tbm=vid";

            Util.loadUrlToBuffer(url)
                .then((data:Buffer) =>
                {
                    return data.toString();
                })
                .then((ytResp:string) =>
                {
                    const index = ytResp.indexOf("videoId");

                    if (index !== -1)
                    {
                        resolve({videoId:ytResp.substring(index+10, index+21)});
                    }
                    else
                    {
                        reject();
                    }
                })
                .catch((data) =>
                {
                    resolve({});
                });
        });
    }


}