import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";
import {
  Shield,
  ArrowLeft,
  AlertTriangle,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  Phone,
} from "lucide-react";

export default function WomenChildrenComplaintPage() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <nav className="bg-white border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="size-10 bg-[#EA435F] rounded-md border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center">
                <Shield className="size-5 text-white" strokeWidth={3} />
              </div>
              <span className="text-xl font-black uppercase">Women/Children Crime</span>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-2 border-black shadow-[2px_2px_0_0_#000] font-bold uppercase text-xs">
                <ArrowLeft className="size-4 mr-1" /> Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Emergency Banner */}
        <FadeIn>
          <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-[#EA435F] rounded-md mb-6">
            <CardContent className="p-4 text-white">
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-8 shrink-0" strokeWidth={2.5} />
                <div>
                  <p className="font-black uppercase text-sm mb-1">Emergency? Call Immediately</p>
                  <p className="text-xl font-black">911 | Women: 1091 | Child: 1098</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Registration Type Selection */}
        <FadeIn delay={0.1}>
          <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md mb-6">
            <CardContent className="p-6">
              <h2 className="text-2xl font-black uppercase mb-6 text-center">Choose Report Type</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setIsAnonymous(false)}
                  className={`p-6 border-4 rounded-md transition-all ${
                    !isAnonymous
                      ? "border-black bg-[#CEEBFC] shadow-[4px_4px_0_0_#000]"
                      : "border-gray-300 bg-white hover:border-black"
                  }`}
                >
                  <Eye className="size-10 mx-auto mb-3 text-black" strokeWidth={2.5} />
                  <p className="font-black uppercase text-sm mb-2">Register & Track</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Track your case status</p>
                </button>

                <button
                  onClick={() => setIsAnonymous(true)}
                  className={`p-6 border-4 rounded-md transition-all ${
                    isAnonymous
                      ? "border-black bg-[#CEEBFC] shadow-[4px_4px_0_0_#000]"
                      : "border-gray-300 bg-white hover:border-black"
                  }`}
                >
                  <EyeOff className="size-10 mx-auto mb-3 text-black" strokeWidth={2.5} />
                  <p className="font-black uppercase text-sm mb-2">Anonymous Report</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Complete privacy</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Progress Steps */}
        <FadeIn delay={0.2}>
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`size-12 rounded-md border-2 border-black flex items-center justify-center font-black text-lg ${
                    step >= s ? "bg-[#599D77] text-white shadow-[3px_3px_0_0_#000]" : "bg-white"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && <div className="w-12 h-1 bg-black mx-2"></div>}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <FadeIn>
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md mb-6">
              <CardContent className="p-8">
                <h3 className="text-2xl font-black uppercase mb-6">Step 1: Basic Information</h3>

                <div className="space-y-6">
                  {/* Crime Type */}
                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Crime Type *</label>
                    <select className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm">
                      <option>Select Crime Type</option>
                      <option>Online Harassment</option>
                      <option>Cyberbullying</option>
                      <option>Sexual Harassment</option>
                      <option>Stalking/Threatening</option>
                      <option>Child Exploitation</option>
                      <option>Blackmail/Sextortion</option>
                      <option>Morphed Images</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {!isAnonymous && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-black uppercase mb-2">Your Name *</label>
                          <input
                            type="text"
                            placeholder="FULL NAME"
                            className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-black uppercase mb-2">Age *</label>
                          <input
                            type="number"
                            placeholder="AGE"
                            className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-black uppercase mb-2">Phone *</label>
                          <input
                            type="tel"
                            placeholder="+91 XXXXXXXXXX"
                            className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-black uppercase mb-2">Email</label>
                          <input
                            type="email"
                            placeholder="EMAIL@EXAMPLE.COM"
                            className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">City/State *</label>
                    <input
                      type="text"
                      placeholder="LOCATION"
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full mt-8 bg-[#599D77] hover:bg-[#4A8566] text-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6 text-lg"
                >
                  Next: Incident Details →
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Step 2: Incident Details */}
        {step === 2 && (
          <FadeIn>
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md mb-6">
              <CardContent className="p-8">
                <h3 className="text-2xl font-black uppercase mb-6">Step 2: What Happened?</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Date of Incident *</label>
                    <input
                      type="date"
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Describe the Incident *</label>
                    <textarea
                      rows={6}
                      placeholder="DESCRIBE WHAT HAPPENED IN DETAIL..."
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Platform Used</label>
                    <input
                      type="text"
                      placeholder="E.G., FACEBOOK, WHATSAPP, INSTAGRAM"
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Suspect Information (if known)</label>
                    <textarea
                      rows={3}
                      placeholder="USERNAME, PHONE, EMAIL, OR ANY OTHER DETAILS..."
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-[#599D77] hover:bg-[#4A8566] text-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6"
                  >
                    Next: Upload Evidence →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Step 3: Evidence Upload */}
        {step === 3 && (
          <FadeIn>
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md mb-6">
              <CardContent className="p-8">
                <h3 className="text-2xl font-black uppercase mb-6">Step 3: Upload Evidence</h3>

                <div className="border-4 border-dashed border-black rounded-md p-12 text-center mb-6 bg-[#FFDA5C]/20 hover:bg-[#FFDA5C]/30 transition-colors cursor-pointer">
                  <Upload className="size-16 mx-auto mb-4 text-black" strokeWidth={2} />
                  <p className="font-black uppercase text-lg mb-2">Drop Files Here</p>
                  <p className="text-sm font-bold text-muted-foreground uppercase mb-4">or click to browse</p>
                  <Button className="bg-[#FFDA5C] hover:bg-[#FFD040] text-black border-2 border-black shadow-[3px_3px_0_0_#000] font-black uppercase text-sm">
                    Choose Files
                  </Button>
                  <p className="text-xs font-bold text-muted-foreground uppercase mt-4">
                    Screenshots, Messages, Photos, Documents
                  </p>
                </div>

                <Card className="border-2 border-black bg-[#CEEBFC] rounded-md mb-6">
                  <CardContent className="p-4">
                    <p className="text-xs font-bold uppercase text-center">
                      🔒 All evidence is encrypted • Maximum 10MB per file
                    </p>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => alert("Complaint submitted! (Frontend only)")}
                    className="flex-1 bg-[#599D77] hover:bg-[#4A8566] text-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6 text-lg"
                  >
                    <CheckCircle2 className="size-5 mr-2" />
                    Submit Complaint
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-gradient-to-br from-[#EA435F] to-[#C92A49] rounded-md">
              <CardContent className="p-6 text-white text-center">
                <Phone className="size-8 mx-auto mb-3" strokeWidth={2.5} />
                <p className="font-black uppercase mb-2">Need Help While Filling?</p>
                <p className="text-xl font-black">Call Support: 1091 | 1098</p>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
