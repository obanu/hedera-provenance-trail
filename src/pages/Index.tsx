import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, Link2, Package, Search, History } from "lucide-react";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-supply-chain.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Supply chain transparency" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
            Supply Chain Transparency
            <br />
            <span className="text-accent">Powered by Hedera</span>
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Track your product's complete journey from origin to consumer with immutable, 
            timestamped records on the Hedera Consensus Service.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/producer">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-glow">
                <Package className="h-5 w-5 mr-2" />
                Producer Dashboard
              </Button>
            </Link>
            <Link to="/consumer">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Search className="h-5 w-5 mr-2" />
                Track Product
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Why Hedera for Supply Chain?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-accent mb-4" />
                <CardTitle className="text-primary">Immutable Records</CardTitle>
                <CardDescription>
                  Every event is permanently recorded on the Hedera network, ensuring tamper-proof provenance data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-shadow">
              <CardHeader>
                <Clock className="h-10 w-10 text-accent mb-4" />
                <CardTitle className="text-primary">Timestamped Events</CardTitle>
                <CardDescription>
                  Hedera Consensus Service provides cryptographic proof of order and timestamp for all supply chain events.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-shadow">
              <CardHeader>
                <Link2 className="h-10 w-10 text-accent mb-4" />
                <CardTitle className="text-primary">Low Cost, High Throughput</CardTitle>
                <CardDescription>
                  Process thousands of events per second at a fraction of the cost of traditional blockchains.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            How It Works
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold">1</div>
                  Producers Create Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Producers register new product batches on the Hedera network using the Producer Dashboard. 
                  Each product gets a unique HCS topic ID that serves as its permanent identifier.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold">2</div>
                  Log Events Throughout Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  As the product moves through the supply chain, each stakeholder logs events 
                  (harvested, processed, shipped, etc.) as immutable messages on the product's HCS topic.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold">3</div>
                  Consumers Verify Authenticity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Consumers can track any product using its topic ID, viewing the complete, 
                  verified history via Hedera mirror nodes. Perfect for ethical sourcing verification.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Case */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary mb-6">
              Example: Coffee Bean Journey
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Track a batch of Ethiopian coffee beans from a small farm in Yirgacheffe to your local café. 
              Each step—harvesting, processing, quality checks, shipping, roasting, and delivery—is permanently 
              recorded on Hedera, giving you complete transparency and trust in your morning brew.
            </p>
            <Link to="/consumer">
              <Button size="lg" className="bg-gradient-accent hover:opacity-90">
                <History className="h-5 w-5 mr-2" />
                See Example Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Built with Hedera Consensus Service • Learn more at <a href="https://hedera.com" className="text-accent hover:underline">hedera.com</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
