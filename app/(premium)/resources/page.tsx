"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PremiumGate from "@/components/premium-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResourcesPage() {
  const freeResources = useQuery(api.resources.getFree);
  const isPremium = useQuery(api.users.isPremium);

  return (
    <PremiumGate>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Premium Resources</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {freeResources?.map((res: any) => (
            <Card key={res._id}>
              <CardHeader>
                <CardTitle>{res.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{res.description}</p>
                <Button>Download</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PremiumGate>
  );
}