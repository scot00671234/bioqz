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
  onPreviewChange: (previewState: any) => void;
  previewState: any;
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

const fontOptions = {
  inter: {
    name: "Inter",
    family: "'Inter', sans-serif",
    description: "Modern and clean"
  },
  poppins: {
    name: "Poppins",
    family: "'Poppins', sans-serif",
    description: "Friendly and rounded"
  },
  roboto: {
    name: "Roboto",
    family: "'Roboto', sans-serif",
    description: "Google's material design"
  },
  playfair: {
    name: "Playfair Display",
    family: "'Playfair Display', serif",
    description: "Elegant serif font"
  },
  montserrat: {
    name: "Montserrat",
    family: "'Montserrat', sans-serif",
    description: "Geometric and modern"
  },
  opensans: {
    name: "Open Sans",
    family: "'Open Sans', sans-serif",
    description: "Readable and versatile"
  }
};

const fontSizes = {
  small: { name: "Small", size: "14px" },
  medium: { name: "Medium", size: "16px" },
  large: { name: "Large", size: "18px" },
  xlarge: { name: "Extra Large", size: "20px" }
};

export default function ProThemeEditor({ bio, onSave, onPreviewChange, previewState }: ProThemeEditorProps) {
  const [colorScheme, setColorScheme] = useState(previewState?.colorScheme || bio?.colorScheme || "default");
  const [layout, setLayout] = useState(previewState?.layout || bio?.layout || "default");
  const [theme, setTheme] = useState(previewState?.theme || bio?.theme || {});
  const [fontFamily, setFontFamily] = useState(previewState?.theme?.fontFamily || bio?.theme?.fontFamily || "inter");
  const [fontSize, setFontSize] = useState(previewState?.theme?.fontSize || bio?.theme?.fontSize || "medium");
  const { toast } = useToast();

  // Update preview in real-time whenever any setting changes
  const updatePreview = (updates: any) => {
    const newPreviewState = {
      colorScheme: updates.colorScheme || colorScheme,
      layout: updates.layout || layout,
      theme: {
        ...theme,
        fontFamily: updates.theme?.fontFamily || fontFamily,
        fontSize: updates.theme?.fontSize || fontSize,
        ...updates.theme
      }
    };

    onPreviewChange(newPreviewState);
  };

  // Update preview in real-time whenever settings change
  const currentPreviewData = {
    colorScheme,
    layout,
    theme: {
      ...theme,
      colors: colorSchemes[colorScheme as keyof typeof colorSchemes],
      fontFamily,
      fontSize
    }
  };

  const handleSave = () => {
    const themeData = {
      colorScheme,
      layout,
      customCss: "",
      theme: {
        ...theme,
        colors: colorSchemes[colorScheme as keyof typeof colorSchemes],
        fontFamily,
        fontSize
      }
    };
    
    onSave(themeData);
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
          <TabsTrigger value="typography">
            <span className="text-sm mr-2">Aa</span>
            Typography
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Color Scheme</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="colorScheme">Choose a color scheme</Label>
              <Select value={colorScheme} onValueChange={(value) => {

                setColorScheme(value);
                updatePreview({ colorScheme: value });
              }}>
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
              
              {/* Live Bio Preview */}
              <div className="mt-4 p-6 rounded-lg border" style={{
                backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].background,
                color: colorSchemes[colorScheme as keyof typeof colorSchemes].text,
                fontFamily: fontOptions[fontFamily as keyof typeof fontOptions].family,
                fontSize: fontSizes[fontSize as keyof typeof fontSizes].size
              }}>
                <h4 className="font-semibold mb-4">Live Bio Preview</h4>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-3" style={{
                      backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].primary,
                      opacity: 0.9
                    }}>
                      <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {(bio?.username || 'A').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <h5 className="font-bold text-lg mb-1">{bio?.displayName || bio?.username || 'Your Name'}</h5>
                    <p className="opacity-80 text-sm mb-3">{bio?.bio || 'Your bio description will appear here'}</p>
                  </div>
                  
                  {/* Sample Links with Layout */}
                  {layout === 'cards' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg shadow-sm text-center" style={{ 
                        backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].primary,
                        color: 'white'
                      }}>
                        <div className="font-medium">Portfolio</div>
                      </div>
                      <div className="p-3 rounded-lg shadow-sm text-center" style={{ 
                        backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].secondary,
                        color: 'white'
                      }}>
                        <div className="font-medium">Contact</div>
                      </div>
                    </div>
                  )}
                  
                  {layout === 'minimal' && (
                    <div className="space-y-2">
                      <div className="py-2 px-4 text-center border-b" style={{ 
                        borderColor: colorSchemes[colorScheme as keyof typeof colorSchemes].primary,
                        color: colorSchemes[colorScheme as keyof typeof colorSchemes].primary
                      }}>
                        Portfolio
                      </div>
                      <div className="py-2 px-4 text-center border-b" style={{ 
                        borderColor: colorSchemes[colorScheme as keyof typeof colorSchemes].secondary,
                        color: colorSchemes[colorScheme as keyof typeof colorSchemes].secondary
                      }}>
                        Contact
                      </div>
                    </div>
                  )}
                  
                  {layout === 'gradient' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg text-center text-white font-medium bg-gradient-to-r" style={{ 
                        background: `linear-gradient(135deg, ${colorSchemes[colorScheme as keyof typeof colorSchemes].primary}, ${colorSchemes[colorScheme as keyof typeof colorSchemes].secondary})`
                      }}>
                        Portfolio
                      </div>
                      <div className="p-3 rounded-lg text-center text-white font-medium bg-gradient-to-r" style={{ 
                        background: `linear-gradient(135deg, ${colorSchemes[colorScheme as keyof typeof colorSchemes].secondary}, ${colorSchemes[colorScheme as keyof typeof colorSchemes].primary})`
                      }}>
                        Contact
                      </div>
                    </div>
                  )}
                  
                  {layout === 'default' && (
                    <div className="space-y-3">
                      <div className="px-4 py-3 rounded-lg text-white text-center font-medium" style={{ 
                        backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].primary
                      }}>
                        Portfolio
                      </div>
                      <div className="px-4 py-3 rounded-lg text-white text-center font-medium" style={{ 
                        backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].secondary
                      }}>
                        Contact
                      </div>
                    </div>
                  )}
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
              <Select value={layout} onValueChange={(value) => {
                setLayout(value);
                updatePreview({ layout: value });
              }}>
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

              {/* Live Layout Preview */}
              <div className="mt-4 p-6 rounded-lg border" style={{
                backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].background,
                color: colorSchemes[colorScheme as keyof typeof colorSchemes].text,
                fontFamily: fontOptions[fontFamily as keyof typeof fontOptions].family,
                fontSize: fontSizes[fontSize as keyof typeof fontSizes].size
              }}>
                <h4 className="font-semibold mb-4">Live Layout Preview</h4>
                <div className="text-sm mb-4 opacity-80">
                  {layouts[layout as keyof typeof layouts].description}
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-3" style={{
                      backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].primary,
                      opacity: 0.9
                    }}>
                      <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {(bio?.username || 'A').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <h5 className="font-bold text-lg mb-1">{bio?.displayName || bio?.username || 'Your Name'}</h5>
                    <p className="opacity-80 text-sm mb-4">{bio?.bio || 'Your bio description'}</p>
                  </div>
                  
                  {/* Dynamic Layout Rendering */}
                  {layout === 'cards' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg shadow-sm text-center border" style={{ 
                        backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].primary,
                        color: 'white'
                      }}>
                        <div className="font-medium">My Portfolio</div>
                      </div>
                      <div className="p-4 rounded-lg shadow-sm text-center border" style={{ 
                        backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].secondary,
                        color: 'white'
                      }}>
                        <div className="font-medium">Contact Me</div>
                      </div>
                    </div>
                  )}
                  
                  {layout === 'minimal' && (
                    <div className="space-y-2">
                      <div className="py-3 px-4 text-center border-b-2 hover:opacity-80 transition-opacity" style={{ 
                        borderColor: colorSchemes[colorScheme as keyof typeof colorSchemes].primary,
                        color: colorSchemes[colorScheme as keyof typeof colorSchemes].primary
                      }}>
                        My Portfolio
                      </div>
                      <div className="py-3 px-4 text-center border-b-2 hover:opacity-80 transition-opacity" style={{ 
                        borderColor: colorSchemes[colorScheme as keyof typeof colorSchemes].secondary,
                        color: colorSchemes[colorScheme as keyof typeof colorSchemes].secondary
                      }}>
                        Contact Me
                      </div>
                    </div>
                  )}
                  
                  {layout === 'gradient' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg text-center text-white font-medium bg-gradient-to-r shadow-md hover:shadow-lg transition-shadow" style={{ 
                        background: `linear-gradient(135deg, ${colorSchemes[colorScheme as keyof typeof colorSchemes].primary}, ${colorSchemes[colorScheme as keyof typeof colorSchemes].secondary})`
                      }}>
                        My Portfolio
                      </div>
                      <div className="p-4 rounded-lg text-center text-white font-medium bg-gradient-to-r shadow-md hover:shadow-lg transition-shadow" style={{ 
                        background: `linear-gradient(135deg, ${colorSchemes[colorScheme as keyof typeof colorSchemes].secondary}, ${colorSchemes[colorScheme as keyof typeof colorSchemes].primary})`
                      }}>
                        Contact Me
                      </div>
                    </div>
                  )}
                  
                  {layout === 'default' && (
                    <div className="space-y-3">
                      <div className="px-6 py-4 rounded-lg text-white text-center font-medium hover:opacity-90 transition-opacity" style={{ 
                        backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].primary
                      }}>
                        My Portfolio
                      </div>
                      <div className="px-6 py-4 rounded-lg text-white text-center font-medium hover:opacity-90 transition-opacity" style={{ 
                        backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].secondary
                      }}>
                        Contact Me
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <Badge variant="outline" className="opacity-70">
                    {layouts[layout as keyof typeof layouts].name} Layout
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Font & Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select value={fontFamily} onValueChange={(value) => {
                  setFontFamily(value);
                  updatePreview({ theme: { fontFamily: value } });
                }}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(fontOptions).map(([key, font]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div className="font-medium" style={{ fontFamily: font.family }}>
                            {font.name}
                          </div>
                          <div className="text-sm text-gray-500">{font.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Select value={fontSize} onValueChange={(value) => {
                  setFontSize(value);
                  updatePreview({ theme: { fontSize: value } });
                }}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(fontSizes).map(([key, size]) => (
                      <SelectItem key={key} value={key}>
                        <span style={{ fontSize: size.size }}>
                          {size.name} ({size.size})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Typography Live Preview */}
              <div className="mt-4 p-6 rounded-lg border" style={{
                backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].background,
                color: colorSchemes[colorScheme as keyof typeof colorSchemes].text,
                fontFamily: fontOptions[fontFamily as keyof typeof fontOptions].family,
                fontSize: fontSizes[fontSize as keyof typeof fontSizes].size
              }}>
                <h4 className="font-semibold mb-4">Live Typography Preview</h4>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-3" style={{
                      backgroundColor: colorSchemes[colorScheme as keyof typeof colorSchemes].primary,
                      opacity: 0.9
                    }}>
                      <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {(bio?.username || 'A').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <h5 className="font-bold text-lg mb-1" style={{
                      fontFamily: fontOptions[fontFamily as keyof typeof fontOptions].family,
                      fontSize: `calc(${fontSizes[fontSize as keyof typeof fontSizes].size} * 1.2)`
                    }}>
                      {bio?.displayName || bio?.username || 'Your Name'}
                    </h5>
                    <p className="opacity-80 mb-3" style={{
                      fontFamily: fontOptions[fontFamily as keyof typeof fontOptions].family,
                      fontSize: fontSizes[fontSize as keyof typeof fontSizes].size
                    }}>
                      {bio?.bio || 'Your bio description with the selected typography'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm opacity-70">
                      Font: {fontOptions[fontFamily as keyof typeof fontOptions].name} • Size: {fontSizes[fontSize as keyof typeof fontSizes].name}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
}