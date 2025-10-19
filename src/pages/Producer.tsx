import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Package, Plus, History } from "lucide-react";

const Producer = () => {
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [origin, setOrigin] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventNotes, setEventNotes] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with Hedera HCS - Create topic and submit initial message
    toast.success("Product created successfully!", {
      description: `${productName} has been registered on Hedera network.`
    });
    setProductName("");
    setProductType("");
    setOrigin("");
  };

  const handleLogEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with Hedera HCS - Submit message to existing topic
    toast.success("Event logged successfully!", {
      description: `${eventType} event added to product history.`
    });
    setEventType("");
    setEventNotes("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Producer Dashboard</h1>
          <p className="text-muted-foreground">Create products and log events on the Hedera network</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Product Card */}
          <Card className="shadow-elegant border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Package className="h-5 w-5" />
                Create New Product
              </CardTitle>
              <CardDescription>Register a new product batch on the Hedera network</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Ethiopian Coffee Batch #42"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="productType">Product Type</Label>
                  <Select value={productType} onValueChange={setProductType} required>
                    <SelectTrigger id="productType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coffee">Coffee Beans</SelectItem>
                      <SelectItem value="cocoa">Cocoa</SelectItem>
                      <SelectItem value="tea">Tea</SelectItem>
                      <SelectItem value="organic">Organic Produce</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="origin">Origin/Location</Label>
                  <Input
                    id="origin"
                    placeholder="e.g., Yirgacheffe, Ethiopia"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Product
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Log Event Card */}
          <Card className="shadow-elegant border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <History className="h-5 w-5" />
                Log Event
              </CardTitle>
              <CardDescription>Add a new event to an existing product's journey</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogEvent} className="space-y-4">
                <div>
                  <Label htmlFor="selectProduct">Select Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
                    <SelectTrigger id="selectProduct">
                      <SelectValue placeholder="Choose product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ethiopian Coffee Batch #42</SelectItem>
                      <SelectItem value="2">Colombian Coffee Batch #18</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select value={eventType} onValueChange={setEventType} required>
                    <SelectTrigger id="eventType">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="harvested">Harvested</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="roasted">Roasted</SelectItem>
                      <SelectItem value="quality-check">Quality Check</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="eventNotes">Additional Notes</Label>
                  <Textarea
                    id="eventNotes"
                    placeholder="Optional details about this event..."
                    value={eventNotes}
                    onChange={(e) => setEventNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-accent hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Event
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Integration Instructions */}
        <Card className="mt-8 border-accent/20 bg-card/50">
          <CardHeader>
            <CardTitle className="text-accent">Hedera Integration Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Create Product:</strong> Creates a new HCS topic and submits the initial "Created" message with product metadata.</p>
            <p><strong>Log Event:</strong> Submits a new ConsensusMessageSubmitTransaction to the product's topic with event details and timestamp.</p>
            <p>See backend documentation for complete implementation using @hashgraph/sdk.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Producer;
