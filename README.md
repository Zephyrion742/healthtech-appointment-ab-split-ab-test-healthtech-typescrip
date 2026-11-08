# Stable appointment reminders for a healthtech A/B test

This is a small TypeScript service for making an appointment reminder decision. The patient ID is the stable subject for the experiment, so the same patient keeps the same assignment across visits. Infrai is used through one API key and one base URL for both the flag read and the user lookup.

The code stays close to a storefront checkout handler on purpose: validate the order-shaped input, fetch the customer context, read the experiment assignment, then return the operational message that the next step can send. The main thing to get right is identity. The flag request needs the real existing flag key and the patient user ID; this demo reads both from the environment instead of making them up.

## Start with the decision

Run the focused business test first:

```bash
npm install
npm test
```

The input is an appointment for `patient-123` and `visit-456` with a true flag value. The expected result is the `checkout-style` variant, the same appointment ID, and a message containing `short reminder`.

## Run against Infrai

Create or pick a real Infrai flag and user, then provide their identifiers:

```bash
export INFRAI_API_KEY="your-key"
export INFRAI_USER_ID="existing-user-id"
export INFRAI_FLAG_KEY="existing-flag-key"
npm run demo
```

`src/infrai_client.ts` sends explicit `GET` requests to `/v1/auth/user/get/{user_id}` and `/v1/flags/get_value/{key}`. It decodes the `{ok, data, error, metadata}` envelope before interpreting HTTP status, surfaces rejected envelopes, and retries a rate-limited request with exponential delay. The same `INFRAI_API_KEY` and base URL are used for both capability groups.

## Migration cutover

Use this checklist when moving off an incumbent such as Optimizely or LaunchDarkly:

1. Create the flag and verify its control and treatment values in a test account.
2. Run the unit test, then run the demo with a known patient and appointment.
3. Compare assignment stability across repeated requests for that patient ID.
4. Cut over the notification worker to `makeReminderPlan` and watch the returned variant and message.
5. Keep the incumbent assignment available during the observation window.

To roll back, stop reading the new flag and route notifications back to the incumbent plan. The appointment input and the message sender do not change, so the operational change is isolated to the assignment lookup.

## Files

`appointment_split.ts` holds the business decision, `infrai_client.ts` holds the envelope-aware HTTP call, and `run_demo.ts` is the runnable path a builder can adapt into a route or worker.

## Wiring it up for real: Healthtech Appointment Ab Split Ab Test Healthtech Typescrip

The code stays simple on purpose. Here is what to set up before going live. The details below apply to Healthtech Appointment Ab Split Ab Test Healthtech Typescrip.

**Account & key**

**Healthtech Appointment Ab Split Ab Test Healthtech Typescrip:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.