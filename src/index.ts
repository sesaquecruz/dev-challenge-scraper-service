import { ConsumeMessage } from "amqplib";
import { RabbitMqConsumer } from "./messaging/consumer/rabbitmq";
import { configs } from "./config/configs";
import { DasMail } from "./email/das";
import { DasScraper } from "./scrapper/das";
import { DasEvent } from "./messaging/event/das";

// Initialize dependencies
const dasScraper = new DasScraper(
  configs.scraperbaseDownloadPath,
  configs.scraperNavigationTimeout,
  configs.scraperHeadless,
);

const dasMail = new DasMail(
  configs.emailServer,
  configs.emailPort,
  configs.emailSecure,
  configs.emailUser,
  configs.emailPass,
  configs.emailSubject,
  configs.emailTemplatePath,
);

// Define operations to process messages
async function onMessage (message: ConsumeMessage): Promise<void> {
  const content = JSON.parse(message.content.toString());
  const dasEvent = DasEvent.from(content);

  const mei = dasEvent.mei;
  const das = dasEvent.das;
  const dasFilePath = await dasScraper.getDas(mei.cnpj, das.year, das.month);

  das.setFilePath(dasFilePath);

  console.log(`sending the DAS for ${das.month}/${das.year} to ${mei.email}`);
  await dasMail.sendDas(mei.email, das);
}

// Initialize dependencies
const rabbitMqConsumer = new RabbitMqConsumer(configs.rabbitMqUrl, configs.rabbitMqQueue, onMessage);

// Start consumer
rabbitMqConsumer.start();

// Don't finish when RabbitMQ disconnects
process.on("unhandledRejection", (error) => {
  console.error(error);
});
