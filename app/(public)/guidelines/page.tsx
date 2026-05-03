"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Shield, Users, Lock, Eye, HandHeart, Ban } from "lucide-react";

export default function GuidelinesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.email;

  const guidelines = [
    {
      icon: Shield,
      title: "1. Be Authentic",
      description: "Share genuine interview experiences. Do not fabricate or exaggerate details. All submissions are reviewed by admins before publishing."
    },
    {
      icon: Users,
      title: "2. Be Respectful",
      description: "Maintain professionalism when describing companies, interviewers, and processes. Do not include personal identifiable information of others."
    },
    {
      icon: HandHeart,
      title: "3. Be Helpful",
      description: "Focus on providing actionable insights - tips, questions asked, round details. This community is for helping fellow students succeed."
    },
    {
      icon: Eye,
      title: "4. Privacy",
      description: "You can submit anonymously. Your identity is never shared without consent. Do not mention names of interviewers."
    },
    {
      icon: Ban,
      title: "5. No Spam",
      description: "Do not use this platform for promotional purposes. Reserved for genuine placement experiences only."
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/browse" className="text-sm text-zinc-400 hover:text-white inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to experiences
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-3">Community Guidelines</h1>
        <p className="text-zinc-400 mb-8">Help us maintain a quality resource for all PSG students</p>
        
        <div className="space-y-4">
          {guidelines.map((item, index) => (
            <Card key={index} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <item.icon className="w-5 h-5 text-blue-400" />
                </div>
                <CardTitle className="text-lg text-white">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Want to Contribute?</h2>
          <p className="text-zinc-400 mb-4">
            Share your placement experience to help fellow students. Every story matters!
          </p>
          {userId ? (
            <Link href="/submit">
              <Button className="bg-blue-600 hover:bg-blue-700">Share Experience</Button>
            </Link>
          ) : (
            <Button 
              onClick={() => signIn()} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sign In to Contribute
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}