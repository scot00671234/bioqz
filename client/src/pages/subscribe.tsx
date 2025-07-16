import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Welcome to bioqz Pro!",
      });
    }
    setIsProcessing(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center text-brand-700">
          <Crown className="h-6 w-6 mr-2" />
          Complete Your Upgrade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />
          <Button 
            type="submit" 
            className="w-full bg-brand-600 hover:bg-brand-700" 
            disabled={!stripe || !elements || isProcessing}
          >
            {isProcessing ? "Processing..." : "Subscribe to Pro - $9/month"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Create subscription as soon as the page loads
    console.log("Making request to /api/get-or-create-subscription");
    console.log("Current URL:", window.location.href);
    console.log("User authenticated:", isAuthenticated);
    
    apiRequest("/api/get-or-create-subscription", "POST")
      .then(async (res) => {
        console.log("Response status:", res.status);
        console.log("Response headers:", Object.fromEntries(res.headers.entries()));
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response body:", errorText);
          throw new Error(`Failed to create subscription: ${res.status} ${res.statusText}. ${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Subscription data received:", data);
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else if (data.status === 'active') {
          // User already has active subscription
          console.log("User already has active subscription");
          navigate("/dashboard?already_subscribed=true");
        } else {
          throw new Error("No client secret received from server");
        }
      })
      .catch((err) => {
        console.error("Subscription error:", err);
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          setError("Please log in to subscribe to Pro");
          setTimeout(() => navigate("/"), 2000);
        } else {
          setError(err.message);
        }
      });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">Stripe is not configured. Please contact support.</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="text-2xl font-bold text-brand-600 hover:text-brand-700 cursor-pointer mr-8"
              >
                bioqz
              </button>
              <span className="text-gray-600">Upgrade to Pro</span>
            </div>
            <Button onClick={() => navigate("/dashboard")} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Pro Features */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Upgrade to <span className="text-brand-600">bioqz Pro</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Unlimited Links</h3>
                  <p className="text-gray-600">Add as many links as you want to your bio page</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Detailed Analytics</h3>
                  <p className="text-gray-600">Track views, clicks, and engagement on your bio page</p>
                </div>
              </div>
              

              
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Custom Themes</h3>
                  <p className="text-gray-600">Personalize your bio page with custom colors and styles</p>
                </div>
              </div>
            </div>


          </div>

          {/* Payment Form */}
          <div>
            {stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm />
              </Elements>
            ) : (
              <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center text-brand-700">
                    <Crown className="h-6 w-6 mr-2" />
                    Try Pro Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-center space-y-4">
                  <p className="text-gray-600 mb-4">
                    Stripe payment processing is not configured yet, but you can try all Pro features in demo mode!
                  </p>
                  <Button 
                    onClick={async () => {
                      try {
                        const res = await apiRequest("POST", "/api/activate-demo-mode");
                        if (res.ok) {
                          navigate("/dashboard?demo=true");
                        }
                      } catch (error) {
                        console.error("Error activating demo mode:", error);
                      }
                    }}
                    className="w-full bg-brand-600 hover:bg-brand-700"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Activate Demo Mode
                  </Button>
                  <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <div className="text-sm text-gray-500 mt-4">
                    <p>Demo mode gives you full access to:</p>
                    <ul className="list-disc list-inside text-left mt-2">
                      <li>Unlimited links</li>
                      <li>Custom themes</li>
                      <li>Analytics dashboard</li>
                      <li>Priority support</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}