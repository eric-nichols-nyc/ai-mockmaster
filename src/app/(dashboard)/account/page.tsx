import { currentUser } from '@clerk/nextjs/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';

export default async function AccountPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-10 space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Manage your account preferences and view your profile information.
          </p>
        </div>

        {/* Profile Section */}
        <Card className="mb-8 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Image 
                src={user?.imageUrl || ''} 
                alt="Profile" 
                width={80}
                height={80}
                className="h-20 w-20 rounded-full border-2 border-primary/20"
              />
              <div>
                <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
                <p className="text-gray-600">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional account sections can be added here */}
      </div>
    </div>
  );
} 