import dotenv from "@dotenvx/dotenvx";
import axios, { AxiosRequestConfig } from "axios";
import cors from "cors";
import express from "express";
import fu from "express-fileupload";
import expressPino from "express-pino-logger";
import path from "path";
import pino from "pino";
import { URL } from "url";
import { daily } from "./daily";
import { TypedRequestBody, TypedRequestQuery } from "./types";
import { sleep } from "./utils";
import { logEvent, ServerEventTypes } from "./logging";
dotenv.config();

//#region constants
//@ts-expect-error
const __filename = new URL("", import.meta.url).pathname;
//@ts-expect-error
const __dirname = new URL(".", import.meta.url).pathname;
const __pdirname = path.resolve(__dirname, "..");
const MAX_ALLOWED_SIZE = 1000000000; // 1Gb
const PORT = 3002;
const SECOND = 1000;
const HOUR = 3600 * SECOND;
const SERVER = {
  pool: true,
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // use TLS
  auth: {
    user: "rom.seguy@lilo.org",
    pass: process.env.EMAIL_API_KEY
  }
};
//#endregion

//#region bootstrap
const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || "error" });
//const logger = pino({ level: "silent" });
app.use(expressPino({ logger }));
app.use(cors());
app.use(express.json({ limit: "25mb" }));
//app.use(express.urlencoded({limit: '25mb'}));
app.use(
  fu({
    defCharset: "utf8",
    defParamCharset: "utf8"
  })
);
// app.use('/', express.static("files"))
//#endregion

app.get("/", function home(req, res, next) {
  const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ GET / `;
  console.log(prefix + "query", req.query);

  try {
    res.status(200).send(prefix);
  } catch (error) {
    logger.error(error);
    res.status(500).send(error);
  }
});

app.get("/check", function check(req, res, next) {
  res.status(200).send("check");
});

app.get("/backup", async function backup(req, res, next) {
  const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ GET /backup `;
  console.log(prefix + "query", req.query);

  try {
    const config: AxiosRequestConfig = {
      headers: { Cookie: process.env.COOKIE }
    };
    const { data } = await axios.get(
      "http://localhost:3000/api/admin/backup",
      config
    );
    res.status(200).json(data);
  } catch (error) {
    const message = error.response.data.message || error.message || error;
    logger.error(message);
    res.status(500).send(message);
  }
});

app.post(
  "/",
  async (
    req: TypedRequestBody<{
      fileId?: string;
    }>,
    res,
    next
  ) => {
    const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ POST / `;
    console.log(prefix + "body", req.body);

    try {
      res.status(200).send(prefix);
    } catch (error) {
      logger.error(error);
      res.status(500).send(error);
    }
  }
);

app.delete(
  "/",
  async (
    req: TypedRequestQuery<{
      fileId?: string;
    }>,
    res,
    next
  ) => {
    const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ DELETE / `;
    console.log(prefix + "query", req.query);

    try {
      res.status(200).send(prefix);
    } catch (error) {
      logger.error(error);
      return res
        .status(500)
        .send({ message: "Le document n'a pas pu être supprimé" });
    }
  }
);

app.listen(PORT, async () => {
  const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ LISTEN `;
  console.log(prefix + PORT);

  //const root = process.env.ROOT;
  //mkdirp.sync(root);
  //logger.info(`Listening at http://localhost:${PORT} ; root=${root}`);
  logger.info(`Listening at http://localhost:${PORT}`);

  // logEvent({
  //   type: ServerEventTypes.API_LISTEN,
  //   metadata: {
  //     timestamp: Date.now()
  //   }
  // });

  while (true) {
    await daily();
    await sleep(HOUR);
    //await sleep(SECOND * 30);
  }
});
