import Util from "../util/Util";
import {parse} from "node-html-parser";
import {GameData, NewGameData} from "../types";
import BaseCrawler from "./BaseCrawler";
import DataBaseModule from "../DataBaseModule";

export default class TechnopolisCrawler extends BaseCrawler
{


    constructor(db:DataBaseModule)
    {
        super("Technopolis", db);
    }


    async run()
    {
        this.currPage = 0;
        await this.loadNextChunk("https://www.technopolis.bg/bg//TV%2C-Video-i-Gaming/Igri/c/P11030301?pageselect=90&page=0");
    }


    async loadNextChunk(url:string)
    {
        const dataBuf = await Util.loadUrlToBuffer(url);
        const root = parse(dataBuf.toString());

        const productList = root.querySelectorAll(".products-grid-list li");

        const urlBase = "https://www.technopolis.bg";
        let gameData:NewGameData[] = productList.map((d:any) =>
        {
            let imgLink = "";
            let imgPath = d.querySelector(".product-box__top img")?.getAttribute("data-src");
            if (imgPath)
            {
                imgLink = urlBase + imgPath;
            }

            const titleLink = d.querySelector(".product-box__title-link");

            let price =
                Number(d.querySelector(".product-box__price-value")?.innerHTML) +
                Number(d.querySelector(".product-box__price sup")?.innerHTML/100);

            const thirtyDaysMS = 2592000000;

            const vendorId = d.querySelector(".product-box")?.getAttribute("data-product-id");
            delete this.vendorIds?.[vendorId];

            return {
                name:Util.sanitizeStringForDB(titleLink?.innerHTML || "", 100),
                price:isNaN(price) ? 0 : price,
                provider:this.provider,
                img:imgLink,
                link:urlBase + titleLink?.getAttribute("href"),
                vendor_id:vendorId,
                expires_at:Util.dateToMySqlFormat(new Date(Date.now() + thirtyDaysMS))
            };
        });

        await this.getImages(gameData);
        await this.addDataToDB(gameData);

        const pages = root.querySelectorAll(".paging li").filter(li =>
            !((li.getAttribute("class") === "prev") || (li.getAttribute("class") === "next")));
        const numPages = Number(pages[pages.length-1].querySelector("a")?.innerHTML) || 0;

        if (this.currPage < numPages)
        {
            this.currPage++;
            await Util.delay(1);
            await this.loadNextChunk("https://www.technopolis.bg/bg//TV%2C-Video-i-Gaming/Igri/c/P11030301?pageselect=90&page=" + this.currPage);
        }

    }


    processResults()
    {

    }

}