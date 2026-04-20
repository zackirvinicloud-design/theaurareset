import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="app-shell-dark min-h-screen px-4 py-10 text-foreground">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Legal</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Terms of Service</h1>
            <p className="mt-2 text-sm text-muted-foreground">Updated April 20, 2026</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Back to app</Link>
          </Button>
        </div>

        <Card className="app-panel-dark">
          <CardHeader>
            <CardTitle>Service scope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>The Gut Brain Journal is a digital workspace that helps you organize a 21-day protocol, follow daily steps, save progress, and manage reminders.</p>
            <p>The service is informational and organizational only. It is not medical advice and it is not a substitute for professional evaluation or treatment.</p>
          </CardContent>
        </Card>

        <Card className="app-panel-dark">
          <CardHeader>
            <CardTitle>Accounts and billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>You are responsible for maintaining access to your account credentials and for the activity that occurs under your account.</p>
            <p>Paid access, renewals, cancellations, and trial terms follow the pricing and billing terms shown at checkout.</p>
          </CardContent>
        </Card>

        <Card className="app-panel-dark">
          <CardHeader>
            <CardTitle>Acceptable use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>Do not misuse the service, interfere with the platform, attempt unauthorized access, or use the app for unlawful conduct.</p>
            <p>We may suspend or terminate access when necessary to protect the service, other users, or legal compliance.</p>
          </CardContent>
        </Card>

        <Card className="app-panel-dark">
          <CardHeader>
            <CardTitle>Medical disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>The app does not diagnose, treat, cure, or prevent disease. If you have urgent, severe, worsening, or concerning symptoms, use qualified medical care instead of relying on the app.</p>
          </CardContent>
        </Card>

        <Card className="app-panel-dark">
          <CardHeader>
            <CardTitle>Termination and deletion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>You can stop using the service at any time. You can permanently remove your account and saved app data from the in-app settings screen.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
