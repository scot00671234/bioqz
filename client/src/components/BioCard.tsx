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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card className={`${layoutClasses[layout as keyof typeof layoutClasses]} backdrop-blur-sm border-0 overflow-hidden`} style={{...cardStyle, ...typographyStyle}}>
          <CardContent className="p-0">
            {/* Custom CSS */}
            {bio.customCss && (
              <style dangerouslySetInnerHTML={{ __html: bio.customCss }} />
            )}
            
            {/* Header Section with Glassmorphism Effect */}
            <div className="relative p-8 text-center" style={{ 
              background: `linear-gradient(135deg, ${themeColors.primary}15, ${themeColors.secondary}10)`
            }}>
              {/* Floating background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${themeColors.primary}30, transparent)` }}></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${themeColors.secondary}30, transparent)` }}></div>
              </div>
              
              {/* Profile Image */}
              <div className="relative mb-6 animate-fade-in">
                {(bio.profilePicture || bio.avatarUrl) ? (
                  <div className="relative group">
                    <img
                      src={bio.profilePicture || bio.avatarUrl}
                      alt={`${bio.name} profile`}
                      className="w-28 h-28 rounded-full mx-auto object-cover ring-4 ring-white/50 shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 w-28 h-28 rounded-full mx-auto bg-gradient-to-tr from-transparent via-white/10 to-white/30 group-hover:opacity-0 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-full mx-auto bg-gradient-to-br flex items-center justify-center ring-4 ring-white/50 shadow-2xl hover:scale-105 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                    <span className="text-white text-3xl font-bold">
                      {bio.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>

              {/* Name and Bio */}
              <h1 className="text-3xl font-bold mb-3 animate-slide-up tracking-tight" style={{ color: themeColors.text }}>{bio.name}</h1>
              {bio.description && (
                <p className="mb-6 animate-slide-up leading-relaxed text-lg max-w-xs mx-auto" style={{ color: themeColors.text, opacity: 0.8 }}>{bio.description}</p>
              )}
            </div>

            {/* Links Section */}
            <div className="px-8 pb-8">
              <div className="space-y-3">
                {bio.links && Array.isArray(bio.links) && bio.links.map((link: any, index: number) => (
                  <Button
                    key={index}
                    onClick={() => handleLinkClick(link.url, link.title)}
                    className={`${buttonLayoutClasses[layout as keyof typeof buttonLayoutClasses]} group relative overflow-hidden backdrop-blur-sm`}
                    style={layout === 'gradient' ? {
                      background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                      border: 'none'
                    } : {
                      ...buttonStyle,
                      boxShadow: `0 4px 12px ${themeColors.primary}20`
                    }}
                    variant="default"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    <div className="flex items-center justify-center w-full relative z-10">
                      <ExternalLink className="h-4 w-4 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="font-medium">{link.title}</span>
                    </div>
                  </Button>
                ))}
                {(!bio.links || !Array.isArray(bio.links) || bio.links.length === 0) && (
                  <div className="text-center py-12 px-4 rounded-xl" style={{ 
                    background: `linear-gradient(135deg, ${themeColors.primary}05, ${themeColors.secondary}05)`,
                    border: `1px dashed ${themeColors.primary}30`
                  }}>
                    <ExternalLink className="h-12 w-12 mx-auto mb-3 opacity-40" style={{ color: themeColors.primary }} />
                    <p className="text-lg font-medium" style={{ color: themeColors.text, opacity: 0.6 }}>No links added yet</p>
                    <p className="text-sm mt-1" style={{ color: themeColors.text, opacity: 0.4 }}>Links will appear here once added</p>
                  </div>
                )}
              </div>
            </div>

            {/* Powered by */}
            <div className="px-8 pb-6 text-center" style={{ 
              background: `linear-gradient(135deg, ${themeColors.primary}08, ${themeColors.secondary}05)`,
              borderTop: `1px solid ${themeColors.primary}15`
            }}>
              <div className="pt-6">
                <p className="text-sm font-medium" style={{ color: themeColors.text, opacity: 0.6 }}>
                  Powered by{" "}
                  <a 
                    href="https://bioqz.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: themeColors.primary }} 
                    className="font-semibold hover:underline cursor-pointer transition-all duration-200 hover:opacity-80"
                  >
                    bioqz
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
