import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Link, Palette, BarChart3, Menu, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import peopleCollageImage from "@/assets/people-collage.jpg";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const handleSignIn = () => {
    navigate("/auth");
  };

  const handleViewDemo = () => {
    navigate("/demo");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-2xl font-bold text-brand-600 animate-bounce-subtle hover:text-brand-700 cursor-pointer"
                >
                  bioqz
                </button>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-brand-600 px-3 py-2 text-sm font-medium transition-colors">Home</button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-brand-600 px-3 py-2 text-sm font-medium transition-colors">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-brand-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</button>
              <Button variant="ghost" onClick={handleSignIn} className="text-gray-700 hover:text-brand-600">
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="bg-brand-600 text-white hover:bg-brand-700">
                Get Started
              </Button>
            </div>
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-brand-600"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-2">
              <div className="space-y-1">
                <button onClick={() => scrollToSection('home')} className="block px-3 py-2 text-gray-700 hover:text-brand-600 w-full text-left">Home</button>
                <button onClick={() => scrollToSection('features')} className="block px-3 py-2 text-gray-700 hover:text-brand-600 w-full text-left">Features</button>
                <button onClick={() => scrollToSection('pricing')} className="block px-3 py-2 text-gray-700 hover:text-brand-600 w-full text-left">Pricing</button>
                <Button variant="ghost" onClick={handleSignIn} className="w-full justify-start">
                  Sign In
                </Button>
                <Button onClick={handleGetStarted} className="w-full bg-brand-600 text-white hover:bg-brand-700">
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        id="home" 
        className="relative py-20"
        style={{
          backgroundImage: `url(${peopleCollageImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              Your Bio, 
              <span className="text-orange-400">Quick & Eazy</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-slide-up">
              Create a stunning bio page that showcases all your links in one place. Perfect for social media, business cards, and email signatures.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={handleGetStarted} 
                className="bg-orange-500 text-white px-8 py-3 text-lg font-semibold hover:bg-orange-600 h-auto shadow-lg"
              >
                Create Your Bio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Example Bio Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">See It In Action</h2>
            <p className="text-xl text-gray-600">This is how your bio page will look to visitors</p>
          </div>
          
          {/* Example Bio Card */}
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl">
              <CardContent className="p-8 text-center">
                {/* Profile Image */}
                <div className="mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                    alt="Alex Johnson profile"
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                  />
                </div>

                {/* Name and Bio */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Alex Johnson</h3>
                <p className="text-gray-600 mb-8">
                  Digital creator, photographer, and coffee enthusiast. Sharing my journey through art and life.
                </p>

                {/* Links */}
                <div className="space-y-4">
                  {[
                    { title: "Instagram", url: "https://instagram.com" },
                    { title: "Photography Portfolio", url: "https://example.com" },
                    { title: "YouTube Channel", url: "https://youtube.com" }
                  ].map((link, index) => (
                    <Button
                      key={index}
                      className="w-full bg-brand-600 text-white hover:bg-brand-700 py-3 h-auto"
                      variant="default"
                      onClick={() => {}}
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
                    Powered by <span className="text-brand-600 font-semibold">bioqz</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Simple, powerful tools to build your perfect bio page</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-brand-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Link className="text-brand-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Links</h3>
              <p className="text-gray-600">Add links to your social profiles, websites, and content (1 link free, unlimited with Pro)</p>
            </div>
            <div className="text-center">
              <div className="bg-brand-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Palette className="text-brand-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Beautiful Themes</h3>
              <p className="text-gray-600">Choose from professionally designed themes that match your style</p>
            </div>
            <div className="text-center">
              <div className="bg-brand-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-brand-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600">Track clicks and see which links your audience engages with most</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you're ready</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 shadow-lg">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-lg font-normal text-gray-600">/month</span></div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>1 bio page</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Basic themes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>1 link only</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleGetStarted} 
                  variant="secondary" 
                  className="w-full"
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>
            
            {/* Pro Plan */}
            <Card className="p-8 shadow-lg border-2 border-brand-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </div>
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">$9<span className="text-lg font-normal text-gray-600">/month</span></div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Unlimited links</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Premium themes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Custom domains</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Analytics dashboard</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-brand-600 text-white hover:bg-brand-700"
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
