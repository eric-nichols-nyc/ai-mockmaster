import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
export default async function Page() {
  // redirect user to dashboard after sign in
  const user = await currentUser();
  console.log(user);

  return <AuthenticateWithRedirectCallback signInFallbackRedirectUrl="/dashboard" />
}