import { GoogleAuth } from 'google-auth-library';

export function getGoogleCredentials() {
  if (typeof window === 'undefined' && process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      const credentialsString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
      console.log("Credentials string:", credentialsString); // For debugging
      const credentials = JSON.parse(credentialsString);
      return new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
    } catch (error) {
      console.error("Error parsing Google credentials:", error);
      throw new Error('Failed to parse Google credentials');
    }
  }
  throw new Error('Google credentials not found');
}