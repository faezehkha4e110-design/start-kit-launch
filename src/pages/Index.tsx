import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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