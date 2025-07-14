import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ExternalLink, Upload, Camera, User, Crown, Eye, Palette } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Bio, User as UserType } from "../../../shared/schema";

const bioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  profilePicture: z.string().optional(),
  colorScheme: z.string().optional(),
});

const linkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
  icon: z.string().optional(),
});

type BioFormData = z.infer<typeof bioSchema>;
type LinkFormData = z.infer<typeof linkSchema>;

interface LiveEditingDashboardProps {
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

export default function LiveEditingDashboard({ bio, user }: LiveEditingDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [links, setLinks] = useState<LinkFormData[]>(
    bio?.links && Array.isArray(bio.links) ? bio.links : []
  );
  const [profilePicture, setProfilePicture] = useState<string>(bio?.profilePicture || bio?.avatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  
  // Live preview state
  const [livePreview, setLivePreview] = useState({
    name: bio?.name || user?.firstName || "",
    description: bio?.description || "",
    username: user?.username || "",
    avatarUrl: bio?.avatarUrl || "",
    profilePicture: bio?.profilePicture || "",
    links: bio?.links || [],
    colorScheme: bio?.colorScheme || "default",
    layout: bio?.layout || "default"
  });
  
  // Check if user is on free plan and has reached link limit
  const maxLinks = user?.isPaid ? Infinity : 1;
  const canAddMoreLinks = links.length < maxLinks;

  const form = useForm<BioFormData>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
      name: bio?.name || user?.firstName || "",
      description: bio?.description || "",
      username: user?.username || "",
      avatarUrl: bio?.avatarUrl || "",
      profilePicture: bio?.profilePicture || "",
      colorScheme: bio?.colorScheme || "default",
    },
  });

  // Update live preview when form values change
  const watchedValues = form.watch();
  const watchedName = watchedValues.name;
  const watchedDescription = watchedValues.description;
  const watchedUsername = watchedValues.username;
  const watchedAvatarUrl = watchedValues.avatarUrl;
  const watchedColorScheme = watchedValues.colorScheme;
  
  useEffect(() => {
    setLivePreview(prev => ({
      ...prev,
      name: watchedName || user?.firstName || "",
      description: watchedDescription || "",
      username: watchedUsername || "",
      avatarUrl: watchedAvatarUrl || "",
      profilePicture: profilePicture,
      links: links,
      colorScheme: watchedColorScheme || "default"
    }));
  }, [watchedName, watchedDescription, watchedUsername, watchedAvatarUrl, watchedColorScheme, links, profilePicture, user?.firstName]);

  const usernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("/api/users/username", "POST", { username });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update username");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      const message = error.message || "Failed to update username";
      const isUsernameTaken = message.includes("already taken");
      
      toast({
        title: isUsernameTaken ? "Username Taken" : "Error",
        description: isUsernameTaken 
          ? "This username is already taken. Please choose a different one."
          : message,
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: BioFormData & { links: LinkFormData[], profilePicture?: string }) => {
      // Extract username from data and only send bio-related fields
      const { username, ...bioData } = data;
      const bioResponse = await apiRequest("/api/bios", "POST", {
        ...bioData,
        links,
        profilePicture,
        layout: bio?.layout || "default",
        theme: bio?.theme || {}
      });
      if (!bioResponse.ok) {
        const error = await bioResponse.json();
        throw new Error(error.message || "Failed to save bio");
      }
      return bioResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bios/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expired",
          description: "Please log in again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save bio. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = async (data: BioFormData) => {
    try {
      console.log("🔄 Starting bio save process with data:", { 
        username: data.username, 
        currentUsername: user?.username 
      });
      
      // Update username if changed
      if (data.username !== user?.username) {
        console.log(`🔄 Updating username from ${user?.username} to ${data.username}`);
        await usernameMutation.mutateAsync(data.username);
        console.log("✅ Username updated successfully");
      } else {
        console.log("ℹ️ Username unchanged, skipping username update");
      }

      // Filter out empty links
      const validLinks = links.filter(link => link.title && link.url);
      
      // Create/update bio
      console.log("🔄 Saving bio data...");
      await saveMutation.mutateAsync({
        ...data,
        links: validLinks,
        profilePicture,
      });
      console.log("✅ Bio saved successfully");

      // Show success message
      toast({
        title: "Success!",
        description: `Your bio is now live at bioqz.com/${data.username}`,
      });
      
    } catch (error) {
      console.error("❌ Failed to save bio:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save bio. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addLink = () => {
    if (canAddMoreLinks) {
      const newLink = { title: "", url: "", icon: "" };
      const updatedLinks = [...links, newLink];
      setLinks(updatedLinks);
      setLivePreview(prev => ({ ...prev, links: updatedLinks }));
    }
  };

  const removeLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
    setLivePreview(prev => ({ ...prev, links: updatedLinks }));
  };

  const updateLink = (index: number, field: keyof LinkFormData, value: string) => {
    const updatedLinks = links.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setLinks(updatedLinks);
    setLivePreview(prev => ({ ...prev, links: updatedLinks }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePicture(result);
        setLivePreview(prev => ({ ...prev, profilePicture: result }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const colorScheme = livePreview.colorScheme || "default";
  const colors = colorSchemes[colorScheme as keyof typeof colorSchemes];

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Left Panel - Editor */}
      <div className="w-1/2 overflow-y-auto pr-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Picture */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold border-4"
                    style={{ backgroundColor: colors.primary, borderColor: colors.secondary }}
                  >
                    {profilePicture ? (
                      <img 
                        src={profilePicture} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-upload"
                    />
                    <label htmlFor="profile-upload">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        asChild
                      >
                        <span>
                          {isUploading ? (
                            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                          {isUploading ? "Uploading..." : "Upload Photo"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                    bioqz.com/
                  </span>
                  <Input
                    id="username"
                    placeholder="username"
                    className="rounded-l-none"
                    {...form.register("username")}
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                )}
              </div>

              {/* Bio Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Bio Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell people about yourself..."
                  rows={3}
                  {...form.register("description")}
                />
              </div>

              {/* Color Scheme - Pro Feature Only */}
              {user?.isPaid && (
                <div className="space-y-2">
                  <Label htmlFor="colorScheme" className="flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Color Scheme
                    <Crown className="h-4 w-4 ml-2 text-yellow-500" />
                  </Label>
                  <Select
                    value={form.watch("colorScheme") || "default"}
                    onValueChange={(value) => {
                      form.setValue("colorScheme", value);
                      toast({
                        title: "Color scheme updated!",
                        description: `Applied ${colorSchemes[value as keyof typeof colorSchemes]?.name || value} theme`,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(colorSchemes).map(([key, scheme]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2 border"
                              style={{ backgroundColor: scheme.primary }}
                            />
                            {scheme.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Links Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Links</CardTitle>
                {!user?.isPaid && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">Free plan: {links.length}/{maxLinks} links</span>
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {links.map((link, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Link {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Link title"
                    value={link.title}
                    onChange={(e) => updateLink(index, "title", e.target.value)}
                  />
                  <Input
                    placeholder="https://example.com"
                    value={link.url}
                    onChange={(e) => updateLink(index, "url", e.target.value)}
                  />
                </div>
              ))}

              {canAddMoreLinks ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLink}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              ) : (
                <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upgrade to Pro for unlimited links</p>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                    onClick={() => window.location.href = '/subscribe'}
                  >
                    Upgrade Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white pt-4 border-t">
            <Button
              type="submit"
              className="w-full"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="w-1/2 overflow-y-auto pl-4">
        <div className="sticky top-0 bg-white z-10 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Live Preview
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const username = form.watch("username") || livePreview.username;
                  if (!username) {
                    toast({
                      title: "Username Required",
                      description: "Please set a username first to copy the link.",
                      variant: "destructive",
                    });
                    return;
                  }
                  navigator.clipboard.writeText(`${window.location.origin}/${username}`);
                  toast({
                    title: "Link Copied!",
                    description: `Your bio link has been copied to clipboard.`,
                  });
                }}
              >
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const username = form.watch("username") || livePreview.username;
                  if (!username) {
                    toast({
                      title: "Username Required",
                      description: "Please set a username first to view your live bio.",
                      variant: "destructive",
                    });
                    return;
                  }
                  window.open(`/${username}`, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Live Bio
              </Button>
            </div>
          </div>
        </div>

        {/* Bio Preview Card */}
        <Card 
          className="w-full max-w-md mx-auto shadow-lg overflow-hidden"
          style={{
            backgroundColor: colors.background,
            color: colors.text
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
                {livePreview.profilePicture ? (
                  <img 
                    src={livePreview.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12" />
                )}
              </div>
              
              {/* Name */}
              <h1 className="text-2xl font-bold mb-2">
                {livePreview.name || "Your Name"}
              </h1>
              
              {/* Bio Description */}
              <p className="opacity-80 mb-6 leading-relaxed">
                {livePreview.description || "Your bio description will appear here. Add a compelling description about yourself!"}
              </p>
            </div>

            {/* Links Section */}
            <div className="space-y-4">
              {livePreview.links.slice(0, user?.isPaid ? livePreview.links.length : 1).map((link: any, index: number) => (
                <Button
                  key={index}
                  className="w-full h-auto p-4 text-white font-medium"
                  style={{ 
                    backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div>{link.title || `Link ${index + 1}`}</div>
                    {link.url && (
                      <div className="text-sm opacity-90 mt-1 truncate max-w-full">
                        {link.url}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
              
              {/* Pro upgrade message for free users */}
              {!user?.isPaid && livePreview.links.length > 1 && (
                <div className="text-center py-4 px-3 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Upgrade to Pro for unlimited links</p>
                  <div className="text-xs text-gray-400">
                    {livePreview.links.length - 1} more links available with Pro
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
      </div>
    </div>
  );
}