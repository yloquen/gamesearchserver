import {NetConnectOpts} from "net";
import {credentials} from "./cred";
import {GameData, SearchResult} from "./types";
import {Connection, MysqlError, OkPacket} from "mysql";
const mysql = require('mysql');


export default class DataBaseModule
{
    private connection:Connection;

    constructor()
    {
        this.connection = mysql.createConnection(credentials);
    }

    checkQuery(queryString:string):Promise<any>
    {
        this.connection.connect();

        return new Promise<any>((resolve, reject) =>
        {
            this.executeQuery("SELECT * FROM searches WHERE query_string = ?;", [queryString])
                .then((r:any) =>
                {
                    console.log(1);
                })
                .catch((e)=>
                {

                })
                .finally(() =>
                {
                    this.connection.end();
                });
        });
    }


    add(queryString:string, results:SearchResult):Promise<any>
    {
        return new Promise<any>((resolve, reject) =>
        {
            this.connection.connect();

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
                                [null, searchId, d.link, d.img, d.name, d.provider, d.price]);
                            return vals.length > 0 ? this.executeQuery(q, vals) : undefined;
                        })
                        .then(() =>
                        {
                            const q = "INSERT INTO priceresults VALUES ?;";
                            const vals = results.priceData.map(d =>
                                [null, searchId, d.link, d.name, d.price]);

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
                            return vals.length > 0 ? this.executeQuery(q, vals) : undefined;
                        })
                        .then(() =>
                        {
                            const q = "INSERT INTO videoresults VALUES ?;";
                            const vals = [[null, searchId, results.videoId]];
                            return vals.length > 0 ? this.executeQuery(q, vals) : undefined;
                        })
                        .then((r:any) =>
                        {
                            this.connection.commit();
                        })
                        .catch((e) =>
                        {
                            this.connection.rollback();
                            reject(e);
                        })
                        .finally(() =>
                        {
                            this.connection.end();
                        });
                }
            });


        });
    }


    executeQuery(q:string, values:any[]):Promise<any>
    {
        return new Promise((resolve, reject) =>
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
        });
    }



}