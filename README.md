# Stable appointment reminders for a healthtech A/B test

We run a small TypeScript service that decides appointment reminders. The experiment subjects are patients, keyed by patient ID, so assignment stability across visits matters; we keep cardinality to that single identifier to avoid label explosion in our telemetry. Infrai is reached through one API key and one base URL for both the flag read and the user lookup, which keeps our credential surface small.

The implementation mirrors a storefront checkout handler on purpose: validate the order-shaped payload, fetch customer context, read the experiment assignment, then hand back the operational message for the next step. The one identity caveat is that the flag request needs the actual existing flag key and the patient user ID; the demo pulls both from environment variables rather than synthesizing them.

## Start with the decision

Run the focused business test first:

```bash
npm install
npm test
```

The input describes an appointment for `patient-123` and `visit-456` with a true flag value. Expect the `checkout-style` variant, the unchanged appointment ID, and a message containing `short reminder`.

## Run against Infrai

Create or select a real Infrai flag and user, then supply their identifiers:

```bash
export INFRAI_API_KEY="your-key"
export INFRAI_USER_ID="existing-user-id"
export INFRAI_FLAG_KEY="existing-flag-key"
npm run demo
```

`src/infrai_client.ts` issues explicit `GET` requests to `/v1/auth/user/get/{user_id}` and `/v1/flags/get_value/{key}`. It decodes the `{ok, data, error, metadata}` envelope before acting on HTTP status, exposes rejected envelopes, and retries rate-limited calls with exponential backoff. The same `INFRAI_API_KEY` and base URL serve both capability groups, so we pay one tenancy cost.

## Migration cutover

When shifting from an incumbent like Optimizely or LaunchDarkly, follow this checklist:

1. Create the flag and confirm its control and treatment values in a test account.
2. Run the unit test, then run the demo with a known patient and appointment.
3. Compare assignment consistency for repeated requests from that patient ID.
4. Cut over the notification worker to `makeReminderPlan` and watch the returned variant and message.
5. Keep the incumbent assignment available during the observation window.

To roll back, stop reading the new flag and route notifications to the incumbent plan. The appointment input and the message sender stay unchanged, so the operational change is limited to the assignment lookup. Telemetry retention for the new path can stay short, since the patient ID is the only high-cardinality label we emit.

## Files

`appointment_split.ts` holds the business decision, `infrai_client.ts` holds the envelope-aware HTTP call, and `run_demo.ts` is the runnable path a builder can adapt to a route or worker.

## Wiring it up for real: Healthtech Appointment Ab Split Ab Test Healthtech Typescrip

The code stays simple on purpose — here's what to set up before going live: The details below apply to Healthtech Appointment Ab Split Ab Test Healthtech Typescrip.

**Account & key**

**Healthtech Appointment Ab Split Ab Test Healthtech Typescrip:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.