import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  ArrowLeft, 
  Check, 
  Link, 
  BarChart3, 
  Palette, 
  Zap, 
  Shield, 
  Globe,
  Star,
  TrendingUp,
  Sparkles,
  Image,
  Users,
  Settings,
  Moon,
  Sun,
  Heart
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProFeatures() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState("gradient");
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Please Sign In",
        description: "Sign in to access Pro features",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  const handleUpgradeToPro = async () => {
    setIsUpgrading(true);
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
        navigate("/dashboard");
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
    } finally {
      setIsUpgrading(false);
    }
  };

  const themes = [
    { name: "Gradient", id: "gradient", colors: "from-purple-500 to-pink-500" },
    { name: "Ocean", id: "ocean", colors: "from-blue-500 to-teal-500" },
    { name: "Sunset", id: "sunset", colors: "from-orange-500 to-red-500" },
    { name: "Forest", id: "forest", colors: "from-green-500 to-emerald-500" },
    { name: "Midnight", id: "midnight", colors: "from-gray-800 to-gray-900" },
    { name: "Rose Gold", id: "rose", colors: "from-pink-400 to-yellow-400" }
  ];

  const proFeatures = [
    {
      icon: <Link className="h-6 w-6" />,
      title: "Unlimited Links",
      description: "Add as many links as you want to your bio page",
      current: "1 link limit",
      pro: "Unlimited links"
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Custom Themes",
      description: "Choose from beautiful themes or create your own design",
      current: "Default theme only",
      pro: "20+ premium themes"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Track clicks, views, and engagement with detailed insights",
      current: "Basic stats",
      pro: "Detailed analytics dashboard"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Custom Domain",
      description: "Use your own domain name for your bio page",
      current: "bioqz.com/username",
      pro: "yourdomain.com"
    },
    {
      icon: <Image className="h-6 w-6" />,
      title: "Custom Backgrounds",
      description: "Upload your own background images and videos",
      current: "Standard backgrounds",
      pro: "Custom backgrounds & videos"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Priority Support",
      description: "Get priority email support and feature requests",
      current: "Community support",
      pro: "Priority email support"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user?.isPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-brand-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="text-brand-600 hover:text-brand-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div className="hidden sm:block w-px h-6 bg-brand-200"></div>
                <h1 className="text-2xl font-bold text-brand-900">Pro Features</h1>
                <Badge variant="default" className="bg-brand-600 text-white">Pro Member</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Member Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-full mb-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-brand-900 mb-2">You're a Pro Member!</h2>
            <p className="text-lg text-gray-600">Enjoy all the premium features below</p>
          </div>

          {/* Theme Selector */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Choose Your Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      selectedTheme === theme.id
                        ? "border-brand-600 shadow-lg"
                        : "border-gray-200 hover:border-brand-300"
                    }`}
                  >
                    <div className={`w-full h-16 rounded-md bg-gradient-to-r ${theme.colors} mb-2`}></div>
                    <div className="text-sm font-medium text-center">{theme.name}</div>
                    {selectedTheme === theme.id && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <Button className="mt-4 bg-brand-600 hover:bg-brand-700">
                Apply Theme
              </Button>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proFeatures.map((feature, index) => (
              <Card key={index} className="border-brand-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-brand-700">
                    {feature.icon}
                    <span className="ml-2">{feature.title}</span>
                    <Badge className="ml-auto bg-green-100 text-green-800">Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-green-700 font-medium">{feature.pro}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-brand-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="text-brand-600 hover:text-brand-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="hidden sm:block w-px h-6 bg-brand-200"></div>
              <h1 className="text-2xl font-bold text-brand-900">Upgrade to Pro</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-brand-600 to-purple-600 rounded-full mb-6">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-brand-900 mb-4">
            Unlock Premium Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take your bio page to the next level with Pro features. Unlimited links, custom themes, analytics, and more.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="border-brand-200 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 to-purple-600"></div>
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                <Crown className="h-6 w-6 text-brand-600 mr-2" />
                <CardTitle className="text-2xl text-brand-900">Pro Plan</CardTitle>
              </div>
              <div className="text-4xl font-bold text-brand-900">
                $9<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={handleUpgradeToPro}
                disabled={isUpgrading}
                className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
              >
                {isUpgrading ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Activating...
                  </div>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Get Pro - $9/month
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                Instant access • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {proFeatures.map((feature, index) => (
            <Card key={index} className="border-brand-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-brand-700">
                  {feature.icon}
                  <span className="ml-2">{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Free:</span>
                    <span className="text-gray-600">{feature.current}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-brand-600 mr-2" />
                    <span className="text-brand-700 font-medium">{feature.pro}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Theme Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Preview: Custom Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {themes.map((theme, index) => (
                <div key={index} className="text-center">
                  <div className={`w-full h-16 rounded-md bg-gradient-to-r ${theme.colors} mb-2 shadow-md`}></div>
                  <div className="text-sm font-medium text-gray-700">{theme.name}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
              <p className="text-sm text-brand-700">
                <Crown className="h-4 w-4 inline mr-1" />
                Pro members get access to all themes plus the ability to customize colors and upload custom backgrounds.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to upgrade?</h3>
          <p className="text-brand-100 mb-6 max-w-2xl mx-auto">
            Join thousands of creators who have upgraded to Pro and transformed their bio pages into powerful marketing tools.
          </p>
          <Button
            onClick={handleUpgradeToPro}
            disabled={isUpgrading}
            size="lg"
            className="bg-white text-brand-600 hover:bg-gray-100 font-semibold"
          >
            {isUpgrading ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full mr-2" />
                Activating...
              </div>
            ) : (
              <>
                <Crown className="h-5 w-5 mr-2" />
                Start Your Pro Journey
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}