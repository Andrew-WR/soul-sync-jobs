import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
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
  const cultureOptions = [
    "Flexible PTO",
    "Work from Home",
    "Fast-paced",
    "Collaborative",
    "Autonomous",
    "Structured",
    "Innovation-driven",
    "Mentorship culture",
    "Diverse & Inclusive",
    "Work-life Balance",
    "Global team",
    "Flat hierarchy",
  ];
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load previously selected culture indices from localStorage (if present)
  const [selectedCultures, setSelectedCultures] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("user_data_scores");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed?.cultureVector)) {
        return parsed.cultureVector
          .map((val: number, idx: number) => (val === 1 ? idx : -1))
          .filter((idx: number) => idx !== -1);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const toggleCulture = (idx: number) => {
    setSelectedCultures((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Load CV scores from localStorage on initialization (flattened object -> extract categories)
  const [cvScores, setCvScores] = useState<Record<string, number> | null>(() => {
    try {
      const saved = localStorage.getItem("user_data_scores");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const scores: Record<string, number> = {};
      CATEGORIES.forEach((c) => {
        if (typeof parsed[c] === "number") scores[c] = parsed[c];
      });
      return Object.keys(scores).length ? scores : null;
    } catch {
      return null;
    }
  });

  const { toast } = useToast();

  // populate name/email from logged_in_user or saved user_data_scores when component mounts
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    try {
      const loggedRaw = localStorage.getItem("logged_in_user");
      if (loggedRaw) {
        const user = JSON.parse(loggedRaw);
        if (user?.name) setName(user.name);
        if (user?.email) setEmail(user.email);
        // also pull cvScores/cultureVector if present there (keeps in sync)
        if (user?.cvScores && typeof user.cvScores === "object") {
          const scoresFromLogged: Record<string, number> = {};
          CATEGORIES.forEach((c) => {
            if (typeof user.cvScores[c] === "number") scoresFromLogged[c] = user.cvScores[c];
          });
          if (Object.keys(scoresFromLogged).length) setCvScores(scoresFromLogged);
        }
        if (Array.isArray(user?.cultureVector)) {
          const sel = user.cultureVector
            .map((val: number, idx: number) => (val === 1 ? idx : -1))
            .filter((idx: number) => idx !== -1);
          setSelectedCultures(sel);
        }
      } else {
        // fallback: check user_data_scores for stored name/email/cultureVector
        const saved = localStorage.getItem("user_data_scores");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.name && !name) setName(parsed.name);
          if (parsed?.email && !email) setEmail(parsed.email);
          if (Array.isArray(parsed?.cultureVector)) {
            const sel = parsed.cultureVector
              .map((val: number, idx: number) => (val === 1 ? idx : -1))
              .filter((idx: number) => idx !== -1);
            setSelectedCultures(sel);
          }
        }
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation helper (simple email regex)
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const savePreferences = () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const binaryVector = cultureOptions.map((_, idx) =>
      selectedCultures.includes(idx) ? 1 : 0
    );

    // Compose user data: flatten cvScores and culture vector under one key
    const dataToSave: Record<string, any> = {
      ...(cvScores || {}),
      cultureVector: binaryVector,
      name,
      email,
    };

    localStorage.setItem("user_data_scores", JSON.stringify(dataToSave));

    // Also update the logged_in_user to mark dashboard complete and save name/email and cv/culture
    const loggedInUserRaw = localStorage.getItem("logged_in_user");
    if (loggedInUserRaw) {
      try {
        const loggedInUser = JSON.parse(loggedInUserRaw);
        loggedInUser.dashboardComplete = true;
        loggedInUser.name = name;
        loggedInUser.email = email;
        loggedInUser.cvScores = cvScores || {};
        loggedInUser.cultureVector = binaryVector;
        localStorage.setItem("logged_in_user", JSON.stringify(loggedInUser));
      } catch {
        // ignore JSON parse errors
      }
    }

    // Optionally also update a "users" collection if present
    try {
      const usersRaw = localStorage.getItem("users");
      let users: Record<string, any> = {};
      if (usersRaw) users = JSON.parse(usersRaw);
      users[email] = { ...(users[email] || {}), ...dataToSave };
      localStorage.setItem("users", JSON.stringify(users));
    } catch {
      // ignore
    }

    console.log("Saved user data:", dataToSave);

    setSuccessMessage("Preferences saved successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCvUpload = async (file: File) => {
    if (!file) return;
    setCvLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("https://fbufcosogyfbzwdzjxwo.functions.supabase.co/parse-cv-gemini", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to analyze CV");
      }
      const data = await res.json();
      const scores = (data.scores || {}) as Record<string, number>;
      setCvScores(scores);

      // Build culture vector based on currently selected UI choices
      const cultureVector = cultureOptions.map((_, idx) => (selectedCultures.includes(idx) ? 1 : 0));

      // Save flattened scores plus culture vector (and optionally name/email) in one object
      const savedData = {
        ...scores,
        cultureVector,
        name,
        email,
      };
      localStorage.setItem("user_data_scores", JSON.stringify(savedData));

      // Update logged_in_user if exists
      try {
        const loggedRaw = localStorage.getItem("logged_in_user");
        if (loggedRaw) {
          const user = JSON.parse(loggedRaw);
          user.cvScores = scores;
          user.cultureVector = cultureVector;
          if (name) user.name = name;
          if (email) user.email = email;
          localStorage.setItem("logged_in_user", JSON.stringify(user));
        }
      } catch {
        // ignore
      }

      // Also update a "users" collection (optional)
      try {
        const usersRaw = localStorage.getItem("users");
        let users: Record<string, any> = {};
        if (usersRaw) users = JSON.parse(usersRaw);
        if (email) users[email] = { ...(users[email] || {}), ...savedData };
        localStorage.setItem("users", JSON.stringify(users));
      } catch {
        // ignore
      }

      toast({ title: "CV analyzed", description: "Scores updated from Gemini." });
    } catch (e) {
      console.error(e);
      toast({
        title: "CV analysis failed",
        description: "Please set GEMINI_API_KEY in Supabase secrets and try again.",
        variant: "destructive" as any,
      });
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
        </div>
      </section>

      <section className="container mx-auto py-8 md:py-12 grid gap-6 md:grid-cols-2">
        {successMessage && (
          <div
            className="mb-4 rounded-md border border-green-400 bg-green-50 px-4 py-3 text-green-800 text-sm font-medium"
            role="alert"
          >
            {successMessage}
          </div>
        )}

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Please provide your name and email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="you@example.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Work Culture Preferences</CardTitle>
            <CardDescription>Select all that match your ideal work culture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {cultureOptions.map((option, idx) => (
                <Button
                  key={option}
                  variant={selectedCultures.includes(idx) ? "default" : "outline"}
                  size="sm"
                  className="text-sm px-3 py-1"
                  onClick={() => toggleCulture(idx)}
                >
                  {option}
                </Button>
              ))}
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
              <div className="text-sm text-muted-foreground">
                {cvLoading ? "Analyzing CV with Gemini..." : "Drag & drop your CV here, or click to browse"}
              </div>
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
                    <span className="font-medium">
                      {Math.round(((cvScores?.[c] ?? 0) + Number.EPSILON) * 10) / 10}/10
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!cvScores && !cvLoading && <p className="mt-4 text-sm text-muted-foreground">No CV scores uploaded yet.</p>}
          </CardContent>
        </Card>
      </section>

      {/* Save button */}
      <div className="container mx-auto py-6 flex justify-end">
        <Button variant="hero" onClick={savePreferences}>
          Save Preferences
        </Button>
      </div>

      <section className="container mx-auto py-12 md:py-16">
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
                <Radar
                  name="You"
                  dataKey="user"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Typical"
                  dataKey="typical"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
