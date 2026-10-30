import { InfraiClient } from "./infrai_client.ts";
import { appointmentRequestSchema, makeReminderPlan } from "./appointment_split.ts";
import type { AppointmentRequest } from "./appointment_split.ts";

const key = process.env.INFRAI_API_KEY;
const userId = process.env.INFRAI_USER_ID;
const flagKey = process.env.INFRAI_FLAG_KEY;
if (!key || !userId || !flagKey) {
  throw new Error("Set INFRAI_API_KEY, INFRAI_USER_ID, and INFRAI_FLAG_KEY before running the demo.");
}

const request = appointmentRequestSchema.parse({
  userId,
  appointmentId: process.env.APPOINTMENT_ID ?? "appointment-demo-001",
  channel: process.env.REMINDER_CHANNEL === "email" ? "email" : "sms"
}) as AppointmentRequest;
const infrai = new InfraiClient(key);
await infrai.getUser(request.userId);
const flagValue = await infrai.getFlagValue(flagKey, request.userId);
console.log(JSON.stringify(makeReminderPlan(request, flagValue), null, 2));
