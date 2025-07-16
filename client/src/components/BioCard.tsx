import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BioCardProps {
  bio: any;
  username: string;
}

export default function BioCard({ bio, username }: BioCardProps) {
  const handleLinkClick = async (url: string, title: string) => {
    // Ensure URL has protocol for external links
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
      formattedUrl = `https://${url}`;
    }

    // Track the click
    try {
      await apiRequest("/api/track-click", "POST", {
        userId: bio.userId,
        bioId: bio.id,
        linkUrl: formattedUrl,
        linkTitle: title
      });
    } catch (error) {
      console.error("Error tracking click:", error);
      // Don't prevent the link from opening if tracking fails
    }
    
    window.open(formattedUrl, "_blank", "noopener,noreferrer");
  };

  // Color schemes - matching LiveBioPreview
  const colorSchemes = {
    default: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      background: "#ffffff",
      text: "#1f2937"
    },
    sunset: {
      primary: "#f59e0b",
      secondary: "#ef4444",
      background: "#fef3c7",
      text: "#92400e"
    },
    ocean: {
      primary: "#0ea5e9",
      secondary: "#06b6d4",
      background: "#e0f2fe",
      text: "#0c4a6e"
    },
    forest: {
      primary: "#10b981",
      secondary: "#059669",
      background: "#d1fae5",
      text: "#064e3b"
    },
    midnight: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      background: "#1f2937",
      text: "#f9fafb"
    },
    rose: {
      primary: "#f43f5e",
      secondary: "#ec4899",
      background: "#fdf2f8",
      text: "#881337"
    }
  };

  // Get theme colors from colorScheme field
  const colorScheme = bio.colorScheme || "default";
  const themeColors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.default;

  const cardStyle = {
    backgroundColor: themeColors.background,
    color: themeColors.text,
  };

  const buttonStyle = {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  };

  // Apply layout-specific styles
  const layout = bio.layout || 'default';
  const layoutClasses = {
    default: "shadow-xl",
    cards: "shadow-lg border-2",
    minimal: "shadow-sm border",
    gradient: "shadow-2xl bg-gradient-to-br"
  };

  const buttonLayoutClasses = {
    default: "w-full text-white py-3 h-auto transition-all duration-200 hover:opacity-90",
    cards: "w-full text-white py-4 h-auto rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:transform hover:scale-105",
    minimal: "w-full text-white py-2 h-auto rounded-sm transition-all duration-200 hover:opacity-80",
    gradient: "w-full text-white py-3 h-auto rounded-lg bg-gradient-to-r transition-all duration-200 hover:shadow-lg"
  };

  // Typography settings
  const fontOptions = {
    inter: "'Inter', sans-serif",
    poppins: "'Poppins', sans-serif",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    montserrat: "'Montserrat', sans-serif",
    opensans: "'Open Sans', sans-serif"
  };

  const fontSizes = {
    small: "14px",
    medium: "16px",
    large: "18px",
    xlarge: "20px"
  };

  const fontFamily = fontOptions[bio.theme?.fontFamily as keyof typeof fontOptions] || fontOptions.inter;
  const fontSize = fontSizes[bio.theme?.fontSize as keyof typeof fontSizes] || fontSizes.medium;

  const typographyStyle = {
    fontFamily,
    fontSize
  };

  return (
    <Card className={layoutClasses[layout as keyof typeof layoutClasses]} style={{...cardStyle, ...typographyStyle}}>
      <CardContent className="p-8 text-center">
        {/* Custom CSS */}
        {bio.customCss && (
          <style dangerouslySetInnerHTML={{ __html: bio.customCss }} />
        )}
        {/* Profile Image */}
        <div className="mb-6 animate-fade-in">
          {(bio.profilePicture || bio.avatarUrl) ? (
            <img
              src={bio.profilePicture || bio.avatarUrl}
              alt={`${bio.name} profile`}
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg warm-shadow"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center border-4 border-white shadow-lg warm-shadow">
              <span className="text-white text-2xl font-bold">
                {bio.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}
        </div>

        {/* Name and Bio */}
        <h1 className="text-2xl font-bold mb-2 animate-slide-up" style={{ color: themeColors.text }}>{bio.name}</h1>
        {bio.description && (
          <p className="mb-8 animate-slide-up" style={{ color: themeColors.text, opacity: 0.8 }}>{bio.description}</p>
        )}

        {/* Links */}
        <div className="space-y-4">
          {bio.links && Array.isArray(bio.links) && bio.links.map((link: any, index: number) => (
            <Button
              key={index}
              onClick={() => handleLinkClick(link.url, link.title)}
              className={buttonLayoutClasses[layout as keyof typeof buttonLayoutClasses]}
              style={layout === 'gradient' ? {
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                border: 'none'
              } : buttonStyle}
              variant="default"
            >
              <div className="flex items-center justify-center w-full">
                <ExternalLink className="h-4 w-4 mr-3" />
                <span>{link.title}</span>
              </div>
            </Button>
          ))}
          {(!bio.links || !Array.isArray(bio.links) || bio.links.length === 0) && (
            <div className="text-center py-8" style={{ color: themeColors.text, opacity: 0.6 }}>
              <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No links added yet.</p>
            </div>
          )}
        </div>

        {/* Powered by */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: themeColors.text, opacity: 0.2 }}>
          <p className="text-sm" style={{ color: themeColors.text, opacity: 0.6 }}>
            Powered by{" "}
            <a 
              href="https://bioqz.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: themeColors.primary }} 
              className="font-semibold hover:underline cursor-pointer"
            >
              bioqz
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
