import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, CDPSession } from "puppeteer";
import { removeFolder } from "../utils/files";

puppeteer.use(StealthPlugin());

interface IDasScraper {
  getDas(cnpj: string, year: number, month: number): Promise<string>;
}

class DasScraper implements IDasScraper {
  private readonly baseDownloadPath: string;
  private readonly navigationTimeout: number;
  private readonly headless: boolean | "new";

  constructor(baseDownloadPath: string, navigationTimeout: number, headless: boolean) { 
    this.baseDownloadPath = baseDownloadPath;
    this.navigationTimeout = navigationTimeout;
    this.headless = headless ? "new" : false;

    this.getDas = this.getDas.bind(this);
  }

  // Downloads DAS from PGMEI and returns its file path
  async getDas(cnpj: string, year: number, month: number): Promise<string> {
    const downloadPath = await this.generateDownloadPath(this.baseDownloadPath);
    const browser = await this.createBrowser(this.headless);
    const session = await this.createSession(browser, downloadPath);
  
    try {
      await this.downloadDas(browser, this.navigationTimeout, cnpj, String(year), String(month));
      await this.downloadEvent(session);
      const filePath = await this.getFilePathWithCustomName(downloadPath, `das-${year}-${month}.pdf`);
      return filePath;
    } catch (error) {
      await removeFolder(downloadPath);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async generateDownloadPath(baseDownloadPath: string): Promise<string> {
    const downloadPath = `${baseDownloadPath}${uuidv4()}`;
    await fs.promises.mkdir(downloadPath);
    return downloadPath;
  }

  private async createBrowser(headless: boolean | "new"): Promise<Browser> {
    return puppeteer.launch({ 
      headless: headless,
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
  
  private async downloadDas(browser: Browser, timeout: number, cnpj: string, year: string, month: string) {
    const page = await browser.newPage();

    async function goToPgmeiPage() {
      await page.goto("https://www8.receita.fazenda.gov.br/simplesnacional/aplicacoes/atspo/pgmei.app/identificacao");
      page.waitForNavigation({ waitUntil: "load" });
    }
  
    async function enterWithCnpj() {
      await page.waitForSelector("[name=\"cnpj\"]", { timeout: timeout });
      await page.keyboard.press("Home");
      await page.type("[name=\"cnpj\"]", cnpj);
  
      await page.keyboard.press("Enter");
      page.waitForNavigation({ waitUntil: "load" });
    }
  
    async function goToIssuePage() {
      await page.waitForSelector("[href=\"/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao\"]", { timeout: timeout });
      await page.click("[href=\"/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao\"]");
      page.waitForNavigation({ waitUntil: "load" });
    }
  
    async function selectYear() {
      // Select options
      await page.waitForSelector("[data-id=\"anoCalendarioSelect\"]", { timeout: timeout });
      await page.click("[data-id=\"anoCalendarioSelect\"]");
  
      await page.waitForSelector(".dropdown-menu.inner", { timeout: timeout });
  
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
      await page.waitForSelector(`input[type="checkbox"][value="${year}${month.padStart(2, "0")}"]`, { timeout: timeout });
      await page.click(`input[type="checkbox"][value="${year}${month.padStart(2, "0")}"]`);
  
      await page.waitForSelector("#btnEmitirDas", { timeout: timeout });
      await page.click("#btnEmitirDas");
    }
  
    async function startDownload() {
      await page.waitForSelector("[href=\"/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao/imprimir\"]", { timeout: timeout });
      await page.click("[href=\"/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao/imprimir\"]");
    }

    // Execute steps
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

  private async getFilePathWithCustomName(downloadPath: string, customName: string): Promise<string> {
    const files = await fs.promises.readdir(downloadPath);

    if (files.length < 1)
      throw new Error("download file not found");

    if (files.length > 1)
      throw new Error("multiples download files");

    const dasPath = path.join(downloadPath, files[0]);
    const filePath = path.join(downloadPath, customName);

    await fs.promises.rename(dasPath, filePath);

    return filePath;
  }
}

export { IDasScraper, DasScraper };
