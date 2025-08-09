import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { SEO } from "@/components/SEO";
import skillsImg from "@/assets/illus-skills.png";
import cultureImg from "@/assets/illus-culture.png";
import growthImg from "@/assets/illus-growth.png";
import { Link } from "react-router-dom";

const Index = () => {
  const spotRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = spotRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--spotlight-x", `${x}%`);
    el.style.setProperty("--spotlight-y", `${y}%`);
  };

  return (
    <div>
      <SEO
        title="InstaConnect – Jobs that fit your skills and soul"
        description="A premium, data-driven job platform matching on skills, culture, and values. Find roles that truly fit you."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "InstaConnect",
          url: typeof window !== 'undefined' ? window.location.origin : 'https://example.com'
        }}
      />

      <header ref={spotRef} onMouseMove={onMove} className="relative overflow-hidden">
        <div className="absolute inset-0 surface-spotlight" aria-hidden />
        <div className="container mx-auto py-20 md:py-28 relative">
          <p className="inline-flex items-center rounded-full border px-3 py-1 text-xs md:text-sm text-muted-foreground bg-secondary/60">Find the job that fits your skills and your soul</p>
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Match on skills, culture, and values
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
            InstaConnect blends skills, preferences, and culture signals to deliver transparent, high-fit job matches.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild variant="hero" size="lg">
              <Link to="/dashboard">Create your profile</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/jobs">Browse jobs</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[{
              title: "Skills Matching",
              desc: "Weighted scoring aligns your strengths with role requirements.",
              img: skillsImg,
            },{
              title: "Culture Fit",
              desc: "Preferences meet company culture for long-term success.",
              img: cultureImg,
            },{
              title: "Career Growth",
              desc: "See growth paths and learning suggestions to close gaps.",
              img: growthImg,
            }].map((f) => (
              <Card key={f.title} className="card-hover">
                <CardHeader>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <img src={f.img} alt={`${f.title} illustration`} className="w-full h-40 object-contain" loading="lazy" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto py-8 md:py-12">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">What candidates say</h2>
            <p className="text-muted-foreground mt-2">Real outcomes from real matches</p>
          </div>
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {[{
                  quote: "I finally understood why some roles weren’t the right fit — the culture map was eye-opening.",
                  name: "Amira, Product Designer",
                },{
                  quote: "The compatibility score nailed it. Applied to 2 roles, got 2 interviews.",
                  name: "Leo, Data Analyst",
                },{
                  quote: "Loved the transparent breakdown. It helped me improve my profile in minutes.",
                  name: "Sofia, Frontend Engineer",
                }].map((t, i) => (
                  <CarouselItem key={i}>
                    <Card className="mx-auto max-w-3xl">
                      <CardContent className="p-8 text-center">
                        <p className="text-lg md:text-xl">“{t.quote}”</p>
                        <p className="mt-3 text-sm text-muted-foreground">{t.name}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
