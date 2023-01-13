import Util from "../util/Util";
import {parse} from "node-html-parser";
import {GameData, NewGameData} from "../types";
import BaseCrawler from "./BaseCrawler";
import DataBaseModule from "../DataBaseModule";

export default class OlxCrawler extends BaseCrawler
{

    constructor(db:DataBaseModule)
    {
        super("OLX", db);
    }


    async run()
    {
        await this.loadNextChunk("https://www.olx.bg/api/v1/offers?offset=0&limit=50&category_id=636");
    }


    async loadNextChunk(url:string)
    {
        const dataBuf = await Util.loadUrlToBuffer(url);
        const data = JSON.parse(dataBuf.toString());

        let gameData:NewGameData[] = data.data.map((d:any) =>
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
                name:Util.sanitizeStringForDB(d.title, 100),
                price:price,
                provider:this.provider,
                img:imgLink,
                link:d.url,
                vendor_id:d.id,
                expires_at:Util.dateToMySqlFormat(new Date(d.valid_to_time))
            }
        });

        await this.getImages(gameData);
        await this.addDataToDB(gameData);

        const next = data.links?.next?.href;
        if (next)
        {
            await Util.delay(1);
            await this.loadNextChunk(next);
        }
    }

}