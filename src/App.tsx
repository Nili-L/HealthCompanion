import { useState, useEffect } from "react";
import { HealthcareDashboard } from "./components/HealthcareDashboard";
import { AuthForm } from "./components/AuthForm";
import { createClient } from "./utils/supabase/client";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<'patient' | 'provider' | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setAccessToken(session.access_token);
        // Role will be fetched by the dashboard component
        setRole(session.user.user_metadata?.role || 'patient');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleAuthSuccess = (token: string, userRole: 'patient' | 'provider') => {
    setAccessToken(token);
    setRole(userRole);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAccessToken(null);
    setRole(null);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-blue-600 mb-4">Loading...</div>
        </div>
      </div>
    );
  }

  if (!accessToken || !role) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      <Toaster />
      <HealthcareDashboard 
        accessToken={accessToken} 
        role={role}
        onLogout={handleLogout}
      />
    </>
  );
}