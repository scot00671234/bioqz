import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Crown, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import type { Bio } from "../../../shared/schema";

export default function Settings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [customDomain, setCustomDomain] = useState("");
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");

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

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/users/account");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      window.location.href = "/api/logout";
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/cancel-subscription");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bios/me"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      deleteAccountMutation.mutate();
    }
  };

  const handleCancelSubscription = () => {
    if (window.confirm("Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your current billing period.")) {
      cancelSubscriptionMutation.mutate();
    }
  };

  const handleGoBack = () => {
    navigate("/");
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
          title: "Pro Features Unlocked!",
          description: "You now have access to all Pro features",
        });
        // Force a page refresh to update user state
        window.location.reload();
      } else {
        throw new Error("Failed to upgrade to Pro");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upgrade to Pro. Please try again.",
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              <h1 className="text-2xl font-bold text-brand-600">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : "Not set"}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user?.username || "Not set"}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <p className="text-sm text-gray-500">
                Account information is managed through your Replit profile and cannot be changed here.
              </p>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 mr-2" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {user?.isPaid ? "Pro Plan" : "Free Plan"}
                  </h3>
                  <p className="text-gray-600">
                    {user?.isPaid 
                      ? "You have access to all premium features"
                      : "Upgrade to unlock premium features"}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!user?.isPaid && (
                    <Button
                      onClick={handleUpgrade}
                      className="bg-brand-600 text-white hover:bg-brand-700"
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                  {user?.isPaid && (
                    <Button
                      onClick={handleCancelSubscription}
                      disabled={cancelSubscriptionMutation.isPending}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {cancelSubscriptionMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Custom Domain (Pro Only) */}
          {user?.isPaid && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Domain</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="domain">Custom Domain</Label>
                  <Input
                    id="domain"
                    placeholder="yourdomain.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Connect your own domain to your bio page (coming soon)
                  </p>
                </div>
                <Button 
                  disabled 
                  className="bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Save Domain (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Bio Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Bio Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-600">
                    {bio?.links && Array.isArray(bio.links) ? bio.links.length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Links</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-600">
                    {user?.isPaid ? "∞" : "5"}
                  </div>
                  <div className="text-sm text-gray-600">Max Links</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-600">
                    {user?.username ? "✓" : "✗"}
                  </div>
                  <div className="text-sm text-gray-600">Username Set</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-red-600">Delete Account</h3>
                  <p className="text-gray-600 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
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