import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2 } from "lucide-react"

export default function JobListingCard() {
  return (
    <Card className="w-full max-w-3xl bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm text-gray-600">September 15, 2024</span>
        <div className="flex space-x-2">
          <button className="rounded-full bg-white bg-opacity-50 p-2 hover:bg-opacity-75 transition-colors duration-200">
            <Eye className="h-4 w-4 text-green-600" />
          </button>
          <button className="rounded-full bg-white bg-opacity-50 p-2 hover:bg-opacity-75 transition-colors duration-200">
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Software Engineer</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Full-time</Badge>
          <Badge variant="secondary">Remote</Badge>
          <Badge variant="secondary">Mid-level</Badge>
          <Badge variant="secondary">Backend</Badge>
        </div>
        <p className="text-gray-600">
          Job Title: Software Engineer Role Summary: We are looking for a Software Engineer to join our
          diverse and dedicated team. This position is an excellent opportunity for those seeking to grow
          their skills and experience in software development while working on projects with significant...
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            Q1: Can you provide an example of a challenging software development problem you encountered in
            your previous role and how you successfully resolved it?
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}