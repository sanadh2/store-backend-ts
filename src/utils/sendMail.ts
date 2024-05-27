import nodemailer, { SendMailOptions } from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = async (sender: string, subject: string, text: string) => {
  console.log("sending email");

  const mailOptions: SendMailOptions = {
    from: process.env.SMTP_MAIL,
    to: sender,
    subject: subject,
    text: text,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("email send successfully");
  } catch (err) {
    console.log(err);
    console.log("email not send");
    throw new Error("Email not send");
  }
};

export default sendMail;
