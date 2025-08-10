import { SEO } from "@/components/SEO";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { CATEGORIES } from "@/constants/categories";

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

const Companies = () => {
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [requirements, setRequirements] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    CATEGORIES.forEach((c) => (init[c] = 5));
    return init;
  });
  const [selectedCultures, setSelectedCultures] = useState<number[]>([]);
  const { toast } = useToast();

  const toggleCulture = (idx: number) => {
    setSelectedCultures((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const saveCompanyData = () => {
    if (!companyName.trim()) {
      alert("Please enter your company name.");
      return;
    }
    if (!jobTitle.trim()) {
      alert("Please enter the job title.");
      return;
    }

    const cultureVector = cultureOptions.map((_, idx) =>
      selectedCultures.includes(idx) ? 1 : 0
    );

    // Compose new job posting data
    const jobs = JSON.parse(localStorage.getItem("jobs") || "[]");
    const newJob = {
      id: Date.now(),
      title: jobTitle,
      company: companyName,
      location: location || "Remote",
      salary: salary || "—",
      requirements,
      cultureVector,
    };

    localStorage.setItem(
      "jobs",
      JSON.stringify([...(Array.isArray(jobs) ? jobs : []), newJob])
    );

    toast({
      title: "Job and culture profile saved",
      description: "Candidates will see it ranked by similarity.",
    });

    // Optional: clear form or keep state
  };

  return (
    <div>
      <SEO
        title="Companies – Share your culture & post jobs | InstaConnect"
        description="Publish roles with clear skill priorities and share your company culture to get high-fit candidates instantly."
      />

      <section className="border-b">
        <div className="container mx-auto py-10 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Company hub</h1>
          <p className="text-muted-foreground mt-2">
            Describe your culture and post roles with must-haves and nice-to-haves.
          </p>
        </div>
      </section>

      <section className="container mx-auto py-8 grid gap-6 md:grid-cols-2">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company info</CardTitle>
            <CardDescription>Basic details about your company and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Company name</Label>
              <Input
                placeholder="Your Company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <Label>Job title</Label>
              <Input
                placeholder="Senior Backend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                placeholder="City or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <Label>Salary range</Label>
              <Input
                placeholder="$80k - $120k"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Culture Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Culture survey</CardTitle>
            <CardDescription>Give candidates a transparent view</CardDescription>
          </CardHeader>
          <CardContent>
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

        {/* Skill Requirements */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Minimum category requirements</CardTitle>
            <CardDescription>
              Define minimum scores per skill category
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[420px] overflow-auto pr-1 grid gap-4">
            {CATEGORIES.map((c) => (
              <div key={c} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground mr-4">{c}</span>
                  <span className="font-medium">{requirements[c]}</span>
                </div>
                <Slider
                  defaultValue={[requirements[c]]}
                  max={10}
                  step={1}
                  onValueChange={(v) =>
                    setRequirements((r) => ({ ...r, [c]: v[0] }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="md:col-span-2 flex justify-end">
          <Button variant="hero" onClick={saveCompanyData} size="sm" className="w-auto">
            Save Job & Culture Profile
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Companies;
