import fs from "fs";
import mkdirp from "mkdirp";
import { logJson } from "./utils";

//@ts-ignore
const __dirname = new URL(".", import.meta.url).pathname;
const filePath = __dirname + "logs/events.json";

export enum ServerEventTypes {
  API_LISTEN = "API_LISTEN",
  API_CALL = "API_CALL",
  API_ERROR = "API_ERROR",
  API_LOG = "API_LOG",
  API_SUCCESS = "API_SUCCESS"
}

interface ServerEvent {
  date?: Date;
  timestamp?: number;
  type: ServerEventTypes;
  metadata: Record<string, any>;
}

export async function logEvent(event: ServerEvent) {
  const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ logEvent `;
  console.log(prefix + "~ event: ", event);

  await fs.promises.mkdir("logs", { recursive: true });

  const date = event.date ? event.date : new Date().toLocaleString();
  const newEvent = !event.date
    ? { date, timestamp: Date.now(), ...event }
    : event;

  fs.readFile(filePath, (err, buffer) => {
    if (err?.code === "ENOENT") {
      const json = JSON.stringify([newEvent], null, 2);
      fs.writeFile(filePath, json, { encoding: "utf8" }, () => {});
      return;
    }

    if (buffer) {
      const json = JSON.parse(buffer);

      fs.writeFile(
        filePath,
        JSON.stringify(json.concat([newEvent]), null, 2),
        "utf8",
        () => {}
      );
    }
  });
}

export async function getEvent(filter): Promise<ServerEvent | undefined> {
  const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ getEvent `;
  mkdirp.sync(__dirname + "logs");
  const filePath = __dirname + "logs/events.json";
  console.log(prefix + filePath);

  if (!fs.existsSync(filePath)) {
    await fs.promises.writeFile(filePath, "[]", { flag: "a+" });
  }

  const data = await fs.promises.readFile(filePath);
  const json = JSON.parse(data.toString());
  const arr = json.filter(filter);
  //logJson(prefix + "filtered", arr);
  const last = arr[arr.length - 1];
  //logJson(prefix + "last", last);

  return last;
}
