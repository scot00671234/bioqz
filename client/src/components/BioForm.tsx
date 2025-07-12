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
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

const bioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
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

  const form = useForm<BioFormData>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
      name: bio?.name || "",
      description: bio?.description || "",
      username: user?.username || "",
      avatarUrl: bio?.avatarUrl || "",
    },
  });

  const bioMutation = useMutation({
    mutationFn: async (data: BioFormData & { links: LinkFormData[] }) => {
      const bioResponse = await apiRequest("POST", "/api/bios", data);
      return bioResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bio updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bios/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
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
        description: "Failed to update bio. Please try again.",
        variant: "destructive",
      });
    },
  });

  const usernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("POST", "/api/users/username", { username });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
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
        description: "Failed to update username. It may already be taken.",
        variant: "destructive",
      });
    },
  });

  const addLink = () => {
    if (!user?.isPaid && links.length >= 5) {
      toast({
        title: "Upgrade Required",
        description: "Free users can only add up to 5 links. Upgrade to Pro for unlimited links.",
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
    // Update username if changed
    if (data.username !== user?.username) {
      await usernameMutation.mutateAsync(data.username);
    }

    // Filter out empty links
    const validLinks = links.filter(link => link.title && link.url);
    
    bioMutation.mutate({
      ...data,
      links: validLinks,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Your display name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
              quickbio.com/
            </span>
            <Input
              id="username"
              {...form.register("username")}
              className="pl-24"
              placeholder="yourname"
            />
          </div>
          {form.formState.errors.username && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.username.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Bio</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Tell people about yourself..."
          rows={3}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
        <Input
          id="avatarUrl"
          {...form.register("avatarUrl")}
          placeholder="https://example.com/your-photo.jpg"
        />
        {form.formState.errors.avatarUrl && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.avatarUrl.message}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Links</CardTitle>
            <Button type="button" onClick={addLink} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
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
        className="w-full bg-brand-600 text-white hover:bg-brand-700"
        disabled={bioMutation.isPending || usernameMutation.isPending}
      >
        {bioMutation.isPending || usernameMutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
