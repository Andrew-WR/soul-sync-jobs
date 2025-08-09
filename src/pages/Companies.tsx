import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Companies = () => {
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
            <CardDescription>Define must-haves, nice-to-haves, and experience</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. Senior Backend Engineer" />
            </div>
            <div className="space-y-2">
              <Label>Must-have skills</Label>
              <Input placeholder="e.g. Node.js, PostgreSQL" />
            </div>
            <div className="space-y-2">
              <Label>Nice-to-have skills</Label>
              <Input placeholder="e.g. GraphQL, AWS" />
            </div>
            <div className="space-y-2">
              <Label>Years of experience required 4</Label>
              <Slider defaultValue={[4]} max={15} step={1} />
            </div>
            <div className="flex justify-end">
              <Button variant="hero">Preview listing</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Companies;
