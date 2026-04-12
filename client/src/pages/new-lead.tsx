import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Rocket,
  Building2,
  User,
  Briefcase,
  MapPin,
  Mail,
  Linkedin,
  MessageSquare,
  Loader2,
  Sparkles,
  Target,
  Search,
  Globe,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/ui/motion";
import { api } from "@/lib/api";

export default function NewLeadPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Targeted fields
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactTitle, setContactTitle] = useState("");
  const [location, setLocation] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactLinkedIn, setContactLinkedIn] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");

  // Discovery fields
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetIndustries, setTargetIndustries] = useState("");
  const [targetGeo, setTargetGeo] = useState("");

  async function handleTargeted(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return setError("Company name is required");
    setLoading(true);
    setError("");
    try {
      const res = await api.executeTargeted({
        companyName: companyName.trim(),
        contactName: contactName.trim() || undefined,
        contactTitle: contactTitle.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactLinkedIn: contactLinkedIn.trim() || undefined,
        location: location.trim() || undefined,
        additionalContext: additionalContext.trim() || undefined,
      });
      navigate(`/pipeline/${res.pipelineId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start pipeline");
    } finally {
      setLoading(false);
    }
  }

  async function handleDiscovery(e: React.FormEvent) {
    e.preventDefault();
    if (!productName.trim() || !productDescription.trim() || !targetIndustries.trim())
      return setError("Product name, description, and industries are required");
    setLoading(true);
    setError("");
    try {
      const res = await api.discover({
        productName: productName.trim(),
        productDescription: productDescription.trim(),
        targetIndustries: targetIndustries.split(",").map((s) => s.trim()).filter(Boolean),
        targetGeographies: targetGeo ? targetGeo.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        maxResults: 3,
      });
      navigate(`/pipeline/${res.pipelineId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start discovery");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <FadeIn>
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="size-12 rounded-2xl bg-linear-to-br from-primary/20 to-purple-500/10 flex items-center justify-center">
                <Cpu className="size-6 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Launch New Mission</h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Deploy the 10-agent autonomous pipeline on a new target
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Tabs defaultValue="targeted" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl h-auto">
              <TabsTrigger value="targeted" className="gap-2 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Target className="size-4" /> Targeted
              </TabsTrigger>
              <TabsTrigger value="discovery" className="gap-2 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Search className="size-4" /> AI Discovery
              </TabsTrigger>
            </TabsList>

            {/* ── Targeted ── */}
            <TabsContent value="targeted" className="mt-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="size-4 text-primary" /> Target a Specific Company
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Enter company details. Apollo enriches the rest automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTargeted} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="company" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Building2 className="size-3" /> Company Name *
                        </Label>
                        <Input
                          id="company"
                          placeholder="Stripe"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="size-3" /> Contact Name
                        </Label>
                        <Input
                          id="contact"
                          placeholder="Patrick Collison"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="title" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Briefcase className="size-3" /> Title
                        </Label>
                        <Input
                          id="title"
                          placeholder="CEO"
                          value={contactTitle}
                          onChange={(e) => setContactTitle(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="location" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3" /> Location
                        </Label>
                        <Input
                          id="location"
                          placeholder="San Francisco"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="size-3" /> Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="patrick@stripe.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="linkedin" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Linkedin className="size-3" /> LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          placeholder="linkedin.com/in/..."
                          value={contactLinkedIn}
                          onChange={(e) => setContactLinkedIn(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="context" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MessageSquare className="size-3" /> Additional Context
                      </Label>
                      <Textarea
                        id="context"
                        placeholder="Any extra notes about why this lead matters..."
                        rows={2}
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-primary/50"
                      />
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-lg"
                      >
                        {error}
                      </motion.p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full gap-2 h-11 bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white border-0 shadow-lg shadow-primary/20 transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Initializing Pipeline…
                        </>
                      ) : (
                        <>
                          <Rocket className="size-4" />
                          Launch 10-Agent Pipeline
                          <Sparkles className="size-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Discovery ── */}
            <TabsContent value="discovery" className="mt-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="size-4 text-cyan-400" /> AI Discovery Mode
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Describe your product — AI finds the right companies and runs the full pipeline.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDiscovery} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-xs text-muted-foreground">Product Name *</Label>
                        <Input
                          placeholder="CortexReach"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-cyan-500/50"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-xs text-muted-foreground">Description *</Label>
                        <Textarea
                          placeholder="Autonomous B2B outreach engine for sales teams..."
                          rows={2}
                          value={productDescription}
                          onChange={(e) => setProductDescription(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-cyan-500/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Target Industries * (comma-separated)</Label>
                        <Input
                          placeholder="SaaS, FinTech, EdTech"
                          value={targetIndustries}
                          onChange={(e) => setTargetIndustries(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-cyan-500/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Geographies (optional)</Label>
                        <Input
                          placeholder="India, US, EU"
                          value={targetGeo}
                          onChange={(e) => setTargetGeo(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-cyan-500/50"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-lg"
                      >
                        {error}
                      </motion.p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full gap-2 h-11 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-500/90 hover:to-blue-600/90 text-white border-0 shadow-lg shadow-cyan-500/20 transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Discovering…
                        </>
                      ) : (
                        <>
                          <Search className="size-4" />
                          Discover & Run Pipeline
                          <Sparkles className="size-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </FadeIn>

        {/* Info Panel */}
        <FadeIn delay={0.2}>
          <Card className="border-border/30 bg-card/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground text-sm">What happens when you launch?</p>
                  <p>The pipeline deploys <span className="text-primary font-medium">10 autonomous AI agents</span> that work in parallel:</p>
                  <p>Enrich lead data → Scout signals → Score intent → Profile persona → Plan strategy → Generate content → Explain decisions → Deliver outreach → Monitor responses → Learn & adapt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
