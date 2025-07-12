import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Demo() {
  const [, navigate] = useLocation();

  // Mock bio data for demonstration
  const demoBio = {
    name: "Alex Johnson",
    description: "Digital creator, photographer, and coffee enthusiast. Sharing my journey through art and life.",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    links: [
      {
        title: "Instagram",
        url: "https://instagram.com/alexjohnson",
      },
      {
        title: "Photography Portfolio",
        url: "https://alexjohnson.com/portfolio",
      },
      {
        title: "YouTube Channel",
        url: "https://youtube.com/alexjohnson",
      },
      {
        title: "Coffee Blog",
        url: "https://coffeewithale.com",
      },
      {
        title: "Contact Me",
        url: "mailto:alex@example.com",
      },
    ],
  };

  const handleLinkClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-brand-600">bioqz Demo</h1>
            </div>
            <Button 
              onClick={() => navigate("/")}
              className="bg-brand-600 text-white hover:bg-brand-700"
            >
              Create Your Own
            </Button>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Example Bio Page
          </h2>
          <p className="text-gray-600">
            This is how your bio page will look to visitors
          </p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8 text-center">
            {/* Profile Image */}
            <div className="mb-6">
              <img
                src={demoBio.avatarUrl}
                alt={`${demoBio.name} profile`}
                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
              />
            </div>

            {/* Name and Bio */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {demoBio.name}
            </h1>
            <p className="text-gray-600 mb-8">{demoBio.description}</p>

            {/* Links */}
            <div className="space-y-4">
              {demoBio.links.map((link, index) => (
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
            </div>

            {/* Powered by */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Powered by{" "}
                <span className="text-brand-600 font-semibold">bioqz</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Card className="bg-brand-50 border-brand-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to create your own?
              </h3>
              <p className="text-gray-600 mb-4">
                Get started with bioqz and build your personalized bio page in minutes
              </p>
              <Button
                onClick={() => {
                  window.location.href = "/api/login";
                }}
                className="bg-brand-600 text-white hover:bg-brand-700"
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}