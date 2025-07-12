import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BioCard from "@/components/BioCard";
import { Card, CardContent } from "@/components/ui/card";

export default function BioPreview() {
  const [location, navigate] = useLocation();
  const username = location.split("/")[1];

  const { data: bio, isLoading, error } = useQuery({
    queryKey: ["/api/bios", username],
    enabled: !!username,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !bio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bio Not Found</h1>
            <p className="text-gray-600 mb-4">
              The bio page you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <BioCard bio={bio} username={username} />
      </div>
    </div>
  );
}
