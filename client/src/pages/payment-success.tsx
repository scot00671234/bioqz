import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Verify subscription status and activate Pro features
    const verifySubscription = async () => {
      try {
        const response = await apiRequest("/api/verify-subscription", "POST");
        const data = await response.json();
        
        if (data.success && data.isPaid) {
          // Invalidate user data cache to refresh Pro status
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          
          toast({
            title: "Payment Successful!",
            description: "Welcome to bioqz Pro! Your account has been upgraded.",
          });
        } else {
          toast({
            title: "Payment Processing",
            description: "Your payment is being processed. Please wait a moment...",
          });
        }
      } catch (error) {
        console.error("Error verifying subscription:", error);
        toast({
          title: "Payment Processing",
          description: "Verifying your payment. You'll see Pro features shortly.",
        });
      }
    };

    verifySubscription();

    // Redirect to dashboard after a short delay to allow data refresh
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, toast]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-brand-700">
            <Crown className="h-6 w-6 mr-2" />
            Welcome to bioqz Pro!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your subscription to bioqz Pro has been activated. You now have access to:
            </p>
            <ul className="text-left text-sm text-gray-600 space-y-1">
              <li>• Unlimited bio links</li>
              <li>• Custom color themes</li>
              <li>• Advanced analytics</li>
              <li>• Profile picture uploads</li>
            </ul>
          </div>
          <Button 
            onClick={() => navigate("/dashboard")}
            className="w-full bg-brand-600 hover:bg-brand-700"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}