"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import { formatMonthYear } from "@/lib/utils";

interface AdminTableProps {}

export default function AdminTable({}: AdminTableProps) {
  const pending = useQuery(api.admin.getPending);
  const approve = useMutation(api.admin.approve);
  const reject = useMutation(api.admin.reject);

  if (!pending) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Experiences</CardTitle>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <p className="text-muted-foreground">No pending experiences</p>
        ) : (
          <div className="space-y-4">
            {pending.map((exp) => (
              <div
                key={exp._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{exp.companyName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {exp.roleTitle} - {exp.opportunityType}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatMonthYear(exp.year, exp.month)} - {exp.branch}
                  </p>
                  <Badge
                    variant={
                      exp.difficulty === "easy"
                        ? "secondary"
                        : exp.difficulty === "hard"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {exp.difficulty}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approve({ experienceId: exp._id, isVerified: true })}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => reject({ experienceId: exp._id })}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}