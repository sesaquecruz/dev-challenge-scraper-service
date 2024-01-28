import * as fs from "fs";

type Config = {
  rabbitMqUrl: string,
  rabbitMqQueue: string,
  emailServer: string,
  emailPort: number,
  emailSecure: boolean,
  emailUser: string,
  emailPass: string,
  emailSubject: string,
  emailTemplatePath: string,
  scraperbaseDownloadPath: string,
  scraperNavigationTimeout: number,
  scraperHeadless: boolean,
}

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} env var is required`);
  return value;
}

// RabbitMQ configs
const rabbitMqUrl = getEnvVar("RABBIT_MQ_URL");
const rabbitMqQueue = "email.das.queue";

// Email configs
const emailServer = getEnvVar("EMAIL_SERVER");
const emailPort = Number(getEnvVar("EMAIL_PORT"));
const emailSecure = getEnvVar("EMAIL_SECURE") === "true";
const emailUser = getEnvVar("EMAIL_USER");
const emailPass = getEnvVar("EMAIL_PASS");
const emailSubject = "Notificação de Pagamento da DAS";
const emailTemplatePath = "das-email.ejs";

// Scraper configs
const scraperbaseDownloadPath = "downloads/";
const scraperNavigationTimeout = Number(getEnvVar("SCRAPER_NAVIGATION_TIMEOUT"));
const scraperHeadless = getEnvVar("SCRAPER_HEADLESS") === "true";

if (!fs.existsSync(scraperbaseDownloadPath))
  fs.mkdirSync(scraperbaseDownloadPath);

// All configs
const configs: Config = {
  rabbitMqUrl: rabbitMqUrl,
  rabbitMqQueue: rabbitMqQueue,
  emailServer: emailServer,
  emailPort: emailPort,
  emailSecure: emailSecure,
  emailUser: emailUser,
  emailPass: emailPass,
  emailSubject: emailSubject,
  emailTemplatePath: emailTemplatePath,
  scraperbaseDownloadPath: scraperbaseDownloadPath,
  scraperNavigationTimeout: scraperNavigationTimeout,
  scraperHeadless: scraperHeadless,
};

export { Config, configs };
