import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Crown, TrendingUp, Eye, MousePointer, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import BioForm from "@/components/BioForm";
import { useLocation } from "wouter";
import type { Bio } from "../../../shared/schema";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: bio } = useQuery<Bio | null>({
    queryKey: ["/api/bios/me"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleViewBio = () => {
    if (user?.username) {
      navigate(`/${user.username}`);
    } else {
      toast({
        title: "No username set",
        description: "Please set a username first to view your bio.",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = () => {
    navigate("/subscribe");
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleAnalytics = () => {
    navigate("/analytics");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 warm-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-brand-600 mr-8 animate-bounce-subtle">bioqz</h1>
              <span className="text-gray-600">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleViewBio}
                variant="ghost"
                className="text-brand-600 hover:text-brand-700"
                disabled={!user?.username}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Bio
              </Button>
              <Button
                onClick={handleSettings}
                variant="ghost"
                className="text-gray-600 hover:text-gray-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <div className="flex items-center space-x-2">
                {user?.profileImageUrl && (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-gray-700 font-medium">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email}
                </span>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Bio Editor */}
          <div className="lg:col-span-2 animate-slide-up">
            <Card className="shadow-lg warm-shadow">
              <CardHeader>
                <CardTitle className="text-brand-700">Edit Your Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <BioForm bio={bio} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Subscription Status */}
            <Card className="shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg p-4 mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {user?.isPaid ? "Pro Plan" : "Free Plan"}
                    </div>
                    {!user?.isPaid && (
                      <div className="text-sm text-gray-600">
                        {bio?.links ? Array.isArray(bio.links) ? bio.links.length : 0 : 0} of 5 links used
                      </div>
                    )}
                  </div>
                  {!user?.isPaid && (
                    <Button
                      onClick={handleUpgrade}
                      className="w-full bg-brand-600 text-white hover:bg-brand-700"
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Preview */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Total Views
                    </span>
                    <span className="font-semibold text-gray-900">
                      {user?.isPaid ? "247" : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <MousePointer className="h-4 w-4 mr-2" />
                      Link Clicks
                    </span>
                    <span className="font-semibold text-gray-900">
                      {user?.isPaid ? "89" : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-semibold text-emerald-600">
                      {user?.isPaid ? "+12%" : "—"}
                    </span>
                  </div>
                  {user?.isPaid ? (
                    <Button
                      onClick={handleAnalytics}
                      className="w-full bg-brand-600 text-white hover:bg-brand-700"
                    >
                      View Full Analytics
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-500 text-center mt-4">
                      Upgrade to Pro for detailed analytics
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
