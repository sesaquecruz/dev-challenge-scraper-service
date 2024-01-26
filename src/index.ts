import { ConsumeMessage } from "amqplib";
import { RabbitMqConsumer } from "./messaging/rabbitmq-consumer";
import { Mei } from "./model/mei";
import { configs } from "./config/configs";
import { DasMail } from "./email/das";
import { DasScraper } from "./scrapper/das";

// Initialize dependencies
const dasScraper = new DasScraper(
  configs.downloadBasePath,
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
  const mei = Mei.from(content);

  console.log(`sending DAS of ${mei.das.month}/${mei.das.year} to ${mei.email}`);

  mei.das = await dasScraper.downloadDas(mei.cnpj, mei.das.year, mei.das.month);
  await dasMail.sendDas(mei.email, mei.das);
}

// Initialize dependencies
const rabbitMqConsumer = new RabbitMqConsumer(configs.rabbitMqUrl, configs.rabbitMqQueue, onMessage);

// Start consumer
rabbitMqConsumer.start();

// Don't finish when RabbitMQ disconnects
process.on("unhandledRejection", (error) => {
  console.error(error);
});
