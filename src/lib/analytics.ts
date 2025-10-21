export type ScoreBundle = {
  accuracy: number;
  clarity: number;
  confidence: number;
  communication: number;
};

export type AnalyticsEntry = {
  id: string; // timestamp string
  dateISO: string;
  type: "text" | "vapi";
  domain?: string;
  topic?: string;
  scores: ScoreBundle;
  summary: string;
};

const KEY = "ih_analytics_history";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function count(words: string[], s: string) {
  const t = s.toLowerCase();
  return words.reduce((acc, w) => acc + (t.match(new RegExp(`\\b${w}\\b`, "g"))?.length || 0), 0);
}

export function computeScoresFromSummary(summary: string): ScoreBundle {
  const posAccuracy = ["correct", "precise", "accurate", "right"];
  const negAccuracy = ["incorrect", "wrong", "mistake", "error"];

  const posClarity = ["clear", "structured", "concise", "organized"];
  const negClarity = ["unclear", "vague", "rambling", "confusing"];

  const posConfidence = ["confident", "assertive", "composed", "steady"];
  const negConfidence = ["hesitant", "unsure", "nervous", "uncertain"];

  const posComm = ["communication", "delivery", "tone", "flow", "engaging"];
  const negComm = ["monotone", "dull", "awkward", "poor communication"];

  const acc = clamp01((count(posAccuracy, summary) - count(negAccuracy, summary) + 1) / 5);
  const cla = clamp01((count(posClarity, summary) - count(negClarity, summary) + 1) / 5);
  const con = clamp01((count(posConfidence, summary) - count(negConfidence, summary) + 1) / 5);
  const com = clamp01((count(posComm, summary) - count(negComm, summary) + 1) / 5);

  return {
    accuracy: Math.round(acc * 100),
    clarity: Math.round(cla * 100),
    confidence: Math.round(con * 100),
    communication: Math.round(com * 100),
  };
}

export function loadHistory(): AnalyticsEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalyticsEntry[];
  } catch {
    return [];
  }
}

export function saveSession(entry: AnalyticsEntry) {
  const hist = loadHistory();
  hist.unshift(entry);
  try {
    localStorage.setItem(KEY, JSON.stringify(hist.slice(0, 25)));
  } catch {}
}
