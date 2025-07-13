import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Palette, Layout, Code, Crown, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProThemeEditorProps {
  bio: any;
  onSave: (themeData: any) => void;
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

const layouts = {
  default: {
    name: "Default",
    description: "Traditional centered layout"
  },
  cards: {
    name: "Cards",
    description: "Links displayed as cards"
  },
  minimal: {
    name: "Minimal",
    description: "Clean, minimal design"
  },
  gradient: {
    name: "Gradient",
    description: "Gradient background design"
  }
};

export default function ProThemeEditor({ bio, onSave }: ProThemeEditorProps) {
  const [colorScheme, setColorScheme] = useState(bio?.colorScheme || "default");
  const [layout, setLayout] = useState(bio?.layout || "default");
  const [customCss, setCustomCss] = useState(bio?.customCss || "");
  const [theme, setTheme] = useState(bio?.theme || {});
  const { toast } = useToast();

  const handleSave = () => {
    const themeData = {
      colorScheme,
      layout,
      customCss,
      theme: {
        ...theme,
        colors: colorSchemes[colorScheme as keyof typeof colorSchemes]
      }
    };
    
    onSave(themeData);
    toast({
      title: "Theme Saved",
      description: "Your theme customizations have been saved successfully.",
    });
  };

  const handlePreview = () => {
    // Open bio in new tab for preview
    window.open(`/${bio?.username || 'preview'}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Crown className="h-5 w-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold">Pro Theme Editor</h3>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handlePreview} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Theme
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Code className="h-4 w-4 mr-2" />
            Custom CSS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Color Scheme</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="colorScheme">Choose a color scheme</Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select color scheme" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(colorSchemes).map(([key, scheme]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: scheme.primary }}
                        />
                        {scheme.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Color Preview */}
              <div className="mt-4 p-4 rounded-lg border" style={{
                backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].background,
                color: colorSchemes[colorScheme as keyof typeof colorSchemes].text
              }}>
                <h4 className="font-semibold mb-2">Preview</h4>
                <div className="space-y-2">
                  <div
                    className="px-3 py-2 rounded text-white text-sm"
                    style={{ backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].primary }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="px-3 py-2 rounded text-white text-sm"
                    style={{ backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].secondary }}
                  >
                    Secondary Button
                  </div>
                  <p className="text-sm">This is how your text will appear</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Layout Style</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="layout">Choose a layout</Label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(layouts).map(([key, layoutInfo]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{layoutInfo.name}</div>
                        <div className="text-sm text-gray-500">{layoutInfo.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Layout Preview */}
              <div className="mt-4 p-4 rounded-lg border bg-gray-50">
                <h4 className="font-semibold mb-2">Layout Preview</h4>
                <div className="text-sm text-gray-600">
                  {layouts[layout as keyof typeof layouts].description}
                </div>
                <Badge variant="outline" className="mt-2">
                  {layouts[layout as keyof typeof layouts].name}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custom CSS</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="customCss">Add custom CSS to further customize your bio</Label>
              <Textarea
                id="customCss"
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                placeholder="/* Add your custom CSS here */
.bio-container {
  font-family: 'Inter', sans-serif;
}

.bio-link {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.bio-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}"
                className="mt-2 h-32 font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-2">
                Use CSS to override default styles. Changes will be applied to your bio page.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}