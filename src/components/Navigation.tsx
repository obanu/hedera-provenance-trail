import { Link } from "react-router-dom";
import { Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary-glow transition-colors">
            <Package className="h-6 w-6" />
            <span>Hedera Provenance</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/producer">
              <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-accent/10">
                Producer Dashboard
              </Button>
            </Link>
            <Link to="/consumer">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Search className="h-4 w-4 mr-2" />
                Track Product
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
