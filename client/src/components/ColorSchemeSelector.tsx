import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ColorSchemeSelectorProps {
  user: any;
  bio: any;
  onUpdate: () => void;
}

const colorSchemes = {
  default: {
    name: "Default",
    primary: "#6366f1",
    secondary: "#8b5cf6",
    background: "#ffffff",
    text: "#1f2937"
  },
  sunset: {
    name: "Sunset",
    primary: "#f59e0b",
    secondary: "#f97316",
    background: "#fef3c7",
    text: "#92400e"
  },
  ocean: {
    name: "Ocean",
    primary: "#0ea5e9",
    secondary: "#0284c7",
    background: "#e0f2fe",
    text: "#0c4a6e"
  },
  forest: {
    name: "Forest",
    primary: "#059669",
    secondary: "#10b981",
    background: "#d1fae5",
    text: "#064e3b"
  },
  midnight: {
    name: "Midnight",
    primary: "#6366f1",
    secondary: "#8b5cf6",
    background: "#1e293b",
    text: "#e2e8f0"
  },
  rose: {
    name: "Rose",
    primary: "#e11d48",
    secondary: "#f43f5e",
    background: "#fdf2f8",
    text: "#881337"
  }
};

export default function ColorSchemeSelector({ user, bio, onUpdate }: ColorSchemeSelectorProps) {
  // Only show for Pro users
  if (!user?.isPaid) {
    return null;
  }
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Only show for Pro users
  if (!user?.isPaid) {
    return null;
  }

  const handleColorSchemeChange = async (scheme: string) => {
    setIsLoading(true);
    try {
      const themeData = {
        colorScheme: scheme,
        layout: bio?.layout || 'default',
        customCss: bio?.customCss || '',
        theme: {
          ...bio?.theme,
          colors: colorSchemes[scheme as keyof typeof colorSchemes]
        }
      };

      const response = await apiRequest("/api/bios/me/theme", "PATCH", themeData);
      
      if (response.ok) {
        onUpdate();
        toast({
          title: "Color scheme updated!",
          description: `Applied ${colorSchemes[scheme as keyof typeof colorSchemes].name} theme`,
        });
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error updating color scheme:", error);
      toast({
        title: "Error",
        description: "Failed to update color scheme",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 bg-brand-600 hover:bg-brand-700 shadow-lg"
          size="icon"
        >
          <Palette className="h-5 w-5" />
        </Button>
      ) : (
        <Card className="w-80 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Color Schemes</h3>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(colorSchemes).map(([key, scheme]) => (
                <Button
                  key={key}
                  onClick={() => handleColorSchemeChange(key)}
                  disabled={isLoading}
                  className="h-auto p-3 flex flex-col items-center space-y-2"
                  variant={bio?.colorScheme === key ? "default" : "outline"}
                >
                  <div className="flex space-x-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: scheme.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: scheme.secondary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: scheme.background }}
                    />
                  </div>
                  <span className="text-xs">{scheme.name}</span>
                </Button>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500 text-center">
                Pro feature - Change your bio colors instantly
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}