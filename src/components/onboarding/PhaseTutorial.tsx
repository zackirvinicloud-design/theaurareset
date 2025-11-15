import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Play, CheckCircle2, Clock, AlertCircle, Leaf, Droplet, Target, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PhaseTutorialProps {
  phase: 1 | 2 | 3 | 4;
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialSection {
  title: string;
  content: string;
  icon: React.ReactNode;
  tips: string[];
  warnings?: string[];
}

const phaseTutorials: Record<number, {
  title: string;
  color: string;
  duration: string;
  goal: string;
  sections: TutorialSection[];
}> = {
  1: {
    title: "Phase 1: Liver Support & Detox Pathways",
    color: "from-green-500 to-emerald-600",
    duration: "Days 1-7",
    goal: "Open drainage pathways and support liver function",
    sections: [
      {
        title: "Morning Ritual",
        icon: <Droplet className="w-6 h-6 text-green-500" />,
        content: "Start every morning with 16 oz warm lemon water + pinch of sea salt. Wait 30 minutes before eating. This kickstarts bile flow and hydration.",
        tips: [
          "Use fresh lemon juice, not bottled",
          "Room temperature or slightly warm water",
          "Himalayan or Celtic sea salt preferred",
          "Do this BEFORE coffee or supplements"
        ]
      },
      {
        title: "Key Supplements",
        icon: <Leaf className="w-6 h-6 text-green-500" />,
        content: "Liver support is critical: milk thistle, dandelion root, NAC (N-acetyl cysteine). These protect and regenerate liver cells.",
        tips: [
          "Take with breakfast for best absorption",
          "NAC is especially powerful for glutathione production",
          "Dandelion root tea counts as supplement + hydration"
        ]
      },
      {
        title: "Binder Schedule",
        icon: <Clock className="w-6 h-6 text-green-500" />,
        content: "Activated charcoal or bentonite clay - ALWAYS 2 hours away from food and supplements. This captures toxins being released.",
        tips: [
          "Take before bed (2 hours after dinner)",
          "Or mid-morning (2 hours after breakfast)",
          "Drink extra water with binders"
        ],
        warnings: [
          "Skip binders if constipated - fix that first",
          "Never take with medications or supplements"
        ]
      },
      {
        title: "Foods to Emphasize",
        icon: <Target className="w-6 h-6 text-green-500" />,
        content: "Bitter greens stimulate bile: arugula, dandelion greens, endive, radishes. Green juices. Cruciferous vegetables.",
        tips: [
          "Start meals with bitter greens",
          "Make a morning green juice ritual",
          "Add lemon to everything - it supports bile",
          "Avoid sugar - it stresses the liver"
        ]
      }
    ]
  },
  2: {
    title: "Phase 2: Fungal & Viral Elimination",
    color: "from-purple-500 to-violet-600",
    duration: "Days 8-14",
    goal: "Target candida, fungi, and viral overgrowth",
    sections: [
      {
        title: "The Anti-Fungal Arsenal",
        icon: <Sparkles className="w-6 h-6 text-purple-500" />,
        content: "Oregano oil, pau d'arco, caprylic acid, garlic. These are your weapons against candida and fungal overgrowth.",
        tips: [
          "Oregano oil is powerful - start low dose",
          "Pau d'arco tea 2-3x daily",
          "Raw garlic is more potent than cooked",
          "Coconut oil contains natural caprylic acid"
        ]
      },
      {
        title: "Starve the Fungus",
        icon: <AlertCircle className="w-6 h-6 text-purple-500" />,
        content: "ZERO sugar, zero fermented foods, zero yeast. Candida feeds on sugar. You must starve it while killing it.",
        tips: [
          "No fruit except berries (limited)",
          "No kombucha, vinegar, alcohol",
          "No bread, pasta, or grains with yeast",
          "Read labels - sugar hides everywhere"
        ],
        warnings: [
          "Die-off symptoms are NORMAL: brain fog, fatigue, skin breakouts",
          "This means it's working - don't quit now",
          "Increase binders to help remove dead fungus"
        ]
      },
      {
        title: "Probiotics Strategy",
        icon: <Leaf className="w-6 h-6 text-purple-500" />,
        content: "High-quality probiotic on empty stomach. Repopulate good bacteria as you kill the bad.",
        tips: [
          "Take first thing in morning",
          "Look for 50+ billion CFUs",
          "Multiple strains preferred",
          "Continue through all phases"
        ]
      },
      {
        title: "Symptom Management",
        icon: <Target className="w-6 h-6 text-purple-500" />,
        content: "Die-off can be intense. Support your body through this healing crisis.",
        tips: [
          "Extra sleep - 8-9 hours minimum",
          "Epsom salt baths with apple cider vinegar",
          "Gentle exercise - walking, yoga",
          "TRIPLE your binder dose if symptoms are severe"
        ]
      }
    ]
  },
  3: {
    title: "Phase 3: Parasite Elimination",
    color: "from-orange-500 to-red-600",
    duration: "Days 15-21",
    goal: "Address parasitic infections and gut invaders",
    sections: [
      {
        title: "Anti-Parasitic Protocol",
        icon: <Target className="w-6 h-6 text-orange-500" />,
        content: "Wormwood, black walnut hull, cloves - the traditional anti-parasitic trinity. Plus raw garlic, pumpkin seeds, papaya.",
        tips: [
          "Take herbs with food to avoid nausea",
          "Raw pumpkin seeds daily (handful)",
          "Fresh papaya or papaya seeds",
          "Raw garlic cloves if you can handle it"
        ]
      },
      {
        title: "Binders Are CRITICAL",
        icon: <AlertCircle className="w-6 h-6 text-orange-500" />,
        content: "Dead parasites release toxins. Binders capture them. This phase REQUIRES consistent binder use.",
        tips: [
          "Take binders 2-3x daily",
          "Activated charcoal is especially effective",
          "Consider adding diatomaceous earth",
          "Drink even MORE water this phase"
        ],
        warnings: [
          "Must have daily bowel movements",
          "If constipated, add magnesium citrate",
          "Toxins recirculate without proper elimination"
        ]
      },
      {
        title: "Emotional Releases",
        icon: <Sparkles className="w-6 h-6 text-orange-500" />,
        content: "Parasites are linked to stuck emotions. You may experience emotional processing, vivid dreams, mood shifts.",
        tips: [
          "Journal your feelings",
          "Allow yourself to feel and release",
          "This is part of the healing",
          "Full moon often intensifies symptoms"
        ]
      },
      {
        title: "Dietary Emphasis",
        icon: <Leaf className="w-6 h-6 text-orange-500" />,
        content: "High fiber vegetables to sweep the intestines. Foods hostile to parasites.",
        tips: [
          "Cayenne pepper (parasites hate heat)",
          "Pineapple (contains bromelain)",
          "Fermented vegetables (if tolerated)",
          "Avoid raw fish and undercooked meat"
        ]
      }
    ]
  },
  4: {
    title: "Phase 4: Heavy Metals & Mold",
    color: "from-blue-500 to-cyan-600",
    duration: "Days 22-28",
    goal: "Remove deep-stored heavy metals and mycotoxins",
    sections: [
      {
        title: "Metal Chelation",
        icon: <Sparkles className="w-6 h-6 text-blue-500" />,
        content: "Chlorella, spirulina, cilantro, modified citrus pectin. These bind and remove heavy metals stored in tissues.",
        tips: [
          "Heavy metal smoothie: cilantro, spirulina, wild blueberries, dulse, barley grass",
          "Start with small doses and build up",
          "Chlorella binds metals in the gut",
          "Cilantro pulls metals from tissues"
        ]
      },
      {
        title: "Glutathione Support",
        icon: <Leaf className="w-6 h-6 text-blue-500" />,
        content: "Master antioxidant for metal detox. NAC, glutathione, or liposomal glutathione.",
        tips: [
          "Liposomal form absorbs best",
          "NAC converts to glutathione in body",
          "Sulfur-rich foods support production",
          "Take on empty stomach"
        ]
      },
      {
        title: "Aggressive Binder Protocol",
        icon: <AlertCircle className="w-6 h-6 text-blue-500" />,
        content: "Metals stored deep need maximum binding. Increase binder frequency this week.",
        tips: [
          "Binders 3x daily minimum",
          "Zeolite is especially good for metals",
          "Bentonite clay draws out toxins",
          "Always 2 hours from food/supplements"
        ],
        warnings: [
          "Metals can cause brain fog and fatigue",
          "This is the deepest detox phase",
          "Extra rest and self-care essential"
        ]
      },
      {
        title: "Supporting Elimination",
        icon: <Droplet className="w-6 h-6 text-blue-500" />,
        content: "Multiple routes of elimination: bowels, urine, sweat, breath. Support all pathways.",
        tips: [
          "Infrared sauna if available",
          "Epsom salt + bentonite clay baths",
          "Drink your body weight in ounces of water",
          "Vitamin C to bowel tolerance helps flush"
        ]
      }
    ]
  }
};

export const PhaseTutorial = ({ phase, isOpen, onClose }: PhaseTutorialProps) => {
  const [currentSection, setCurrentSection] = useState(0);
  const tutorial = phaseTutorials[phase];
  const section = tutorial.sections[currentSection];
  const progress = ((currentSection + 1) / tutorial.sections.length) * 100;

  const handleNext = () => {
    if (currentSection < tutorial.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      onClose();
      setCurrentSection(0);
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${tutorial.color} flex items-center justify-center text-white font-bold text-xl animate-fade-in`}>
              {phase}
            </div>
            <div className="flex-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <DialogTitle className="text-2xl">{tutorial.title}</DialogTitle>
              <DialogDescription className="text-base flex items-center gap-4 mt-1">
                <Badge variant="outline" className="font-normal">
                  {tutorial.duration}
                </Badge>
                <span>{tutorial.goal}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <Progress value={progress} className="w-full animate-fade-in" />
          
          <Card className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 border-2 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-lg bg-background shadow-sm">
                {section.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Actions
                </h4>
                <ul className="space-y-2">
                  {section.tips.map((tip, index) => (
                    <li 
                      key={index} 
                      className="flex gap-3 text-sm animate-fade-in"
                      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                      <Play className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {section.warnings && section.warnings.length > 0 && (
                <div className="space-y-2 mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg animate-fade-in" style={{ animationDelay: '0.5s' }}>
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-orange-600 dark:text-orange-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Important Warnings
                  </h4>
                  <ul className="space-y-2">
                    {section.warnings.map((warning, index) => (
                      <li key={index} className="flex gap-3 text-sm text-orange-700 dark:text-orange-300">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          <div className="flex items-center justify-between pt-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentSection === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {currentSection + 1} of {tutorial.sections.length}
              </span>
              <Button
                onClick={handleNext}
                className="gap-2"
              >
                {currentSection < tutorial.sections.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  "Complete"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};