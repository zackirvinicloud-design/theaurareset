import { useMemo, useState } from 'react';
import { ArrowLeft, ChefHat, MessageSquare, Plus, Search, Utensils, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
    RECIPE_MEAL_TYPE_OPTIONS,
    RECIPE_PHASE_ORDER,
    getRecipeMealTypeLabel,
    getRecipePhaseForDay,
    resolveRecipes,
    searchRecipes,
    type RecipeItem,
    type RecipeMealType,
} from '@/lib/recipes';
import type { RecipeEntry, RecipeInput } from '@/hooks/useJournalStore';

interface RecipesViewProps {
    currentDay: number;
    recipeOverrides?: RecipeEntry[];
    onBack: () => void;
    onAskAI?: (prompt: string) => void;
    onAddRecipe?: (recipe: RecipeInput) => Promise<unknown> | unknown;
    onRemoveRecipe?: (recipe: RecipeItem) => Promise<unknown> | unknown;
}

const splitList = (value: string) => {
    return value
        .split('\n')
        .map((entry) => entry.trim())
        .filter(Boolean);
};

export function RecipesView({
    currentDay,
    recipeOverrides = [],
    onBack,
    onAskAI,
    onAddRecipe,
    onRemoveRecipe,
}: RecipesViewProps) {
    const recipes = useMemo(() => resolveRecipes(recipeOverrides), [recipeOverrides]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [phase, setPhase] = useState(getRecipePhaseForDay(currentDay));
    const [mealType, setMealType] = useState<RecipeMealType>('breakfast');
    const [summary, setSummary] = useState('');
    const [ingredientsText, setIngredientsText] = useState('');
    const [instructionsText, setInstructionsText] = useState('');
    const [notes, setNotes] = useState('');

    const visibleRecipes = useMemo(
        () => searchRecipes(recipes, searchQuery),
        [recipes, searchQuery],
    );

    const groupedRecipes = useMemo(() => {
        return RECIPE_PHASE_ORDER.map((phaseName) => ({
            phase: phaseName,
            recipes: visibleRecipes.filter((recipe) => recipe.phase === phaseName),
        })).filter((entry) => entry.recipes.length > 0);
    }, [visibleRecipes]);

    const resetForm = () => {
        setTitle('');
        setPhase(getRecipePhaseForDay(currentDay));
        setMealType('breakfast');
        setSummary('');
        setIngredientsText('');
        setInstructionsText('');
        setNotes('');
    };

    const handleSave = async () => {
        if (!onAddRecipe || title.trim().length < 2 || isSaving) {
            return;
        }

        setIsSaving(true);
        try {
            await onAddRecipe({
                title: title.trim(),
                phase,
                mealType,
                summary: summary.trim() || undefined,
                ingredients: splitList(ingredientsText),
                instructions: splitList(instructionsText),
                notes: notes.trim() || undefined,
                source: 'manual',
            });
            resetForm();
            setShowForm(false);
        } finally {
            setIsSaving(false);
        }
    };

    const askCoachToCreateRecipe = () => {
        onAskAI?.(
            `Help me create one ${getRecipeMealTypeLabel(mealType).toLowerCase()} recipe for ${phase}. ` +
            'Start with an open-ended ingredient question (what I have on hand), then ask if I want to cook or order/delivery, ' +
            'ask only the key constraints needed, then build one protocol-compliant option and offer to save it.',
        );
    };

    const askCoachAboutRecipe = (recipe: RecipeItem) => {
        if (!onAskAI) {
            return;
        }

        const ingredientPreview = recipe.ingredients.slice(0, 8).join(', ');
        onAskAI(
            `Give me clarity on this recipe: ${recipe.title}. ` +
            `Phase: ${recipe.phase}. Meal type: ${getRecipeMealTypeLabel(recipe.mealType)}. ` +
            `Ingredients: ${ingredientPreview}. ` +
            'Explain the practical benefits someone in this protocol would care about (bloating, energy, cravings, die-off support), ' +
            'then give 1-2 easy swaps based on what I might already have. If I cannot cook, also give one compliant order/delivery version.',
        );
    };

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="flex-shrink-0 border-b border-border/50 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="h-8 w-8 flex-shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold">Recipes</h2>
                        <p className="text-[11px] text-muted-foreground">
                            Protocol defaults + your saved custom recipes.
                        </p>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {searchQuery.trim().length > 0 ? `${visibleRecipes.length}/${recipes.length}` : recipes.length}
                    </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full px-3 text-[11px]"
                        onClick={() => setShowForm((prev) => !prev)}
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        {showForm ? 'Close recipe form' : 'Add recipe'}
                    </Button>
                    {onAskAI && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full px-3 text-[11px]"
                            onClick={askCoachToCreateRecipe}
                        >
                            <ChefHat className="w-3.5 h-3.5 mr-1.5" />
                            Build with GutBrain
                        </Button>
                    )}
                </div>

                <div className="mt-2.5">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search by recipe, ingredient, phase, or benefit"
                            className="h-9 pl-8 pr-8 text-sm"
                        />
                        {searchQuery.trim().length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Clear recipe search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-4 px-4 py-4">
                    {showForm && (
                        <section className="rounded-2xl border border-border/60 bg-card/70 p-3">
                            <div className="grid gap-2">
                                <Input
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    placeholder="Recipe name"
                                    className="h-9 text-sm"
                                />
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <label className="grid gap-1 text-[11px] text-muted-foreground">
                                        Phase
                                        <select
                                            value={phase}
                                            onChange={(event) => setPhase(event.target.value)}
                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                        >
                                            {RECIPE_PHASE_ORDER.map((phaseOption) => (
                                                <option key={phaseOption} value={phaseOption}>{phaseOption}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="grid gap-1 text-[11px] text-muted-foreground">
                                        Meal type
                                        <select
                                            value={mealType}
                                            onChange={(event) => setMealType(event.target.value as RecipeMealType)}
                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                        >
                                            {RECIPE_MEAL_TYPE_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                <Input
                                    value={summary}
                                    onChange={(event) => setSummary(event.target.value)}
                                    placeholder="One-line summary (optional)"
                                    className="h-9 text-sm"
                                />
                                <Textarea
                                    value={ingredientsText}
                                    onChange={(event) => setIngredientsText(event.target.value)}
                                    placeholder={'Ingredients (one per line)\nEggs\nSpinach\nCoconut oil'}
                                    className="min-h-[92px] text-sm"
                                />
                                <Textarea
                                    value={instructionsText}
                                    onChange={(event) => setInstructionsText(event.target.value)}
                                    placeholder={'Steps (one per line)\nSaute garlic and spinach\nScramble eggs'}
                                    className="min-h-[92px] text-sm"
                                />
                                <Textarea
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    placeholder="Notes (optional)"
                                    className="min-h-[70px] text-sm"
                                />
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3"
                                        onClick={() => {
                                            resetForm();
                                            setShowForm(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="h-8 px-3"
                                        disabled={title.trim().length < 2 || isSaving}
                                        onClick={() => void handleSave()}
                                    >
                                        Save recipe
                                    </Button>
                                </div>
                            </div>
                        </section>
                    )}

                    {groupedRecipes.length === 0 ? (
                        <section className="rounded-2xl border border-dashed border-border/60 bg-card/40 px-4 py-6 text-center">
                            <p className="text-sm font-medium text-foreground">
                                {searchQuery.trim().length > 0 ? 'No recipes match that search yet.' : 'No recipes saved yet.'}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {searchQuery.trim().length > 0
                                    ? 'Try another ingredient, recipe name, phase, or meal type.'
                                    : 'Use GutBrain to create one, then save it here.'}
                            </p>
                        </section>
                    ) : (
                        groupedRecipes.map((phaseGroup) => (
                            <section key={phaseGroup.phase} className="space-y-2.5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    {phaseGroup.phase}
                                </p>
                                <div className="grid gap-2">
                                    {phaseGroup.recipes.map((recipe) => (
                                        <article
                                            key={recipe.key}
                                            className="rounded-2xl border border-border/60 bg-card/72 px-3 py-3"
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                                                    <Utensils className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className="text-[15px] font-semibold text-foreground">{recipe.title}</p>
                                                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                                                    {getRecipeMealTypeLabel(recipe.mealType)}
                                                                </span>
                                                                <span
                                                                    className={cn(
                                                                        'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                                        recipe.source === 'protocol'
                                                                            ? 'bg-muted text-muted-foreground'
                                                                            : recipe.source === 'ai'
                                                                                ? 'bg-primary/10 text-primary'
                                                                                : 'bg-emerald-500/10 text-emerald-500',
                                                                    )}
                                                                >
                                                                    {recipe.source === 'protocol' ? 'protocol' : recipe.source === 'ai' ? 'gutbrain' : 'custom'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {onAskAI && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 rounded-full px-2.5 text-[10px]"
                                                                    onClick={() => askCoachAboutRecipe(recipe)}
                                                                >
                                                                    <MessageSquare className="mr-1 h-3 w-3" />
                                                                    Ask GutBrain
                                                                </Button>
                                                            )}
                                                            {onRemoveRecipe && (
                                                                <button
                                                                    type="button"
                                                                    className="rounded-full p-1 text-muted-foreground/60 hover:bg-muted hover:text-foreground"
                                                                    onClick={() => {
                                                                        void onRemoveRecipe(recipe);
                                                                    }}
                                                                    aria-label={`Remove ${recipe.title}`}
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {recipe.summary && (
                                                        <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">
                                                            {recipe.summary}
                                                        </p>
                                                    )}
                                                    {recipe.ingredients.length > 0 && (
                                                        <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                                                            <span className="font-medium text-foreground">Ingredients:</span>{' '}
                                                            {recipe.ingredients.join(', ')}
                                                        </p>
                                                    )}
                                                    {recipe.instructions.length > 0 && (
                                                        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                                            <span className="font-medium text-foreground">Steps:</span>{' '}
                                                            {recipe.instructions.join(' -> ')}
                                                        </p>
                                                    )}
                                                    {recipe.notes && (
                                                        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                                            <span className="font-medium text-foreground">Notes:</span>{' '}
                                                            {recipe.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
