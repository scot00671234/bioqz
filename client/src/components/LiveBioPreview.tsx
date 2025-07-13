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
  

  
  const colors = colorSchemes[colorScheme as keyof typeof colorSchemes];
  const font = fontOptions[fontFamily as keyof typeof fontOptions];
  const size = fontSizes[fontSize as keyof typeof fontSizes];

  const sampleLinks = bio?.links?.length > 0 ? bio.links : [
    { title: "My Portfolio", url: "https://example.com", description: "Check out my work" },
    { title: "Contact Me", url: "mailto:hello@example.com", description: "Get in touch" }
  ];

  return (
    <Card 
      className="w-full max-w-md mx-auto shadow-lg overflow-hidden"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: font.family,
        fontSize: size.size
      }}
    >
      <CardContent className="p-8">
        {/* Profile Section */}
        <div className="text-center mb-8">
          {/* Profile Picture */}
          <div 
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: colors.primary }}
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
          
          {/* Name */}
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ 
              fontSize: `calc(${size.size} * 1.5)`,
              fontFamily: font.family
            }}
          >
            {bio?.name || user?.firstName || "Your Name"}
          </h1>
          
          {/* Bio Description */}
          <p 
            className="opacity-80 mb-6 leading-relaxed"
            style={{ 
              fontSize: size.size,
              fontFamily: font.family
            }}
          >
            {bio?.description || "Your bio description will appear here. Add a compelling description about yourself!"}
          </p>
        </div>

        {/* Links Section */}
        <div className="space-y-4">
          {sampleLinks.slice(0, user?.isPaid ? sampleLinks.length : 1).map((link: any, index: number) => {
            if (layout === 'cards') {
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg shadow-sm text-center border cursor-pointer hover:shadow-md transition-shadow"
                  style={{ 
                    backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary,
                    color: 'white'
                  }}
                >
                  <div className="font-medium">{link.title}</div>
                  {link.description && (
                    <div className="text-sm opacity-90 mt-1">{link.description}</div>
                  )}
                </div>
              );
            }
            
            if (layout === 'minimal') {
              return (
                <div
                  key={index}
                  className="py-3 px-4 text-center border-b-2 cursor-pointer hover:opacity-80 transition-opacity"
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
                  className="p-4 rounded-lg text-center text-white font-medium bg-gradient-to-r shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ 
                    background: index % 2 === 0 
                      ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                      : `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`
                  }}
                >
                  <div>{link.title}</div>
                  {link.description && (
                    <div className="text-sm opacity-90 mt-1">{link.description}</div>
                  )}
                </div>
              );
            }
            
            // Default layout
            return (
              <Button
                key={index}
                className="w-full h-auto p-4 text-white font-medium cursor-pointer hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary,
                  fontSize: size.size,
                  fontFamily: font.family
                }}
              >
                <div className="flex flex-col items-center">
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
            <div className="text-center py-4 px-3 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Upgrade to Pro for unlimited links</p>
              <div className="text-xs text-gray-400">
                {sampleLinks.length - 1} more links available with Pro
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs opacity-60">
            Powered by bioqz
          </div>
        </div>
      </CardContent>
    </Card>
  );
}