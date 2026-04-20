export interface NormalTodayData {
  headline: string;
  normal: string[];
  redFlags: string[];
  ignore: string[];
}

const PREP_DAY: NormalTodayData = {
  headline: 'Prep Day: Keep the job small and practical.',
  normal: [
    'Feeling overwhelmed by the setup list.',
    'Needing to simplify the shopping list before you start.',
    'Wanting the app to tell you what matters first.',
  ],
  redFlags: [
    'Anything urgent, dangerous, or medically concerning belongs with a clinician, not this page.',
  ],
  ignore: [
    'The urge to buy everything at once.',
    'The urge to research three more hours before doing the setup.',
  ],
};

const WEEK_ONE: NormalTodayData = {
  headline: 'Week 1: Protect the routine and keep the next step obvious.',
  normal: [
    'Cravings, frustration, or the urge to overthink the process.',
    'A messy day that makes you want to improvise.',
    'Needing simpler meals and cleaner timing to stay on track.',
  ],
  redFlags: [
    'Anything severe, worsening, or medically concerning should move out of the app and toward qualified care.',
  ],
  ignore: [
    'The urge to add random fixes because one day felt harder.',
    'Comparing your Day 3 or Day 4 to someone else\'s timeline.',
  ],
};

const WEEK_TWO: NormalTodayData = {
  headline: 'Week 2: More moving pieces means more reason to stay simple.',
  normal: [
    'Wanting to re-check the shopping list, timing, or day order.',
    'Feeling tempted to research instead of following the checklist.',
    'Needing the app to bring you back to the next practical move.',
  ],
  redFlags: [
    'Anything urgent or medically concerning belongs with a clinician, not a protocol explainer.',
  ],
  ignore: [
    'The urge to interpret every rough patch in real time.',
    'The urge to rebuild the whole system because one day felt off.',
  ],
};

const WEEK_THREE: NormalTodayData = {
  headline: 'Week 3: Finish cleanly instead of chasing a dramatic ending.',
  normal: [
    'Feeling tempted to coast because you are almost done.',
    'Feeling tempted to overpush because you want a stronger finish.',
    'Needing the checklist to keep the final week steady.',
  ],
  redFlags: [
    'Anything severe, worsening, or medically concerning should move to qualified care right away.',
  ],
  ignore: [
    'The urge to add extra intensity late in the protocol.',
    'The urge to stop early because you feel close enough.',
  ],
};

export function getNormalToday(day: number): NormalTodayData {
  if (day <= 0) {
    return PREP_DAY;
  }

  if (day <= 7) {
    return WEEK_ONE;
  }

  if (day <= 14) {
    return WEEK_TWO;
  }

  return WEEK_THREE;
}
