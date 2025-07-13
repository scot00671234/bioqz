import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Crown, TrendingUp, Eye, MousePointer, Settings, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import LiveEditingDashboard from "@/components/LiveEditingDashboard";
import ColorSchemeSelector from "@/components/ColorSchemeSelector";
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

  const { data: analytics } = useQuery<{
    totalViews: number;
    totalClicks: number;
    clickRate: number;
    weeklyGrowth: number;
    topLinks: Array<{ title: string; clicks: number; url: string }>;
    dailyViews: Array<{ date: string; views: number }>;
  }>({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated && user?.isPaid,
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

  const handleUpgrade = async () => {
    try {
      const response = await fetch("/api/upgrade-to-pro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        toast({
          title: "Welcome to Pro!",
          description: "You now have access to unlimited links and Pro features.",
        });
        // Refresh user data
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        // Navigate to pro editor
        navigate("/pro-editor");
      } else {
        throw new Error("Failed to upgrade");
      }
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "There was an error upgrading your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const upgradeProMutation = useMutation({
    mutationFn: handleUpgrade,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expired",
          description: "Please log in again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/api/logout", "POST");
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
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
              <h1 className="text-2xl font-bold text-brand-600">bioqz</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                Hi, {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'there'}
              </span>
              <Button
                onClick={handleSettings}
                variant="ghost"
                className="text-gray-600 hover:text-gray-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section with Quick Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Your Bio</h2>
            <p className="text-gray-600">Make changes and see them instantly in the live preview</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Pro Badge */}
            {user?.isPaid && (
              <div className="flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full">
                <Crown className="h-4 w-4 text-yellow-600 mr-1" />
                <span className="text-sm font-medium text-yellow-700">PRO</span>
              </div>
            )}
            
            {/* Quick Actions */}
            {bio && user?.username && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${user.username}`);
                    toast({
                      title: "Copied!",
                      description: "Bio link copied to clipboard",
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="border-brand-600 text-brand-600 hover:bg-brand-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
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
                  size="sm"
                  className="border-brand-600 text-brand-600 hover:bg-brand-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            )}
            

            
            {/* Upgrade Button for Free Users */}
            {!user?.isPaid && (
              <Button 
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                disabled={upgradeProMutation.isPending}
              >
                <Crown className="h-4 w-4 mr-2" />
                {upgradeProMutation.isPending ? "Upgrading..." : "Upgrade to Pro"}
              </Button>
            )}
          </div>
        </div>

        {/* Live Editing Dashboard */}
        <LiveEditingDashboard bio={bio} user={user} />

        {/* Analytics Section for Pro Users */}
        {user?.isPaid && analytics && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Analytics Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-2xl font-bold text-brand-600 mb-1">
                      <Eye className="h-5 w-5 mr-1" />
                      {analytics.totalViews}
                    </div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-2xl font-bold text-brand-600 mb-1">
                      <MousePointer className="h-5 w-5 mr-1" />
                      {analytics.totalClicks}
                    </div>
                    <div className="text-sm text-gray-600">Total Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-600 mb-1">
                      {analytics.clickRate}%
                    </div>
                    <div className="text-sm text-gray-600">Click Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-600 mb-1">
                      {analytics.weeklyGrowth > 0 ? '+' : ''}{analytics.weeklyGrowth}%
                    </div>
                    <div className="text-sm text-gray-600">Weekly Growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Color Scheme Selector for Pro users */}
        {user?.isPaid && (
          <div className="mt-6">
            <ColorSchemeSelector
              user={user}
              bio={bio}
              onUpdate={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/bios/me"] });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}