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
            let query = "SELECT * FROM searches WHERE query_string = ?;";
            query = mysql.format(query, [queryString]);

            this.connection.query(query, (error:string, results:any, fields:any) =>
            {
                this.connection.end();
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
                    this.executeQuery(q, [[null, queryString, null]])
                        .then((r:OkPacket) =>
                        {
                            const q = "INSERT INTO gameresults VALUES ?;";
                            const vals = results.gameData.map(d =>
                                [null, r.insertId, d.link, d.img, d.name, d.provider, d.price]);
                            return this.executeQuery(q, vals);
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