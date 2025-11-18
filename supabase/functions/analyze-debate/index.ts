import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DebateTranscript {
  speaker: string;
  text: string;
  timestamp: string;
}

interface AnalysisRequest {
  sessionId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid authentication");
    }

    const { sessionId }: AnalysisRequest = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const { data: session, error: sessionError } = await supabase
      .from("debate_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found or unauthorized");
    }

    const { data: transcripts, error: transcriptsError } = await supabase
      .from("debate_transcripts")
      .select("speaker, text, timestamp")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    if (transcriptsError) {
      throw new Error("Failed to fetch transcripts");
    }

    if (!transcripts || transcripts.length === 0) {
      throw new Error("No transcripts found for this session");
    }

    const userTranscripts = transcripts.filter((t: DebateTranscript) => t.speaker === "user");
    const partnerTranscripts = transcripts.filter((t: DebateTranscript) => t.speaker === "partner");

    let analysis;

    if (openaiApiKey) {
      const conversationText = transcripts
        .map((t: DebateTranscript) => `${t.speaker === "user" ? "You" : "Opponent"}: ${t.text}`)
        .join("\n");

      const prompt = `You are an expert debate coach analyzing a debate performance. Analyze the following debate transcript and provide detailed feedback.

Debate Topic: ${session.topic}
Debate Duration: ${session.duration_seconds ? Math.floor(session.duration_seconds / 60) : 'N/A'} minutes

Transcript:
${conversationText}

Provide a comprehensive analysis in the following JSON format:
{
  "overall_score": (0-100),
  "communication_score": (0-100),
  "argumentation_score": (0-100),
  "clarity_score": (0-100),
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "weak_portions": [{"text": "portion of debate", "reason": "why it was weak", "alternative": "better approach"}, ...],
  "key_insights": "overall feedback and recommendations"
}

Focus on:
1. Communication clarity and articulation
2. Quality of arguments and evidence
3. Logical reasoning and structure
4. Engagement and responsiveness
5. Areas needing improvement with specific examples
6. Alternative approaches for weak arguments`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are an expert debate coach providing constructive feedback." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        console.error("OpenAI API error:", await response.text());
        throw new Error("Failed to generate AI analysis");
      }

      const aiResponse = await response.json();
      analysis = JSON.parse(aiResponse.choices[0].message.content);
    } else {
      const totalWords = userTranscripts.reduce((sum: number, t: DebateTranscript) => sum + t.text.split(" ").length, 0);
      const avgWordsPerResponse = userTranscripts.length > 0 ? totalWords / userTranscripts.length : 0;

      const communicationScore = Math.min(100, Math.floor((userTranscripts.length / Math.max(partnerTranscripts.length, 1)) * 80));
      const argumentationScore = Math.min(100, Math.floor(avgWordsPerResponse * 3));
      const clarityScore = Math.max(0, 100 - (userTranscripts.filter((t: DebateTranscript) => t.text.split(" ").length < 5).length * 10));
      const overallScore = Math.floor((communicationScore + argumentationScore + clarityScore) / 3);

      const strengths = [];
      if (userTranscripts.length > 5) strengths.push("Active participation in the debate");
      if (avgWordsPerResponse > 15) strengths.push("Detailed and thoughtful responses");
      if (clarityScore > 70) strengths.push("Clear and coherent communication");

      const weaknesses = [];
      if (userTranscripts.length < 5) weaknesses.push("Limited participation - try to engage more");
      if (avgWordsPerResponse < 10) weaknesses.push("Responses are too brief - elaborate more");
      if (clarityScore < 50) weaknesses.push("Work on providing more complete responses");

      analysis = {
        overall_score: overallScore,
        communication_score: communicationScore,
        argumentation_score: argumentationScore,
        clarity_score: clarityScore,
        strengths: strengths.length > 0 ? strengths : ["Keep practicing to develop your strengths"],
        weaknesses: weaknesses.length > 0 ? weaknesses : ["Great performance overall!"],
        weak_portions: [],
        key_insights: `You participated ${userTranscripts.length} times with an average of ${avgWordsPerResponse.toFixed(1)} words per response. ${communicationScore > 70 ? 'Strong' : 'Moderate'} engagement level. Keep practicing to improve your debate skills!`,
      };
    }

    const { error: insertError } = await supabase
      .from("debate_analysis")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        overall_score: analysis.overall_score,
        communication_score: analysis.communication_score,
        argumentation_score: analysis.argumentation_score,
        clarity_score: analysis.clarity_score,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        key_insights: analysis.key_insights,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save analysis");
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});