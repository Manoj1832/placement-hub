"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import { Briefcase, Star, ArrowRight } from "lucide-react";
import ExperienceCard from "@/components/experience-card";

export default function HomePage() {
  const recentExperiences = useQuery(api.experiences.getRecent, { limit: 3 });
  const { userId } = useAuth();
  const stats = useQuery(api.experiences.getStats);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">PSG Placement Hub</h1>
          <nav className="flex items-center gap-4">
            <Link href="/browse" className="text-sm">Browse</Link>
            <Link href="/guidelines" className="text-sm">Guidelines</Link>
            {!userId ? (
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
            ) : (
              <UserButton />
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Your Placement Journey Starts Here
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Real interview experiences from PSG College students. Get insights into company-specific rounds,
              questions asked, and tips to crack your dream job.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/browse">
                <Button size="lg">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Browse Experiences
                </Button>
              </Link>
              <Link href="/submit">
                <Button variant="outline" size="lg">
                  <Star className="w-5 h-5 mr-2" />
                  Share Experience
                </Button>
              </Link>
            </div>
            
            {stats && (
              <div className="flex justify-center gap-8 mt-12 text-sm text-muted-foreground">
                <div>
                  <span className="font-bold text-foreground text-xl block">{stats.totalExperiences}</span>
                  Experiences
                </div>
                <div>
                  <span className="font-bold text-foreground text-xl block">{stats.totalCompanies}</span>
                  Companies
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Recent Experiences</h3>
              <Link href="/browse" className="text-sm flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {recentExperiences?.map((exp: any) => (
                <ExperienceCard key={exp._id} experience={exp} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-12">
              Why PSG Placement Hub?
            </h3>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Real Experiences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Learn from actual interview experiences shared by PSG students who cracked top companies.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Verified Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All experiences are verified by admins to ensure authenticity and quality.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Premium Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Access resume templates, GitHub checklists, and company-specific guides.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>PSG Placement Hub - Helping PSG students succeed</p>
        </div>
      </footer>
    </div>
  );
}