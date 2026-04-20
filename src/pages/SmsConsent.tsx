import { Link } from 'react-router-dom';

const SmsConsent = () => {
  return (
    <div className="app-shell-dark min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="app-panel-dark rounded-3xl border border-border/70 px-6 py-8 shadow-2xl sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
            SMS Consent Disclosure
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Gut Brain Journal Text Reminder Program
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            This page documents how users opt in to receive text reminders from The Gut Brain Journal.
            It exists as a public proof-of-consent reference for our transactional SMS reminder program.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <section className="app-panel-muted rounded-2xl px-5 py-5">
              <h2 className="text-lg font-semibold text-foreground">Program purpose</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Gut Brain Journal sends text reminders that help users re-enter their day-by-day cleanse
                plan. These messages are designed to reopen the exact app step a user needs.
              </p>
            </section>

            <section className="app-panel-muted rounded-2xl px-5 py-5">
              <h2 className="text-lg font-semibold text-foreground">Message types</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Transactional texts may include day-start nudges, task reminders, rescue prompts,
                and app re-entry links. Optional marketing texts are only sent if a user separately
                opts into updates about product releases or future programs.
              </p>
            </section>
          </div>

          <section className="mt-6 app-panel-muted rounded-2xl px-5 py-5">
            <h2 className="text-lg font-semibold text-foreground">How consent is collected</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Users opt in on the Gut Brain Journal text reminder setup screen after account creation
              or product access. They manually enter their mobile number and must actively check the
              transactional consent box before saving.
            </p>
            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                Transactional Consent Language
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                I agree to receive transactional text reminders about my protocol, tasks, and app re-entry.
              </p>
            </div>
            <div className="mt-4 rounded-2xl border border-border/60 bg-background/50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Optional Marketing Language
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Also send me occasional product updates and new protocol launches.
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="app-panel-muted rounded-2xl px-5 py-5">
              <h2 className="text-lg font-semibold text-foreground">Frequency and fees</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Message frequency varies based on reminder timing and user activity. Message and data
                rates may apply depending on the user&apos;s mobile plan.
              </p>
            </div>
            <div className="app-panel-muted rounded-2xl px-5 py-5">
              <h2 className="text-lg font-semibold text-foreground">Opt-out and help</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Users can reply <span className="font-semibold text-foreground">STOP</span> to opt out.
                Users can reply <span className="font-semibold text-foreground">HELP</span> for help.
              </p>
            </div>
          </section>

          <section className="mt-6 app-panel-muted rounded-2xl px-5 py-5">
            <h2 className="text-lg font-semibold text-foreground">Additional disclosures</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>Consent to receive texts is not a condition of purchase.</li>
              <li>Gut Brain Journal is a guided protocol companion, not a medical diagnosis service.</li>
              <li>Texts are used to deliver reminders and deep links back into the user&apos;s workspace.</li>
              <li>Users control whether they enable transactional texts and whether they opt into optional marketing texts.</li>
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/setup/text-reminders"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-95"
            >
              View Opt-In Flow
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-border/70 px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted/40"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsConsent;
