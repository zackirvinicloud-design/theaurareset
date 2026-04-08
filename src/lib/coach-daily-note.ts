export interface CoachDailyNote {
  dateLabel: string;
  quote: string;
  author: string;
  support: string;
}

type CoachQuoteStage = 'launch' | 'rhythm' | 'resilience' | 'finish';

interface CoachHistoricalQuote {
  quote: string;
  author: string;
}

const HISTORICAL_QUOTES: Record<CoachQuoteStage, CoachHistoricalQuote[]> = {
  launch: [
    { quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
    { quote: 'Well begun is half done.', author: 'Aristotle' },
    { quote: 'The journey of a thousand miles begins with one step.', author: 'Lao Tzu' },
    { quote: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
    { quote: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
    { quote: 'Knowing is not enough; we must apply. Willing is not enough; we must do.', author: 'Johann Wolfgang von Goethe' },
  ],
  rhythm: [
    { quote: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
    { quote: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
    { quote: 'Great works are performed not by strength but by perseverance.', author: 'Samuel Johnson' },
    { quote: 'Perseverance is not a long race; it is many short races one after the other.', author: 'Walter Elliot' },
    { quote: 'Nothing in this world can take the place of persistence.', author: 'Calvin Coolidge' },
    { quote: 'Victory belongs to the most persevering.', author: 'Napoleon Bonaparte' },
  ],
  resilience: [
    { quote: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
    { quote: 'When we are no longer able to change a situation, we are challenged to change ourselves.', author: 'Viktor E. Frankl' },
    { quote: 'Difficulties strengthen the mind, as labor does the body.', author: 'Seneca' },
    { quote: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche' },
    { quote: 'No man ever steps in the same river twice, for it is not the same river and he is not the same man.', author: 'Heraclitus' },
    { quote: "It's not what happens to you, but how you react to it that matters.", author: 'Epictetus' },
  ],
  finish: [
    { quote: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
    { quote: 'The best way out is always through.', author: 'Robert Frost' },
    { quote: 'You may encounter many defeats, but you must not be defeated.', author: 'Maya Angelou' },
    { quote: "Courage is not having the strength to go on; it is going on when you don't have the strength.", author: 'Theodore Roosevelt' },
    { quote: 'Let me tell you the secret that has led me to my goal: my strength lies solely in my tenacity.', author: 'Louis Pasteur' },
    { quote: 'Our greatest glory is not in never falling, but in rising every time we fall.', author: 'Confucius' },
  ],
};

function getQuoteStage(currentDay: number): CoachQuoteStage {
  if (currentDay <= 1) {
    return 'launch';
  }

  if (currentDay <= 7) {
    return 'rhythm';
  }

  if (currentDay <= 14) {
    return 'resilience';
  }

  return 'finish';
}

function hashString(value: string) {
  let hash = 5381;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }

  return hash >>> 0;
}

function getProtocolSupport(currentDay: number) {
  if (currentDay === 0) {
    return "Prep is about reducing tomorrow's friction, not winning today.";
  }

  if (currentDay <= 7) {
    return "Week 1 gets easier when meals, timing, and binder windows stay predictable.";
  }

  if (currentDay <= 14) {
    return "Week 2 rewards steadiness. Watch the day without turning every signal into a story.";
  }

  return "Week 3 is a clean finish phase. Protect recovery and stop adding noise.";
}

export function getCoachDailyNote(currentDay: number, date = new Date(), sessionSeed = 0): CoachDailyNote {
  const quoteStage = getQuoteStage(currentDay);
  const quotePool = HISTORICAL_QUOTES[quoteStage];
  const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const quoteSeed = hashString(`${dateKey}:${currentDay}:${quoteStage}:${sessionSeed}`);
  const selectedQuote = quotePool[quoteSeed % quotePool.length];
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(date);

  return {
    dateLabel,
    quote: selectedQuote.quote,
    author: selectedQuote.author,
    support: getProtocolSupport(currentDay),
  };
}
