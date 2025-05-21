import axios, { AxiosRequestConfig } from "axios";

export async function backupTask() {
  try {
    const config: AxiosRequestConfig = {
      headers: { Cookie: process.env.COOKIE }
    };
    const { data } = await axios.get(
      process.env.PUBLIC_API_URL + "/admin/backup",
      config
    );
    return data;
  } catch (error) {
    const message = error.response?.data.message || error.message || error;
    console.log("🚀 ~ backupTask ~ error:", message);
  }
}

export async function sendMailTask() {
  const mail = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAILS,
    subject: "[] du nouveau !",
    html: ``
  };

  if (process.env.NODE_ENV === "production") {
    // const transport = nodemailer.createTransport(SERVER);
    // await transport.sendMail(mail);
  } else console.log("🚀 ~ daily ~ mail:", mail);
}
