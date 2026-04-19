import { useState } from 'react';
import { Loader2, Pencil, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GutBrainLogo } from '@/components/brand/GutBrainLogo';
import {
  GUT_BRAIN_AI_NAME,
  type GutBrainConversationEntry,
  type GutBrainProfile,
  type GutBrainProgressState,
  type GutBrainSnapshot,
} from '@/lib/gutbrain';

interface ConversationInsightsProps {
  entries: GutBrainConversationEntry[];
  progress: GutBrainProgressState;
  profile: GutBrainProfile;
  snapshot: GutBrainSnapshot | null;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: (options?: { force?: boolean; silent?: boolean }) => Promise<void>;
  onUpdateProfile?: (updates: Partial<GutBrainProfile>) => Promise<void>;
}

const renderPills = (items: string[], tone: 'neutral' | 'warm' = 'neutral') => {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Nothing durable yet. More conversation will sharpen this.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge
          key={item}
          variant="secondary"
          className={cn(
            'rounded-full px-3 py-1 text-[11px] font-medium',
            tone === 'warm' && 'bg-primary/10 text-primary hover:bg-primary/10',
          )}
        >
          {item}
        </Badge>
      ))}
    </div>
  );
};

const EditableField = ({
  label,
  value,
  placeholder,
  onSave,
}: {
  label: string;
  value: string;
  placeholder: string;
  onSave: (value: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="space-y-1.5">
        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <div className="flex gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSave(draft);
                setEditing(false);
              }
              if (e.key === 'Escape') {
                setDraft(value);
                setEditing(false);
              }
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { onSave(draft); setEditing(false); }}
            className="h-8 w-8 p-0"
          >
            <Save className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 group">
      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm">{value || placeholder}</p>
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
          title={`Edit ${label.toLowerCase()}`}
        >
          <Pencil className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export const ConversationInsights = ({
  entries,
  progress,
  profile,
  snapshot,
  isLoading,
  isRefreshing,
  onRefresh,
  onUpdateProfile,
}: ConversationInsightsProps) => {
  const hasConversation = entries.some((entry) => entry.role === 'user' && entry.content.trim());
  const lastUpdated = snapshot?.updatedAt || profile.updatedAt;
  const canEdit = Boolean(onUpdateProfile);

  return (
    <div className="space-y-4">
      <Card className="border-primary/15 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GutBrainLogo className="h-4 w-4 rounded-sm" />
            {GUT_BRAIN_AI_NAME}
          </CardTitle>
          <CardDescription>
            A running read on what helps you finish the protocol, what gets in the way, and what matters today.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Day {progress.currentDay} · Phase {progress.currentPhase}
              {lastUpdated ? ` · Updated ${new Date(lastUpdated).toLocaleString()}` : ''}
            </div>
            <Button
              size="sm"
              onClick={() => onRefresh({ force: true })}
              disabled={isRefreshing || !hasConversation}
              className="gap-2"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reading...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Refresh read
                </>
              )}
            </Button>
          </div>
          {!hasConversation && (
            <p className="text-sm text-muted-foreground">
              Start talking with GutBrain about what feels hard, confusing, or easy. The insight layer gets better once there is real texture to read.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">About you</CardTitle>
              <CardDescription>
                {canEdit
                  ? 'Edit these fields to train GutBrain. Hover over a field to edit it.'
                  : 'What GutBrain knows about you from your conversations.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">Current read</div>
            <p className="text-sm leading-relaxed text-foreground">
              {profile.conversationSummary || 'GutBrain is still building a read on how you stay on track.'}
            </p>
          </div>

          {canEdit ? (
            <div className="grid gap-4 md:grid-cols-2">
              <EditableField
                label="Your name"
                value={profile.preferredName || ''}
                placeholder="What should GutBrain call you?"
                onSave={(v) => onUpdateProfile?.({ preferredName: v || null })}
              />
              <EditableField
                label="Goal"
                value={profile.protocolGoal || ''}
                placeholder="What are you trying to achieve?"
                onSave={(v) => onUpdateProfile?.({ protocolGoal: v || null })}
              />
              <EditableField
                label="Why now"
                value={profile.whyNow || ''}
                placeholder="What made you start now?"
                onSave={(v) => onUpdateProfile?.({ whyNow: v || null })}
              />
              <EditableField
                label="Motivation style"
                value={profile.motivationStyle || ''}
                placeholder="e.g. blunt, gentle, data-driven"
                onSave={(v) => onUpdateProfile?.({ motivationStyle: v || null })}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Goal</div>
                <p className="text-sm">{profile.protocolGoal || 'Not clear yet.'}</p>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Motivation style</div>
                <p className="text-sm">{profile.motivationStyle || 'Not clear yet.'}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Likely barriers</div>
            {renderPills(profile.barriers)}
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Best support style</div>
            {renderPills(profile.supportPreferences)}
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Wins to reinforce</div>
            {renderPills(profile.wins, 'warm')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today&apos;s read</CardTitle>
          <CardDescription>Deeper pattern recognition for the current phase and day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && !snapshot ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading stored memory...
            </div>
          ) : snapshot ? (
            <>
              <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                <div className="mb-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">Summary</div>
                <p className="text-sm leading-relaxed">{snapshot.summary}</p>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="mb-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">Best next move</div>
                <p className="text-sm font-medium text-foreground">{snapshot.nextStep}</p>
              </div>

              <div className="space-y-3">
                {snapshot.signals.map((signal) => (
                  <div key={signal.title} className="rounded-2xl border border-border/60 p-4">
                    <div className="mb-2 text-sm font-semibold">{signal.title}</div>
                    <p className="text-sm leading-relaxed text-foreground">{signal.observation}</p>
                    {signal.evidence.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">Grounded in</div>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {signal.evidence.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-sm">
                      <span className="font-medium">Action step:</span> {signal.actionStep}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No daily read yet. Ask a few real questions, then refresh the read to see what GutBrain is noticing.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
