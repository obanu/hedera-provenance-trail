import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle2, Package, MapPin } from "lucide-react";
import EventTimeline from "@/components/EventTimeline";

const Consumer = () => {
  const [productId, setProductId] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Mock data - will be replaced with actual Hedera mirror node queries
  const mockProduct = {
    id: "0.0.123456",
    name: "Ethiopian Coffee Batch #42",
    type: "Coffee Beans",
    origin: "Yirgacheffe, Ethiopia",
  };

  const mockEvents = [
    {
      type: "Created",
      timestamp: "2024-01-15T08:00:00Z",
      location: "Yirgacheffe, Ethiopia",
      notes: "Batch registered on Hedera network",
      status: "completed" as const
    },
    {
      type: "Harvested",
      timestamp: "2024-01-16T06:30:00Z",
      location: "Kochere Farm, Ethiopia",
      notes: "Hand-picked arabica beans, Grade 1",
      status: "completed" as const
    },
    {
      type: "Processed",
      timestamp: "2024-01-20T14:00:00Z",
      location: "Yirgacheffe Processing Station",
      notes: "Washed process, sun-dried for 12 days",
      status: "completed" as const
    },
    {
      type: "Quality Check",
      timestamp: "2024-01-25T10:00:00Z",
      location: "Addis Ababa Quality Lab",
      notes: "Passed cupping test, score: 88/100",
      status: "completed" as const
    },
    {
      type: "Shipped",
      timestamp: "2024-02-01T09:00:00Z",
      location: "Port of Djibouti",
      notes: "Container ship to Rotterdam",
      status: "completed" as const
    },
    {
      type: "Roasted",
      timestamp: "2024-02-20T11:00:00Z",
      location: "Amsterdam Roastery",
      notes: "Medium roast, City+ profile",
      status: "completed" as const
    },
    {
      type: "Delivered",
      timestamp: "2024-02-25T15:30:00Z",
      location: "Local Café, Amsterdam",
      notes: "Ready for consumers",
      status: "completed" as const
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Query Hedera mirror node for topic messages
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Track Product Provenance</h1>
          <p className="text-muted-foreground">Verify the complete journey of your product on the Hedera network</p>
        </div>

        {/* Search Card */}
        <Card className="mb-8 shadow-elegant border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Search className="h-5 w-5" />
              Search by Product ID
            </CardTitle>
            <CardDescription>Enter the product ID or scan the QR code on your product</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="productId" className="sr-only">Product ID</Label>
                <Input
                  id="productId"
                  placeholder="e.g., 0.0.123456 (Hedera Topic ID)"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && (
          <div className="space-y-6">
            {/* Product Info */}
            <Card className="shadow-elegant border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Package className="h-5 w-5" />
                  {mockProduct.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <MapPin className="h-4 w-4" />
                  {mockProduct.origin}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Product Type:</span>
                    <p className="font-medium">{mockProduct.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hedera Topic ID:</span>
                    <p className="font-mono text-xs">{mockProduct.id}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Verified on Hedera Network</span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-elegant border-border/50">
              <CardHeader>
                <CardTitle className="text-primary">Product Journey</CardTitle>
                <CardDescription>Complete provenance history recorded on Hedera Consensus Service</CardDescription>
              </CardHeader>
              <CardContent>
                <EventTimeline events={mockEvents} />
              </CardContent>
            </Card>

            {/* Integration Note */}
            <Card className="border-accent/20 bg-card/50">
              <CardHeader>
                <CardTitle className="text-accent text-sm">Mirror Node Integration</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>This data is fetched from a Hedera mirror node using the topic ID. Each event is an immutable message submitted via ConsensusMessageSubmitTransaction.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consumer;
