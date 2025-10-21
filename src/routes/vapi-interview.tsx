import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MicOff, Sparkles, Loader, PhoneCall } from "lucide-react";
import { createVapiClient, type VapiController } from "@/lib/vapi";
import { chatSession } from "@/scripts";

const VapiInterview = () => {
  // Live session (no setup form) — show a modern pre-session screen
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<string[]>(["Live AI session"]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [perFeedback, setPerFeedback] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [vapi, setVapi] = useState<VapiController | null>(null);
  const [isVapiActive, setIsVapiActive] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [lastError, setLastError] = useState<string>("");
  const hasPubKey = Boolean(import.meta.env.VITE_VAPI_PUBLIC_KEY);
  const hasAssistant = Boolean(import.meta.env.VITE_VAPI_ASSISTANT_ID);

  const progressText = useMemo(() => {
    return "Live Session";
  }, []);

  useEffect(() => {
    // ensure single-session scaffolding exists
    if (!started) {
      setQuestions(["Live AI session"]);
      setAnswers([""]);
      setPerFeedback([""]);
      setCurrentIdx(0);
      setSummary("");
      setStarted(true);
    }
  }, [started]);

  const onStartSession = async () => {
    setStarted(true);
    await toggleVapi();
  };


  const toggleVapi = async () => {
    if (isVapiActive && vapi) {
      setStatusMsg("Stopping call...");
      await vapi.stop();
      setIsVapiActive(false);
      setStatusMsg("Call stopped");
      return;
    }

    if (!vapi) {
      setStatusMsg("Initializing Vapi client...");
      const client = await createVapiClient();
      setVapi(client);
      if (!client) {
        console.warn("Vapi not configured. Ensure VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID are set.");
        setStatusMsg("Vapi not configured");
        return;
      }
    }

    try {
      setStatusMsg("Requesting microphone permission...");
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.error(e);
      setLastError(String(e));
      setStatusMsg("Microphone permission denied");
      return;
    }

    setStatusMsg("Starting Vapi call...");
    await (vapi as VapiController).start({
      onPartial: (text) => {
        setAnswers((prev) => {
          const next = [...prev];
          next[currentIdx] = text;
          return next;
        });
      },
      onFinal: (text) => {
        setAnswers((prev) => {
          const next = [...prev];
          next[currentIdx] = text;
          return next;
        });
      },
      onStatus: (s) => setStatusMsg(String(s)),
      onError: (err) => {
        console.error("Vapi error", err);
        setLastError(String(err));
        setStatusMsg("Vapi error");
      },
    });
    setIsVapiActive(true);
    setStatusMsg("On Call");
  };


  const onFinish = async () => {
    setIsGenerating(true);
    try {
      const prompt = `You are an interview coach. Based on the following live-call answers, write a concise summary of strengths, weaknesses, and concrete improvement suggestions. Be encouraging and specific. Return plain text.\n\n${questions
        .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || "(no answer)"}`)
        .join("\n\n")}`;
      const ai = await chatSession.sendMessage(prompt);
      setSummary(ai.response.text());
    } finally {
      setIsGenerating(false);
      if (isVapiActive && vapi) await vapi.stop();
      setIsVapiActive(false);
    }
  };

  return (
    <div className="w-full">
      <div className="section-gradient border-b">
        <Container className="py-8 md:py-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Vapi Interview
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Real-time voice interview using Vapi AI. Speak answers, see partials live.
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-700 border border-purple-200 hidden md:inline-flex">
              Vapi Agent
            </Badge>
          </div>
        </Container>
      </div>

      <Container className="py-8 md:py-10 space-y-8">
        {/* Pre-session hero */}
        {!started && (
          <Card className="p-0 overflow-hidden rounded-2xl shadow-xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
              <div className="relative p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900">Machine Interview</h2>
                  <p className="text-sm md:text-base text-neutral-600 max-w-prose">
                    Practice with a live AI voice agent. Click Start to begin a real-time conversation. Your speech will be
                    transcribed live and summarized at the end.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">Live Voice</span>
                    <span className="px-2 py-1 rounded-md bg-cyan-100 text-cyan-700 border border-cyan-200">Realtime Transcripts</span>
                    <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">Instant Summary</span>
                  </div>
                  <div className="pt-2">
                    <Button variant="gradient" className="card-hover" onClick={onStartSession}>
                      Start Machine Interview
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="mx-auto h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 opacity-90 blur-2xl" />
                  <div className="-mt-40 mx-auto h-56 w-56 rounded-2xl bg-white/70 backdrop-blur border shadow" />
                </div>
              </div>
            </div>
          </Card>
        )}

        {started && !summary && (
          <Card className="p-6 glass space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-600">{progressText}</div>
              <div className="flex items-center gap-2">
                {isVapiActive && (
                  <Badge className="bg-purple-100 text-purple-700 border border-purple-200">On Call</Badge>
                )}
                <Button variant="soft" onClick={toggleVapi} className="card-hover">
                  {isVapiActive ? (
                    <>
                      <MicOff className="h-4 w-4" /> End Call
                    </>
                  ) : (
                    <>
                      <PhoneCall className="h-4 w-4" /> Start Call
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Diagnostics */}
            <div className="text-xs text-neutral-600 flex flex-wrap gap-2">
              <Badge className={hasPubKey ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"}>
                Public Key: {hasPubKey ? "OK" : "Missing"}
              </Badge>
              <Badge className={hasAssistant ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"}>
                Assistant ID: {hasAssistant ? "OK" : "Missing"}
              </Badge>
              {statusMsg && (
                <Badge className="bg-sky-100 text-sky-700 border border-sky-200">{statusMsg}</Badge>
              )}
              {lastError && (
                <Badge className="bg-red-100 text-red-700 border border-red-200" title={lastError}>Error</Badge>
              )}
            </div>

            <div>
              <CardTitle className="text-base">Connected to AI Interviewer</CardTitle>
              <CardDescription className="mt-2">Speak naturally. Live transcript will appear below. Click End Call to finish.</CardDescription>
              <Textarea
                className="mt-3 min-h-36"
                placeholder="Live transcript will appear here..."
                value={answers[currentIdx] || ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setAnswers((prev) => {
                    const next = [...prev];
                    next[currentIdx] = v; // allow manual correction too
                    return next;
                  });
                }}
              />

              {perFeedback[currentIdx] && (
                <div className="mt-4 whitespace-pre-wrap text-sm text-neutral-800 bg-emerald-50 rounded-md p-3 border border-emerald-100">
                  {perFeedback[currentIdx]}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <Button variant="gradient" onClick={onFinish} className="card-hover" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate Summary
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {summary && (
          <Card className="p-6 glass space-y-4">
            <CardTitle className="text-lg">Summary Feedback</CardTitle>
            <CardDescription className="text-sm">Overall strengths, weaknesses, and improvement suggestions.</CardDescription>
            <div className="whitespace-pre-wrap text-sm text-neutral-800 bg-white/60 rounded-md p-4 border">{summary}</div>
            {(statusMsg || lastError) && (
              <div className="text-xs text-neutral-600">
                {statusMsg && <div>Status: {statusMsg}</div>}
                {lastError && <div className="text-red-600">Error: {lastError}</div>}
              </div>
            )}
          </Card>
        )}
      </Container>
    </div>
  );
};

export default VapiInterview;
