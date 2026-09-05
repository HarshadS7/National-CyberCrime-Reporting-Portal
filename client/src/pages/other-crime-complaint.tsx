import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";
import {
  Shield,
  ArrowLeft,
  Globe,
  Upload,
  CheckCircle2,
  Phone,
} from "lucide-react";

export default function OtherCrimeComplaintPage() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    {
      name: "Online Harassment",
      types: ["Cyberbullying", "Trolling", "Threats", "Doxxing"],
    },
    {
      name: "Data & Privacy",
      types: ["Hacking", "Data Breach", "Privacy Violation", "Unauthorized Access"],
    },
    {
      name: "Social Media",
      types: ["Fake Profile", "Impersonation", "Account Hacking", "Misinformation"],
    },
    {
      name: "Other",
      types: ["Malware", "Email Hacking", "Website Defacement", "Other"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <nav className="bg-white border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="size-10 bg-[#599D77] rounded-md border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center">
                <Globe className="size-5 text-white" strokeWidth={3} />
              </div>
              <span className="text-xl font-black uppercase">Other Cyber Crime</span>
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
        {/* Progress */}
        <FadeIn>
          <div className="flex items-center justify-center gap-3 mb-8">
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

        {/* Step 1: Crime Category */}
        {step === 1 && (
          <FadeIn>
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md mb-6">
              <CardContent className="p-8">
                <h3 className="text-2xl font-black uppercase mb-6 text-center">Step 1: Select Crime Category</h3>

                <div className="space-y-4">
                  {categories.map((cat) => (
                    <div key={cat.name} className="border-2 border-black rounded-md p-4 bg-white">
                      <button
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full text-left p-4 rounded-md border-2 transition-all ${
                          selectedCategory === cat.name
                            ? "border-black bg-[#FFDA5C] shadow-[3px_3px_0_0_#000]"
                            : "border-gray-300 hover:border-black"
                        }`}
                      >
                        <p className="font-black uppercase mb-2">{cat.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {cat.types.map((type) => (
                            <span
                              key={type}
                              className="px-3 py-1 bg-white border border-black text-xs font-bold uppercase rounded"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedCategory}
                  className="w-full mt-8 bg-[#599D77] hover:bg-[#4A8566] text-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6 text-lg disabled:opacity-50"
                >
                  Next: Your Details →
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <FadeIn>
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md mb-6">
              <CardContent className="p-8">
                <h3 className="text-2xl font-black uppercase mb-6">Step 2: Incident Details</h3>

                <div className="space-y-6">
                  {/* Personal Info */}
                  <div className="p-4 bg-[#CEEBFC] border-2 border-black rounded-md">
                    <p className="font-black uppercase text-sm mb-4">Your Information</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="FULL NAME *"
                        className="p-3 border-2 border-black rounded shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                      />
                      <input
                        type="tel"
                        placeholder="PHONE NUMBER *"
                        className="p-3 border-2 border-black rounded shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                      />
                      <input
                        type="email"
                        placeholder="EMAIL *"
                        className="p-3 border-2 border-black rounded shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                      />
                      <input
                        type="text"
                        placeholder="CITY/STATE"
                        className="p-3 border-2 border-black rounded shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                      />
                    </div>
                  </div>

                  {/* Incident Info */}
                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Date of Incident *</label>
                    <input
                      type="date"
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Platform/Service Used</label>
                    <input
                      type="text"
                      placeholder="E.G., FACEBOOK, EMAIL, WEBSITE"
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Website URL / Profile Link</label>
                    <input
                      type="url"
                      placeholder="HTTPS://EXAMPLE.COM"
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Describe What Happened *</label>
                    <textarea
                      rows={8}
                      placeholder="PROVIDE DETAILED DESCRIPTION...&#10;&#10;• WHAT HAPPENED?&#10;• WHEN DID IT HAPPEN?&#10;• HOW DID YOU DISCOVER IT?&#10;• WHAT IS THE IMPACT?"
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Suspect Information (if known)</label>
                    <textarea
                      rows={3}
                      placeholder="USERNAME, EMAIL, PHONE, IP ADDRESS, ETC."
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

        {/* Step 3: Evidence */}
        {step === 3 && (
          <FadeIn>
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md mb-6">
              <CardContent className="p-8">
                <h3 className="text-2xl font-black uppercase mb-6">Step 3: Upload Evidence</h3>

                <div className="border-4 border-dashed border-black rounded-md p-16 text-center mb-6 bg-[#FFDA5C]/20 hover:bg-[#FFDA5C]/30 transition-colors cursor-pointer">
                  <Upload className="size-20 mx-auto mb-4 text-black" strokeWidth={2} />
                  <p className="font-black uppercase text-xl mb-3">Drop Files Here</p>
                  <Button className="bg-[#FFDA5C] hover:bg-[#FFD040] text-black border-2 border-black shadow-[4px_4px_0_0_#000] font-black uppercase">
                    Choose Files
                  </Button>
                  <p className="text-xs font-bold text-muted-foreground uppercase mt-4">
                    Screenshots • Emails • Documents • Videos
                  </p>
                </div>

                <Card className="border-2 border-black bg-[#CEEBFC] rounded-md mb-6">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs font-bold uppercase">
                      ✓ Max 10MB per file • ✓ Multiple files supported • ✓ Encrypted storage
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

            {/* Helpline */}
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-[#599D77] rounded-md">
              <CardContent className="p-6 text-white text-center">
                <Phone className="size-8 mx-auto mb-3" strokeWidth={2.5} />
                <p className="font-black uppercase mb-2">Cyber Crime Helpline</p>
                <p className="text-2xl font-black">155260</p>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
