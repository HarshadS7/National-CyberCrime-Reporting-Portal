import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";
import {
  Shield,
  Search,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Download,
  MessageCircle,
  Eye,
} from "lucide-react";

export default function TrackCasePage() {
  const [caseNumber, setCaseNumber] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Mock case data for demonstration
  const mockCase = {
    caseNumber: "CC-2026-001234",
    status: "under_review",
    crimeType: "Financial Fraud - UPI",
    filedDate: "2026-09-01",
    lastUpdated: "2026-09-05",
    amount: "₹45,000",
    assignedOfficer: "Officer Sharma",
    officerBadge: "CB-9876",
    location: "Mumbai, Maharashtra",
    timeline: [
      { date: "2026-09-01", status: "Complaint Filed", icon: FileText, color: "bg-[#CEEBFC]" },
      { date: "2026-09-02", status: "Case Registered", icon: CheckCircle2, color: "bg-[#599D77]" },
      { date: "2026-09-03", status: "Assigned to Officer", icon: User, color: "bg-[#FFDA5C]" },
      { date: "2026-09-05", status: "Under Investigation", icon: Clock, color: "bg-[#CEEBFC]", current: true },
      { date: "Pending", status: "Resolved", icon: CheckCircle2, color: "bg-gray-300", pending: true },
    ],
    updates: [
      { date: "2026-09-05 10:30 AM", message: "Investigation team has contacted the payment gateway" },
      { date: "2026-09-03 02:15 PM", message: "Case assigned to Cyber Crime Cell, Mumbai" },
      { date: "2026-09-02 11:00 AM", message: "FIR registered. Case number: CC-2026-001234" },
    ],
  };

  const handleTrack = () => {
    if (caseNumber.length > 5) {
      setShowResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <nav className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="size-10 bg-[#FFDA5C] rounded-md border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center">
                <Shield className="size-5 text-black" strokeWidth={3} />
              </div>
              <span className="text-xl font-black uppercase">Track Your Case</span>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-2 border-black shadow-[2px_2px_0_0_#000] font-bold uppercase text-xs">
                <ArrowLeft className="size-4 mr-1" /> Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {!showResults ? (
          <>
            {/* Search Section */}
            <FadeIn>
              <div className="text-center mb-12">
                <h1 className="text-5xl font-black uppercase tracking-tight mb-4">
                  Track Your Complaint
                </h1>
                <p className="text-lg font-bold uppercase text-muted-foreground">
                  Enter your case number to view real-time status
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Card className="border-4 border-black shadow-[8px_8px_0_0_#000] bg-white rounded-md mb-8">
                <CardContent className="p-12">
                  <div className="max-w-2xl mx-auto">
                    <label className="block text-center text-sm font-black uppercase mb-4">
                      Enter Case Number
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={caseNumber}
                        onChange={(e) => setCaseNumber(e.target.value)}
                        placeholder="CC-2026-XXXXXX"
                        className="flex-1 p-6 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-lg text-center"
                      />
                      <Button
                        onClick={handleTrack}
                        className="px-8 bg-[#599D77] hover:bg-[#4A8566] text-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase"
                      >
                        <Search className="size-5 mr-2" />
                        Track
                      </Button>
                    </div>
                    <p className="text-center text-xs font-bold uppercase text-muted-foreground mt-4">
                      Your case number was sent via email/SMS
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Info Cards */}
            <FadeIn delay={0.2}>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-2 border-black shadow-[4px_4px_0_0_#000] bg-white rounded-md">
                  <CardContent className="p-6 text-center">
                    <Clock className="size-12 mx-auto mb-3 text-black" strokeWidth={2.5} />
                    <p className="font-black uppercase text-sm mb-2">24/7 Tracking</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Real-time case updates
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-black shadow-[4px_4px_0_0_#000] bg-white rounded-md">
                  <CardContent className="p-6 text-center">
                    <MessageCircle className="size-12 mx-auto mb-3 text-black" strokeWidth={2.5} />
                    <p className="font-black uppercase text-sm mb-2">SMS Alerts</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Get instant notifications
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-black shadow-[4px_4px_0_0_#000] bg-white rounded-md">
                  <CardContent className="p-6 text-center">
                    <Shield className="size-12 mx-auto mb-3 text-black" strokeWidth={2.5} />
                    <p className="font-black uppercase text-sm mb-2">Secure Access</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Only you can view
                    </p>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>

            {/* Help Section */}
            <FadeIn delay={0.3}>
              <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-[#CEEBFC] rounded-md mt-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="size-8 text-black shrink-0 mt-1" strokeWidth={2.5} />
                    <div>
                      <p className="font-black uppercase mb-2">Don't have a case number?</p>
                      <p className="text-sm font-bold uppercase mb-3">
                        Check your email or SMS. Case number format: CC-YYYY-XXXXXX
                      </p>
                      <div className="flex gap-3">
                        <Link to="/">
                          <Button className="bg-[#FFDA5C] hover:bg-[#FFD040] text-black border-2 border-black shadow-[3px_3px_0_0_#000] font-black uppercase text-xs">
                            File New Complaint
                          </Button>
                        </Link>
                        <Button variant="outline" className="border-2 border-black shadow-[3px_3px_0_0_#000] font-black uppercase text-xs">
                          <Phone className="size-3 mr-1" /> Call Support
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </>
        ) : (
          <>
            {/* Case Details View */}
            <FadeIn>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-black uppercase mb-2">{mockCase.caseNumber}</h1>
                  <p className="text-sm font-bold uppercase text-muted-foreground">Last Updated: {mockCase.lastUpdated}</p>
                </div>
                <Button
                  onClick={() => setShowResults(false)}
                  variant="outline"
                  className="border-2 border-black shadow-[2px_2px_0_0_#000] font-bold uppercase text-xs"
                >
                  <ArrowLeft className="size-4 mr-1" /> Search Again
                </Button>
              </div>
            </FadeIn>

            {/* Status Card */}
            <FadeIn delay={0.1}>
              <Card className="border-4 border-black shadow-[8px_8px_0_0_#000] bg-gradient-to-r from-[#FFDA5C] to-[#FFD040] rounded-md mb-6">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="mb-3 bg-black text-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] uppercase font-black text-xs px-3 py-1">
                        Current Status
                      </Badge>
                      <p className="text-4xl font-black uppercase mb-2">Under Investigation</p>
                      <p className="text-lg font-bold uppercase">Expected Resolution: 7-14 Days</p>
                    </div>
                    <Clock className="size-20 text-black" strokeWidth={2} />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Case Info */}
              <FadeIn delay={0.2}>
                <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md">
                  <CardContent className="p-6">
                    <p className="text-sm font-black uppercase mb-4 text-muted-foreground">Case Information</p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <FileText className="size-4 text-black shrink-0 mt-1" />
                        <div>
                          <p className="text-xs font-bold uppercase text-muted-foreground">Type</p>
                          <p className="font-black uppercase text-sm">{mockCase.crimeType}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="size-4 text-black shrink-0 mt-1" />
                        <div>
                          <p className="text-xs font-bold uppercase text-muted-foreground">Filed On</p>
                          <p className="font-black uppercase text-sm">{mockCase.filedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="size-4 text-black shrink-0 mt-1" />
                        <div>
                          <p className="text-xs font-bold uppercase text-muted-foreground">Location</p>
                          <p className="font-black uppercase text-sm">{mockCase.location}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Officer Info */}
              <FadeIn delay={0.3}>
                <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-[#CEEBFC] rounded-md">
                  <CardContent className="p-6">
                    <p className="text-sm font-black uppercase mb-4 text-muted-foreground">Assigned Officer</p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <User className="size-4 text-black shrink-0 mt-1" />
                        <div>
                          <p className="text-xs font-bold uppercase text-muted-foreground">Name</p>
                          <p className="font-black uppercase text-sm">{mockCase.assignedOfficer}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Shield className="size-4 text-black shrink-0 mt-1" />
                        <div>
                          <p className="text-xs font-bold uppercase text-muted-foreground">Badge</p>
                          <p className="font-black uppercase text-sm">{mockCase.officerBadge}</p>
                        </div>
                      </div>
                      <Button className="w-full mt-2 bg-black hover:bg-gray-800 text-white border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] font-black uppercase text-xs">
                        <MessageCircle className="size-3 mr-1" /> Contact Officer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Amount Info */}
              <FadeIn delay={0.4}>
                <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-[#EA435F] text-white rounded-md">
                  <CardContent className="p-6">
                    <p className="text-sm font-black uppercase mb-4">Amount Involved</p>
                    <p className="text-4xl font-black mb-4">{mockCase.amount}</p>
                    <div className="space-y-2">
                      <Button className="w-full bg-white hover:bg-gray-100 text-black border-2 border-white shadow-[3px_3px_0_0_rgba(255,255,255,0.3)] font-black uppercase text-xs">
                        <Download className="size-3 mr-1" /> Download Report
                      </Button>
                      <Button className="w-full bg-black hover:bg-gray-800 text-white border-2 border-white shadow-[3px_3px_0_0_rgba(255,255,255,0.3)] font-black uppercase text-xs">
                        <Eye className="size-3 mr-1" /> View Evidence
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>

            {/* Timeline */}
            <FadeIn delay={0.5}>
              <Card className="border-4 border-black shadow-[8px_8px_0_0_#000] bg-white rounded-md mb-6">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-black uppercase mb-6">Case Timeline</h3>
                  <div className="space-y-4">
                    {mockCase.timeline.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-start gap-4"
                      >
                        <div className={`size-12 ${item.color} rounded-md border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center shrink-0`}>
                          <item.icon className="size-6 text-black" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 pb-4 border-b-2 border-dashed border-gray-300 last:border-0">
                          <p className="font-black uppercase text-sm mb-1">{item.status}</p>
                          <p className="text-xs font-bold uppercase text-muted-foreground">{item.date}</p>
                          {item.current && (
                            <Badge className="mt-2 bg-[#FFDA5C] text-black border-2 border-black shadow-[2px_2px_0_0_#000] uppercase font-black text-[10px]">
                              Current Stage
                            </Badge>
                          )}
                          {item.pending && (
                            <Badge className="mt-2 bg-gray-300 text-black border-2 border-black uppercase font-black text-[10px]">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Updates */}
            <FadeIn delay={1.0}>
              <Card className="border-4 border-black shadow-[8px_8px_0_0_#000] bg-white rounded-md">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-black uppercase mb-6">Recent Updates</h3>
                  <div className="space-y-4">
                    {mockCase.updates.map((update, index) => (
                      <div key={index} className="p-4 bg-[#CEEBFC] border-2 border-black rounded-md">
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">{update.date}</p>
                        <p className="font-bold uppercase text-sm">{update.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Help Banner */}
            <FadeIn delay={1.1}>
              <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-[#599D77] text-white rounded-md mt-6">
                <CardContent className="p-6 text-center">
                  <Phone className="size-8 mx-auto mb-3" strokeWidth={2.5} />
                  <p className="font-black uppercase mb-2">Need Help With Your Case?</p>
                  <p className="text-2xl font-black">Call: 1930 | Email: support@cybercrime.gov</p>
                </CardContent>
              </Card>
            </FadeIn>
          </>
        )}
      </div>
    </div>
  );
}
