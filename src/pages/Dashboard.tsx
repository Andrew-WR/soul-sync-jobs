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

const radarData = [
  { trait: "Pace", user: 7, typical: 5 },
  { trait: "Autonomy", user: 8, typical: 6 },
  { trait: "Collab", user: 6, typical: 7 },
  { trait: "Structure", user: 4, typical: 6 },
  { trait: "Innovation", user: 9, typical: 6 },
];

const Dashboard = () => {
  const [skills, setSkills] = useState({ React: 7, "Data Viz": 5, Leadership: 6 });

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
              <div className="text-sm text-muted-foreground">Drag & drop your CV here, or click to browse</div>
              <div className="mt-2 text-xs text-muted-foreground">PDF or DOCX · Max 5MB</div>
              <input id="cv" type="file" className="hidden" accept=".pdf,.doc,.docx" />
            </label>
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
