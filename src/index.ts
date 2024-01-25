import { ConsumeMessage } from "amqplib";
import { RabbitMqConsumer } from "./messaging/rabbitmq-consumer";
import { Mei } from "./model/mei";

// Load configs
const rabbitMqUrl = process.env.RABBIT_MQ_URL;
const rabbitMqQueue = "email.das.queue";

if (!rabbitMqUrl) {
  throw new Error("RABBIT_MQ_URL env var is required.");
}

// Define operations to process messages
async function onMessage (message: ConsumeMessage): Promise<void> {
  const content = JSON.parse(message.content.toString());
  const mei = Mei.from(content);
  console.log(mei);
}

// Initialize dependencies
const rabbitMqConsumer = new RabbitMqConsumer(rabbitMqUrl, rabbitMqQueue, onMessage);

// Start consumer
rabbitMqConsumer.start();

// Don't finish when RabbitMQ disconnects
process.on("unhandledRejection", (error) => {
  console.error(error);
});
