import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const DashboardPage = () => {
  // This is a placeholder. In a real app, you'd fetch this data from an API or database
  const interviews = [
    { id: 1, title: "Interview 1", date: "2023-05-01", summary: "This was an interview for a software developer position." },
    { id: 2, title: "Interview 2", date: "2023-05-15", summary: "This was an interview for a product manager role." },
    { id: 3, title: "Interview 3", date: "2023-05-30", summary: "This was an interview for a UX designer position." },
  ]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header and tagline with button */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Interview Dashboard</h1>
        <p className="text-gray-600 mb-4">Manage and review your interviews</p>
        <Link href="/dashboard/interview">
          <Button>Start New Interview</Button>
        </Link>
      </header>

      {/* List of interviews */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Your Interviews</h2>
        {interviews.length > 0 ? (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <Link href={`/dashboard/interview/${interview.id}`} key={interview.id} className="block">
                <Card className="w-full hover:shadow-md transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>{interview.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">{interview.date}</p>
                    <p className="mt-2">{interview.summary}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No interviews found. Start a new one!</p>
        )}
      </div>
    </div>
  )
}

export default DashboardPage