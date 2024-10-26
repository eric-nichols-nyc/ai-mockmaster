import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from 'next/link';
import { useUser } from '@clerk/clerk-react'

export const DashboardHeader: React.FC = () => {
  const { isSignedIn, user, isLoaded } = useUser()
console.log(isSignedIn, isLoaded, user);
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Interview Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">Manage and review your interviews</p>
        <Link href="/dashboard/interview">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> New Interview
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
