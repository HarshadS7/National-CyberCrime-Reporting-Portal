import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";
import {
  Shield,
  UserX,
  DollarSign,
  Globe,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Phone,
  TrendingUp,
  Users,
  FileText,
  Zap,
} from "lucide-react";

export default function CyberCrimeHomePage() {
  const stats = [
    { label: "Total Reports", value: "1,247", icon: FileText, color: "bg-white" },
    { label: "Under Review", value: "89", icon: Clock, color: "bg-[#FFDA5C]" },
    { label: "Resolved", value: "1,043", icon: Shield, color: "bg-[#599D77]" },
    { label: "Response Time", value: "< 24h", icon: Zap, color: "bg-[#CEEBFC]" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <nav className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-12 bg-[#FFDA5C] rounded-md border-2 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center">
                <Shield className="size-6 text-black" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight">CyberGuard</h1>
                <p className="text-xs font-bold uppercase text-muted-foreground">Cyber Crime Portal</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/track">
                <Button
                  variant="outline"
                  className="border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-bold uppercase text-xs"
                >
                  Track Case
                </Button>
              </Link>
              <Link to="/report/other-crime">
                <Button className="bg-[#599D77] hover:bg-[#4A8566] text-white border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-bold uppercase text-xs">
                  File Complaint
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Stats */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <FadeIn>
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#EA435F] text-white border-2 border-black shadow-[2px_2px_0_0_#000] uppercase font-black text-xs px-4 py-2">
              <AlertTriangle className="size-3 mr-1" />
              24/7 Emergency Response
            </Badge>
            <h2 className="text-6xl font-black uppercase tracking-tight mb-4">
              Report Cybercrime
              <br />
              <span className="text-[#599D77]">Fast & Secure</span>
            </h2>
            <p className="text-lg font-bold text-muted-foreground uppercase max-w-2xl mx-auto">
              AI-powered incident reporting • Real-time tracking • Expert support
            </p>
          </div>
        </FadeIn>

        {/* Stats Grid */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-4 gap-4 mb-12">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Card className={`border-2 border-black shadow-[4px_4px_0_0_#000] ${stat.color} rounded-md transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className="size-8 text-black" strokeWidth={2.5} />
                      <TrendingUp className="size-4 text-black" />
                    </div>
                    <p className="text-4xl font-black tracking-tight mb-2">{stat.value}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-black">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Crime Categories */}
        <FadeIn delay={0.2}>
          <div className="mb-8">
            <h3 className="text-3xl font-black uppercase tracking-tight mb-6 text-center">
              Select Crime Category
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Women/Children Crime */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-4 border-black shadow-[8px_8px_0_0_#000] bg-gradient-to-br from-[#EA435F] to-[#C92A49] rounded-md overflow-hidden group hover:-translate-y-2 hover:shadow-[10px_10px_0_0_#000] transition-all">
                  <CardContent className="p-8 text-white">
                    <div className="flex items-center justify-center mb-6">
                      <div className="size-24 bg-white/20 backdrop-blur-sm rounded-md border-2 border-white shadow-[4px_4px_0_0_rgba(255,255,255,0.3)] flex items-center justify-center">
                        <UserX className="size-12" strokeWidth={2.5} />
                      </div>
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-tight text-center mb-6">
                      Women/Children
                      <br />
                      Related Crime
                    </h4>
                    <div className="space-y-3">
                      <Link to="/report/women-children?type=anonymous">
                        <Button className="w-full bg-[#FFDA5C] hover:bg-[#FFD040] text-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase text-sm py-6">
                          <EyeOff className="size-4 mr-2" />
                          Report Anonymously
                        </Button>
                      </Link>
                      <Link to="/report/women-children?type=track">
                        <Button className="w-full bg-[#CEEBFC] hover:bg-[#B5DBF0] text-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase text-sm py-6">
                          <Eye className="size-4 mr-2" />
                          Register & Track
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-6 pt-6 border-t-2 border-white/30">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase">
                        <Phone className="size-3" />
                        <span>Helpline: 1091 | 1098</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Financial Fraud */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-4 border-black shadow-[8px_8px_0_0_#000] bg-gradient-to-br from-[#CEEBFC] to-[#7AC3E8] rounded-md overflow-hidden group hover:-translate-y-2 hover:shadow-[10px_10px_0_0_#000] transition-all">
                  <CardContent className="p-8 text-black">
                    <div className="flex items-center justify-center mb-6">
                      <div className="size-24 bg-white/40 backdrop-blur-sm rounded-md border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] flex items-center justify-center">
                        <DollarSign className="size-12" strokeWidth={2.5} />
                      </div>
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-tight text-center mb-6">
                      Financial
                      <br />
                      Fraud
                    </h4>
                    <Link to="/report/financial-fraud">
                      <Button className="w-full bg-[#FFDA5C] hover:bg-[#FFD040] text-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase text-sm py-6">
                        <FileText className="size-4 mr-2" />
                        Register Complaint
                      </Button>
                    </Link>
                    <div className="mt-6 pt-6 border-t-2 border-black/20">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase">
                        <Phone className="size-3" />
                        <span>Cyber Fraud: 1930</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-white/60 rounded-md border-2 border-black">
                      <p className="text-[10px] font-bold uppercase text-center">
                        ⚡ Block card immediately
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Other Cyber Crime */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-4 border-black shadow-[8px_8px_0_0_#000] bg-gradient-to-br from-[#599D77] to-[#3D7A59] rounded-md overflow-hidden group hover:-translate-y-2 hover:shadow-[10px_10px_0_0_#000] transition-all">
                  <CardContent className="p-8 text-white">
                    <div className="flex items-center justify-center mb-6">
                      <div className="size-24 bg-white/20 backdrop-blur-sm rounded-md border-2 border-white shadow-[4px_4px_0_0_rgba(255,255,255,0.3)] flex items-center justify-center">
                        <Globe className="size-12" strokeWidth={2.5} />
                      </div>
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-tight text-center mb-6">
                      Other
                      <br />
                      Cyber Crime
                    </h4>
                    <Link to="/report/other-crime">
                      <Button className="w-full bg-[#FFDA5C] hover:bg-[#FFD040] text-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase text-sm py-6">
                        <Shield className="size-4 mr-2" />
                        Register Complaint
                      </Button>
                    </Link>
                    <div className="mt-6 pt-6 border-t-2 border-white/30">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase">
                        <Phone className="size-3" />
                        <span>Helpline: 155260</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-white/20 rounded-md border-2 border-white/40">
                      <p className="text-[10px] font-bold uppercase text-center">
                        🌐 Hacking • Data Breach • More
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </FadeIn>

        {/* Features Section */}
        <FadeIn delay={0.6}>
          <Card className="border-4 border-black shadow-[8px_8px_0_0_#000] bg-white rounded-md mt-12">
            <CardContent className="p-8">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-6 text-center">
                Why Choose CyberGuard Portal
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { icon: Zap, title: "AI Assistant", desc: "Smart chatbot guides you through reporting" },
                  { icon: Clock, title: "Real-Time Tracking", desc: "Monitor your case status live" },
                  { icon: Shield, title: "Secure Upload", desc: "Encrypted evidence storage" },
                  { icon: Users, title: "Expert Support", desc: "Specialized cybercrime officers" },
                ].map((feature, i) => (
                  <div key={i} className="text-center">
                    <div className="size-16 mx-auto mb-4 bg-[#FFDA5C] rounded-md border-2 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center">
                      <feature.icon className="size-8 text-black" strokeWidth={2.5} />
                    </div>
                    <p className="font-black uppercase text-sm mb-2">{feature.title}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Emergency Contact */}
        <FadeIn delay={0.7}>
          <Card className="border-4 border-black shadow-[8px_8px_0_0_#000] bg-[#EA435F] rounded-md mt-8">
            <CardContent className="p-6 text-white text-center">
              <div className="flex items-center justify-center gap-4">
                <AlertTriangle className="size-8" strokeWidth={2.5} />
                <div className="text-left">
                  <p className="font-black uppercase text-lg mb-1">Emergency? Call Now</p>
                  <p className="text-2xl font-black">911 | 1091 | 1930</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-bold uppercase text-sm">© 2026 CyberGuard Portal • Secure • Fast • Reliable</p>
        </div>
      </footer>
    </div>
  );
}
