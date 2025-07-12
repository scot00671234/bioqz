import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Eye, MousePointer, Users, Calendar, ExternalLink, Crown } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Analytics() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
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

  // Redirect to dashboard if not a paid user
  useEffect(() => {
    if (!isLoading && isAuthenticated && !user?.isPaid) {
      toast({
        title: "Upgrade Required",
        description: "Analytics are only available to Pro users.",
        variant: "destructive",
      });
      navigate("/subscribe");
      return;
    }
  }, [isAuthenticated, isLoading, user?.isPaid, navigate, toast]);

  const handleGoBack = () => {
    navigate("/");
  };

  const handleUpgrade = () => {
    navigate("/subscribe");
  };

  // Mock analytics data for demonstration
  const analyticsData = {
    totalViews: 1247,
    totalClicks: 389,
    clickRate: 31.2,
    weeklyGrowth: 15.3,
    topLinks: [
      { title: "Instagram", clicks: 156, url: "https://instagram.com" },
      { title: "Portfolio", clicks: 98, url: "https://portfolio.com" },
      { title: "YouTube", clicks: 67, url: "https://youtube.com" },
      { title: "LinkedIn", clicks: 45, url: "https://linkedin.com" },
      { title: "Twitter", clicks: 23, url: "https://twitter.com" },
    ],
    dailyViews: [
      { date: "Mon", views: 67 },
      { date: "Tue", views: 89 },
      { date: "Wed", views: 45 },
      { date: "Thu", views: 123 },
      { date: "Fri", views: 156 },
      { date: "Sat", views: 234 },
      { date: "Sun", views: 178 },
    ],
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

  if (!user?.isPaid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Crown className="h-12 w-12 text-brand-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pro Feature</h1>
            <p className="text-gray-600 mb-4">
              Analytics are only available to Pro users. Upgrade to unlock detailed insights about your bio page.
            </p>
            <div className="space-y-2">
              <Button onClick={handleUpgrade} className="w-full bg-brand-600 text-white hover:bg-brand-700">
                Upgrade to Pro
              </Button>
              <Button onClick={handleGoBack} variant="outline" className="w-full">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-brand-600">Analytics</h1>
            </div>
            <div className="flex items-center">
              <Crown className="h-5 w-5 text-brand-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Pro Feature</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-brand-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.totalClicks.toLocaleString()}</p>
                </div>
                <MousePointer className="h-8 w-8 text-brand-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Click Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.clickRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-brand-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Weekly Growth</p>
                  <p className="text-3xl font-bold text-emerald-600">+{analyticsData.weeklyGrowth}%</p>
                </div>
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Daily Views (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.dailyViews.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{day.date}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-brand-600 h-2 rounded-full"
                          style={{ width: `${(day.views / Math.max(...analyticsData.dailyViews.map(d => d.views))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{day.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExternalLink className="h-5 w-5 mr-2" />
                Top Performing Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                        <span className="text-brand-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{link.title}</p>
                        <p className="text-sm text-gray-500">{link.url}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{link.clicks}</p>
                      <p className="text-sm text-gray-500">clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analytics Data
                </h3>
                <p className="text-gray-600 mb-4">
                  This is sample analytics data for demonstration purposes. In a real implementation, this would show your actual bio page performance metrics.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={handleGoBack} variant="outline">
                    Back to Dashboard
                  </Button>
                  <Button onClick={() => navigate("/settings")} variant="ghost">
                    Go to Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}