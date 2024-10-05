"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your email and password to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignIn.Root>
            <SignIn.Step name="start">
              <h1>Sign in to your account</h1>
              <Clerk.Connection name="google">
                <Button>Sign in with Google</Button>
              </Clerk.Connection>
              <Clerk.Connection name="discord">
                <Button>Sign in with Discord</Button>
              </Clerk.Connection>
              <Clerk.Connection name="github">
                <Button>Sign in with Github</Button>
              </Clerk.Connection>
              <Clerk.Field name="identifier">
                <Clerk.Label>Email</Clerk.Label>
                <Clerk.Input />
                <Clerk.FieldError />
              </Clerk.Field>

              <SignIn.Action submit>Continue</SignIn.Action>
            </SignIn.Step>

            {/* <SignIn.Step name="verifications">
        <SignIn.Strategy name="email_code">
          <h1>Check your email</h1>
          <p>
            We sent a code to <SignIn.SafeIdentifier />.
          </p>

          <Clerk.Field name="code">
            <Clerk.Label>Email code</Clerk.Label>
            <Clerk.Input />
            <Clerk.FieldError />
          </Clerk.Field>

          <SignIn.Action submit>Continue</SignIn.Action>
        </SignIn.Strategy>

        <SignIn.Strategy name="password">
          <h1>Enter your password</h1>

          <Clerk.Field name="password">
            <Clerk.Label>Password</Clerk.Label>
            <Clerk.Input />
            <Clerk.FieldError />
          </Clerk.Field>

          <SignIn.Action submit>Continue</SignIn.Action>
          <SignIn.Action navigate="forgot-password">
            Forgot password?
          </SignIn.Action>
        </SignIn.Strategy>

        <SignIn.Strategy name="reset_password_email_code">
          <h1>Check your email</h1>
          <p>
            We sent a code to <SignIn.SafeIdentifier />.
          </p>

          <Clerk.Field name="code">
            <Clerk.Label>Email code</Clerk.Label>
            <Clerk.Input />
            <Clerk.FieldError />
          </Clerk.Field>

          <SignIn.Action submit>Continue</SignIn.Action>
        </SignIn.Strategy>
      </SignIn.Step>
      <SignIn.Step name="forgot-password">
        <h1>Forgot your password?</h1>

        <SignIn.SupportedStrategy name="reset_password_email_code">
          Reset password
        </SignIn.SupportedStrategy>

        <SignIn.Action navigate="previous">Go back</SignIn.Action>
      </SignIn.Step>

      <SignIn.Step name="reset-password">
        <h1>Reset your password</h1>

        <Clerk.Field name="password">
          <Clerk.Label>New password</Clerk.Label>
          <Clerk.Input />
          <Clerk.FieldError />
        </Clerk.Field>

        <Clerk.Field name="confirmPassword">
          <Clerk.Label>Confirm password</Clerk.Label>
          <Clerk.Input />
          <Clerk.FieldError />
        </Clerk.Field>

        <SignIn.Action submit>Reset password</SignIn.Action>
      </SignIn.Step> */}
          </SignIn.Root>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-center text-gray-700 mt-4">
            By clicking continue, you agree to our{" "}
            <a href="/terms" className="underline hover:text-blue-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-blue-600">
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
