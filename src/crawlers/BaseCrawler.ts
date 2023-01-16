import DataBaseModule from "../DataBaseModule";
import {NewGameData} from "../types";
import Util from "../util/Util";

export default class BaseCrawler
{
    protected provider:string;
    protected db:DataBaseModule;
    protected currPage:number;
    protected vendorIds:Record<string, number>|undefined;

    constructor(provider:string, db:DataBaseModule)
    {
        this.provider = provider;
        this.db = db;
        this.currPage = 0;
    }


    async runAndClean()
    {
        const data = await this.db.executeQuery("SELECT vendor_id FROM crawl_gameresults WHERE provider = ?", [[this.provider]]);
        this.vendorIds = {};
        data.forEach((d:any) => { this.vendorIds![d.vendor_id] = 1});

        debugger;

        await this.run();

        const idsToDelete = [];
        for (let vendorId in this.vendorIds)
        {
            idsToDelete.push(vendorId);
        }

        const q = "DELETE FROM crawl_gameresults WHERE vendor_id IN ?";
        await this.db.executeQuery(q, [[idsToDelete]]);
    }


    async run()
    {

    }


    async getImages(gameData:NewGameData[])
    {
        const promises:Promise<any>[] = [];
        gameData.forEach((d:NewGameData, idx:number) =>
        {
            if (d.img)
            {
                const img = d.img;
                promises.push(Util.delayedPromise(() => Util.getImage(img), idx * 0.025));
            }
            else
            {
                promises.push(Promise.resolve(null));
            }
        });

        const imgNames = await Promise.all(promises);

        gameData.forEach((gd:NewGameData, idx:number) =>
        {
            gd.img = imgNames[idx];
        });
    }


    async addDataToDB(gameData:NewGameData[])
    {
        const gameValues = gameData.map(d =>
        {
            return [null, d.link, d.img, d.name, d.provider, d.price, d.vendor_id, d.expires_at];
        });

        if (gameValues.length > 0)
        {
            await this.db.executeQuery("INSERT INTO crawl_gameresults VALUES ? ON DUPLICATE KEY UPDATE price = price;", [gameValues]);
        }
    }


}