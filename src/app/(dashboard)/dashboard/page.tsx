"use client";

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import InterviewList from './(components)/InterviewList'
import { useApi } from "@/lib/api"

const DashboardPage = () => {
  const { fetchApi } = useApi();
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await fetchApi('/interviews', { method: 'GET' });
        console.log('data = ', data)
        setInterviews(data);
      } catch (err) {
        setError('Failed to fetch interviews. Please try again later.');
        console.error('Error fetching interviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Interview Dashboard</h1>
        <p className="text-gray-600 mb-4">Manage and review your interviews</p>
        <Link href="/dashboard/interview">
          <Button>Start New Interview</Button>
        </Link>
      </header>

      {isLoading ? (
        <p className="text-center">Loading interviews...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <InterviewList interviews={interviews} />
      )}
    </div>
  )
}

export default DashboardPage