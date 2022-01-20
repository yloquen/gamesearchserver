import {NetConnectOpts} from "net";
import {credentials} from "./cred";
import {SearchResult} from "./types";
import {Connection, MysqlError} from "mysql";
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


    add(queryString:string, result:SearchResult):Promise<any>
    {
/*        this.connection.beginTransaction((error) => {
            if (error)
            {
                throw error;
            }

            this.queryPromise()
            .then()

            this.connection.query('INSERT INTO posts SET title=?', title, function (error, results, fields)
            {
                if (error)
                {
                    return this.connection.rollback(function() {
                        throw error;
                    });
                }

                var log = 'Post ' + results.insertId + ' added';

                this.connection.query('INSERT INTO log SET data=?', log, function (error, results, fields)
                {
                    if (error)
                    {
                        return this.connection.rollback(function() {
                            throw error;
                        });
                    }
                    this.connection.commit(function(err) {
                        if (err) {
                            return this.connection.rollback(function() {
                                throw err;
                            });
                        }
                        console.log('success!');
                    });
                });
            });
        });*/



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
                    const q = "INSERT INTO searches (query_string) VALUES (?);";
                    this.executeQuery(q, [queryString])
                        .then((r:any) =>
                        {
                            console.log(1);
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
            this.connection.query(mysql.format(q, values), (error) =>
            {
                if (error)
                {
                    reject(error);
                }
                else
                {
                    resolve(undefined);
                }
            });
        });
    }



}