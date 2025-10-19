import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle2, Package, MapPin, Loader2 } from "lucide-react";
import EventTimeline from "@/components/EventTimeline";
import QRScanner from "@/components/QRScanner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Consumer = () => {
  const [topicId, setTopicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const { toast } = useToast();

  const searchProduct = async (searchTopicId: string) => {
    setLoading(true);
    setProduct(null);
    setEvents([]);

    try {
      // Query events from Hedera mirror node
      const { data: eventsData, error: eventsError } = await supabase.functions.invoke('query-events', {
        body: { topicId: searchTopicId }
      });

      if (eventsError) throw eventsError;

      // Get product details from database
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('topic_id', searchTopicId)
        .maybeSingle();

      if (productError) throw productError;

      if (!productData) {
        toast({
          title: "Product not found",
          description: "No product found with this Topic ID in our database.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Transform events to match timeline format
      const transformedEvents = eventsData.events.map((event: any) => ({
        type: event.eventType,
        timestamp: event.consensusTimestamp,
        location: event.location,
        notes: event.details || "",
        status: "completed" as const,
      }));

      setProduct(productData);
      setEvents(transformedEvents);

      toast({
        title: "Product found!",
        description: `Retrieved ${transformedEvents.length} events from Hedera network.`,
      });
    } catch (error: any) {
      toast({
        title: "Error searching product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchProduct(topicId);
  };

  const handleQRScan = (scannedTopicId: string) => {
    setTopicId(scannedTopicId);
    searchProduct(scannedTopicId);
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
              Search by Topic ID
            </CardTitle>
            <CardDescription>Enter the Hedera Topic ID or scan the QR code on your product</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="topicId" className="sr-only">Topic ID</Label>
                  <Input
                    id="topicId"
                    placeholder="e.g., 0.0.123456"
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="bg-gradient-primary hover:opacity-90" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground uppercase">or</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <QRScanner onScan={handleQRScan} />
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {product && (
          <div className="space-y-6">
            {/* Product Info */}
            <Card className="shadow-elegant border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Package className="h-5 w-5" />
                  {product.name}
                </CardTitle>
                {product.description && (
                  <CardDescription className="mt-2">
                    {product.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Hedera Topic ID:</span>
                    <p className="font-mono text-xs mt-1">{product.topic_id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="text-xs mt-1">{new Date(product.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Verified on Hedera Network</span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            {events.length > 0 && (
              <Card className="shadow-elegant border-border/50">
                <CardHeader>
                  <CardTitle className="text-primary">Product Journey</CardTitle>
                  <CardDescription>
                    Complete provenance history with {events.length} events recorded on Hedera Consensus Service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EventTimeline events={events} />
                </CardContent>
              </Card>
            )}

            {events.length === 0 && (
              <Card className="border-muted">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No events recorded yet for this product.</p>
                </CardContent>
              </Card>
            )}

            {/* Integration Note */}
            <Card className="border-accent/20 bg-card/50">
              <CardHeader>
                <CardTitle className="text-accent text-sm">Hedera Mirror Node Data</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>This data is fetched in real-time from the Hedera Testnet mirror node. Each event represents an immutable message submitted via Hedera Consensus Service.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consumer;
