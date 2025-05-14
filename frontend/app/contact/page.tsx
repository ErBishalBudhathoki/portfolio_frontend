"use client";

import { useState, useEffect } from "react";
import { Mail, Send, MapPin, Phone, Linkedin, Github, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGlobalLoading } from "@/providers/loading-provider";
import { useApi } from "@/hooks/useApi";

// Define types
interface BasicInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  contact_email?: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface ContactData {
  basic_info: BasicInfo;
  social_links: SocialLink[];
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { withLoading } = useGlobalLoading();
  
  // Use our caching hook to fetch contact data
  const { data, error, isLoading } = useApi<{basic_info: BasicInfo, social_links: SocialLink[]}>('/profile', {
    dedupingInterval: 300000, // 5 minutes cache
  });
  
  // Debug log to see what we're getting from the API
  useEffect(() => {
    if (data) {
      console.log('Contact page - Profile data received:', data);
      console.log('Contact email:', data.basic_info?.contact_email);
    }
  }, [data]);
  
  // Extract relevant data or use defaults
  const contactInfo = {
    basic_info: data?.basic_info || {},
    social_links: data?.social_links || []
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use the withLoading function to show global loading state
    withLoading(new Promise<void>((resolve) => {
      (async () => {
        setSending(true);
        setSendStatus(null);
        
        try {
          // Make API call to send form data
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          
          if (!response.ok) {
            throw new Error("Failed to send message");
          }
          
          // Clear form after successful submission
          setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
          });
          
          setSendStatus({
            type: "success",
            message: "Your message has been sent! I'll get back to you as soon as possible.",
          });
        } catch (error) {
          console.error("Error sending contact form:", error);
          setSendStatus({
            type: "error",
            message: "Sorry, there was an error sending your message. Please try again later.",
          });
        } finally {
          setSending(false);
          resolve();
        }
      })();
    }));
  };
  
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" showText />
      </div>
    );
  }
  
  return (
    <div className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center section-heading-spacing">
          <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-sm font-medium">
            <MessageSquare className="w-4 h-4 mr-2" />
            Connect
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Let's Get In Touch
          </h1>
          <div className="w-20 h-1 bg-accent-foreground rounded-full"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-center">
            Have a question or want to work together? Feel free to reach out
            using the form below or through any of my contact channels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Information */}
          <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-md">
            <h2 className="text-2xl font-bold mb-8 text-foreground">Contact Information</h2>
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-accent-foreground/10 p-3 rounded-lg mr-4 border border-accent-foreground/20">
                  <Mail className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1 text-foreground">Email</h3>
                  <a
                    href={`mailto:${contactInfo.basic_info.contact_email || 'contact@bishalbudhathoki.com'}`}
                    className="text-muted-foreground hover:text-accent-foreground transition-colors"
                  >
                    {contactInfo.basic_info.contact_email || 'contact@bishalbudhathoki.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-accent-foreground/10 p-3 rounded-lg mr-4 border border-accent-foreground/20">
                  <MapPin className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1 text-foreground">Location</h3>
                  <p className="text-muted-foreground">{contactInfo.basic_info.location || 'Available for remote work worldwide'}</p>
                </div>
              </div>

              {/* Social Links */}
              {contactInfo.social_links.map((link, index) => (
                <div className="flex items-start" key={index}>
                  <div className="bg-accent-foreground/10 p-3 rounded-lg mr-4 border border-accent-foreground/20">
                    {link.platform.toLowerCase().includes('linkedin') ? (
                      <Linkedin className="h-6 w-6 text-accent-foreground" />
                    ) : link.platform.toLowerCase().includes('github') ? (
                      <Github className="h-6 w-6 text-accent-foreground" />
                    ) : (
                      <MessageSquare className="h-6 w-6 text-accent-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1 text-foreground">{link.platform}</h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent-foreground transition-colors"
                    >
                      {link.url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Send Message</h2>
            
            {sendStatus && sendStatus.type === "success" ? (
              <div className="bg-primary/10 border border-primary p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2 text-foreground">Thank You!</h3>
                <p className="text-muted-foreground mb-4">
                  {sendStatus.message}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSendStatus(null)}
                  className="mt-2"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {sendStatus && sendStatus.type === "error" && (
                  <div className="text-destructive bg-destructive/10 p-3 rounded border border-destructive/30 text-sm">
                    {sendStatus.message}
                  </div>
                )}
                
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-foreground">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="John Smith"
                    required
                    disabled={sending}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="john@example.com"
                    required
                    disabled={sending}
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block mb-2 text-sm font-medium text-foreground">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Project Inquiry"
                    required
                    disabled={sending}
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block mb-2 text-sm font-medium text-foreground">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Hello, I'd like to discuss a project..."
                    required
                    disabled={sending}
                  ></textarea>
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={sending}
                >
                  {sending ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="small" className="mr-2" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 