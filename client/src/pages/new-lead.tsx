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
      navigate(`/dashboard/pipeline/${res.pipelineId}`);
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
      navigate(`/dashboard/pipeline/${res.pipelineId}`);
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
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="size-16 rounded-md bg-secondary border-2 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center">
                <Cpu className="size-8 text-black" />
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase">Launch New Mission</h1>
            <p className="font-bold text-muted-foreground mt-2 uppercase text-sm tracking-wider">
              Deploy the 10-agent autonomous pipeline on a new target
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Tabs defaultValue="targeted" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white border-2 border-black shadow-[4px_4px_0_0_#000] p-1 rounded-md h-auto mb-6">
              <TabsTrigger value="targeted" className="gap-2 py-3 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase tracking-wider text-xs border-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0_0_#000] transition-all">
                <Target className="size-4" /> Targeted
              </TabsTrigger>
              <TabsTrigger value="discovery" className="gap-2 py-3 rounded-md data-[state=active]:bg-[#CEEBFC] data-[state=active]:text-black font-bold uppercase tracking-wider text-xs border-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0_0_#000] transition-all">
                <Search className="size-4" /> AI Discovery
              </TabsTrigger>
            </TabsList>

            {/* ── Targeted ── */}
            <TabsContent value="targeted" className="mt-4">
              <Card className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] rounded-md">
                <CardHeader className="pb-4 border-b-2 border-black bg-muted/20">
                  <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                    <Building2 className="size-6 text-black" /> Target a Specific Company
                  </CardTitle>
                  <CardDescription className="text-sm font-bold text-muted-foreground uppercase">
                    Enter company details. Apollo enriches the rest automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleTargeted} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="company" className="flex items-center gap-1.5 text-xs font-bold uppercase text-black">
                          <Building2 className="size-3" /> Company Name *
                        </Label>
                        <Input
                          id="company"
                          placeholder="Stripe"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="border-2 border-black focus:border-primary focus:ring-0 shadow-[2px_2px_0_0_#000] rounded-md font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact" className="flex items-center gap-1.5 text-xs font-bold uppercase text-black">
                          <User className="size-3" /> Contact Name
                        </Label>
                        <Input
                          id="contact"
                          placeholder="Patrick Collison"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="border-2 border-black focus:border-primary focus:ring-0 shadow-[2px_2px_0_0_#000] rounded-md font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="title" className="flex items-center gap-1.5 text-xs font-bold uppercase text-black">
                          <Briefcase className="size-3" /> Title
                        </Label>
                        <Input
                          id="title"
                          placeholder="CEO"
                          value={contactTitle}
                          onChange={(e) => setContactTitle(e.target.value)}
                          className="border-2 border-black focus:border-primary focus:ring-0 shadow-[2px_2px_0_0_#000] rounded-md font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="location" className="flex items-center gap-1.5 text-xs font-bold uppercase text-black">
                          <MapPin className="size-3" /> Location
                        </Label>
                        <Input
                          id="location"
                          placeholder="San Francisco"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="border-2 border-black focus:border-primary focus:ring-0 shadow-[2px_2px_0_0_#000] rounded-md font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-bold uppercase text-black">
                          <Mail className="size-3" /> Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="patrick@stripe.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="border-2 border-black focus:border-primary focus:ring-0 shadow-[2px_2px_0_0_#000] rounded-md font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="linkedin" className="flex items-center gap-1.5 text-xs font-bold uppercase text-black">
                          <Linkedin className="size-3" /> LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          placeholder="linkedin.com/in/..."
                          value={contactLinkedIn}
                          onChange={(e) => setContactLinkedIn(e.target.value)}
                          className="border-2 border-black focus:border-primary focus:ring-0 shadow-[2px_2px_0_0_#000] rounded-md font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="context" className="flex items-center gap-1.5 text-xs font-bold uppercase text-black">
                        <MessageSquare className="size-3" /> Additional Context
                      </Label>
                      <Textarea
                        id="context"
                        placeholder="Any extra notes about why this lead matters..."
                        rows={3}
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        className="border-2 border-black focus:border-primary focus:ring-0 shadow-[2px_2px_0_0_#000] rounded-md font-bold"
                      />
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white font-bold text-sm bg-destructive border-2 border-black shadow-[2px_2px_0_0_#000] px-4 py-3 rounded-md uppercase"
                      >
                        {error}
                      </motion.p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full gap-2 h-14 bg-primary hover:bg-primary text-white font-black uppercase tracking-widest text-base border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-md"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          Initializing Pipeline…
                        </>
                      ) : (
                        <>
                          <Rocket className="size-5" />
                          Launch 10-Agent Pipeline
                          <Sparkles className="size-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Discovery ── */}
            <TabsContent value="discovery" className="mt-4">
              <Card className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000] rounded-md">
                <CardHeader className="pb-4 border-b-2 border-black bg-[#CEEBFC]">
                  <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                    <Globe className="size-6 text-black" /> AI Discovery Mode
                  </CardTitle>
                  <CardDescription className="text-sm font-bold text-black uppercase">
                    Describe your product — AI finds the right companies and runs the full pipeline.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleDiscovery} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-xs font-bold uppercase text-black">Product Name *</Label>
                        <Input
                          placeholder="CortexReach"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          className="border-2 border-black focus:border-primary focus:ring-0 shadow-[2px_2px_0_0_#000] rounded-md font-bold"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-xs font-bold uppercase text-black">Description *</Label>
                        <Textarea
                          placeholder="Autonomous B2B outreach engine for sales teams..."
                          rows={3}
                          value={productDescription}
                          onChange={(e) => setProductDescription(e.target.value)}
                          className="border-2 border-black focus:border-primary focus:ring-0 shadow-[2px_2px_0_0_#000] rounded-md font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase text-black">Target Industries * (comma-sep)</Label>
                        <Input
                          placeholder="SaaS, FinTech, EdTech"
                          value={targetIndustries}
                          onChange={(e) => setTargetIndustries(e.target.value)}
                          className="border-2 border-black focus:border-primary focus:ring-0 shadow-[2px_2px_0_0_#000] rounded-md font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase text-black">Geographies (optional)</Label>
                        <Input
                          placeholder="India, US, EU"
                          value={targetGeo}
                          onChange={(e) => setTargetGeo(e.target.value)}
                          className="border-2 border-black focus:border-primary focus:ring-0 shadow-[2px_2px_0_0_#000] rounded-md font-bold"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white font-bold text-sm bg-destructive border-2 border-black shadow-[2px_2px_0_0_#000] px-4 py-3 rounded-md uppercase"
                      >
                        {error}
                      </motion.p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full gap-2 h-14 bg-[#599D77] hover:bg-[#39654c] text-white font-black uppercase tracking-widest text-base border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-md"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          Discovering…
                        </>
                      ) : (
                        <>
                          <Search className="size-5" />
                          Discover & Run Pipeline
                          <Sparkles className="size-5 ml-2" />
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
        <FadeIn delay={0.2} className="mt-8">
          <Card className="border-2 border-black bg-secondary shadow-[4px_4px_0_0_#000] rounded-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-md bg-white border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center shrink-0">
                  <Sparkles className="size-6 text-black" />
                </div>
                <div className="text-sm font-bold text-black space-y-2 uppercase">
                  <p className="font-black text-lg tracking-tight">What happens when you launch?</p>
                  <p>The pipeline deploys <span className="bg-primary text-white px-2 py-0.5 ml-1 mr-1 border-2 border-black">10 autonomous AI agents</span> that work in parallel:</p>
                  <p className="text-xs bg-white p-3 border-2 border-black shadow-[2px_2px_0_0_#000] mt-2 inline-block font-mono">
                    Enrich lead data → Scout signals → Score intent → Profile persona → Plan strategy → Generate content → Explain decisions → Deliver outreach → Monitor responses → Learn & adapt
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
