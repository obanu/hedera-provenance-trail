import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, History, QrCode, Download, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Producer = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDetails, setEventDetails] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrTopicId, setQrTopicId] = useState("");
  const [qrProductName, setQrProductName] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${qrProductName || 'product'}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast({
        title: "QR Code Downloaded",
        description: "QR code saved successfully",
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyTopicId = () => {
    navigator.clipboard.writeText(qrTopicId);
    toast({
      title: "Copied!",
      description: "Topic ID copied to clipboard",
    });
  };

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProducts(session.user.id);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProducts(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProducts = async (userId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-topic', {
        body: { productName, productDescription }
      });

      if (error) throw error;

      toast({
        title: "Product created!",
        description: `Topic ID: ${data.topicId}`,
      });

      // Reload products
      if (user) loadProducts(user.id);
      
      // Show QR code
      setQrTopicId(data.topicId);
      setQrProductName(productName);
      setShowQR(true);
      
      // Reset form
      setProductName("");
      setProductDescription("");
    } catch (error: any) {
      toast({
        title: "Error creating product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedProduct = products.find(p => p.id === selectedProductId);
      if (!selectedProduct) throw new Error('Product not found');

      const { error } = await supabase.functions.invoke('submit-event', {
        body: {
          topicId: selectedProduct.topic_id,
          eventType,
          location: eventLocation,
          details: eventDetails,
        }
      });

      if (error) throw error;

      toast({
        title: "Event logged!",
        description: `${eventType} event added to product history.`,
      });

      // Reset form
      setEventType("");
      setEventLocation("");
      setEventDetails("");
    } catch (error: any) {
      toast({
        title: "Error logging event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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
                  <Label htmlFor="productDescription">Description</Label>
                  <Textarea
                    id="productDescription"
                    placeholder="Product details..."
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90" disabled={submitting}>
                  <Plus className="h-4 w-4 mr-2" />
                  {submitting ? "Creating..." : "Create Product"}
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
                  <Select value={selectedProductId} onValueChange={setSelectedProductId} required>
                    <SelectTrigger id="selectProduct">
                      <SelectValue placeholder="Choose product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
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
                  <Label htmlFor="eventLocation">Location</Label>
                  <Input
                    id="eventLocation"
                    placeholder="e.g., Yirgacheffe, Ethiopia"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="eventDetails">Additional Notes</Label>
                  <Textarea
                    id="eventDetails"
                    placeholder="Optional details about this event..."
                    value={eventDetails}
                    onChange={(e) => setEventDetails(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-accent hover:opacity-90" disabled={submitting || !selectedProductId}>
                  <Plus className="h-4 w-4 mr-2" />
                  {submitting ? "Logging..." : "Log Event"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* My Products */}
        {products.length > 0 && (
          <Card className="mt-8 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-primary">My Products</CardTitle>
              <CardDescription>Products you've created on the Hedera network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-semibold text-primary">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">Topic ID: {product.topic_id}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQrTopicId(product.topic_id);
                        setQrProductName(product.name);
                        setShowQR(true);
                      }}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      View QR
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-primary">Product QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <div ref={qrRef} className="p-4 bg-white rounded-lg shadow-elegant">
              <QRCodeSVG 
                value={qrTopicId} 
                size={256}
                level="H"
                includeMargin
              />
            </div>
            <div className="w-full space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Topic ID</p>
                <p className="text-sm font-mono break-all">{qrTopicId}</p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan this QR code to track the product's journey on the blockchain
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button 
                onClick={copyTopicId}
                variant="outline"
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy ID
              </Button>
              <Button 
                onClick={downloadQRCode}
                className="flex-1 bg-gradient-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Producer;
