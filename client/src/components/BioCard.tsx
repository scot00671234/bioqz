import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface BioCardProps {
  bio: any;
  username: string;
}

export default function BioCard({ bio, username }: BioCardProps) {
  const handleLinkClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="shadow-xl">
      <CardContent className="p-8 text-center">
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-slide-up">{bio.name}</h1>
        {bio.description && (
          <p className="text-gray-600 mb-8 animate-slide-up">{bio.description}</p>
        )}

        {/* Links */}
        <div className="space-y-4">
          {bio.links && Array.isArray(bio.links) && bio.links.map((link: any, index: number) => (
            <Button
              key={index}
              onClick={() => handleLinkClick(link.url)}
              className="w-full bg-brand-600 text-white hover:bg-brand-700 py-3 h-auto"
              variant="default"
            >
              <div className="flex items-center justify-center w-full">
                <ExternalLink className="h-4 w-4 mr-3" />
                <span>{link.title}</span>
              </div>
            </Button>
          ))}
          {(!bio.links || !Array.isArray(bio.links) || bio.links.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No links added yet.</p>
            </div>
          )}
        </div>

        {/* Powered by */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Powered by <span className="text-brand-600 font-semibold">bioqz</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
