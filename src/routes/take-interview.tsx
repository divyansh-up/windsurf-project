import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/components/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import useSpeechToText from "react-hook-speech-to-text";
import { chatSession } from "@/scripts";
import { Mic, MicOff, RefreshCw, Rocket, Sparkles, Loader } from "lucide-react";
import { computeScoresFromSummary, loadHistory, saveSession, type ScoreBundle } from "@/lib/analytics";
import { AnalyticsRadar } from "@/components/analytics-radar";

// Utility: simple random question generator by domain/topic
function generateQuestions(domain: string, topic: string, count: number): string[] {
  const base: Record<string, string[]> = {
    "web development": [
      "Explain the difference between var, let, and const in JavaScript.",
      "How does the virtual DOM work in React?",
      "What is the purpose of useEffect and when does it run?",
      "Describe CSS specificity and how to resolve conflicts.",
      "Explain how promises and async/await work in JS.",
    ],
    "data science": [
      "Explain bias-variance tradeoff.",
      "What is regularization and why is it useful?",
      "Difference between supervised and unsupervised learning?",
      "How do you handle class imbalance?",
      "Explain precision, recall, and F1-score.",
    ],
    java: [
      "Explain the concept of OOP pillars in Java.",
      "What is the difference between an interface and an abstract class?",
      "How does the JVM manage memory (heap vs stack)?",
      "What are generics and why are they useful?",
      "Explain exception handling best practices.",
    ],
  };

  

  const key = domain.trim().toLowerCase();
  const pool = base[key] ?? [
    `Explain key concepts in ${topic}.`,
    `What are common pitfalls in ${topic} within ${domain}?`,
    `How would you approach a real-world problem in ${topic}?`,
    `Describe best practices for ${topic}.`,
    `What tools or libraries would you use for ${topic} in ${domain}?`,
  ];

  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const q = pool[Math.floor(Math.random() * pool.length)];
    out.push(q);
  }
  return out;
}

const defaultCount = 5;

const TakeInterview = () => {
  const [searchParams] = useSearchParams();
  // Form state
  const [domain, setDomain] = useState("");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState<number>(defaultCount);

  // Interview state
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [perFeedback, setPerFeedback] = useState<string[]>([]);
  const [autoStopTimer, setAutoStopTimer] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scores, setScores] = useState<ScoreBundle | null>(null);
  const [compareIdx, setCompareIdx] = useState<number>(-1);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const suppressInterimRef = useRef<boolean>(false);
  const interimIdxRef = useRef<number>(0);
  

  // Speech-to-text (optional voice input)
  const { isRecording, results, interimResult, startSpeechToText, stopSpeechToText, error } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    const d = searchParams.get("domain");
    const t = searchParams.get("topic");
    const c = searchParams.get("count");
    if (d) setDomain(d);
    if (t) setTopic(t);
    if (c && !Number.isNaN(Number(c))) setCount(Math.max(1, Math.min(10, Number(c))));
  }, [searchParams]);

  // Derived
  const progressText = useMemo(() => {
    if (!started || questions.length === 0) return "";
    return `Question ${currentIdx + 1} of ${questions.length}`;
  }, [started, currentIdx, questions.length]);

  // Apply transcript to current answer
  useEffect(() => {
    if (!started) return;
    if (results.length === 0) return;

    const transcript = results
      .map((r: any) => (typeof r === "string" ? r : r.transcript))
      .join(" ");

    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = transcript;
      return next;
    });
  }, [results, started, currentIdx]);

  // Live update with interimResult for smoother UX
  useEffect(() => {
    if (!started) return;
    if (!isRecording) return;
    if (!interimResult) return;
    if (suppressInterimRef.current) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = interimResult;
      return next;
    });
    interimIdxRef.current = currentIdx;
  }, [interimResult, isRecording, started, currentIdx]);

  // Smoothly keep chat scrolled to bottom when content changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [currentIdx, answers[currentIdx], perFeedback[currentIdx], interimResult]);

  // When current question changes, clear its answer/feedback if empty and suppress interim carry-over briefly
  useEffect(() => {
    if (!started) return;
    suppressInterimRef.current = true;
    // Clear answer and per-question feedback for the new index to avoid leftover content
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = "";
      return next;
    });
    setPerFeedback((prev) => {
      const next = [...prev];
      next[currentIdx] = "";
      return next;
    });
    // Stop any ongoing recording so interim from previous question doesn't bleed over
    if (isRecording) {
      stopSpeechToText();
      if (autoStopTimer) window.clearTimeout(autoStopTimer);
      setAutoStopTimer(null);
    }
    const t = setTimeout(() => {
      suppressInterimRef.current = false;
    }, 600);
    return () => clearTimeout(t);
  }, [currentIdx, started]);

  // Start interview handler
  const onStart = () => {
    const qty = Math.max(1, Math.min(10, Number(count) || defaultCount));
    const qs = generateQuestions(domain || "Web Development", topic || "Basics", qty);
    setQuestions(qs);
    setAnswers(Array(qs.length).fill(""));
    setPerFeedback(Array(qs.length).fill(""));
    setCurrentIdx(0);
    setFeedback("");
    setStarted(true);
  };

  // Navigation
  const onPrev = () => {
    setCurrentIdx((i) => Math.max(0, i - 1));
  };
  const onNext = () => {
    setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
  };

  // Voice input toggle: Browser STT only (Web Speech)
  const toggleVoice = async () => {
    // Browser STT path only
    if (isRecording) {
      stopSpeechToText();
      if (autoStopTimer) window.clearTimeout(autoStopTimer);
      setAutoStopTimer(null);
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.error(e);
      return;
    }
    startSpeechToText();
    const t = window.setTimeout(() => {
      stopSpeechToText();
      setAutoStopTimer(null);
    }, 45000);
    setAutoStopTimer(t);
  };

  // Feedback generation (using existing Gemini chatSession; swap to OpenAI if desired)
  const onFinish = async () => {
    setIsGenerating(true);
    try {
      const prompt = `You are an interview coach. Based on the following answers, write a concise summary of strengths, weaknesses, and concrete improvement suggestions. Be encouraging and specific. Return plain text.\n\nDomain: ${domain}\nTopic: ${topic}\n\n${questions
        .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || "(no answer)"}`)
        .join("\n\n")}`;

      // Place to call OpenAI GPT API instead of Gemini if preferred
      // Example (pseudo):
      // const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });
      // const completion = await openai.chat.completions.create({ ...messagesFromPrompt });
      // const summary = completion.choices[0].message.content;

      const ai = await chatSession.sendMessage(prompt);
      const summary = ai.response.text();
      setFeedback(summary);

      // Only compute analytics if user attempted at least one meaningful answer
      const hasAttempt = answers.some((a) => (a || "").trim().replace(/\s+/g, "").length >= 10);
      if (hasAttempt) {
        const s = computeScoresFromSummary(summary);
        setScores(s);
        saveSession({
          id: String(Date.now()),
          dateISO: new Date().toISOString(),
          type: "text",
          domain,
          topic,
          scores: s,
          summary,
        });
      } else {
        setScores(null);
      }
    } catch (e) {
      setFeedback("Could not generate feedback. Please try again.");
      console.error(e);
    } finally {
      setIsGenerating(false);
      if (isRecording) stopSpeechToText();
    }
  };

  // Per-question feedback (no auto-advance so user can read it)
  const onEvaluateCurrent = async () => {
    setIsGenerating(true);
    try {
      const q = questions[currentIdx];
      const a = answers[currentIdx] || "(no answer)";
      const prompt = `You are an interview coach. Evaluate this single answer and provide:\n- 1-2 strengths\n- 1-2 weaknesses\n- 2 specific improvements\nKeep it to ~5 lines, plain text.\n\nQuestion: ${q}\nAnswer: ${a}`;

      const ai = await chatSession.sendMessage(prompt);
      const summary = ai.response.text();
      setPerFeedback((prev) => {
        const next = [...prev];
        next[currentIdx] = summary;
        return next;
      });

      // Do not auto-advance; let the user read feedback then click Next
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      if (isRecording) {
        stopSpeechToText();
        if (autoStopTimer) window.clearTimeout(autoStopTimer);
        setAutoStopTimer(null);
      }
    }
  };

  const onRestart = () => {
    setStarted(false);
    setFeedback("");
    setQuestions([]);
    setAnswers([]);
    setDomain("");
    setTopic("");
    setCount(defaultCount);
    setCurrentIdx(0);
    if (isRecording) stopSpeechToText();
  };

  // Render
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Animated soft gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-[80px] animate-pulse" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-cyan-200/40 blur-[80px] animate-pulse [animation-delay:200ms]" />
      </div>

      {/* Minimal navbar */}
      <div className="w-full sticky top-0 z-30 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <Container className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 shadow" />
              <span className="font-semibold tracking-tight">Interview Hub</span>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 hidden md:inline-flex">Quick Practice</Badge>
          </div>
        </Container>
      </div>

      {/* Header area */}
      <div className="section-gradient border-b">
        <Container className="py-6 md:py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900">Take Interview</h1>
              <p className="text-sm text-muted-foreground mt-2">Choose your domain and topic, answer questions, and get instant feedback.</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8 md:py-10 space-y-8">
        {/* Setup form */}
        {!started && (
          <Card className="p-6 glass rounded-2xl shadow-lg">
            <CardTitle className="text-xl">Setup</CardTitle>
            <CardDescription className="mt-2">Select what you want to practice</CardDescription>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div>
                <Label htmlFor="domain">Domain / Field</Label>
                <Input
                  id="domain"
                  placeholder="e.g., Web Development, Data Science, Java"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <button type="button" className="px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200" onClick={() => setDomain("Web Development")}>Web Development</button>
                  <button type="button" className="px-2 py-1 rounded-md bg-cyan-100 text-cyan-700 border border-cyan-200 hover:bg-cyan-200" onClick={() => setDomain("Data Science")}>Data Science</button>
                  <button type="button" className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200" onClick={() => setDomain("Java")}>Java</button>
                </div>
              </div>
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" placeholder="e.g., React Hooks" value={topic} onChange={(e) => setTopic(e.target.value)} />
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <button type="button" className="px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200" onClick={() => setTopic("React Hooks")}>React Hooks</button>
                  <button type="button" className="px-2 py-1 rounded-md bg-cyan-100 text-cyan-700 border border-cyan-200 hover:bg-cyan-200" onClick={() => setTopic("Node.js APIs")}>Node.js APIs</button>
                  <button type="button" className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200" onClick={() => setTopic("SQL Basics")}>SQL Basics</button>
                </div>
              </div>
              <div>
                <Label htmlFor="count">Number of Questions</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={10}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {[3,5,7,10].map(n => (
                    <button key={n} type="button" className={`px-2 py-1 rounded-md border ${count===n ? "bg-neutral-900 text-white border-neutral-900" : "bg-white/70 text-neutral-700 border-neutral-200 hover:bg-white"}`} onClick={() => setCount(n)}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="soft" onClick={onRestart} className="card-hover">
                <RefreshCw className="h-4 w-4" /> Reset
              </Button>
              <Button variant="gradient" onClick={onStart} className="card-hover" disabled={!domain || !topic || count < 1}>
                <Rocket className="h-4 w-4" /> Start Interview
              </Button>
            </div>
          </Card>
        )}

        {started && questions.length > 0 && !feedback && (
          <Card className="p-0 glass rounded-2xl shadow-xl overflow-hidden">
            {/* Top bar inside card */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60">
              <div className="text-sm text-neutral-600">{progressText}</div>
              <div className="flex items-center gap-2">
                {isRecording && (
                  <div className="flex items-center gap-2">
                    <span className="relative inline-flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                    </span>
                    <Badge className="bg-sky-100 text-sky-700 border border-sky-200">Recording</Badge>
                  </div>
                )}
                <Button variant="soft" onClick={toggleVoice} className="card-hover">
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4" /> Stop Voice
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" /> Voice Input
                    </>
                  )}
                </Button>
              </div>
            </div>

          {/* Show STT error if any */}
          {error && (
            <div className="px-4 py-2 text-xs text-red-600 border-b bg-white/60">Speech error: {String(error)}</div>
          )}

          {/* Chat area */}
          <div className="grid grid-rows-[1fr_auto] h-[70vh]">
            <div ref={chatScrollRef} className="overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-white/70 to-white/40">
              {/* AI Question bubble */}
              <div className="flex items-start gap-3 max-w-3xl">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 shadow" />
                <div className="rounded-2xl px-4 py-3 bg-indigo-50 text-indigo-900 shadow-sm border border-indigo-100 ring-1 ring-indigo-200/40">
                  <div className="text-xs font-medium text-indigo-700 mb-1">AI Interviewer</div>
                  <div className="text-sm leading-relaxed">{questions[currentIdx]}</div>
                </div>
              </div>

              {/* User Answer bubble (if exists) */}
              {Boolean((answers[currentIdx] || "").trim()) && (
                <div className="flex items-start gap-3 max-w-3xl ml-auto">
                  <div className="rounded-2xl px-4 py-3 bg-cyan-50 text-cyan-900 shadow border border-cyan-100 ring-1 ring-cyan-300/60">
                    <div className="text-xs font-medium text-cyan-700 mb-1 text-right">You</div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{answers[currentIdx]}</div>
                  </div>
                </div>
              )}

              {/* AI Per-question feedback bubble */}
              {perFeedback[currentIdx] && (
                <div className="flex items-start gap-3 max-w-3xl">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 shadow" />
                  <div className="rounded-2xl px-4 py-3 bg-white text-neutral-900 shadow-sm border border-emerald-100">
                    <div className="text-xs font-medium text-emerald-700 mb-1">Feedback</div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{perFeedback[currentIdx]}</div>
                  </div>
                </div>
              )}

              {/* Live interim transcript line */}
              {interimResult && isRecording && interimIdxRef.current === currentIdx && (
                <div className="flex items-center text-xs text-neutral-600 gap-2 animate-pulse">
                  <span className="h-1 w-1 rounded-full bg-cyan-500"></span>
                  Current Speech: {interimResult}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Composer + actions */}
            <div className="border-t bg-white/60 p-3 md:p-4">
              <div className="flex flex-col gap-3">
                <Textarea
                  className="min-h-24 rounded-2xl bg-white/70 backdrop-blur border shadow-inner focus-visible:ring-2 focus-visible:ring-cyan-300"
                  placeholder="Type your answer or use voice..."
                  value={answers[currentIdx] || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[currentIdx] = v;
                      return next;
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === "Enter") {
                      e.preventDefault();
                      if (!isGenerating) onEvaluateCurrent();
                    }
                  }}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="soft" onClick={onPrev} disabled={currentIdx === 0} className="card-hover">Prev</Button>
                    <Button variant="soft" onClick={onNext} disabled={currentIdx === questions.length - 1} className="card-hover">Next</Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="soft" onClick={onEvaluateCurrent} className="card-hover" disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" /> Evaluating...
                        </>
                      ) : (
                        "Evaluate"
                      )}
                    </Button>
                    {currentIdx === questions.length - 1 && (
                      <Button variant="gradient" onClick={onFinish} className="card-hover" disabled={isGenerating}>
                        {isGenerating ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" /> Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" /> Finish & Get Feedback
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

      {/* Feedback */}
      {feedback && (
        <Card className="p-6 glass rounded-2xl shadow-xl space-y-4">
          <CardTitle className="text-lg">Summary Feedback</CardTitle>
          <CardDescription className="text-sm">
            Highlighted strengths, weaknesses, and suggested improvements based on your answers.
          </CardDescription>
          <div className="whitespace-pre-wrap text-sm text-neutral-800 bg-white/60 rounded-md p-4 border">
            {feedback}
          </div>

          {scores && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Analytics</div>
                <select
                  className="text-xs border rounded-md px-2 py-1 bg-white/80"
                  value={compareIdx}
                  onChange={(e) => setCompareIdx(Number(e.target.value))}
                >
                  <option value={-1}>No comparison</option>
                  {loadHistory()
                    .slice(1)
                    .map((h, idx) => (
                      <option key={h.id} value={idx}>
                        {new Date(h.dateISO).toLocaleString()}
                      </option>
                    ))}
                </select>
              </div>
              <AnalyticsRadar
                scores={scores}
                compare={(() => {
                  const hist = loadHistory();
                  const candidate = hist.slice(1)[compareIdx];
                  return candidate?.scores;
                })()}
              />
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="soft" onClick={onRestart} className="card-hover">
              Restart
            </Button>
            <a href="/generate">
              <Button variant="gradient" className="card-hover">Choose New Topic</Button>
            </a>
          </div>
        </Card>
      )}
    </Container>
  </div>
);
};

export default TakeInterview;
