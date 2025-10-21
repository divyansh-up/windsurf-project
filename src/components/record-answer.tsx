/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth } from "@clerk/clerk-react";
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { toast } from "sonner";
import { chatSession } from "@/scripts";
import { SaveModal } from "./save-modal";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
  content_relevance: number;
  fluency: number;
  tone: number;
  clarity: number;
}

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
}: RecordAnswerProps) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    error,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { userId } = useAuth();
  const { interviewId } = useParams();

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();

      if (userAnswer?.length < 30) {
        toast.error("Error", {
          description: "Your answer should be more than 30 characters",
        });

        return;
      }

      //   ai result
      const aiResult = await generateResult(
        question.question,
        question.answer,
        userAnswer
      );

      setAiResult(aiResult);
    } else {
      try {
        // Pre-warm microphone permission to avoid silent failures in some browsers
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        toast.error("Microphone blocked", {
          description:
            "Please allow microphone access in your browser and try again.",
        });
        return;
      }
      startSpeechToText();
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Parse the clean JSON text into an object
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);
    const prompt = `
      You are evaluating a mock interview response.
      Provide concise, structured scoring on the following dimensions from 1 to 10:
      - content_relevance: How well the answer addresses the key points in the correct answer.
      - fluency: Speech/answer flow and coherence.
      - tone: Professional and confident tone appropriateness.
      - clarity: Clarity and organization of the answer.

      Also provide an overall ratings (1-10) and a short actionable feedback string.

      Return ONLY valid JSON (no comments, code fences, or markdown). Keys must be:
      {
        "ratings": number,
        "feedback": string,
        "content_relevance": number,
        "fluency": number,
        "tone": number,
        "clarity": number
      }

      Question: "${qst}"
      Correct Answer: "${qstAns}"
      User Answer: "${userAns}"
    `;

    try {
      const aiResult = await chatSession.sendMessage(prompt);

      const parsedResult: AIResponse = cleanJsonResponse(
        aiResult.response.text()
      );
      return parsedResult;
    } catch (error) {
      console.log(error);
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      return {
        ratings: 0,
        feedback: "Unable to generate feedback",
        content_relevance: 0,
        fluency: 0,
        tone: 0,
        clarity: 0,
      };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    stopSpeechToText();
    startSpeechToText();
  };

  const saveUserAnswer = async () => {
    setLoading(true);

    if (!aiResult) {
      return;
    }

    const currentQuestion = question.question;
    try {
      // query the firbase to check if the user answer already exists for this question

      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", currentQuestion)
      );

      const querySnap = await getDocs(userAnswerQuery);

      // if the user already answerd the question dont save it again
      if (!querySnap.empty) {
        console.log("Query Snap Size", querySnap.size);
        toast.info("Already Answered", {
          description: "You have already answered this question",
        });
        return;
      } else {
        // save the user answer

        await addDoc(collection(db, "userAnswers"), {
          mockIdRef: interviewId,
          question: question.question,
          correct_ans: question.answer,
          user_ans: userAnswer,
          feedback: aiResult.feedback,
          rating: aiResult.ratings,
          content_relevance: aiResult.content_relevance,
          fluency: aiResult.fluency,
          tone: aiResult.tone,
          clarity: aiResult.clarity,
          userId,
          createdAt: serverTimestamp(),
        });

        toast("Saved", { description: "Your answer has been saved.." });
      }

      setUserAnswer("");
      stopSpeechToText();
    } catch (error) {
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(!open);
    }
  };

  useEffect(() => {
    const combineTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");

    setUserAnswer(combineTranscripts);
  }, [results]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4">
      {/* save modal */}
      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveUserAnswer}
        loading={loading}
      />

      <div className="w-full h-[400px] md:w-[560px] flex flex-col items-center justify-center rounded-xl border bg-muted/30 p-4 shadow-sm">
        {isWebCam ? (
          <WebCam
            onUserMedia={() => setIsWebCam(true)}
            onUserMediaError={() => setIsWebCam(false)}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground" />
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <TooltipButton
          content={isWebCam ? "Turn Off" : "Turn On"}
          icon={
            isWebCam ? (
              <VideoOff className="min-w-5 min-h-5" />
            ) : (
              <Video className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setIsWebCam(!isWebCam)}
        />

        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          icon={
            isRecording ? (
              <CircleStop className="min-w-5 min-h-5" />
            ) : (
              <Mic className="min-w-5 min-h-5" />
            )
          }
          onClick={recordUserAnswer}
        />

        <TooltipButton
          content="Record Again"
          icon={<RefreshCw className="min-w-5 min-h-5" />}
          onClick={recordNewAnswer}
        />

        <TooltipButton
          content="Save Result"
          icon={
            isAiGenerating ? (
              <Loader className="min-w-5 min-h-5 animate-spin" />
            ) : (
              <Save className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setOpen(!open)}
          disbaled={!aiResult}
        />
      </div>

      <div className="w-full mt-4 p-5 rounded-xl bg-white shadow-sm border">
        <h2 className="text-lg font-semibold">Your Answer:</h2>

        <p className="text-sm mt-2 text-gray-700 whitespace-normal">
          {userAnswer || "Start recording to see your answer here"}
        </p>

        {interimResult && (
          <p className="text-sm text-gray-500 mt-2">
            <strong>Current Speech:</strong>
            {interimResult}
          </p>
        )}

        {isRecording && (
          <p className="text-xs text-emerald-600 mt-2">Recording… Speak now.</p>
        )}

        {error && (
          <p className="text-xs text-red-600 mt-2">
            Speech error: {String(error)}. Ensure you are using Chrome on
            localhost or HTTPS and microphone permission is allowed.
          </p>
        )}

        {aiResult && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="p-3 rounded-lg border bg-emerald-50">
              <p className="text-sm text-gray-600">Overall</p>
              <p className="text-emerald-700 text-xl font-semibold">
                {aiResult.ratings} / 10
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-sky-50">
              <p className="text-sm text-gray-600">Content Rel.</p>
              <p className="text-gray-800 text-lg font-semibold">
                {aiResult.content_relevance}
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-sky-50">
              <p className="text-sm text-gray-600">Fluency</p>
              <p className="text-gray-800 text-lg font-semibold">
                {aiResult.fluency}
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-sky-50">
              <p className="text-sm text-gray-600">Tone</p>
              <p className="text-gray-800 text-lg font-semibold">
                {aiResult.tone}
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-sky-50">
              <p className="text-sm text-gray-600">Clarity</p>
              <p className="text-gray-800 text-lg font-semibold">
                {aiResult.clarity}
              </p>
            </div>
            <div className="md:col-span-5 p-3 rounded-lg border bg-yellow-50">
              <p className="text-sm text-gray-700 font-medium">Feedback</p>
              <p className="text-gray-800 text-sm mt-1">{aiResult.feedback}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
