import { Container } from "@/components/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Mic, Brain, Radio } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="w-full">
      <div className="w-full bg-gradient-to-r from-emerald-50 to-sky-50 border-b">
        <Container className="py-12 md:py-16">
          <div className="space-y-3">
            <span className="px-3 py-1 text-xs rounded-full bg-white border text-emerald-700">About Us</span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">INTERVIEWER HUB</h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
              Interview Hub is an AI-powered platform designed to revolutionize interview preparation. In today’s competitive job market,
              traditional mock interviews are often limited by time, availability, and consistency. Our platform overcomes these challenges by
              providing real-time, voice-based mock interviews that simulate both technical and behavioral scenarios.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-10 md:py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white/90 shadow-sm border">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mic className="h-5 w-5 text-emerald-600" /> Voice-first Practice
            </CardTitle>
            <CardDescription className="mt-3 text-sm">
              Real-time, voice-based mock interviews to simulate real conversations and improve fluency, tone, and clarity.
            </CardDescription>
          </Card>

          <Card className="p-6 bg-white/90 shadow-sm border">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-sky-600" /> Instant AI Feedback
            </CardTitle>
            <CardDescription className="mt-3 text-sm">
              Multi-metric feedback on content relevance, fluency, tone, and clarity powered by modern LLMs.
            </CardDescription>
          </Card>

          <Card className="p-6 bg-white/90 shadow-sm border">
            <CardTitle className="text-lg flex items-center gap-2">
              <Radio className="h-5 w-5 text-purple-600" /> Scalable & Accessible
            </CardTitle>
            <CardDescription className="mt-3 text-sm">
              Built to serve students, job seekers, and institutions with a user-friendly and scalable experience.
            </CardDescription>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Technologies</h2>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100">Whisper (Speech-to-Text)</Badge>
            <Badge className="bg-sky-50 text-sky-700 border border-sky-100">Vapi AI</Badge>
            <Badge className="bg-purple-50 text-purple-700 border border-purple-100">WebRTC</Badge>
            <Badge className="bg-gray-900 text-white">OpenAI GPT</Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-4xl">
            Using advanced AI and voice technologies such as Whisper (speech-to-text), Vapi AI, WebRTC, and OpenAI GPT, Interview Hub delivers
            instant feedback and a progress-tracking dashboard, helping users identify strengths, improve weaknesses, and build confidence.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Mission</h2>
          <Card className="p-6 bg-white/90 shadow-sm border">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-emerald-100">
                <Sparkles className="h-5 w-5 text-emerald-700" />
              </div>
              <p className="text-sm text-neutral-700">
                At Interview Hub, our mission is to empower every candidate to succeed with confidence and competence.
                The system is scalable, accessible, and user-friendly, making it ideal for students, job seekers, and institutions aiming to enhance interview readiness.
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Team Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5 border bg-white/90">
              <CardTitle className="text-base">Anubhav Singh</CardTitle>
              <CardDescription className="mt-1">Leader</CardDescription>
            </Card>
            <Card className="p-5 border bg-white/90">
              <CardTitle className="text-base">Anubhav Tyagi</CardTitle>
              <CardDescription className="mt-1">Member</CardDescription>
            </Card>
            <Card className="p-5 border bg-white/90">
              <CardTitle className="text-base">Divyansh Agarwal</CardTitle>
              <CardDescription className="mt-1">Member</CardDescription>
            </Card>
            <Card className="p-5 border bg-white/90">
              <CardTitle className="text-base">Deepak Som</CardTitle>
              <CardDescription className="mt-1">Member</CardDescription>
            </Card>
          </div>
        </div>

        <div className="text-xs text-neutral-500">
          Meerut, India • Contact: anubhav.singh.cse.20222miet.ac.in
        </div>
      </Container>
    </div>
  );
};

export default AboutPage;
