import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, ArrowLeft, Eye, ExternalLink, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import BioForm from "@/components/BioForm";
import ProThemeEditor from "@/components/ProThemeEditor";
import LiveBioPreview from "@/components/LiveBioPreview";
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

  // Redirect to dashboard if user is not pro
  useEffect(() => {
    if (!isLoading && isAuthenticated && !user?.isPaid) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, user?.isPaid, navigate]);

  const { data: bio } = useQuery<Bio | null>({
    queryKey: ["/api/bios/me"],
    enabled: isAuthenticated,
    retry: false,
  });

  // State for real-time preview - initialize with sensible defaults
  const [previewState, setPreviewState] = useState(null);

  // Initialize preview state only once when bio is loaded
  useEffect(() => {
    if (bio && previewState === null) {
      setPreviewState({
        colorScheme: bio.colorScheme || "default",
        layout: bio.layout || "default",
        theme: bio.theme || {},
      });
    }
  }, [bio]);

  const handleViewBio = () => {
    // Get the current username from the form or user data
    const currentUsername = user?.username;
    if (currentUsername) {
      window.open(`/${currentUsername}`, '_blank');
    } else {
      toast({
        title: "Username Required",
        description: "You need to set a username first to view your live bio page.",
        variant: "destructive",
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  const saveThemeMutation = useMutation({
    mutationFn: async (themeData: any) => {
      // Only send valid bio fields to avoid validation errors
      const validBioData = {
        name: bio?.name || user?.firstName || "",
        description: bio?.description || "",
        avatarUrl: bio?.avatarUrl || "",
        profilePicture: bio?.profilePicture || "",
        links: bio?.links || [],
        theme: themeData.theme || {},
        layout: themeData.layout || "default",
        colorScheme: themeData.colorScheme || "default",
        customCss: themeData.customCss || ""
      };
      
      return apiRequest("/api/bios", "POST", validBioData);
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

  if (!isAuthenticated || !user?.isPaid) {
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
                <h1 className="text-2xl font-bold text-gray-900">Pro Editor</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleViewBio}
                variant="outline"
                className="border-brand-600 text-brand-600 hover:bg-brand-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live Bio
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Editor Content - Split Screen Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Editor */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Bio Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Palette className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BioForm bio={bio} />
              </CardContent>
            </Card>
            
            {/* Pro Theme Editor */}
            <ProThemeEditor 
              bio={bio} 
              onSave={handleSaveTheme}
              onPreviewChange={setPreviewState}
              previewState={previewState}
            />
          </div>
        </div>
        
        {/* Right Panel - Live Preview */}
        <div className="w-1/2 bg-gray-100 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Live Preview
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              See your changes in real-time as you edit
            </p>
          </div>
          <div className="p-6">
            <LiveBioPreview 
              bio={bio} 
              user={user} 
              previewState={previewState}
            />
          </div>
        </div>
      </div>
    </div>
  );
}