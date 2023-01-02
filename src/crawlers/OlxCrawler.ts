import Util from "../util/Util";
import {parse} from "node-html-parser";
import {GameData, NewGameData} from "../types";
import BaseCrawler from "./BaseCrawler";
import DataBaseModule from "../DataBaseModule";

export default class OlxCrawler extends BaseCrawler
{
    private currentChunk:any;
    private nextIndex:number = 0;
    private vendorIds:any;

    constructor(db:DataBaseModule)
    {
        super("OLX", db);
    }


    async run()
    {

        this.nextIndex = 0;

        const data = await this.db.executeQuery("SELECT vendor_id FROM crawl_gameresults WHERE provider = ?", [this.provider]);
        this.vendorIds = {};
        data.forEach((d:any) => { this.vendorIds[d.vendor_id] = 1});

        await this.loadNextChunk("https://www.olx.bg/api/v1/offers?offset=0&limit=50&category_id=636");

        debugger;
    }


    async loadNextChunk(url:string)
    {
        const dataBuf = await Util.loadUrlToBuffer(url);
        this.currentChunk = JSON.parse(dataBuf.toString());

        let gameData:NewGameData[] = this.currentChunk.data.map((d:any) =>
        {
            const imgName = d.photos?.[0]?.filename;
            let imgLink = "";
            if (imgName)
            {
                imgLink = "https://frankfurt.apollo.olxcdn.com/v1/files/" + imgName + "/image;s=200x0;q=50"
            }

            let price = 0;
            const priceData = d.params.filter((p:any) => p.key === "price");
            if (priceData.length === 1)
            {
                price = priceData[0].value?.value;
            }

            return {
                name:d.title,
                price:price,
                provider:this.provider,
                img:imgLink,
                link:d.url,
                vendor_id:d.id,
                expires_at:new Date(d.valid_to_time).toISOString().slice(0, 19).replace('T', ' ')
            }
        });

        const imgPromises = [];
        for (let gameIdx = 0; gameIdx < gameData.length; gameIdx++)
        {
            const d = gameData[gameIdx];

            if (d.img)
            {
                imgPromises.push(Util.getImage(d.img));
            }
            else
            {
                imgPromises.push(Promise.resolve(null));
            }
        }

        const imgNames = await Promise.all(imgPromises);

        gameData.forEach((gd:any, idx:number) =>
        {
            gd.img = imgNames[idx];
        });

        const gameValues = gameData.map(d =>
        {
            return [null, d.link, d.img, Util.sanitizeStringForDB(d.name, 100), d.provider, d.price, d.vendor_id, d.expires_at ];
        });

        console.log(JSON.stringify(gameValues));

        if (gameValues.length > 0)
        {
            await this.db.executeQuery("INSERT INTO crawl_gameresults VALUES ? ON DUPLICATE KEY UPDATE name = name;", gameValues);
        }

        const next = this.currentChunk.links?.next?.href;
        if (next)
        {
            await Util.delay(3);
            await this.loadNextChunk(next);
        }
    }


    processResults()
    {

    }

}