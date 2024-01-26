import * as nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import * as fs from "fs";
import * as ejs from "ejs";
import { Das } from "../model/das";

interface IDasMail {
  sendDas(email: string, das: Das): Promise<void>;
}

class DasMail implements IDasMail {
  private readonly sender: string;
  private readonly subject: string;
  private readonly template: string;
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(
    server: string,
    port: number,
    secure: boolean,
    user: string,
    pass: string,
    subject: string,
    templatePath: string,
  ) {
    this.sender = user;
    this.subject = subject;
    this.template = fs.readFileSync(templatePath, "utf-8");

    this.transporter = nodemailer.createTransport({
      host: server,
      port: port,
      secure: secure,
      auth: {
        user: user,
        pass: pass,
      },
    });

    this.sendDas = this.sendDas.bind(this);
  }

  // Send an email to MEI with a DAS
  async sendDas(email: string, das: Das): Promise<void> {
    const content = ejs.render(this.template, das);
    const fileName = das.fileName;
    const file = fs.readFileSync(das.filePath);

    await this.transporter.sendMail({
      from: this.sender,
      to: email,
      subject: this.subject,
      html: content,
      attachments: [{
        filename: fileName,
        content: file,
    }],
    });
  }
}

export { IDasMail, DasMail };
