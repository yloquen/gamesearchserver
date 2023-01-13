import DataBaseModule from "./DataBaseModule";
import OlxCrawler from "./crawlers/OlxCrawler";
import TechnopolisCrawler from "./crawlers/TechnopolisCrawler";

const db = new DataBaseModule();
const activeSessions:Record<number, any> = {};

(async function ()
{
    // const olxCrawler = new OlxCrawler(db);
    // await olxCrawler.run();

    const technopolisCrawler = new TechnopolisCrawler(db);
     await technopolisCrawler.runAndClean();

    console.log("Done");
})();