import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { CATEGORIES } from "@/constants/categories";
const Companies = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [requirements, setRequirements] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    CATEGORIES.forEach((c) => (init[c] = 5));
    return init;
  });
  const { toast } = useToast();

  const saveJob = () => {
    const jobs = JSON.parse(localStorage.getItem("jobs") || "[]");
    const newJob = {
      id: Date.now(),
      title: jobTitle || "Untitled Role",
      company: "Your Company",
      location: "Remote",
      salary: "—",
      requirements,
    };
    localStorage.setItem("jobs", JSON.stringify([...(Array.isArray(jobs) ? jobs : []), newJob]));
    toast({ title: "Job saved", description: "Candidates will see it ranked by similarity." });
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
          <p className="text-muted-foreground mt-2">Describe your culture and post roles with must-haves and nice-to-haves.</p>
        </div>
      </section>

      <section className="container mx-auto py-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Culture survey</CardTitle>
            <CardDescription>Give candidates a transparent view</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label>Work pace</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="steady">Steady</SelectItem>
                  <SelectItem value="dynamic">Dynamic</SelectItem>
                  <SelectItem value="fast">Fast-paced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Management style importance 7/10</Label>
              <Slider defaultValue={[7]} max={10} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Diversity & inclusion rating 8/10</Label>
              <Slider defaultValue={[8]} max={10} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Benefits & perks</Label>
              <Input placeholder="e.g. Flexible hours, Remote stipend, L&D budget" />
            </div>
            <div className="flex justify-end">
              <Button variant="hero">Save culture profile</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Post a job</CardTitle>
            <CardDescription>Define minimum category requirements and experience</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. Senior Backend Engineer" value={jobTitle} onChange={(e)=>setJobTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Years of experience required 4</Label>
              <Slider defaultValue={[4]} max={15} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Minimum required score per category</Label>
              <div className="max-h-[420px] overflow-auto pr-1 grid gap-4">
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
                      onValueChange={(v) => setRequirements((r) => ({ ...r, [c]: v[0] }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="hero" onClick={saveJob}>Save job</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Companies;
