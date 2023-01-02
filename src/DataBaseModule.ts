import {credentials} from "./cred";
import {GameData, SearchResult} from "./types";
import {Connection, MysqlError, OkPacket} from "mysql";
import C_Config from "./C_Config";
import {E_ErrorType, E_GenericError} from "./const/enums";
import Util from "./util/Util";

const mysql = require('mysql');


export default class DataBaseModule
{
    private connection:Connection;

    constructor()
    {
        // this.connection = mysql.createConnection(credentials);
        this.connection = this.createConnection();
        // this.connection.connect();
    }


    createConnection()
    {
        const connection = mysql.createConnection(credentials);

        connection.connect((err:any) =>
        {
            if(err)
            {
                console.log('error when connecting to db:', err);
                setTimeout(() => { this.createConnection() }, 2000);
            }
        });

        connection!.on('error', (err:any) =>
        {
            console.log('db error', err);
            if(err.code === 'PROTOCOL_CONNECTION_LOST')
            {
                console.log("Connection lost, trying to reconnect");
                this.createConnection();
            }
            else
            {
                throw err;
            }
        });

        return connection;
    }


    getUserData(email:string):Promise<any>
    {
        const q = `SELECT passhash, salt, id FROM user WHERE email = ?`;
        return this.executeQuery(q, [email]).then((dbResponse:any[]) =>
        {
            return dbResponse;
        });
    }


    createUser(email:string, hash:string, salt:string, verifyToken:string):Promise<any>
    {
        return new Promise<any>((resolve, reject) =>
        {
            this.connection.beginTransaction(async (err:MysqlError) =>
            {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    try
                    {
                        let q = "INSERT INTO user VALUES ?;";
                        let vals = [ null, email, hash, salt, 0];

                        await this.executeQuery(q, [vals]);

                        q = "INSERT INTO verify VALUES (LAST_INSERT_ID(), ?);";
                        vals = [email, verifyToken];

                        await this.executeQuery(q, vals);

                        this.connection.commit();

                        resolve(true);
                    }
                    catch (e)
                    {
                        this.connection.rollback();
                        reject(e);
                    }
                }
            });
        });



    }


    async getCachedQuery(queryString:string):Promise<SearchResult|undefined>
    {
        const responseData:SearchResult =
        {
            gameData:[],
            priceData:[],
            wikiData:{link:"", imgURL:"", textInfo:[]},
            videoId:""
        };

        let query = `SELECT id, search_date FROM searches WHERE query_string = ?`;
        let dbResponse:any[] = await this.executeQuery(query, [queryString]);

        if (dbResponse.length === 0)
        {
            return;
        }

        const searchId = dbResponse[0].id;
        const secondsSinceSearch = (new Date().getTime() - new Date(dbResponse[0].search_date).getTime())*.001;

        if (secondsSinceSearch > C_Config.CACHE_DURATION_SECONDS)
        {
            query = `DELETE FROM searches WHERE id = ?`;
            await this.executeQuery(query, [searchId]);

            return;
        }

        query = `SELECT id, img, link, price, name, provider FROM gameresults WHERE search_id = ?;`;
        responseData.gameData = await this.executeQuery(query, [searchId]);

        query = `SELECT link, price, name FROM priceresults WHERE search_id = ?;`;
        responseData.priceData = await this.executeQuery(query, [searchId]);

        query = `SELECT img, text_info, link FROM wikiresults WHERE search_id = ?;`;
        dbResponse = await this.executeQuery(query, [searchId]);

        responseData.wikiData =
        {
            link:dbResponse[0]?.link,
            imgURL:dbResponse[0]?.img,
            textInfo:JSON.parse(dbResponse[0]?.text_info || "[]")
        };

        query = `SELECT video_id FROM videoresults WHERE search_id = ?;`;
        dbResponse = await this.executeQuery(query, [searchId]);
        responseData.videoId = dbResponse[0]?.video_id;

        return responseData;
    }



    add(queryString:string, results:SearchResult, userId:number):Promise<any>
    {
        return new Promise<any>((resolve, reject) =>
        {
            this.connection.beginTransaction(async (err:MysqlError) =>
            {
                if (err)
                {
                    this.connection.rollback();
                    reject(err);
                }
                else
                {
                    try
                    {
                        const r = await this.saveGameData(queryString, results, userId);
                        this.connection.commit();
                        resolve(r)
                    }
                    catch(e)
                    {
                        this.connection.rollback();
                        reject(e);
                    }
                }
            });
        });
    }


    async saveGameData(queryString:string, results:SearchResult, userId:number)
    {
        const searchesQuery = "INSERT INTO searches VALUES ?;";
        const searchesResult = await this.executeQuery(searchesQuery, [[null, queryString, null, userId]]);

        let searchId:number = searchesResult.insertId;

        const gameQuery = "INSERT INTO gameresults VALUES ?;";
        const gameValues = results.gameData.map(d =>
        {
            return [null, searchId, d.link, d.img, Util.sanitizeStringForDB(d.name, 100), d.provider, d.price || null]
        });
        const gameResults = await this.executeQuery(gameQuery, gameValues);
        results.gameData.forEach((gameData, idx) => {gameData.id = gameResults.insertId + idx; });

        const priceQuery = "INSERT INTO priceresults VALUES ?;";
        const priceValues = results.priceData.map(d => [null, searchId, d.link, d.name, d.price || null]);
        await this.executeQuery(priceQuery, priceValues);

        const q4 = "INSERT INTO wikiresults VALUES ?;";
        const vals4 = [[
            null,
            searchId,
            results.wikiData.link,
            results.wikiData.imgURL,
            JSON.stringify(results.wikiData.textInfo)
        ]];
        await this.executeQuery(q4, vals4);

        const q5 = "INSERT INTO videoresults VALUES ?;";
        const vals = [[null, searchId, results.videoId]];
        await this.executeQuery(q5, vals);
    }


    executeQuery(q:string, values:any[]):Promise<any>
    {
        console.log(q + " " +  values.length);
        if (values.length === 0)
        {
            return Promise.resolve();
        }

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


    verifyUser(token:string)
    {

    }


    async findUserSearches(userId:any)
    {
        const q = "SELECT query_string FROM searches where user_id = ?;";

        let result;
        try
        {
            result = await this.executeQuery(q, [userId]);
            result = result.map((r:any) => r.query_string)
        }
        catch (e)
        {
            result = {error:{type:E_ErrorType.GENERIC, id:E_GenericError.DATABASE}};
        }

        return result;
    }


    getGames(searchWords:string[])
    {
        const q = "SELECT id, img, link, price, name, provider FROM crawl_gameresults where MATCH(name) AGAINST(? IN BOOLEAN MODE)";
        return this.executeQuery(q, ["+" + searchWords.join(" +")]);
    }


}