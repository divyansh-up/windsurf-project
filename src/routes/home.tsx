import { Sparkles } from "lucide-react";
import Marquee from "react-fast-marquee";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { MarqueImg } from "@/components/marquee-img";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex-col w-full pb-24">
      <Container>
        <div className="my-8">
          <h1 className="text-3xl text-center md:text-left md:text-6xl">
            <span className=" text-outline font-extrabold md:text-8xl">
              INTERVIEWER HUB
            </span>
            <span className="text-gray-500 font-extrabold">
              — Practice. Improve. Ace.
            </span>
            <br />
            AI-driven mock interviews with instant, actionable feedback
          </h1>

          <p className="mt-4 text-muted-foreground text-sm">
            A smart mock interview platform to sharpen your skills across domains
            with voice-enabled practice and multi-metric evaluation.
          </p>
        </div>

        <div className="flex w-full items-center justify-evenly md:px-12 md:py-16 md:items-center md:justify-end gap-12">
          <p className="text-3xl font-semibold text-gray-900 text-center">
            250k+
            <span className="block text-xl text-muted-foreground font-normal">
              Offers Recieved
            </span>
          </p>
          <p className="text-3xl font-semibold text-gray-900 text-center">
            1.2M+
            <span className="block text-xl text-muted-foreground font-normal">
              Interview Aced
            </span>
          </p>
        </div>

        {/* image section */}
        <div className="w-full mt-4 rounded-xl bg-gray-100 h-[420px] drop-shadow-md overflow-hidden relative">
          <img
            src="/assets/img/hero.jpg"
            alt=""
            className="w-full h-full object-cover"
          />

          <div className="absolute top-4 left-4 px-4 py-2 rounded-md bg-white/40 backdrop-blur-md">
            INTERVIEWER HUB &copy;
          </div>

          <div className="hidden md:block absolute w-80 bottom-4 right-4 px-4 py-3 rounded-md bg-white/70 backdrop-blur-md space-y-2">
            <h2 className="text-neutral-800 font-semibold">Project Team</h2>
            <p className="text-sm text-neutral-600">
              Leader: <span className="font-semibold">Anubhav Singh</span>
              <br />
              Members: Deepak Som, Divyansh Agarwal, Anubhav Tyagi
              <br />
              Meerut, India • anubhav.singh.cse.20222miet.ac.in
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link to={"/take-interview"}>
                <Button variant="gradient" className="w-full shadow-lg">Take Interview</Button>
              </Link>
              <Link to={"/machine-interview"}>
                <Button variant="soft" className="w-full shadow">Machine Interview</Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {/* marquee section */}
      <div className=" w-full my-12">
        <Marquee pauseOnHover>
          <MarqueImg img="/assets/img/logo/firebase.png" />
          <MarqueImg img="/assets/img/logo/meet.png" />
          <MarqueImg img="/assets/img/logo/zoom.png" />
          <MarqueImg img="/assets/img/logo/firebase.png" />
          <MarqueImg img="/assets/img/logo/microsoft.png" />
          <MarqueImg img="/assets/img/logo/meet.png" />
          <MarqueImg img="/assets/img/logo/tailwindcss.png" />
          <MarqueImg img="/assets/img/logo/microsoft.png" />
        </Marquee>
      </div>

      <Container className="py-8 space-y-8">
        <h2 className="tracking-wide text-xl text-gray-800 font-semibold">
          Unleash your potential with personalized AI insights and targeted
          interview practice.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="col-span-1 md:col-span-3">
            <img
              src="/assets/img/office.jpg"
              alt=""
              className="w-full max-h-96 rounded-md object-cover"
            />
          </div>

          <div className="col-span-1 md:col-span-2 gap-8 max-h-96 min-h-96 w-full flex flex-col items-center justify-center text-center">
            <p className="text-center text-muted-foreground">
              Built by a passionate team from Meerut, INTERVIEWER HUB helps you
              prepare smarter with domain-specific questions, real-time voice
              capture, and instant feedback on relevance, fluency, tone, and clarity.
            </p>

            <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link to={"/take-interview"} className="w-full sm:w-auto">
                <Button variant="gradient" className="w-full sm:w-56 shadow-lg">
                  Take Interview <Sparkles className="ml-2" />
                </Button>
              </Link>
              <Link to={"/machine-interview"} className="w-full sm:w-auto">
                <Button variant="soft" className="w-full sm:w-56 shadow">
                  Machine Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Team credit section */}
        <div className="mt-10 text-center text-xs text-neutral-500">
          Project: <span className="font-semibold">INTERVIEWER HUB</span> • Leader: <span className="font-semibold">Anubhav Singh</span> • Members: Deepak Som, Divyansh Agarwal, Anubhav Tyagi • Contact: anubhav.singh.cse.20222miet.ac.in • Meerut, India
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
