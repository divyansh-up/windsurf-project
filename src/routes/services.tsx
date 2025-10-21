import { Container } from "@/components/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Mic, Sparkles, LineChart, Globe, Cpu, FileText } from "lucide-react";

const ServicesPage = () => {
  return (
    <div className="w-full">
      {/* Hero */}
      <div className="w-full bg-gradient-to-r from-sky-50 to-emerald-50 border-b">
        <Container className="py-12 md:py-16">
          <div className="space-y-3">
            <span className="px-3 py-1 text-xs rounded-full bg-white border text-emerald-700">Our Services</span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">What Interviewer Hub Offers</h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
              A modern platform for practicing interviews with an AI voice agent, instant feedback, and a progress dashboard.
            </p>
          </div>
        </Container>
      </div>

      {/* Services Grid */}
      <Container className="py-10 md:py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI-Powered Mock Interviews */}
          <Card className="p-6 bg-white/90 shadow-sm border">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-emerald-600" /> AI-Powered Mock Interviews
            </CardTitle>
            <CardDescription className="mt-3 text-sm">
              Conduct realistic technical and behavioral interviews with a voice agent. Practice anytime, anywhere.
            </CardDescription>
          </Card>

          {/* Speech-to-Text Analysis */}
          <Card className="p-6 bg-white/90 shadow-sm border">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mic className="h-5 w-5 text-sky-600" /> Speech-to-Text Analysis
            </CardTitle>
            <CardDescription className="mt-3 text-sm">
              Your spoken answers are transcribed for evaluation, enabling AI to analyze content, fluency, and relevance.
            </CardDescription>
          </Card>

          {/* Real-Time Feedback */}
          <Card className="p-6 bg-white/90 shadow-sm border">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" /> Real-Time Feedback
            </CardTitle>
            <CardDescription className="mt-3 text-sm">
              Instant feedback on your tone, confidence, clarity, and accuracy—plus suggestions to improve fast.
            </CardDescription>
          </Card>

          {/* Progress Tracking */}
          <Card className="p-6 bg-white/90 shadow-sm border">
            <CardTitle className="text-lg flex items-center gap-2">
              <LineChart className="h-5 w-5 text-indigo-600" /> Progress Tracking Dashboard
            </CardTitle>
            <CardDescription className="mt-3 text-sm">
              Visualize performance over time and identify your strengths and areas to improve with metric trends.
            </CardDescription>
          </Card>

          {/* Scalable & Accessible */}
          <Card className="p-6 bg-white/90 shadow-sm border">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-rose-600" /> Scalable & Accessible
            </CardTitle>
            <CardDescription className="mt-3 text-sm">
              Ideal for individuals and institutions. Web-based and accessible from any device.
            </CardDescription>
          </Card>

          {/* Multi-Technology Support */}
          <Card className="p-6 bg-white/90 shadow-sm border">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="h-5 w-5 text-amber-600" /> Multi-Technology Support
            </CardTitle>
            <CardDescription className="mt-3 text-sm">
              Powered by Whisper for speech recognition, Vapi AI/WebRTC for real-time voice, and OpenAI GPT for analysis and feedback.
            </CardDescription>
          </Card>

          {/* Resume Analyzer */}
          <Card className="p-6 bg-white/90 shadow-sm border">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" /> Resume Analyzer
            </CardTitle>
            <CardDescription className="mt-3 text-sm">
              Upload your resume to get an ATS score, suggested improvements, missing skills, and recommended interview topics.
            </CardDescription>
            <div className="mt-4">
              <a href="/resume-analyzer">
                <Button variant="soft" className="card-hover">Try Resume Analyzer</Button>
              </a>
            </div>
          </Card>
        </div>

        {/* Tech badges */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Technologies We Use</h2>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100">Whisper</Badge>
            <Badge className="bg-sky-50 text-sky-700 border border-sky-100">Vapi AI</Badge>
            <Badge className="bg-purple-50 text-purple-700 border border-purple-100">WebRTC</Badge>
            <Badge className="bg-gray-900 text-white">OpenAI GPT</Badge>
          </div>
        </div>

        {/* Start Options */}
        <div className="p-6 rounded-2xl border bg-gradient-to-r from-white to-emerald-50 shadow-sm">
          <div className="flex items-start justify-between flex-col md:flex-row gap-6">
            <div className="max-w-xl">
              <h3 className="text-xl font-semibold">Start Practicing</h3>
              <p className="text-sm text-neutral-700 mt-1">Choose how you want to practice — quick browser voice-to-text or a full voice call with our AI agent.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
              <a href="/take-interview" className="w-full sm:w-auto">
                <Button variant="gradient" className="w-full card-hover">
                  Take Interview
                </Button>
              </a>
              <a href="/machine-interview" className="w-full sm:w-auto">
                <Button variant="soft" className="w-full card-hover">
                  Machine Interview
                </Button>
              </a>
              <a href="/resume-analyzer" className="w-full sm:w-auto">
                <Button variant="soft" className="w-full card-hover">
                  Resume Analyzer
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="text-xs text-neutral-500">
          Meerut, India • Contact: anubhav.singh.cse.20222miet.ac.in
        </div>
      </Container>
    </div>
  );
};

export default ServicesPage;
