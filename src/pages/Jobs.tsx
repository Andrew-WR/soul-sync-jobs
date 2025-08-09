import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Wallet, Sparkles, HeartHandshake } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "@/constants/categories";
import { similarity } from "@/lib/matching";
type JobItem = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  skills?: string[];
  requirements?: Record<string, number>;
  similarity?: number;
};

const fallbackJobs: JobItem[] = [
  {
    id: 1,
    title: "Frontend Engineer",
    company: "BlueWave Labs",
    location: "Remote / EU",
    salary: "$95k – $120k",
    skills: ["React", "TypeScript", "Design Systems"],
  },
  {
    id: 2,
    title: "Data Analyst",
    company: "Northstar Analytics",
    location: "Berlin, DE",
    salary: "$70k – $90k",
    skills: ["SQL", "Python", "Recharts"],
  },
];

const Jobs = () => {
  const [skillMatch, setSkillMatch] = useState(70);
  const [cultureMatch, setCultureMatch] = useState(70);
  const [userScores, setUserScores] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem("userScores") || "{}"); } catch { return {}; }
  });
  const [jobs, setJobs] = useState<JobItem[]>(() => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem("jobs") || "[]"); } catch { return []; } })();
    if (Array.isArray(saved) && saved.length) return saved;
    // enrich fallback with neutral requirements (5)
    const neutral: Record<string, number> = {};
    CATEGORIES.forEach((c) => (neutral[c] = 5));
    return fallbackJobs.map((j) => ({ ...j, requirements: { ...neutral } }));
  });

  useEffect(() => {
    const onStorage = () => {
      try { setUserScores(JSON.parse(localStorage.getItem("userScores") || "{}")); } catch {}
      try {
        const saved = JSON.parse(localStorage.getItem("jobs") || "[]");
        if (Array.isArray(saved)) setJobs(saved);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const ranked = useMemo(() => {
    return [...jobs]
      .map((job) => ({ ...job, similarity: similarity(userScores, job.requirements || {}) }))
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  }, [jobs, userScores]);
  return (
    <div>
      <SEO
        title="Jobs – Smart recommendations | InstaConnect"
        description="Search jobs with powerful filters and see transparent compatibility scores across skills, culture, and experience."
      />

      <section className="border-b">
        <div className="container mx-auto py-10 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Find your next role</h1>
          <p className="text-muted-foreground mt-2">Filter by industry, location, and match scores to discover high-fit opportunities.</p>
        </div>
      </section>

      <section className="container mx-auto py-6 md:py-8">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine job results</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4 items-end">
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="health">Healthcare</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="City or Remote" />
            </div>
            <div className="space-y-2">
              <Label>Min skill match {skillMatch}%</Label>
              <Slider defaultValue={[skillMatch]} max={100} step={5} onValueChange={(v)=>setSkillMatch(v[0])} />
            </div>
            <div className="space-y-2">
              <Label>Min culture match {cultureMatch}%</Label>
              <Slider defaultValue={[cultureMatch]} max={100} step={5} onValueChange={(v)=>setCultureMatch(v[0])} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {ranked.map((job) => (
            <Card key={job.id} className="card-hover">
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-accent" /> {job.title}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-4">
                    <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" /> {job.company}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                  </CardDescription>
                </div>
                <Badge className="text-sm">Similarity {Math.round(((job.similarity || 0) * 100))}%</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" /> {job.salary}
                </div>
                {job.skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {job.skills?.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <HeartHandshake className="h-4 w-4 text-accent" /> Culture fit insights available
                </div>
                <div className="flex justify-end">
                  <Button variant="hero">View & Apply</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Jobs;
