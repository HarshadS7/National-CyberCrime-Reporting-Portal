import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";
import {
  Shield,
  ArrowLeft,
  AlertTriangle,
  DollarSign,
  CreditCard,
  Upload,
  CheckCircle2,
  Phone,
  Clock,
} from "lucide-react";

export default function FinancialFraudComplaintPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <nav className="bg-white border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="size-10 bg-[#CEEBFC] rounded-md border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center">
                <DollarSign className="size-5 text-black" strokeWidth={3} />
              </div>
              <span className="text-xl font-black uppercase">Financial Fraud</span>
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
        {/* Action Banner */}
        <FadeIn>
          <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-gradient-to-r from-[#EA435F] to-[#C92A49] rounded-md mb-6">
            <CardContent className="p-6 text-white">
              <div className="flex items-start gap-4">
                <AlertTriangle className="size-10 shrink-0" strokeWidth={2.5} />
                <div>
                  <p className="font-black uppercase text-lg mb-3">⚡ Take Immediate Action</p>
                  <div className="grid md:grid-cols-2 gap-3 text-sm font-bold uppercase">
                    <div>
                      <p className="mb-1">✓ Block Card/Account</p>
                      <p className="mb-1">✓ Call Your Bank</p>
                    </div>
                    <div>
                      <p className="mb-1">✓ Save Transaction Details</p>
                      <p className="mb-1">✓ File This Complaint</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-white/30">
                    <p className="text-2xl font-black">Cyber Fraud Helpline: 1930</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Progress Steps */}
        <FadeIn delay={0.1}>
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`size-12 rounded-md border-2 border-black flex items-center justify-center font-black text-lg ${
                    step >= s ? "bg-[#CEEBFC] text-black shadow-[3px_3px_0_0_#000]" : "bg-white"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && <div className="w-8 h-1 bg-black mx-2"></div>}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Step 1: Fraud Type */}
        {step === 1 && (
          <FadeIn>
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md mb-6">
              <CardContent className="p-8">
                <h3 className="text-2xl font-black uppercase mb-6">Step 1: Select Fraud Type</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Credit/Debit Card Fraud",
                    "UPI Fraud",
                    "Online Banking Fraud",
                    "Investment Scam",
                    "Cryptocurrency Fraud",
                    "E-Commerce Fraud",
                    "Phishing/Vishing",
                    "Identity Theft",
                  ].map((type) => (
                    <button
                      key={type}
                      className="p-4 border-2 border-black rounded-md bg-white hover:bg-[#FFDA5C] hover:shadow-[3px_3px_0_0_#000] transition-all text-left font-bold uppercase text-sm"
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full mt-8 bg-[#CEEBFC] hover:bg-[#B5DBF0] text-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6 text-lg"
                >
                  Next: Personal Details →
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Step 2: Personal Info */}
        {step === 2 && (
          <FadeIn>
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md mb-6">
              <CardContent className="p-8">
                <h3 className="text-2xl font-black uppercase mb-6">Step 2: Your Information</h3>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Full Name *</label>
                      <input
                        type="text"
                        placeholder="YOUR NAME"
                        className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="+91 XXXXXXXXXX"
                        className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Email Address *</label>
                    <input
                      type="email"
                      placeholder="EMAIL@EXAMPLE.COM"
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">City/State *</label>
                    <input
                      type="text"
                      placeholder="LOCATION"
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
                    className="flex-1 bg-[#CEEBFC] hover:bg-[#B5DBF0] text-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6"
                  >
                    Next: Transaction Details →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Step 3: Transaction Details */}
        {step === 3 && (
          <FadeIn>
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md mb-6">
              <CardContent className="p-8">
                <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                  <CreditCard className="size-6" />
                  Step 3: Transaction Details
                </h3>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Amount Lost (₹) *</label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Date of Fraud *</label>
                      <input
                        type="date"
                        className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Bank/Payment Service *</label>
                      <input
                        type="text"
                        placeholder="E.G., HDFC, PAYTM, PHONEPE"
                        className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black uppercase mb-2">Transaction/UTR ID</label>
                      <input
                        type="text"
                        placeholder="TRANSACTION ID"
                        className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Last 4 Digits of Card/Account</label>
                    <input
                      type="text"
                      placeholder="XXXX"
                      maxLength={4}
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                    <p className="text-xs font-bold uppercase text-muted-foreground mt-1">
                      ⚠️ Never share full card/account number
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Describe How It Happened *</label>
                    <textarea
                      rows={6}
                      placeholder="DETAILS OF THE FRAUD... WHAT HAPPENED? HOW DID YOU DISCOVER IT?"
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Fraudster Details (if known)</label>
                    <textarea
                      rows={3}
                      placeholder="PHONE, EMAIL, ACCOUNT NUMBER, WEBSITE, ETC."
                      className="w-full p-4 border-2 border-black rounded-md shadow-[2px_2px_0_0_#000] font-bold uppercase text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="flex-1 bg-[#CEEBFC] hover:bg-[#B5DBF0] text-black border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6"
                  >
                    Next: Upload Proof →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Step 4: Evidence Upload */}
        {step === 4 && (
          <FadeIn>
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-white rounded-md mb-6">
              <CardContent className="p-8">
                <h3 className="text-2xl font-black uppercase mb-6">Step 4: Upload Evidence</h3>

                <div className="border-4 border-dashed border-black rounded-md p-12 text-center mb-6 bg-[#FFDA5C]/20 hover:bg-[#FFDA5C]/30 transition-colors cursor-pointer">
                  <Upload className="size-16 mx-auto mb-4 text-black" strokeWidth={2} />
                  <p className="font-black uppercase text-lg mb-2">Drop Files Here</p>
                  <p className="text-sm font-bold text-muted-foreground uppercase mb-4">or click to browse</p>
                  <Button className="bg-[#FFDA5C] hover:bg-[#FFD040] text-black border-2 border-black shadow-[3px_3px_0_0_#000] font-black uppercase text-sm">
                    Choose Files
                  </Button>
                </div>

                <Card className="border-2 border-black bg-[#CEEBFC] rounded-md mb-6">
                  <CardContent className="p-4">
                    <p className="text-xs font-black uppercase mb-2">Required Documents:</p>
                    <div className="grid md:grid-cols-2 gap-2 text-xs font-bold uppercase">
                      <p>✓ Transaction Screenshot</p>
                      <p>✓ Bank Statement</p>
                      <p>✓ Messages/Emails</p>
                      <p>✓ Any Other Proof</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-black bg-[#FFDA5C]/30 rounded-md mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="size-5 text-black shrink-0 mt-1" />
                      <div>
                        <p className="font-black uppercase text-sm mb-1">Time is Critical!</p>
                        <p className="text-xs font-bold uppercase">Faster reporting = Better chance of recovery</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="flex-1 border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => alert("Financial fraud complaint submitted! (Frontend only)")}
                    className="flex-1 bg-[#599D77] hover:bg-[#4A8566] text-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none font-black uppercase py-6 text-lg"
                  >
                    <CheckCircle2 className="size-5 mr-2" />
                    Submit Complaint
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Helpline Card */}
            <Card className="border-4 border-black shadow-[6px_6px_0_0_#000] bg-[#599D77] rounded-md">
              <CardContent className="p-6 text-white text-center">
                <Phone className="size-8 mx-auto mb-3" strokeWidth={2.5} />
                <p className="font-black uppercase mb-2">Need Immediate Help?</p>
                <p className="text-2xl font-black">1930 | cybercrime.gov.in</p>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
