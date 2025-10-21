import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Phone, Send, MapPin, Linkedin, Github } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-sky-50 to-emerald-50 border-b">
        <Container className="py-14 md:py-20">
          <div className="max-w-3xl space-y-4">
            <span className="px-3 py-1 text-xs rounded-full bg-white border text-emerald-700">We'd love to hear from you</span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Get in touch
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Questions, feedback, partnerships, or support—drop us a line and we’ll get back within 1–2 business days.
            </p>
          </div>
        </Container>
      </div>

      {/* Content Section */}
      <Container className="py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left: Contact Info */}
          <div className="md:col-span-2 space-y-4">
            <Card className="p-5 bg-white/80">
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4 text-emerald-600" /> Phone
              </CardTitle>
              <CardDescription className="mt-2">+1 (555) 123-4567</CardDescription>
            </Card>

            <Card className="p-5 bg-white/80">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-emerald-600" /> Email
              </CardTitle>
              <CardDescription className="mt-2">anubhav.singh.cse.20222miet.ac.in</CardDescription>
            </Card>

            <Card className="p-5 bg-white/80">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-emerald-600" /> Office
              </CardTitle>
              <CardDescription className="mt-2">Meerut, India</CardDescription>
            </Card>

            <div className="flex items-center gap-3 pt-2">
              <a href="https://www.linkedin.com" target="_blank" className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <a href="https://github.com" target="_blank" className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900">
                <Github className="h-4 w-4" /> GitHub
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="md:col-span-3">
            <Card className="p-6 md:p-8 shadow-sm border bg-white/90">
              <div className="flex items-start gap-3 mb-6">
                <div className="p-2 rounded-md bg-emerald-100">
                  <MessageSquare className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Send us a message</h2>
                  <p className="text-sm text-muted-foreground">We usually reply within 24–48 hours.</p>
                </div>
              </div>

              <form
                className="grid grid-cols-1 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Message sent!");
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" placeholder="Your Name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="How can we help?" />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" placeholder="Write your message..." className="min-h-32" required />
                </div>

                <div className="flex items-center justify-end">
                  <Button type="submit" className="gap-2">
                    <Send className="h-4 w-4" /> Send Message
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ContactPage;
