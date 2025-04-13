
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { auth } from './lib/firebase';
import { AuthProvider } from './hooks/useAuth';
import Index from "./pages/Index";
import Spots from "./pages/Spots";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Social from "./pages/Social";
import NotFound from "./pages/NotFound";
import Messages from "./pages/Messages";
import Search from "./pages/Search";
import UserProfile from "./pages/UserProfile";
import { ThemeToggle } from "./components/ui/theme-toggle";
import { useIsMobile } from "./hooks/use-mobile";

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out");
    });

    return () => unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {/* NotificationBanner é renderizado em Index.tsx */}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {isMobile && (
              <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
              </div>
            )}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/spots" element={<Spots />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/social" element={<Social />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/search" element={<Search />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
