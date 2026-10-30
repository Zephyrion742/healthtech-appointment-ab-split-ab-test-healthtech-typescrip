import { z } from "zod";

export const appointmentRequestSchema = z.object({
  userId: z.string().min(1),
  appointmentId: z.string().min(1),
  channel: z.enum(["sms", "email"])
});

export type AppointmentRequest = {
  userId: string;
  appointmentId: string;
  channel: "sms" | "email";
};

export type ReminderPlan = {
  appointmentId: string;
  variant: "control" | "checkout-style";
  channel: "sms" | "email";
  message: string;
};

export function makeReminderPlan(input: AppointmentRequest, flagValue: unknown): ReminderPlan {
  const enabled = flagValue === true || flagValue === "true" || (typeof flagValue === "object" && flagValue !== null && (flagValue as { value?: unknown }).value === true);
  const variant = enabled ? "checkout-style" : "control";
  const message = enabled
    ? "Appointment confirmed. We will send a short reminder before your visit."
    : "Appointment confirmed. Your care team will remind you before your visit.";
  return { appointmentId: input.appointmentId, variant, channel: input.channel, message };
}
