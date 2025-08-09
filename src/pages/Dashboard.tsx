import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useToast } from "@/components/ui/use-toast";
import { CATEGORIES } from "@/constants/categories";
const radarData = [
  { trait: "Pace", user: 7, typical: 5 },
  { trait: "Autonomy", user: 8, typical: 6 },
  { trait: "Collab", user: 6, typical: 7 },
  { trait: "Structure", user: 4, typical: 6 },
  { trait: "Innovation", user: 9, typical: 6 },
];

const Dashboard = () => {
  const [skills, setSkills] = useState({ React: 7, "Data Viz": 5, Leadership: 6 });
  const [cvLoading, setCvLoading] = useState(false);
  const [cvScores, setCvScores] = useState<Record<string, number> | null>(() => {
    try {
      const saved = localStorage.getItem("userScores");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const { toast } = useToast();

  const handleCvUpload = async (file: File) => {
    if (!file) return;
    setCvLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/functions/v1/parse-cv-gemini", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to analyze CV");
      }
      const data = await res.json();
      const scores = data.scores as Record<string, number>;
      setCvScores(scores);
      localStorage.setItem("userScores", JSON.stringify(scores));
      toast({ title: "CV analyzed", description: "Scores updated from Gemini." });
    } catch (e) {
      console.error(e);
      toast({ title: "CV analysis failed", description: "Please set GEMINI_API_KEY in Supabase secrets and try again.", variant: "destructive" as any });
    } finally {
      setCvLoading(false);
    }
  };
  return (
    <div>
      <SEO
        title="Dashboard – Build your profile | InstaConnect"
        description="Build your InstaConnect profile: set preferences, upload CV, and visualize your culture map to get tailored job matches."
      />

      <section className="relative border-b">
        <div className="absolute inset-0 surface-spotlight" aria-hidden />
        <div className="container mx-auto py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Build your profile</h1>
          <p className="text-muted-foreground mt-2">Step 1 of 5 · Core skills</p>
        </div>
      </section>

      <section className="container mx-auto py-8 md:py-12 grid gap-6 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Core skills</CardTitle>
            <CardDescription>Self-rate key skills to start fine-tuning your matches.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(skills).map(([label, value]) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">{value}/10</span>
                </div>
                <Slider
                  defaultValue={[value]}
                  max={10}
                  step={1}
                  onValueChange={(v) => setSkills((s) => ({ ...s, [label]: v[0] }))}
                />
              </div>
            ))}
            <div className="flex justify-end">
              <Button variant="hero">Continue</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>CV Upload</CardTitle>
            <CardDescription>Upload your CV to auto-extract skills and experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="cv"
              className="block rounded-lg border border-dashed p-8 text-center cursor-pointer bg-secondary/40 hover:bg-secondary/60 interactive"
            >
              <div className="text-sm text-muted-foreground">{cvLoading ? "Analyzing CV with Gemini..." : "Drag & drop your CV here, or click to browse"}</div>
              <div className="mt-2 text-xs text-muted-foreground">PDF or DOCX · Max 5MB</div>
              <input
                id="cv"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCvUpload(f);
                }}
              />
            </label>
            {cvScores && (
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {CATEGORIES.map((c) => (
                  <div key={c} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{c}</span>
                    <span className="font-medium">{Math.round(((cvScores?.[c] ?? 0) + Number.EPSILON) * 10) / 10}/10</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 card-hover">
          <CardHeader>
            <CardTitle>Culture map</CardTitle>
            <CardDescription>Compare your preferences to typical company cultures.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid />
                <PolarAngleAxis dataKey="trait" tick={{ fill: "currentColor" }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "currentColor" }} />
                <Radar name="You" dataKey="user" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
                <Radar name="Typical" dataKey="typical" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
