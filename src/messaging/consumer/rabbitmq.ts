import { Channel, Connection, ConsumeMessage, connect } from "amqplib";

class RabbitMqConsumer {
  private readonly url: string;
  private readonly queue: string;
  private readonly onMessage: (message: ConsumeMessage) => Promise<void>;
  private readonly reconnectTimeout: number;
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  constructor(
    url: string,
    queue: string,
    onMessage: (message: ConsumeMessage) => Promise<void>,
    reconnectTimeout: number = 1000,
  ) {
    this.url = url;
    this.queue = queue;
    this.onMessage = onMessage;
    this.reconnectTimeout = reconnectTimeout;
    
    this.start = this.start.bind(this);
    this.connect = this.connect.bind(this);
    this.onConnectionClose = this.onConnectionClose.bind(this);
    this.onChannelClose = this.onChannelClose.bind(this);
  }

  // Start consume RabbitMQ messages passing them to callback onMessage
  // Nack the message if an error occurs, it is send to DLX exchange
  async start(): Promise<void> {
    await this.connect();
    const channel = this.channel;

    if (channel) {
      channel.consume(this.queue, async (message) => {
        if (message) {
          try {
            await this.onMessage(message);
            channel.ack(message);
          } catch(error) {
            console.error(error);
            channel.nack(message, false, false);
          }
        }
      });
  
      console.log("RabbitMQ consumer started");
    }
  }

  private async connect(): Promise<void> {
    try {
      this.connection = await connect(this.url);
      this.channel = await this.connection.createChannel();
      this.connection.on("close", this.onConnectionClose);
      this.channel.on("close", this.onChannelClose);
      console.log("Connected to RabbitMQ");
    } catch(error) {
      console.error("Failed to connect to RabbitMQ", error);
      this.onConnectionClose();
    }
  }

  private onConnectionClose() {
    setTimeout(this.start, this.reconnectTimeout);
  }

  private onChannelClose() {
    this.connection?.close();
  }
}

export { RabbitMqConsumer };
