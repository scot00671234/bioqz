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
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProFeatures() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

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

  const handleGetPro = () => {
    navigate("/subscribe");
  };

  const handleActivateDemo = async () => {
    try {
      const response = await fetch("/api/activate-demo-mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        toast({
          title: "Demo Mode Activated!",
          description: "You now have access to all Pro features",
        });
        navigate("/dashboard?demo=true");
      } else {
        throw new Error("Failed to activate demo mode");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate demo mode. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: Link,
      title: "Unlimited Links",
      description: "Add as many links as you want to your bio page",
      free: "1 link",
      pro: "Unlimited"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track clicks, views, and engagement with detailed insights",
      free: "Basic stats",
      pro: "Full analytics"
    },
    {
      icon: Palette,
      title: "Custom Themes",
      description: "Personalize your bio with custom colors and styles",
      free: "1 theme",
      pro: "All themes"
    },
    {
      icon: Globe,
      title: "Custom Domain",
      description: "Use your own domain for your bio page",
      free: "bioqz.com subdomain",
      pro: "Custom domain"
    },
    {
      icon: Shield,
      title: "Priority Support",
      description: "Get help when you need it with dedicated support",
      free: "Community support",
      pro: "Priority support"
    },
    {
      icon: Zap,
      title: "Advanced Features",
      description: "Access to beta features and premium integrations",
      free: "Basic features",
      pro: "Premium features"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-brand-600">bioqz Pro</h1>
            </div>
            {user?.isPaid || user?.isDemoMode ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Crown className="h-4 w-4 mr-1" />
                {user?.isDemoMode ? "Demo Mode Active" : "Pro Member"}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                Free Plan
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-full mb-6">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock the Full Power of <span className="text-brand-600">bioqz</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take your bio page to the next level with unlimited links, advanced analytics, and premium features.
          </p>
        </div>

        {/* Current Status Card */}
        {user?.isPaid || user?.isDemoMode ? (
          <Card className="mb-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center text-center">
                <div className="flex items-center">
                  <Crown className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-2xl font-bold text-green-800">
                      {user?.isDemoMode ? "Demo Mode Active!" : "You're a Pro Member!"}
                    </h3>
                    <p className="text-green-700">
                      {user?.isDemoMode 
                        ? "You have access to all Pro features. Add Stripe keys to enable real payments."
                        : "You have access to all premium features."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-12 bg-gradient-to-r from-brand-50 to-purple-50 border-brand-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-brand-600 mr-3" />
                  <div>
                    <h3 className="text-2xl font-bold text-brand-800">Ready to Upgrade?</h3>
                    <p className="text-brand-700">
                      Join thousands of creators who've upgraded to Pro
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button
                    onClick={handleActivateDemo}
                    variant="outline"
                    className="border-brand-600 text-brand-600 hover:bg-brand-50"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Try Demo Mode
                  </Button>
                  <Button
                    onClick={handleGetPro}
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Get Pro - $9/month
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-brand-100 p-3 rounded-lg mr-4">
                      <feature.icon className="h-6 w-6 text-brand-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  {(user?.isPaid || user?.isDemoMode) && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Free:</span>
                    <span className="text-gray-700">{feature.free}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-600 font-semibold">Pro:</span>
                    <span className="text-brand-700 font-semibold">{feature.pro}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h3>
            <p className="text-gray-600">Choose the plan that's right for you</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-4">$0</div>
                <p className="text-gray-600">Forever</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>1 link</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>bioqz.com subdomain</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Community support</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline" disabled>
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-brand-600 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-brand-600 text-white">
                  <Crown className="h-4 w-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-brand-600">Pro</CardTitle>
                <div className="text-4xl font-bold text-brand-600 mt-4">$9</div>
                <p className="text-gray-600">per month</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Unlimited links</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Custom themes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Custom domain</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Premium features</span>
                  </li>
                </ul>
                
                {!(user?.isPaid || user?.isDemoMode) && (
                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={handleGetPro}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Get Pro - $9/month
                    </Button>
                    <Button
                      onClick={handleActivateDemo}
                      variant="outline"
                      className="w-full border-brand-600 text-brand-600 hover:bg-brand-50"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Try Demo Mode First
                    </Button>
                  </div>
                )}
                
                {(user?.isPaid || user?.isDemoMode) && (
                  <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white" disabled>
                    <Check className="h-4 w-4 mr-2" />
                    {user?.isDemoMode ? "Demo Active" : "Current Plan"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">What is Demo Mode?</h4>
              <p className="text-gray-600">
                Demo Mode gives you instant access to all Pro features without payment. 
                It's perfect for testing and exploring before committing to a subscription.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">
                Yes! You can cancel your Pro subscription at any time. Your Pro features 
                will remain active until the end of your billing period.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">What happens to my data if I cancel?</h4>
              <p className="text-gray-600">
                Your bio page and links will remain active, but you'll be limited to 1 link 
                and basic features. Your data is never deleted.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee. If you're not satisfied, 
                contact us within 7 days for a full refund.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}