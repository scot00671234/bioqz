import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, User } from "lucide-react";
import type { Bio, User as UserType } from "../../../shared/schema";

interface LiveBioPreviewProps {
  bio?: Bio | null;
  user?: UserType | null;
}

const colorSchemes = {
  default: {
    name: "Ocean Blue",
    primary: "#3B82F6",
    secondary: "#1E40AF",
    background: "#F8FAFC",
    text: "#1E293B"
  },
  sunset: {
    name: "Sunset Orange",
    primary: "#F97316",
    secondary: "#EA580C",
    background: "#FFF7ED",
    text: "#9A3412"
  },
  forest: {
    name: "Forest Green",
    primary: "#10B981",
    secondary: "#059669",
    background: "#ECFDF5",
    text: "#047857"
  },
  purple: {
    name: "Royal Purple",
    primary: "#8B5CF6",
    secondary: "#7C3AED",
    background: "#FAF5FF",
    text: "#5B21B6"
  },
  rose: {
    name: "Rose Pink",
    primary: "#F43F5E",
    secondary: "#E11D48",
    background: "#FFF1F2",
    text: "#BE123C"
  },
  midnight: {
    name: "Midnight Dark",
    primary: "#6366F1",
    secondary: "#4F46E5",
    background: "#1E293B",
    text: "#F1F5F9"
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

export default function LiveBioPreview({ bio, user }: LiveBioPreviewProps) {
  const colorScheme = bio?.colorScheme || "default";
  const layout = bio?.layout || "default";
  const fontFamily = bio?.theme?.fontFamily || "inter";
  const fontSize = bio?.theme?.fontSize || "medium";
  
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