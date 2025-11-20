import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          AI-Assisted SI/PI Reviews for
          <br />
          High-Speed Boards, Packages & Interposers
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          I help hardware teams de-risk DDR, PCIe, SerDes, and advanced packaging using senior SI/PI expertise supported
          by a custom engineering AI copilot.
        </p>
        <Button size="lg" onClick={() => navigate("/intake")} className="text-lg px-8 py-6">
          Start Your Review
        </Button>
        <p className="text-sm text-gray-500 text-center mt-2">
          Confidential & secure — your design files are never shared.
        </p>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-foreground mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground">Upload Your Design Files</h3>
            <p className="text-muted-foreground">
              Upload your schematic (PDF), stackup (image or PDF), and layout snapshots
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground">AI Pre-Analysis</h3>
            <p className="text-muted-foreground">
              My SI/PI Copilot pre-analyzes your design for:
• Stackup feasibility
• Return-path quality
• Via and layer-transition risks
• PDN noise sensitivity
• DDR / PCIe / SerDes constraints
• Substrate / interposer behavior
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground">Receive a Structured Risk Report</h3>
            <p className="text-muted-foreground">Clear SI/PI findings with prioritized risks and actionable design fixes.</p>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">What You Receive</h2>

          <ul className="space-y-3 text-lg text-gray-700">
            <li>✔ A structured SI/PI risk report</li>
            <li>✔ High / Medium / Low severity analysis</li>
            <li>✔ Root-cause explanations</li>
            <li>✔ Routing, PDN, and stackup fixes</li>
            <li>✔ Optional simulation recommendations</li>
          </ul>
        </div>
      </section>

      {/* Real Examples Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-foreground mb-4">Real Examples of AI-Assisted SI/PI Review</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          See how our AI copilot helps identify critical signal integrity issues before they become costly problems
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">DDR5 Memory Interface</CardTitle>
              <CardDescription>High-speed server motherboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-sm text-destructive mb-1">Challenge:</p>
                <p className="text-sm text-muted-foreground">Inconsistent trace impedance causing signal reflections at 6.4 Gbps</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-primary mb-1">AI Solution:</p>
                <p className="text-sm text-muted-foreground">Identified stackup mismatch and recommended trace width adjustments</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">Result:</p>
                <p className="text-sm text-muted-foreground">Eye diagram improved by 35%, first-pass success achieved</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">PCIe Gen5 Routing</CardTitle>
              <CardDescription>GPU accelerator card</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-sm text-destructive mb-1">Challenge:</p>
                <p className="text-sm text-muted-foreground">Via transitions causing insertion loss at 32 GT/s data rate</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-primary mb-1">AI Solution:</p>
                <p className="text-sm text-muted-foreground">Detected return path discontinuities and suggested via stub mitigation</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">Result:</p>
                <p className="text-sm text-muted-foreground">Reduced insertion loss by 2.1 dB, passed compliance testing</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Advanced Package Substrate</CardTitle>
              <CardDescription>High-performance compute module</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-sm text-destructive mb-1">Challenge:</p>
                <p className="text-sm text-muted-foreground">PDN resonance causing voltage droop during power transients</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-primary mb-1">AI Solution:</p>
                <p className="text-sm text-muted-foreground">Analyzed decoupling strategy and recommended capacitor placement optimization</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">Result:</p>
                <p className="text-sm text-muted-foreground">Voltage ripple reduced from 180mV to 45mV, stable operation achieved</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">SerDes Eye Margin</CardTitle>
              <CardDescription>Network switch backplane</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-sm text-destructive mb-1">Challenge:</p>
                <p className="text-sm text-muted-foreground">Poor eye opening at 28 Gbps due to crosstalk and ISI</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-primary mb-1">AI Solution:</p>
                <p className="text-sm text-muted-foreground">Identified aggressor traces and recommended spacing and guard traces</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">Result:</p>
                <p className="text-sm text-muted-foreground">Eye height increased by 28%, BER improved to specification</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">FPGA Power Integrity</CardTitle>
              <CardDescription>Industrial control system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-sm text-destructive mb-1">Challenge:</p>
                <p className="text-sm text-muted-foreground">Ground bounce affecting sensitive analog measurements</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-primary mb-1">AI Solution:</p>
                <p className="text-sm text-muted-foreground">Analyzed ground plane segmentation and return current paths</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">Result:</p>
                <p className="text-sm text-muted-foreground">Ground noise reduced by 65%, measurement accuracy restored</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Multi-Gigabit Ethernet</CardTitle>
              <CardDescription>Automotive gateway module</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-sm text-destructive mb-1">Challenge:</p>
                <p className="text-sm text-muted-foreground">EMI radiation exceeding automotive standards at 10 Gbps</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-primary mb-1">AI Solution:</p>
                <p className="text-sm text-muted-foreground">Flagged reference plane splits and suggested routing modifications</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">Result:</p>
                <p className="text-sm text-muted-foreground">EMI reduced by 18 dB, passed CISPR 25 Class 5 requirements</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Comprehensive Analysis Coverage</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {["Transmission-line behavior", "Return path integrity", "PDN (Power Distribution Network)", "Via transitions", "Crosstalk analysis", "Advanced packaging considerations"].map((feature, index) => <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={20} />
                  <span className="text-foreground">{feature}</span>
                </div>)}
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;