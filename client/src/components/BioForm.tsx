import { useState } from "react";
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
import { Plus, Trash2, ExternalLink, Upload, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

const bioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  profilePicture: z.string().optional(),
});

const linkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
  icon: z.string().optional(),
});

type BioFormData = z.infer<typeof bioSchema>;
type LinkFormData = z.infer<typeof linkSchema>;

interface BioFormProps {
  bio?: any;
}

export default function BioForm({ bio }: BioFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [links, setLinks] = useState<LinkFormData[]>(
    bio?.links && Array.isArray(bio.links) ? bio.links : []
  );
  const [profilePicture, setProfilePicture] = useState<string>(bio?.profilePicture || bio?.avatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  
  // Check if user is on free plan and has reached link limit
  const maxLinks = user?.isPaid ? Infinity : 1;
  const canAddMoreLinks = links.length < maxLinks;

  const form = useForm<BioFormData>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
      name: bio?.name || "",
      description: bio?.description || "",
      username: user?.username || "",
      avatarUrl: bio?.avatarUrl || "",
      profilePicture: bio?.profilePicture || "",
    },
  });

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
        form.setValue("profilePicture", result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const bioMutation = useMutation({
    mutationFn: async (data: BioFormData & { links: LinkFormData[], profilePicture?: string }) => {
      // Extract username from data and only send bio-related fields
      const { username, ...bioData } = data;
      const bioResponse = await apiRequest("/api/bios", "POST", {
        ...bioData,
        profilePicture,
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
      toast({
        title: "Error",
        description: error.message || "Failed to update bio. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const addLink = () => {
    if (!user?.isPaid && links.length >= 1) {
      toast({
        title: "Upgrade Required",
        description: "Free users can only add 1 link. Upgrade to Pro for unlimited links.",
        variant: "destructive",
      });
      return;
    }
    setLinks([...links, { title: "", url: "", icon: "" }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof LinkFormData, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const onSubmit = async (data: BioFormData) => {
    try {
      // Update username if changed
      if (data.username !== user?.username) {
        await usernameMutation.mutateAsync(data.username);
      }

      // Filter out empty links
      const validLinks = links.filter(link => link.title && link.url);
      
      // Create/update bio
      await bioMutation.mutateAsync({
        ...data,
        links: validLinks,
        profilePicture,
      });

      // Show success message and navigate to the bio page
      toast({
        title: "Success!",
        description: `Your bio is now live at bioqz.com/${data.username}`,
      });
      
      // Wait a moment then navigate to the bio
      setTimeout(() => {
        window.open(`/${data.username}`, '_blank');
      }, 1000);
      
    } catch (error) {
      console.error("Failed to save bio:", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="animate-fade-in">
          <Label htmlFor="name" className="text-brand-700 font-semibold">Display Name</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Your display name"
            className="focus:ring-brand-500 focus:border-brand-500 warm-shadow"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="animate-fade-in">
          <Label htmlFor="username" className="text-brand-700 font-semibold">Username</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-600 text-sm font-medium">
              bioqz.com/
            </span>
            <Input
              id="username"
              {...form.register("username")}
              className="pl-24 focus:ring-brand-500 focus:border-brand-500 warm-shadow"
              placeholder="yourname"
            />
          </div>
          {form.formState.errors.username && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.username.message}</p>
          )}
        </div>
      </div>

      <div className="animate-fade-in">
        <Label htmlFor="description" className="text-brand-700 font-semibold">Bio</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Tell people about yourself..."
          rows={3}
          className="focus:ring-brand-500 focus:border-brand-500 warm-shadow"
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>

      {/* Profile Picture Upload */}
      <div className="animate-fade-in">
        <Label className="text-brand-700 font-semibold">Profile Picture</Label>
        <div className="mt-2 flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="profile-picture-upload"
            />
            <label
              htmlFor="profile-picture-upload"
              className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 cursor-pointer transition-colors warm-shadow"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Upload a photo (max 5MB). JPG, PNG, or GIF.
            </p>
          </div>
        </div>
      </div>

      {/* Legacy Avatar URL for backward compatibility */}
      <div className="animate-fade-in">
        <Label htmlFor="avatarUrl">Or use Avatar URL (optional)</Label>
        <Input
          id="avatarUrl"
          {...form.register("avatarUrl")}
          placeholder="https://example.com/your-photo.jpg"
          className="focus:ring-brand-500 focus:border-brand-500"
        />
        {form.formState.errors.avatarUrl && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.avatarUrl.message}</p>
        )}
      </div>

      <Card className="animate-slide-up warm-shadow">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-brand-700">Your Links</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {user?.isPaid ? `${links.length} links` : `${links.length}/1 link`}
              </span>
              <Button 
                type="button" 
                onClick={addLink} 
                size="sm" 
                className="bg-brand-500 hover:bg-brand-600 text-white"
                disabled={!canAddMoreLinks}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
          {!user?.isPaid && (
            <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
              ⚡ Free plan: 1 link only. <strong>Upgrade to Pro</strong> for unlimited links!
            </p>
          )}
          {user?.isPaid && (
            <p className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
              🎉 Pro plan: Add unlimited links!
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {links.map((link, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {links.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No links added yet. Click "Add Link" to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full brand-gradient text-white hover:bg-brand-700 warm-shadow animate-fade-in text-lg py-3 h-auto"
        disabled={bioMutation.isPending || usernameMutation.isPending}
      >
        {bioMutation.isPending || usernameMutation.isPending ? "Saving..." : "💫 Save Changes"}
      </Button>
    </form>
  );
}
