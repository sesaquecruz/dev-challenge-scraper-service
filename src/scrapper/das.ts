import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import puppeteerExtra from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";
import { Das } from "../model/das";

puppeteerExtra.use(Stealth());

interface IDasScraper {
  downloadDas(cnpj: string, year: number, month: number): Promise<Das>;
}

class DasScraper implements IDasScraper {
  private readonly downloadPath: string;
  private readonly headless: boolean | "new";

  constructor(downloadPath: string, headless: boolean) { 
    this.downloadPath = downloadPath;
    this.headless = headless ? "new" : false;

    this.downloadDas = this.downloadDas.bind(this);
  }

  // Download DAS from PGMEI
  async downloadDas(cnpj: string, year: number, month: number): Promise<Das> {
    // Format inputs to matches with options
    const formatedYear = String(year);
    const formatedMonth = String(month).padStart(2, "0");

    
     // Generate a download path
    const downloadFullPath = `${this.downloadPath}${uuidv4()}`;
    fs.mkdir(downloadFullPath, (error) => { 
      if (error) throw error;
    });
  
    // Setup browser
    const browser = await puppeteerExtra.launch({ headless: this.headless });
    const session = await browser.target().createCDPSession();
  
    await session.send("Browser.setDownloadBehavior", {
      behavior: "allowAndName",
      downloadPath: downloadFullPath,
      eventsEnabled: true,
    });

    const downloadProgress = async () => {
      return new Promise((resolve, reject) => {
        session.on("Browser.downloadProgress", event => {
          if (event.state === "completed")
            return resolve(`download ${event.state}`);
          if (event.state === "canceled")
            return reject(`download ${event.state}`);
        });
      });
    };
    
    // Setup page
    const page = await browser.newPage();
  
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");
  
    // Steps to download DAS
  
    async function goToPgmeiPage() {
      await page.goto("https://www8.receita.fazenda.gov.br/simplesnacional/aplicacoes/atspo/pgmei.app/identificacao");
      page.waitForNavigation({ waitUntil: "load" });
    }
  
    async function enterWithCnpj() {
      await page.waitForSelector("[name=\"cnpj\"]");
      await page.keyboard.press("Home");
      await page.type("[name=\"cnpj\"]", cnpj);
  
      await page.keyboard.press("Enter");
      page.waitForNavigation({ waitUntil: "load" });
    }
  
    async function goToIssuePage() {
      await page.waitForSelector("[href=\"/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao\"]");
      await page.click("[href=\"/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao\"]");
      page.waitForNavigation({ waitUntil: "load" });
    }
  
    async function selectYear() {
      // Select options
      await page.waitForSelector("[data-id=\"anoCalendarioSelect\"]");
      await page.click("[data-id=\"anoCalendarioSelect\"]");
  
      await page.waitForSelector(".dropdown-menu.inner");
  
      // Select year if it is available
      const selectedYear = await page.evaluate((year) => {
        const years = document.querySelectorAll("a[tabindex=\"0\"][aria-disabled=\"false\"]");
        const indexOfYear = Array.from(years).findIndex(element => element.textContent?.trim() === year);
  
        if (indexOfYear >= 0) {
          const option = years[indexOfYear] as HTMLElement;
          option.click();
        }
        
        return indexOfYear >= 0;
      }, formatedYear);
      
      if (!selectedYear)
        throw new Error("unavailable year");
  
      await page.click("[type=\"submit\"]");
      page.waitForNavigation({ waitUntil: "load" });
    }
  
    async function selectMonth() {
      // Select month if it is available
      await page.waitForSelector(`input[type="checkbox"][value="${formatedYear}${formatedMonth}"]`);
      await page.click(`input[type="checkbox"][value="${formatedYear}${formatedMonth}"]`);
  
      await page.waitForSelector("#btnEmitirDas");
      await page.click("#btnEmitirDas");
    }
  
    async function downloadDas() {
      await page.waitForSelector("[href=\"/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao/imprimir\"]");
      await page.click("[href=\"/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao/imprimir\"]");
      await downloadProgress();
    }
  
    function getDas(): Das {
      const fileName = `das-${formatedYear}-${formatedMonth}.pdf`;
      const filePath = `${downloadFullPath}/${fileName}`;
  
      fs.readdir(downloadFullPath, (error, files) => { 
        if (error) throw error;
  
        if (files.length < 1)
          throw new Error("download file not found");
  
        if (files.length > 1)
          throw new Error("multiples download files");
  
        const currentName = files[0];
  
        fs.rename(path.join(downloadFullPath, currentName), path.join(downloadFullPath, fileName), (error) => {
          if (error) throw error;
        });
      });

      const das = new Das(year, month);
      das.setFileInfo(fileName, filePath);

      return das;
    }
  
    try {
      await goToPgmeiPage();
      await enterWithCnpj();
      await goToIssuePage();
      await selectYear();
      await selectMonth();
      await downloadDas();
      return getDas();
    } finally {
      await browser.close();
    }
  }
}

export { IDasScraper, DasScraper };
