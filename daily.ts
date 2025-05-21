import { getEvent, ServerEventTypes, logEvent } from "./logging";
import { backupTask } from "./tasks";
import { toMinutes } from "./utils";

export async function daily() {
  const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ DAILY `;
  console.log(prefix);

  const day = 24;

  const last = await getEvent(
    ({ type, metadata }) =>
      type === ServerEventTypes.API_CALL && metadata.endpoint === "/daily"
  );

  if (/*true ||*/ !last) await runTask();
  else {
    const lastT = last.timestamp;
    const hours = (Date.now() - lastT) / 1000 / 3600;
    if (hours < 1) {
      console.log(
        prefix + Math.ceil(toMinutes(hours)) + " minutes since last call"
      );
    } else {
      console.log(prefix + Math.ceil(hours) + " hours since last call");
    }
    if (hours < day) {
      console.log(prefix + "abort");
      return;
    }
    await runTask();
  }

  async function runTask() {
    console.log(prefix + " ~ TASK BEGIN BACKUP");
    const res = await backupTask();
    if (res && res.data) {
      console.log("🚀 ~ TASK DONE BACKUP ~ data:", res.data);
      logEvent({
        type: ServerEventTypes.API_CALL,
        metadata: {
          endpoint: "/daily",
          data: res.data
        }
      });
    }
  }
}
