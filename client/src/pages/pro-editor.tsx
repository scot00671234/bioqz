import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, ArrowLeft, Eye, ExternalLink, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import BioForm from "@/components/BioForm";
import ProThemeEditor from "@/components/ProThemeEditor";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { Bio } from "../../../shared/schema";

export default function ProEditor() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

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

  // Redirect to pro-features if user is not pro
  useEffect(() => {
    if (!isLoading && isAuthenticated && !user?.isPro) {
      navigate("/pro-features");
    }
  }, [isAuthenticated, isLoading, user?.isPro, navigate]);

  const { data: bio } = useQuery<Bio | null>({
    queryKey: ["/api/bios/me"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleViewBio = () => {
    if (user?.username) {
      window.open(`/${user.username}`, '_blank');
    } else {
      toast({
        title: "No username set",
        description: "Please set a username first to view your bio.",
        variant: "destructive",
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  const saveThemeMutation = useMutation({
    mutationFn: async (themeData: any) => {
      return apiRequest(`/api/bios`, "POST", {
        ...bio,
        ...themeData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bios/me"] });
      toast({
        title: "Theme Saved",
        description: "Your theme customizations have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to save theme. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveTheme = (themeData: any) => {
    saveThemeMutation.mutate(themeData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.isPro) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50">
      {/* Pro Editor Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 warm-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button
                onClick={handleBackToDashboard}
                variant="ghost"
                className="text-gray-600 hover:text-gray-700 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                <h1 className="text-2xl font-bold text-brand-600 mr-8 animate-bounce-subtle">bioqz</h1>
                <span className="text-gray-600">Pro Editor</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleViewBio}
                variant="outline"
                className="text-brand-600 hover:text-brand-700 border-brand-600 hover:border-brand-700"
                disabled={!user?.username}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Bio
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
                <div className="flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 px-2 py-1 rounded-full">
                  <Crown className="h-3 w-3 text-yellow-600 mr-1" />
                  <span className="text-xs font-medium text-yellow-700">PRO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Editor Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="warm-shadow border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-center text-2xl font-bold text-gray-900 flex items-center justify-center">
              <Crown className="h-6 w-6 text-yellow-500 mr-2" />
              Pro Bio Editor
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Create and customize your bio with unlimited links, custom styling, and advanced features
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pro Features Notice */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Crown className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Pro Features Enabled</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Unlimited links and social connections</li>
                    <li>• Custom themes and styling options</li>
                    <li>• Advanced analytics and insights</li>
                    <li>• Priority support and updates</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bio Form */}
            <BioForm bio={bio} />
            
            {/* Pro Theme Editor */}
            <div className="mt-8 pt-6 border-t">
              <ProThemeEditor bio={bio} onSave={handleSaveTheme} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}