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

type JobItem = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  skills?: string[];
  requirements?: Record<string, number>;
  cultureVector?: number[];
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

// Flatten scores + culture as concatenated array of numbers (no keys)
const flattenScoresOrdered = (scores: Record<string, any>, cultureVector?: number[]): number[] => {
  // Extract CV scores values in CATEGORIES order
  const flatScores = CATEGORIES.map((cat) => Number(scores[cat]) || 0);

  // Append culture vector array directly, or 12 zeros if missing
  const flatCulture = Array.isArray(cultureVector) ? cultureVector.map((v) => Number(v) || 0) : Array(12).fill(0);

  return [...flatScores, ...flatCulture];
};

// Manual cosine similarity function
const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) {
    console.warn("Vectors have different lengths:", a.length, b.length);
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const Jobs = () => {
  const [skillMatch, setSkillMatch] = useState(70);
  const [cultureMatch, setCultureMatch] = useState(70);

  const [user_data_scores, setuser_data_scores] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem("user_data_scores") || "{}";
      console.log("Loaded user_data_scores from localStorage:", saved);
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing user_data_scores:", e);
      return {};
    }
  });

  const [jobs, setJobs] = useState<JobItem[]>(() => {
    try {
      const saved = localStorage.getItem("jobs") || "[]";
      console.log("Loaded jobs from localStorage:", saved);
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) {
      console.error("Error parsing jobs from localStorage:", e);
    }
    // enrich fallback with neutral requirements (5)
    const neutral: Record<string, number> = {};
    CATEGORIES.forEach((c) => (neutral[c] = 5));
    return fallbackJobs.map((j) => ({ ...j, requirements: { ...neutral }, cultureVector: Array(12).fill(0) }));
  });

  useEffect(() => {
    const onStorage = () => {
      try {
        const updatedScores = localStorage.getItem("user_data_scores") || "{}";
        console.log("Storage event: updating user_data_scores:", updatedScores);
        setuser_data_scores(JSON.parse(updatedScores));
      } catch (e) {
        console.error("Error parsing user_data_scores on storage event:", e);
      }
      try {
        const saved = localStorage.getItem("jobs") || "[]";
        console.log("Storage event: updating jobs:", saved);
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setJobs(parsed);
      } catch (e) {
        console.error("Error parsing jobs on storage event:", e);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const ranked = useMemo(() => {
    console.log("Computing ranked jobs with user_data_scores:", user_data_scores);

    // user_data_scores is assumed to have CV scores as keys (any order) and a separate cultureVector array
    const userCultureVec: number[] = Array.isArray(user_data_scores.cultureVector)
      ? user_data_scores.cultureVector
      : [];

    // flatten user CV scores + culture vector as concatenated list
    const flatUser = flattenScoresOrdered(user_data_scores, userCultureVec);
    console.log("Flattened user_data_scores + culture:", flatUser);

    const rankedList = [...jobs]
      .map((job) => {
        // flatten job requirements and culture vector to list of numbers
        const flatJob = flattenScoresOrdered(job.requirements || {}, job.cultureVector);
        console.log(`Job ID ${job.id} flattened requirements + culture:`, flatJob);
        const sim = cosineSimilarity(flatUser, flatJob);
        console.log(`Job ID ${job.id} similarity:`, sim);
        return { ...job, similarity: sim };
      })
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

    console.log("Ranked jobs:", rankedList);
    return rankedList;
  }, [jobs, user_data_scores]);

  return (
    <div>
      <SEO
        title="Jobs – Smart recommendations | InstaConnect"
        description="Search jobs with powerful filters and see transparent compatibility scores across skills, culture, and experience."
      />

      <section className="border-b">
        <div className="container mx-auto py-10 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Find your next role</h1>
          <p className="text-muted-foreground mt-2">
            Filter by industry, location, and match scores to discover high-fit opportunities.
          </p>
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
              <Slider defaultValue={[skillMatch]} max={100} step={5} onValueChange={(v) => setSkillMatch(v[0])} />
            </div>
            <div className="space-y-2">
              <Label>Min culture match {cultureMatch}%</Label>
              <Slider defaultValue={[cultureMatch]} max={100} step={5} onValueChange={(v) => setCultureMatch(v[0])} />
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
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-4 w-4" /> {job.company}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {job.location}
                    </span>
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
                    {job.skills.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
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
