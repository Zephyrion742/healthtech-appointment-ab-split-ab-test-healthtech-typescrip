import assert from "node:assert/strict";
import { makeReminderPlan } from "./appointment_split.ts";

const plan = makeReminderPlan({
  userId: "patient-123",
  appointmentId: "visit-456",
  channel: "sms"
}, true);

assert.equal(plan.variant, "checkout-style");
assert.equal(plan.appointmentId, "visit-456");
assert.match(plan.message, /short reminder/);
console.log("appointment split test passed");
