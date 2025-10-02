import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Heart, Loader2 } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AuthFormProps {
  onAuthSuccess: (accessToken: string, role: 'patient' | 'provider') => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'patient' as 'patient' | 'provider'
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const initializeDemoAccounts = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      console.log('Initializing demo accounts...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/init-demo-accounts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      console.log('Demo account initialization result:', data);
      
      if (response.ok) {
        console.log('Demo accounts initialized successfully');
      } else {
        console.error('Failed to initialize demo accounts:', data);
      }
    } catch (error) {
      console.error('Error initializing demo accounts:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // First, try to initialize demo accounts
      console.log('Ensuring demo accounts exist...');
      await initializeDemoAccounts();
      
      // Wait a moment for the accounts to be created
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Demo login failed:', data);
        throw new Error(data.error || 'Login failed');
      }

      onAuthSuccess(data.accessToken, data.role);
    } catch (err) {
      console.error('Demo login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(signupData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Signup error response:', data);
        throw new Error(data.error || 'Signup failed');
      }

      // After successful signup, automatically log in
      if (data.accessToken) {
        onAuthSuccess(data.accessToken, signupData.role);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(loginData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Login error response:', data);
        throw new Error(data.error || 'Login failed');
      }

      onAuthSuccess(data.accessToken, data.role);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Patient Portal</CardTitle>
          <CardDescription>
            Secure access to your healthcare information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-role">I am a...</Label>
                  <select
                    id="signup-role"
                    className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={signupData.role}
                    onChange={(e) => setSignupData({ ...signupData, role: e.target.value as 'patient' | 'provider' })}
                  >
                    <option value="patient">Patient</option>
                    <option value="provider">Healthcare Provider</option>
                  </select>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-3">Try Demo Accounts:</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDemoLogin('patient@demo.com', 'demo123')}
                disabled={isLoading || isInitializing}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Login as Patient
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDemoLogin('provider@demo.com', 'demo123')}
                disabled={isLoading || isInitializing}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Login as Provider
              </Button>
            </div>
            <div className="mt-3 text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={initializeDemoAccounts}
                disabled={isInitializing}
                className="text-xs"
              >
                {isInitializing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                {isInitializing ? 'Initializing...' : 'Refresh Demo Accounts'}
              </Button>
            </div>
            <div className="mt-2 space-y-1 text-xs text-blue-600">
              <p>Patient: <span className="font-mono">patient@demo.com / demo123</span></p>
              <p>Provider: <span className="font-mono">provider@demo.com / demo123</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}