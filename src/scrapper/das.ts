import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import puppeteerExtra from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";
import { Browser, CDPSession, Page } from "puppeteer";
import { ScraperError } from "../error/scraper";

puppeteerExtra.use(Stealth());

interface IDasScraper {
  getDas(cnpj: string, year: number, month: number): Promise<string>;
}

class DasScraper implements IDasScraper {
  private readonly baseDownloadPath: string;
  private readonly headless: boolean | "new";

  constructor(baseDownloadPath: string, headless: boolean) { 
    this.baseDownloadPath = baseDownloadPath;
    this.headless = headless ? "new" : false;
  }

  // Downloads DAS from PGMEI and returns its file path
  async getDas(cnpj: string, year: number, month: number): Promise<string> {
    const downloadPath = this.generateDownloadPath();
    const browser = await this.createBrowser();
    const session = await this.createSession(browser, downloadPath);
    const page = await this.createPage(browser);
  
    try {
      await this.navigationSteps(page, cnpj, String(year), String(month));
      await this.downloadEvent(session);
      const filePath = this.getFilePathWithCustomName(downloadPath, `das-${year}-${month}.pdf`);
      return filePath;
    } catch (error) {
      throw new ScraperError((error as Error).message);
    } finally {
      await browser.close();
    }
  }

  private generateDownloadPath(): string {
    const downloadPath = `${this.baseDownloadPath}${uuidv4()}`;
    fs.mkdir(downloadPath, (error) => { 
      if (error) throw error;
    });
    return downloadPath;
  }

  private async createBrowser(): Promise<Browser> {
    return puppeteerExtra.launch({ 
      headless: this.headless,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });
  }

  private async createSession(browser: Browser, downloadPath: string): Promise<CDPSession> {
    const session = await browser.target().createCDPSession();
    await session.send("Browser.setDownloadBehavior", {
      behavior: "allowAndName",
      downloadPath: downloadPath,
      eventsEnabled: true,
    });
    return session;
  }

  private async createPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");
    return page;
  }
  
  private async navigationSteps(page: Page, cnpj: string, year: string, month: string) {
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
      }, year);
      
      if (!selectedYear)
        throw new Error("unavailable year");
  
      await page.click("[type=\"submit\"]");
      page.waitForNavigation({ waitUntil: "load" });
    }
  
    async function selectMonth() {
      // Select month if it is available
      await page.waitForSelector(`input[type="checkbox"][value="${year}${month.padStart(2, "0")}"]`);
      await page.click(`input[type="checkbox"][value="${year}${month.padStart(2, "0")}"]`);
  
      await page.waitForSelector("#btnEmitirDas");
      await page.click("#btnEmitirDas");
    }
  
    async function startDownload() {
      await page.waitForSelector("[href=\"/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao/imprimir\"]");
      await page.click("[href=\"/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao/imprimir\"]");
    }

    await goToPgmeiPage();
    await enterWithCnpj();
    await goToIssuePage();
    await selectYear();
    await selectMonth();
    await startDownload();
  }

  private async downloadEvent(session: CDPSession): Promise<string> {
    return new Promise((resolve, reject) => {
      session.on("Browser.downloadProgress", event => {
        if (event.state === "completed")
          return resolve(`download ${event.state}`);
        if (event.state === "canceled")
          return reject(`download ${event.state}`);
      });
    });
  }

  private getFilePathWithCustomName(downloadPath: string, customName: string): string {
    const filePath = path.join(downloadPath, customName);

    fs.readdir(downloadPath, (error, files) => { 
      if (error) throw error;

      if (files.length < 1)
        throw new Error("download file not found");

      if (files.length > 1)
        throw new Error("multiples download files");

      const currentName = files[0];

      fs.rename(path.join(downloadPath, currentName), filePath, (error) => {
        if (error) throw error;
      });
    });

    return filePath;
  }
}

export { IDasScraper, DasScraper };
