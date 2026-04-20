import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <div className="app-shell-dark min-h-screen px-4 py-10 text-foreground">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Legal</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Updated April 20, 2026</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Back to app</Link>
          </Button>
        </div>

        <Card className="app-panel-dark">
          <CardHeader>
            <CardTitle>What we collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>We store the information needed to run your workspace, including account details, onboarding answers, checklist progress, journal entries, optional daily check-ins, reminder preferences, and purchase status.</p>
            <p>If you enable reminders, we also store the phone number or push subscription details needed to deliver them. If you contact support or submit a lead form, we store the information you choose to send.</p>
          </CardContent>
        </Card>

        <Card className="app-panel-dark">
          <CardHeader>
            <CardTitle>How we use it</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>We use your data to personalize the workspace, save progress, send reminders you explicitly request, and keep the app functioning across devices.</p>
            <p>We do not present the app as a medical service. Logged check-ins and notes are for your own tracking and workspace continuity.</p>
          </CardContent>
        </Card>

        <Card className="app-panel-dark">
          <CardHeader>
            <CardTitle>Where data lives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>Account and app data are stored with Supabase. SMS reminders are delivered through Twilio when enabled. Push reminders rely on the browser or device notification services tied to your subscription endpoint.</p>
            <p>Some lightweight app state may also be cached locally on your device to improve speed and preserve recent context.</p>
          </CardContent>
        </Card>

        <Card className="app-panel-dark">
          <CardHeader>
            <CardTitle>Your choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>You can manage reminder permissions in the app settings and on your device. You can permanently remove your account and saved app data from the in-app settings screen.</p>
            <p>If you no longer want marketing or reminder texts, revoke consent in the app or through the unsubscribe instructions provided with those messages.</p>
          </CardContent>
        </Card>

        <Card className="app-panel-dark">
          <CardHeader>
            <CardTitle>Medical boundary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>The Gut Brain Journal is organizational software for a protocol workspace. It does not diagnose, treat, cure, or prevent disease, and it does not replace qualified medical care.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
