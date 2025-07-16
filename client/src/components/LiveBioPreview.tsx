import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, User } from "lucide-react";
import type { Bio, User as UserType } from "../../../shared/schema";

interface LiveBioPreviewProps {
  bio?: Bio | null;
  user?: UserType | null;
  previewState?: any;
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
    secondary: "#ef4444",
    background: "#fef3c7",
    text: "#92400e"
  },
  ocean: {
    name: "Ocean",
    primary: "#0ea5e9",
    secondary: "#06b6d4",
    background: "#e0f2fe",
    text: "#0c4a6e"
  },
  forest: {
    name: "Forest",
    primary: "#10b981",
    secondary: "#059669",
    background: "#d1fae5",
    text: "#064e3b"
  },
  midnight: {
    name: "Midnight",
    primary: "#6366f1",
    secondary: "#8b5cf6",
    background: "#1f2937",
    text: "#f9fafb"
  },
  rose: {
    name: "Rose",
    primary: "#f43f5e",
    secondary: "#ec4899",
    background: "#fdf2f8",
    text: "#881337"
  }
};

const fontOptions = {
  inter: { name: "Inter", family: "'Inter', sans-serif" },
  poppins: { name: "Poppins", family: "'Poppins', sans-serif" },
  roboto: { name: "Roboto", family: "'Roboto', sans-serif" },
  playfair: { name: "Playfair Display", family: "'Playfair Display', serif" },
  montserrat: { name: "Montserrat", family: "'Montserrat', sans-serif" },
  opensans: { name: "Open Sans", family: "'Open Sans', sans-serif" }
};

const fontSizes = {
  small: { name: "Small", size: "14px" },
  medium: { name: "Medium", size: "16px" },
  large: { name: "Large", size: "18px" },
  xlarge: { name: "Extra Large", size: "20px" }
};

export default function LiveBioPreview({ bio, user, previewState }: LiveBioPreviewProps) {
  // Use preview state if available, otherwise fall back to bio data
  const colorScheme = previewState?.colorScheme || bio?.colorScheme || "default";
  const layout = previewState?.layout || bio?.layout || "default";
  const fontFamily = previewState?.theme?.fontFamily || bio?.theme?.fontFamily || "inter";
  const fontSize = previewState?.theme?.fontSize || bio?.theme?.fontSize || "medium";
  
  // Add console log to verify color scheme updates
  console.log("LiveBioPreview render - colorScheme:", colorScheme, "previewState:", previewState);
  
  const colors = colorSchemes[colorScheme as keyof typeof colorSchemes];
  const font = fontOptions[fontFamily as keyof typeof fontOptions];
  const size = fontSizes[fontSize as keyof typeof fontSizes];

  const sampleLinks = bio?.links?.length > 0 ? bio.links : [
    { title: "My Portfolio", url: "https://example.com", description: "Check out my work" },
    { title: "Contact Me", url: "mailto:hello@example.com", description: "Get in touch" }
  ];

  return (
    <Card 
      className="w-full max-w-md mx-auto shadow-2xl overflow-hidden border-0 backdrop-blur-sm"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: font.family,
        fontSize: size.size
      }}
    >
      <CardContent className="p-0">
        {/* Header Section with Glassmorphism Effect */}
        <div className="relative p-8 text-center" style={{ 
          background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}10)`
        }}>
          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${colors.primary}30, transparent)` }}></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${colors.secondary}30, transparent)` }}></div>
          </div>
          
          {/* Profile Picture */}
          <div className="relative mb-6 group">
            <div 
              className="w-28 h-28 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-3xl ring-4 ring-white/50 shadow-2xl group-hover:scale-105 transition-all duration-300"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              {bio?.profilePicture ? (
                <img 
                  src={bio.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12" />
              )}
            </div>
            <div className="absolute inset-0 w-28 h-28 rounded-full mx-auto bg-gradient-to-tr from-transparent via-white/10 to-white/30 group-hover:opacity-0 transition-opacity duration-300"></div>
          </div>
          
          {/* Name */}
          <h1 
            className="text-3xl font-bold mb-3 tracking-tight"
            style={{ 
              fontSize: `calc(${size.size} * 1.75)`,
              fontFamily: font.family
            }}
          >
            {bio?.name || user?.firstName || "Your Name"}
          </h1>
          
          {/* Bio Description */}
          <p 
            className="opacity-80 mb-6 leading-relaxed text-lg max-w-xs mx-auto"
            style={{ 
              fontSize: `calc(${size.size} * 1.1)`,
              fontFamily: font.family
            }}
          >
            {bio?.description || "Your bio description will appear here. Add a compelling description about yourself!"}
          </p>
        </div>

        {/* Links Section */}
        <div className="px-8 pb-8">
          <div className="space-y-3">
            {sampleLinks.slice(0, user?.isPaid ? sampleLinks.length : 1).map((link: any, index: number) => {
              if (layout === 'cards') {
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl shadow-lg text-center border cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 group overflow-hidden relative"
                    style={{ 
                      backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary,
                      color: 'white'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="relative z-10 font-medium">{link.title}</div>
                    {link.description && (
                      <div className="text-sm opacity-90 mt-1 relative z-10">{link.description}</div>
                    )}
                  </div>
                );
              }
              
              if (layout === 'minimal') {
                return (
                  <div
                    key={index}
                    className="py-4 px-4 text-center border-b-2 cursor-pointer hover:opacity-80 transition-all duration-300 hover:bg-opacity-5"
                    style={{ 
                      borderColor: index % 2 === 0 ? colors.primary : colors.secondary,
                      color: index % 2 === 0 ? colors.primary : colors.secondary
                    }}
                  >
                    <div className="font-medium">{link.title}</div>
                    {link.description && (
                      <div className="text-sm opacity-70 mt-1">{link.description}</div>
                    )}
                  </div>
                );
              }
              
              if (layout === 'gradient') {
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl text-center text-white font-medium bg-gradient-to-r shadow-xl cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 group overflow-hidden relative"
                    style={{ 
                      background: index % 2 === 0 
                        ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                        : `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="relative z-10">{link.title}</div>
                    {link.description && (
                      <div className="text-sm opacity-90 mt-1 relative z-10">{link.description}</div>
                    )}
                  </div>
                );
              }
              
              // Default layout
              return (
                <Button
                  key={index}
                  className="w-full h-auto p-4 text-white font-medium cursor-pointer hover:opacity-90 transition-all duration-300 group overflow-hidden relative backdrop-blur-sm"
                  style={{ 
                    backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary,
                    fontSize: size.size,
                    fontFamily: font.family,
                    boxShadow: `0 4px 12px ${colors.primary}20`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="flex items-center justify-center w-full relative z-10">
                    <ExternalLink className="h-4 w-4 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    <div>{link.title}</div>
                    {link.description && (
                      <div className="text-sm opacity-90 mt-1">{link.description}</div>
                    )}
                  </div>
                </Button>
              );
            })}
            
            {/* Pro upgrade message for free users */}
            {!user?.isPaid && sampleLinks.length > 1 && (
              <div className="text-center py-6 px-4 rounded-xl" style={{ 
                background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}05)`,
                border: `1px dashed ${colors.primary}30`
              }}>
                <p className="text-sm font-medium mb-2" style={{ color: colors.text, opacity: 0.7 }}>Upgrade to Pro for unlimited links</p>
                <div className="text-xs" style={{ color: colors.text, opacity: 0.5 }}>
                  {sampleLinks.length - 1} more links available with Pro
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center px-8 pb-6" style={{ 
          background: `linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}05)`,
          borderTop: `1px solid ${colors.primary}15`
        }}>
          <div className="pt-6">
            <div className="text-sm font-medium" style={{ color: colors.text, opacity: 0.6 }}>
              Powered by{" "}
              <a 
                href="https://bioqz.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: colors.primary }} 
                className="hover:underline cursor-pointer transition-all duration-200 hover:opacity-80"
              >
                bioqz
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}