import { db } from "@/config/firebase.config";
import { Interview, UserAnswer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Headings } from "@/components/headings";
import { InterviewPin } from "@/components/pin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { CircleCheck, Star } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const Feedback = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [activeFeed, setActiveFeed] = useState("");
  const { userId } = useAuth();
  const navigate = useNavigate();

  if (!interviewId) {
    return <Navigate to="/generate" replace />;
  }
  useEffect(() => {
    if (interviewId) {
      const fetchInterview = async () => {
        if (interviewId) {
          try {
            const interviewDoc = await getDoc(
              doc(db, "interviews", interviewId)
            );
            if (interviewDoc.exists()) {
              setInterview({
                id: interviewDoc.id,
                ...interviewDoc.data(),
              } as Interview);
            }
          } catch (error) {
            console.log(error);
          }
        }
      };

      const fetchFeedbacks = async () => {
        setIsLoading(true);
        try {
          const querSanpRef = query(
            collection(db, "userAnswers"),
            where("userId", "==", userId),
            where("mockIdRef", "==", interviewId)
          );

          const querySnap = await getDocs(querSanpRef);

          const interviewData: UserAnswer[] = querySnap.docs.map((doc) => {
            return { id: doc.id, ...doc.data() } as UserAnswer;
          });

          setFeedbacks(interviewData);
        } catch (error) {
          console.log(error);
          toast("Error", {
            description: "Something went wrong. Please try again later..",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchInterview();
      fetchFeedbacks();
    }
  }, [interviewId, navigate, userId]);

  //   calculate the ratings out of 10

  const overAllRating = useMemo(() => {
    if (feedbacks.length === 0) return "0.0";

    const totalRatings = feedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );

    return (totalRatings / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const metricsAverages = useMemo(() => {
    if (feedbacks.length === 0) {
      return {
        content_relevance: "0.0",
        fluency: "0.0",
        tone: "0.0",
        clarity: "0.0",
      };
    }

    const safe = (n: number | undefined) => (typeof n === "number" ? n : 0);

    const sum = feedbacks.reduce(
      (acc, f) => {
        acc.content_relevance += safe(f.content_relevance);
        acc.fluency += safe(f.fluency);
        acc.tone += safe(f.tone);
        acc.clarity += safe(f.clarity);
        return acc;
      },
      { content_relevance: 0, fluency: 0, tone: 0, clarity: 0 }
    );

    const countCR = feedbacks.filter((f) => typeof f.content_relevance === "number").length || feedbacks.length;
    const countFl = feedbacks.filter((f) => typeof f.fluency === "number").length || feedbacks.length;
    const countTo = feedbacks.filter((f) => typeof f.tone === "number").length || feedbacks.length;
    const countCl = feedbacks.filter((f) => typeof f.clarity === "number").length || feedbacks.length;

    return {
      content_relevance: (sum.content_relevance / countCR).toFixed(1),
      fluency: (sum.fluency / countFl).toFixed(1),
      tone: (sum.tone / countTo).toFixed(1),
      clarity: (sum.clarity / countCl).toFixed(1),
    };
  }, [feedbacks]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrumb
          breadCrumbPage={"Feedback"}
          breadCrumpItems={[
            { label: "Mock Interviews", link: "/generate" },
            {
              label: `${interview?.position}`,
              link: `/generate/interview/${interview?.id}`,
            },
          ]}
        />
      </div>

      <Headings
        title="Congratulations !"
        description="Your personalized feedback is now available. Dive in to see your strengths, areas for improvement, and tips to help you ace your next interview."
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 shadow-sm border rounded-lg">
          <CardTitle className="text-sm text-gray-600">Overall</CardTitle>
          <CardDescription className="text-emerald-600 text-2xl font-semibold">
            {overAllRating} / 10
          </CardDescription>
        </Card>
        <Card className="p-4 shadow-sm border rounded-lg">
          <CardTitle className="text-sm text-gray-600">Content Relevance</CardTitle>
          <CardDescription className="text-gray-800 text-xl font-semibold">
            {metricsAverages.content_relevance} / 10
          </CardDescription>
        </Card>
        <Card className="p-4 shadow-sm border rounded-lg">
          <CardTitle className="text-sm text-gray-600">Fluency</CardTitle>
          <CardDescription className="text-gray-800 text-xl font-semibold">
            {metricsAverages.fluency} / 10
          </CardDescription>
        </Card>
        <Card className="p-4 shadow-sm border rounded-lg">
          <CardTitle className="text-sm text-gray-600">Tone</CardTitle>
          <CardDescription className="text-gray-800 text-xl font-semibold">
            {metricsAverages.tone} / 10
          </CardDescription>
        </Card>
        <Card className="p-4 shadow-sm border rounded-lg">
          <CardTitle className="text-sm text-gray-600">Clarity</CardTitle>
          <CardDescription className="text-gray-800 text-xl font-semibold">
            {metricsAverages.clarity} / 10
          </CardDescription>
        </Card>
      </div>

      {interview && <InterviewPin interview={interview} onMockPage />}

      <Headings title="Interview Feedback" isSubHeading />

      {feedbacks && (
        <Accordion type="single" collapsible className="space-y-6">
          {feedbacks.map((feed) => (
            <AccordionItem
              key={feed.id}
              value={feed.id}
              className="border rounded-lg shadow-md"
            >
              <AccordionTrigger
                onClick={() => setActiveFeed(feed.id)}
                className={cn(
                  "px-5 py-3 flex items-center justify-between text-base rounded-t-lg transition-colors hover:no-underline",
                  activeFeed === feed.id
                    ? "bg-gradient-to-r from-purple-50 to-blue-50"
                    : "hover:bg-gray-50"
                )}
              >
                <span>{feed.question}</span>
              </AccordionTrigger>

              <AccordionContent className="px-5 py-6 bg-white rounded-b-lg space-y-5 shadow-inner">
                <div className="text-lg font-semibold to-gray-700">
                  <Star className="inline mr-2 text-yellow-400" />
                  Rating : {feed.rating}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="border-none p-3 bg-sky-50 rounded-lg">
                    <CardTitle className="text-sm">Content Rel.</CardTitle>
                    <CardDescription className="text-base font-medium">
                      {typeof feed.content_relevance === "number" ? feed.content_relevance : "-"}
                    </CardDescription>
                  </Card>
                  <Card className="border-none p-3 bg-sky-50 rounded-lg">
                    <CardTitle className="text-sm">Fluency</CardTitle>
                    <CardDescription className="text-base font-medium">
                      {typeof feed.fluency === "number" ? feed.fluency : "-"}
                    </CardDescription>
                  </Card>
                  <Card className="border-none p-3 bg-sky-50 rounded-lg">
                    <CardTitle className="text-sm">Tone</CardTitle>
                    <CardDescription className="text-base font-medium">
                      {typeof feed.tone === "number" ? feed.tone : "-"}
                    </CardDescription>
                  </Card>
                  <Card className="border-none p-3 bg-sky-50 rounded-lg">
                    <CardTitle className="text-sm">Clarity</CardTitle>
                    <CardDescription className="text-base font-medium">
                      {typeof feed.clarity === "number" ? feed.clarity : "-"}
                    </CardDescription>
                  </Card>
                </div>

                <Card className="border-none space-y-3 p-4 bg-green-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-green-600" />
                    Expected Answer
                  </CardTitle>

                  <CardDescription className="font-medium text-gray-700">
                    {feed.correct_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4 bg-yellow-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-yellow-600" />
                    Your Answer
                  </CardTitle>

                  <CardDescription className="font-medium text-gray-700">
                    {feed.user_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4 bg-red-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-red-600" />
                    Feedback
                  </CardTitle>

                  <CardDescription className="font-medium text-gray-700">
                    {feed.feedback}
                  </CardDescription>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};
