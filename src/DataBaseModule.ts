import {credentials} from "./cred";
import {GameData, SearchResult} from "./types";
import {Connection, MysqlError, OkPacket} from "mysql";
import C_Config from "./C_Config";
const mysql = require('mysql');


export default class DataBaseModule
{
    private connection:Connection;

    constructor()
    {
        this.connection = mysql.createConnection(credentials);
        // this.connection.connect();
    }


    getUserData(email:string):Promise<any>
    {
        const q = `SELECT passhash, salt, id FROM user WHERE email = ?`;
        return this.executeQuery(q, [email]).then((dbResponse:any[]) =>
        {
            return dbResponse;
        });
    }


    getCachedQuery(queryString:string):Promise<SearchResult>
    {
        return new Promise<any>((resolve, reject) =>
        {
            const responseData:SearchResult =
            {
                gameData:[],
                priceData:[],
                wikiData:{link:"", imgURL:"", textInfo:[]},
                videoId:""
            };
            let searchId:number;
            const q = `SELECT id, search_date FROM searches WHERE query_string = ?`;
            this.executeQuery(q, [queryString]).then((dbResponse:any[]) =>
            {
                if (dbResponse.length !== 1)
                {
                    throw new Error("Cached version not found");
                }
                else
                {
                    return dbResponse;
                }
            })
            .then((dbResponse:any[]) =>
            {
                searchId = dbResponse[0].id;
                const secondsSinceSearch = (new Date().getTime() - new Date(dbResponse[0].search_date).getTime())*.001;
                let query;
                if (secondsSinceSearch > C_Config.CACHE_DURATION_SECONDS)
                {
                    query = `DELETE FROM searches WHERE id = ?`;
                }
                else
                {
                    query = `SELECT img, link, price, name, provider FROM gameresults WHERE search_id = ?;`;
                }
                return this.executeQuery(query, [searchId])
            })
            .then((dbResponse:any) =>
            {
                if (!(dbResponse instanceof Array))
                {
                    throw new Error("Cached version expired");
                }
                responseData.gameData = dbResponse;
                const q = `SELECT link, price, name FROM priceresults WHERE search_id = ?;`;
                return this.executeQuery(q, [searchId])
            })
            .then((dbResponse:any[]) =>
            {
                responseData.priceData = dbResponse;
                const q = `SELECT img, text_info, link FROM wikiresults WHERE search_id = ?;`;
                return this.executeQuery(q, [searchId]);
            })
            .then((dbResponse:any[]) =>
            {
                responseData.wikiData =
                {
                    link:dbResponse[0]?.link,
                    imgURL:dbResponse[0]?.img,
                    textInfo:JSON.parse(dbResponse[0]?.text_info || "[]")
                };

                const q = `SELECT video_id FROM videoresults WHERE search_id = ?;`;
                return this.executeQuery(q, [searchId]);
            })
            .then((dbResponse:any[]) =>
            {
                responseData.videoId = dbResponse[0]?.video_id;
                resolve(responseData);
            })
            .catch((e:Error) =>
            {
                reject(e);
            })
        });
    }


    add(queryString:string, results:SearchResult):Promise<any>
    {
        return new Promise<any>((resolve, reject) =>
        {
            this.connection.beginTransaction((err:MysqlError) =>
            {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    const q = "INSERT INTO searches VALUES ?;";
                    let searchId:number;
                    this.executeQuery(q, [[null, queryString, null]])
                        .then((r:OkPacket) =>
                        {
                            searchId = r.insertId;
                            const q = "INSERT INTO gameresults VALUES ?;";
                            const vals = results.gameData.map(d =>
                                [null, searchId, d.link, d.img, d.name, d.provider, d.price || null]);
                            return vals.length > 0 ? this.executeQuery(q, vals) : undefined;
                        })
                        .then(() =>
                        {
                            const q = "INSERT INTO priceresults VALUES ?;";
                            const vals = results.priceData.map(d =>
                                [null, searchId, d.link, d.name, d.price || null]);

                            return vals.length > 0 ? this.executeQuery(q, vals) : undefined;
                        })
                        .then(() =>
                        {
                            const q = "INSERT INTO wikiresults VALUES ?;";
                            const vals = [[
                                null,
                                searchId,
                                results.wikiData.link,
                                results.wikiData.imgURL,
                                JSON.stringify(results.wikiData.textInfo)
                            ]];
                            return this.executeQuery(q, vals);
                        })
                        .then(() =>
                        {
                            const q = "INSERT INTO videoresults VALUES ?;";
                            const vals = [[null, searchId, results.videoId]];
                            return this.executeQuery(q, vals);
                        })
                        .then((r:any) =>
                        {
                            this.connection.commit();
                            resolve(undefined);
                        })
                        .catch((e) =>
                        {
                            this.connection.rollback();
                            reject(e);
                        })
                        .finally(() =>
                        {

                        });
                }
            });


        });
    }


    executeQuery(q:string, values:any[]):Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                this.connection.query(mysql.format(q, [values]), (error, results) =>
                {
                    if (error)
                    {
                        reject(error);
                    }
                    else
                    {
                        resolve(results);
                    }
                });
            }
            catch (e)
            {
                reject(e);
            }
        });
    }



}