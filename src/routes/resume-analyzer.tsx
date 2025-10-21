import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Sparkles, Rocket, Cpu } from "lucide-react";
import { chatSession } from "@/scripts";

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
// Import worker as URL so Vite can bundle/serve it correctly
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - bundler handles ?url
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

const parsePdf = async (file: File): Promise<string> => {
  (GlobalWorkerOptions as any).workerSrc = workerUrl as string;
  const array = await file.arrayBuffer();
  const loadingTask = getDocument({ data: array });
  const pdf = await loadingTask.promise;
  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => (it.str ?? ""));
    text += strings.join(" ") + "\n";
  }
  return text;
};

const scoreColor = (n: number) => {
  if (n >= 80) return "text-emerald-600";
  if (n >= 60) return "text-amber-600";
  return "text-red-600";
};

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [domain, setDomain] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    atsScore: number;
    improvements: string[];
    missingSkills: string[];
    recommendedTopics: string[];
  } | null>(null);

  const navigate = useNavigate();

  const canAnalyze = useMemo(() => !!(file || rawText.trim()), [file, rawText]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const extract = async () => {
    setError(null);
    setResult(null);
    if (!file && !rawText.trim()) return;
    setLoading(true);
    try {
      let text = rawText.trim();
      if (!text && file) {
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
          text = await parsePdf(file);
        } else if (file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt")) {
          text = await file.text();
        } else {
          text = await file.text().catch(() => "");
        }
      }
      if (!text || text.replace(/\s+/g, "").length < 100) {
        setError("Could not read enough text from the resume. Upload a PDF or paste text.");
        setLoading(false);
        return;
      }

      const prompt = `You are an ATS and career assistant. Analyze the resume text and for the chosen domain return a strict JSON with keys: atsScore (0-100 number), improvements (array of 5 concise strings), missingSkills (array of 8-12 skills), recommendedTopics (array of 5-8 concrete topics to practice for interviews). Do not include any extra commentary.\n\nDomain: ${domain || "General"}\nResume: \n${text.slice(0, 16000)}`;

      const ai = await chatSession.sendMessage(prompt);
      const content = ai.response.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(content);
      } catch {
        const m = content.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      }
      if (!parsed) throw new Error("Model did not return JSON");
      const atsScore = Math.max(0, Math.min(100, Number(parsed.atsScore ?? 0)));
      const improvements = Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 8) : [];
      const missingSkills = Array.isArray(parsed.missingSkills) ? parsed.missingSkills.slice(0, 15) : [];
      const recommendedTopics = Array.isArray(parsed.recommendedTopics) ? parsed.recommendedTopics.slice(0, 12) : [];
      setResult({ atsScore, improvements, missingSkills, recommendedTopics });
    } catch (e: any) {
      setError("Analysis failed. Try a simpler PDF or paste the text.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startPractice = (topic: string) => {
    const d = domain || "Web Development";
    navigate(`/take-interview?domain=${encodeURIComponent(d)}&topic=${encodeURIComponent(topic)}`);
  };
  const goTakeInterview = () => {
    const d = domain || "Web Development";
    const t = result?.recommendedTopics?.[0];
    const qp = t ? `?domain=${encodeURIComponent(d)}&topic=${encodeURIComponent(t)}` : `?domain=${encodeURIComponent(d)}`;
    navigate(`/take-interview${qp}`);
  };
  const goMachineInterview = () => {
    navigate(`/machine-interview`);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Soft animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-[80px] animate-pulse" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-cyan-200/40 blur-[80px] animate-pulse [animation-delay:200ms]" />
      </div>

      {/* Top bar */}
      <div className="w-full sticky top-0 z-30 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <Container className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 shadow" />
              <span className="font-semibold tracking-tight">Resume Analyzer</span>
            </div>
            <div className="flex items-center gap-2">
              {result && (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100">Analysis Ready</Badge>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Header */}
      <div className="section-gradient border-b">
        <Container className="py-6 md:py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900">Analyze your resume</h1>
              <p className="text-sm text-muted-foreground mt-2">Get ATS score, targeted improvements, missing skills, and interview topics — then jump straight into practice.</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button variant="soft" onClick={goTakeInterview} className="card-hover"><Rocket className="h-4 w-4" /> Take Interview</Button>
              <Button variant="soft" onClick={goMachineInterview} className="card-hover"><Cpu className="h-4 w-4" /> Machine Interview</Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Main grid */}
      <Container className="py-8 md:py-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input card */}
          <Card className="p-6 glass rounded-2xl shadow-lg lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Resume</CardTitle>
                <CardDescription className="mt-1">Upload a PDF or paste plain text</CardDescription>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-neutral-600">
                <Sparkles className="h-4 w-4 text-indigo-500" /> Better results with clear headings & keywords
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div className="space-y-3">
                <Label htmlFor="domain">Target Domain</Label>
                <Input id="domain" placeholder="e.g., Web Development, Data Science, Java" value={domain} onChange={(e) => setDomain(e.target.value)} />
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <button type="button" className="px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200" onClick={() => setDomain("Web Development")}>Web Development</button>
                  <button type="button" className="px-2 py-1 rounded-md bg-cyan-100 text-cyan-700 border border-cyan-200 hover:bg-cyan-200" onClick={() => setDomain("Data Science")}>Data Science</button>
                  <button type="button" className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200" onClick={() => setDomain("Java")}>Java</button>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Upload PDF or .txt</Label>
                <div className="rounded-xl border bg-white/70 backdrop-blur p-3">
                  <div className="flex items-center gap-3">
                    <Input type="file" accept=".pdf,.txt" onChange={onPick} />
                    <Button variant="soft" className="card-hover"><Upload className="h-4 w-4" /> Pick file</Button>
                  </div>
                  {file && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600"><FileText className="h-4 w-4" /> {file.name}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Label>Or paste resume text</Label>
              <Textarea className="min-h-48 rounded-xl bg-white/70 backdrop-blur border shadow-inner focus-visible:ring-2 focus-visible:ring-cyan-300" placeholder="Paste resume text here" value={rawText} onChange={(e) => setRawText(e.target.value)} />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
              <Button variant="soft" onClick={() => { setFile(null); setRawText(""); setResult(null); setError(null); }} className="card-hover">Clear</Button>
              <Button variant="gradient" onClick={extract} className="card-hover" disabled={!canAnalyze || loading}>{loading ? "Analyzing..." : (<> <Sparkles className="h-4 w-4" /> Analyze </>)}</Button>
              <Button variant="soft" onClick={goTakeInterview} className="card-hover"><Rocket className="h-4 w-4" /> Take Interview</Button>
              <Button variant="soft" onClick={goMachineInterview} className="card-hover"><Cpu className="h-4 w-4" /> Machine Interview</Button>
            </div>

            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          </Card>

          {/* Right: Tips / Actions card */}
          <Card className="p-6 glass rounded-2xl shadow-lg">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription className="text-xs mt-1">Jump into practice or refine inputs</CardDescription>
            <div className="mt-4 space-y-2">
              <Button variant="soft" onClick={goTakeInterview} className="w-full card-hover"><Rocket className="h-4 w-4" /> Take Interview</Button>
              <Button variant="soft" onClick={goMachineInterview} className="w-full card-hover"><Cpu className="h-4 w-4" /> Machine Interview</Button>
            </div>
            <div className="mt-6 text-xs text-neutral-600 space-y-2">
              <div className="font-medium text-neutral-800">Tips</div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Prefer PDF with selectable text (not scanned images).</li>
                <li>Include measurable impact and relevant keywords.</li>
                <li>Tailor domain for targeted recommendations.</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score */}
              <Card className="p-6 glass rounded-2xl shadow-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">ATS Score</CardTitle>
                  <span className="inline-flex items-center gap-1 rounded-full border bg-white/70 px-2 py-0.5 text-xs"><Sparkles className="h-3 w-3 text-indigo-500" /> heuristic</span>
                </div>
                <div className={`mt-4 text-5xl font-extrabold ${scoreColor(result.atsScore)}`}>{result.atsScore}</div>
                <CardDescription className="mt-2 text-xs">Higher scores often correlate with clearer structure and relevant keywords.</CardDescription>
              </Card>

              {/* Improvements */}
              <Card className="p-6 glass rounded-2xl shadow-xl md:col-span-2">
                <CardTitle className="text-base">Suggested Improvements</CardTitle>
                <ul className="mt-3 space-y-2 text-sm">
                  {result.improvements.map((x, i) => (
                    <li key={i} className="rounded-md border bg-white/70 px-3 py-2">{x}</li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Missing skills */}
              <Card className="p-6 glass rounded-2xl shadow-xl">
                <CardTitle className="text-base">Missing Skills</CardTitle>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.missingSkills.map((s, i) => (
                    <span key={i} className="px-2 py-1 rounded-md bg-white/70 border text-xs">{s}</span>
                  ))}
                </div>
              </Card>

              {/* Recommended topics */}
              <Card className="p-6 glass rounded-2xl shadow-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recommended Topics</CardTitle>
                  <Button variant="gradient" size="sm" onClick={goTakeInterview} className="card-hover">Start Practice</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.recommendedTopics.map((t, i) => (
                    <button key={i} type="button" onClick={() => startPractice(t)} className="px-2 py-1 rounded-md bg-neutral-900 text-white border border-neutral-900 hover:opacity-90 text-xs">{t}</button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
