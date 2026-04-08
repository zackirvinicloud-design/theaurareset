/**
 * Day-specific "What's Normal Today" content.
 * Each day returns what the user should expect, what's a red flag,
 * and what they can safely ignore.
 */

export interface NormalTodayData {
  headline: string;
  normal: string[];
  redFlags: string[];
  ignore: string[];
}

const NORMAL_BY_DAY: Record<number, NormalTodayData> = {
  0: {
    headline: 'Prep Day: No symptoms yet — just setup.',
    normal: [
      'Feeling overwhelmed by the number of supplements is expected.',
      'Anxiety about starting is totally normal.',
      'Mild food cravings as you remove off-plan items from the kitchen.',
    ],
    redFlags: [
      'If you feel pressured to start before you are ready, slow down. Prep is not optional.',
    ],
    ignore: [
      'The urge to buy everything at once. Start with Phase 1-2 supplies only.',
      'Comparing your prep to anyone else is timeline — this is your reset.',
    ],
  },
  1: {
    headline: 'Day 1: Your body is adjusting to the new rhythm.',
    normal: [
      'Low energy or mild fatigue as your body shifts fuel sources.',
      'Slight headache from sugar and caffeine reduction.',
      'Feeling hungry more often as processed foods drop out.',
    ],
    redFlags: [
      'Severe headache that does not improve with hydration and rest.',
      'Chest tightness or difficulty breathing — seek medical help immediately.',
    ],
    ignore: [
      'Not feeling anything dramatic. Day 1 is subtle for most people.',
      'Worrying that you are "doing it wrong" because nothing happened yet.',
    ],
  },
  2: {
    headline: 'Day 2: Sugar withdrawal kicks in for most people.',
    normal: [
      'Irritability or mood swings — your brain is adjusting to less sugar.',
      'Stronger food cravings, especially sweets and carbs.',
      'Mild brain fog or difficulty concentrating.',
    ],
    redFlags: [
      'Persistent vomiting or inability to keep water down.',
    ],
    ignore: [
      'Feeling like you want to quit already. This is the sugar talking, not you.',
      'Minor digestive changes — your gut flora is starting to shift.',
    ],
  },
  3: {
    headline: 'Day 3: Die-off symptoms often peak here.',
    normal: [
      'Headache, fatigue, and brain fog hitting harder — classic die-off.',
      'Skin breakouts or rashes as toxins exit through the skin.',
      'Joint aches or flu-like feelings without actually being sick.',
    ],
    redFlags: [
      'High fever over 101°F / 38.3°C — this is not die-off.',
      'Severe rash spreading rapidly or causing difficulty breathing.',
    ],
    ignore: [
      'Thinking die-off means the protocol is hurting you. It means it is working.',
      'The temptation to take more supplements to "speed it up." Stay on plan.',
    ],
  },
  4: {
    headline: 'Day 4: Die-off usually starts easing.',
    normal: [
      'Symptoms may feel lighter than yesterday — that is a good sign.',
      'Sleep may still be disrupted or unusually deep.',
      'Increased thirst as your body flushes toxins.',
    ],
    redFlags: [
      'Die-off symptoms getting significantly WORSE instead of leveling off.',
    ],
    ignore: [
      'Not feeling "healed" yet. This is Day 4, not Day 21.',
      'Comparing your progress to how someone else felt on Day 4.',
    ],
  },
  5: {
    headline: 'Day 5: The first rhythm checkpoint.',
    normal: [
      'Energy may start returning in waves.',
      'Digestion might feel different — more active, more regular.',
      'Cravings dropping noticeably compared to Days 1-3.',
    ],
    redFlags: [
      'Severe abdominal pain that is sharp, localized, and getting worse.',
    ],
    ignore: [
      'Days where you feel great followed by days you do not. It is not linear.',
      'Worrying about Phase 3 supplies. You have a few more days.',
    ],
  },
  6: {
    headline: 'Day 6: Your body is adapting to the routine.',
    normal: [
      'The daily routine should feel more automatic now.',
      'Mild bloating or gas as gut bacteria continue to shift.',
      'Better mental clarity compared to the first few days.',
    ],
    redFlags: [
      'Blood in stool — contact a healthcare provider.',
    ],
    ignore: [
      'Occasional "off" meals that were not perfectly compliant. Stay consistent.',
    ],
  },
  7: {
    headline: 'Day 7: End of the fungal phase. Take stock.',
    normal: [
      'A sense of accomplishment — you finished the hardest week.',
      'Energy more stable than Day 1, but not perfect yet.',
      'Appetite normalizing around cleaner food choices.',
    ],
    redFlags: [
      'Symptoms that have gotten progressively worse every day with no relief.',
    ],
    ignore: [
      'Not feeling "transformed" yet. The magic compounds over 21 days.',
    ],
  },
  8: {
    headline: 'Day 8: Parasite phase begins. New supplements, same routine.',
    normal: [
      'Slight increase in detox symptoms as new supports kick in.',
      'Digestive changes — looser stools or more frequent elimination.',
      'Mild nausea from black walnut or wormwood on an empty stomach.',
    ],
    redFlags: [
      'Severe cramping or uncontrollable diarrhea lasting more than 24 hours.',
    ],
    ignore: [
      'Strange things in your stool. This phase dislodges things. That is the point.',
      'Worrying that new supplements will clash. The protocol accounts for this.',
    ],
  },
  9: {
    headline: 'Day 9: Your body is adjusting to the phase change.',
    normal: [
      'Temporary increase in fatigue as the new phase compounds take effect.',
      'Mild mood fluctuations — parasites can affect neurotransmitters.',
      'Changes in appetite or specific food aversions.',
    ],
    redFlags: [
      'Severe allergic reaction to any supplement — stop it and consult a provider.',
    ],
    ignore: [
      'Reading horror stories online about parasite cleanses. Stay on plan.',
    ],
  },
  10: {
    headline: 'Day 10: Almost halfway. Steady wins.',
    normal: [
      'Energy levels stabilizing again after the phase transition.',
      'Noticing that mornings feel easier than the first week.',
      'Skin may be clearing up or going through a purge cycle.',
    ],
    redFlags: [
      'Persistent fever or chills not explained by weather or illness.',
    ],
    ignore: [
      'The plateau feeling — you are doing the work even when it does not feel dramatic.',
    ],
  },
  11: {
    headline: 'Day 11: Halfway point is tomorrow. Keep going.',
    normal: [
      'The routine should feel natural by now.',
      'Digestive system settling into a cleaner rhythm.',
      'Sleep quality often improves around this point.',
    ],
    redFlags: [
      'Any new severe symptom that appeared suddenly and is not easing.',
    ],
    ignore: [
      'Wondering if you should add extra supplements. Do not. Stay on protocol.',
    ],
  },
  12: {
    headline: 'Day 12: Start thinking about Phase 4 supplies.',
    normal: [
      'Energy and mood more consistent than Week 1.',
      'Reduced bloating and improved digestion for most people.',
      'A growing sense that the protocol is actually working.',
    ],
    redFlags: [
      'Severe dehydration symptoms — dark urine, dizziness, rapid heartbeat.',
    ],
    ignore: [
      'Phase 4 is not here yet. Buy the supplies but do not start early.',
    ],
  },
  13: {
    headline: 'Day 13: The parasite phase is winding down.',
    normal: [
      'Detox symptoms should be lighter than Days 8-9.',
      'Gut feels calmer overall — less bloating, better regularity.',
      'Mental clarity noticeably improved compared to Week 1.',
    ],
    redFlags: [
      'Symptoms returning to Day 3 intensity — something may need adjustment.',
    ],
    ignore: [
      'Feeling "too good" and worrying the protocol is not working. Feeling good IS it working.',
    ],
  },
  14: {
    headline: 'Day 14: Two thirds done. Transition day tomorrow.',
    normal: [
      'Feeling emotionally lighter — gut health affects mood directly.',
      'Cravings are significantly lower than where you started.',
      'Your body has adapted to the supplement timing and routine.',
    ],
    redFlags: [
      'New onset of severe joint pain or swelling.',
    ],
    ignore: [
      'Pre-transition anxiety about Phase 4. Same routine, different supports.',
    ],
  },
  15: {
    headline: 'Day 15: Heavy metal phase begins. Go slow.',
    normal: [
      'Metallic taste in mouth — chlorella and chelation supports can cause this.',
      'Temporary increase in fatigue as heavy metals mobilize.',
      'Mild headaches returning — different cause than Week 1.',
    ],
    redFlags: [
      'Severe neurological symptoms — numbness, tingling, confusion.',
    ],
    ignore: [
      'The metallic taste does not mean something is wrong. It is a sign chelation is active.',
    ],
  },
  16: {
    headline: 'Day 16: Let your body adjust to chelation.',
    normal: [
      'More tired than the past few days — chelation is energy-intensive.',
      'Increased sweating or body odor as metals exit through skin.',
      'Mild digestive disruption as binders do their work.',
    ],
    redFlags: [
      'Persistent severe headaches not responding to hydration and rest.',
    ],
    ignore: [
      'Smelling different is normal. Your body is dumping stored metals.',
    ],
  },
  17: {
    headline: 'Day 17: Four days to go. Stay steady.',
    normal: [
      'Energy fluctuations — good hours and tired hours in the same day.',
      'Body feels lighter overall despite the detox waves.',
      'Emotional processing — stored metals can release stored emotions.',
    ],
    redFlags: [
      'Fainting or severe dizziness that does not resolve with rest.',
    ],
    ignore: [
      'Emotional ups and downs do not mean you are failing. It is part of the release.',
    ],
  },
  18: {
    headline: 'Day 18: Three days left. Focus on finishing clean.',
    normal: [
      'Clarity returning — many people report "fog lifting" around now.',
      'Better sleep quality than the start of the protocol.',
      'Appetite stabilized around whole, clean foods.',
    ],
    redFlags: [
      'Any worsening symptom trend that has not been present before.',
    ],
    ignore: [
      'Wanting to "do one more round" immediately. Finish this one first.',
    ],
  },
  19: {
    headline: 'Day 19: Almost there. Protect your momentum.',
    normal: [
      'High energy days mixed with recovery days — your body is recalibrating.',
      'Skin looking noticeably different — clearer, brighter.',
      'Digestion feeling the best it has in weeks.',
    ],
    redFlags: [
      'Sudden severe symptoms appearing for the first time this late.',
    ],
    ignore: [
      'The temptation to reintroduce eliminated foods early. Two more days.',
    ],
  },
  20: {
    headline: 'Day 20: Tomorrow is the last day.',
    normal: [
      'A mix of excitement and "is this really making a difference?" — both are normal.',
      'Your system is significantly cleaner than Day 1 even if you cannot see it all.',
      'Energy likely more stable than any point in the last 3 weeks.',
    ],
    redFlags: [
      'Anything that feels like an emergency — trust your gut and call a provider.',
    ],
    ignore: [
      'Comparing your "results" to someone else. Your body, your timeline.',
    ],
  },
  21: {
    headline: 'Day 21: You finished. Take this seriously.',
    normal: [
      'Feeling proud, relieved, or even emotional — you earned it.',
      'Wondering "what now?" — the transition plan matters.',
      'Noticing how different your body feels compared to Day 1.',
    ],
    redFlags: [
      'If you feel worse overall than Day 1, consult a healthcare provider.',
    ],
    ignore: [
      'The urge to immediately eat everything you avoided. Transition slowly.',
      'Thinking the benefits will disappear overnight. You built something real.',
    ],
  },
};

export function getNormalToday(day: number): NormalTodayData {
  return NORMAL_BY_DAY[day] ?? NORMAL_BY_DAY[Math.min(day, 21)] ?? NORMAL_BY_DAY[21];
}
