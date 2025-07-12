import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Crown, TrendingUp, Eye, MousePointer, Settings, Copy, Share2 } from "lucide-react";
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        {user?.isDemoMode && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Crown className="h-6 w-6 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">Demo Mode Active</h3>
                    <p className="text-yellow-700">You have access to all Pro features! Add your Stripe keys to enable real payments.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate("/settings")}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Configure Stripe
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Your Bio Link Section */}
        {user?.username && (
          <Card className="mb-8 shadow-lg warm-shadow border-brand-200 bg-gradient-to-r from-brand-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-brand-700 flex items-center">
                <ExternalLink className="h-5 w-5 mr-2" />
                Your Bio Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="bg-white rounded-lg px-4 py-3 border border-brand-200 flex-1 max-w-md">
                    <div className="text-sm text-gray-600 mb-1">Your live bio page:</div>
                    <div className="font-mono text-brand-600 font-semibold">
                      bioqz.com/{user.username}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleViewBio}
                    className="bg-brand-600 text-white hover:bg-brand-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Bio
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/${user.username}`);
                      toast({
                        title: "Copied!",
                        description: "Bio link copied to clipboard",
                      });
                    }}
                    variant="outline"
                    className="border-brand-600 text-brand-600 hover:bg-brand-50"
                  >
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${bio?.name || user.firstName}'s Bio`,
                          url: `${window.location.origin}/${user.username}`
                        });
                      } else {
                        window.open(`https://twitter.com/intent/tweet?text=Check out my bio page: ${window.location.origin}/${user.username}`, '_blank');
                      }
                    }}
                    variant="outline"
                    className="border-brand-600 text-brand-600 hover:bg-brand-50"
                  >
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
          <div className="lg:col-span-1 space-y-6">
            {/* Subscription Status */}
            <Card className="shadow-lg warm-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-brand-700">
                  <Crown className="h-5 w-5 mr-2 text-brand-600" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`${user?.isPaid ? 'bg-gradient-to-r from-brand-100 to-purple-100 border-brand-200' : 'bg-gray-100'} rounded-lg p-4 mb-4 border`}>
                    <div className={`text-2xl font-bold ${user?.isPaid ? 'text-brand-700' : 'text-gray-900'}`}>
                      {user?.isPaid ? "Pro Plan" : "Free Plan"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {!user?.isPaid && `${bio?.links ? Array.isArray(bio.links) ? bio.links.length : 0 : 0} of 1 link used`}
                      {user?.isPaid && "Unlimited links"}
                    </div>
                  </div>
                  {!user?.isPaid && (
                    <Button
                      onClick={handleUpgrade}
                      className="w-full bg-brand-600 text-white hover:bg-brand-700 warm-shadow"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Preview */}
            <Card className="shadow-lg warm-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-brand-700">
                  <TrendingUp className="h-5 w-5 mr-2 text-brand-600" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600 flex items-center text-sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Total Views
                      </span>
                      <span className="font-semibold text-gray-900">
                        {user?.isPaid ? "247" : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600 flex items-center text-sm">
                        <MousePointer className="h-4 w-4 mr-2" />
                        Link Clicks
                      </span>
                      <span className="font-semibold text-gray-900">
                        {user?.isPaid ? "89" : "—"}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">This Week</span>
                        <span className="font-semibold text-emerald-600">
                          {user?.isPaid ? "+12%" : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {user?.isPaid ? (
                    <Button
                      onClick={handleAnalytics}
                      className="w-full bg-brand-600 text-white hover:bg-brand-700"
                    >
                      View Full Analytics
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-500 text-center bg-gray-50 rounded-lg p-3">
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
