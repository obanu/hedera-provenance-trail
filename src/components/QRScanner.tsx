import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";

interface QRScannerProps {
  onScan: (topicId: string) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // Successfully scanned
          onScan(decodedText);
          setIsOpen(false);
          scanner.clear();
          scannerRef.current = null;
        },
        (error) => {
          // Scan error - can be ignored as it happens continuously while scanning
          console.debug("QR scan error:", error);
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScan]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Camera className="h-4 w-4" />
        Scan QR Code
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan QR Code
            </DialogTitle>
            <DialogDescription>
              Position the QR code within the camera frame to scan
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative">
            <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
          </div>

          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRScanner;
