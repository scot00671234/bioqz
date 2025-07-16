import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refresh user data to get updated Pro status if authenticated
    if (isAuthenticated) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
    
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (isAuthenticated) {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, queryClient, isAuthenticated]);

  const handleGoToDashboard = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6 pb-8">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <Crown className="h-8 w-8 text-yellow-500 mx-auto" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to bioqz Pro!
          </h1>
          <p className="text-gray-600 mb-6">
            Your payment was successful. You now have access to unlimited links, custom themes, and advanced analytics.
          </p>

          {/* User Greeting */}
          {user && (
            <div className="mb-6 p-4 bg-brand-50 rounded-lg">
              <p className="text-brand-700 font-medium">
                Hi {user.firstName || user.email}! 🎉
              </p>
              <p className="text-sm text-brand-600 mt-1">
                Your Pro subscription is now active
              </p>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={handleGoToDashboard}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white mb-4"
            size="lg"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>

          {/* Auto-redirect notice */}
          <p className="text-sm text-gray-500">
            Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}