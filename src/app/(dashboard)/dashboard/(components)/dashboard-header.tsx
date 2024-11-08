"use client"
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs'

export const DashboardHeader: React.FC = () => {
  const { userId, isLoaded } = useAuth()
console.log(isLoaded, userId);
  return (
    <Card className="mb-6">
      <CardContent>
        <Link href="/interview">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> New Interview
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
