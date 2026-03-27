import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, BanknoteIcon, DollarSign, Copy, Bitcoin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { formatBitcoin } from "@/lib/utils";

// Lightning well-known data interface
interface LightningWellKnownData {
  callback: string;
  maxSendable: number;
  minSendable: number;
  metadata: string;
  commentAllowed: number;
  tag: string;
  allowsNostr: boolean;
  nostrPubkey: string;
}

// Lightning payment request interface
interface LightningPaymentRequest {
  pr: string;
  routes?: any[];
  successAction?: any;
  disposable?: boolean;
}

const PayUs = () => {
  const { toast } = useToast();
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null);
  const [bitcoinAmount, setBitcoinAmount] = useState<string>("");
  const [bitcoinMethod, setBitcoinMethod] = useState<"onchain" | "lightning">("onchain");
  const [lightningInvoice, setLightningInvoice] = useState<string | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Bitcoin payment details
  const bitcoinDetails = {
    onchainAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", // Example address - replace with your actual Bitcoin address
    lightningAddress: "pay@w4lkies.com", // Updated Lightning address
    lightningUrl: "/.well-known/lnurlp/pay" // Lightning address endpoint
  };

  // Bank transfer details
  const bankDetails = {
    accountName: "London W4lkies Ltd",
    accountNumber: "65204158",
    sortCode: "04-29-09",
    bankName: "Revolut",
    reference: "Your dog's name"
  };

  // Fetch current Bitcoin price when component mounts
  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=gbp");
        const data = await response.json();
        setBitcoinPrice(data.bitcoin.gbp);
        
        // Calculate Bitcoin amount based on £49.99 service fee
        if (data.bitcoin.gbp) {
          const btcAmount = (49.99 / data.bitcoin.gbp).toFixed(8);
          setBitcoinAmount(btcAmount);
        }
      } catch (error) {
        console.error("Failed to fetch Bitcoin price:", error);
        toast({
          title: "Error",
          description: "Failed to fetch current Bitcoin price. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchBitcoinPrice();
  }, [toast]);

  // Function to fetch the lightning invoice using the callback URL
  const fetchLightningInvoice = async () => {
    setLoadingInvoice(true);
    setLightningInvoice(null);
    setPaymentError(null);
    
    try {
      // First, fetch the .well-known data
      const wellKnownResponse = await fetch(bitcoinDetails.lightningUrl);
      if (!wellKnownResponse.ok) {
        throw new Error(`Failed to fetch lightning data: ${wellKnownResponse.status}`);
      }
      
      const wellKnownData: LightningWellKnownData = await wellKnownResponse.json();
      
      if (!wellKnownData.callback) {
        throw new Error("No callback URL found in lightning data");
      }
      
      // Calculate amount in millisatoshis (1 BTC = 100,000,000 sats = 100,000,000,000 msats)
      // £49.99 worth of Bitcoin in millisatoshis
      const amountMsats = Math.round(parseFloat(bitcoinAmount) * 100000000000);
      
      // Now fetch the invoice using the callback URL
      const invoiceResponse = await fetch(`${wellKnownData.callback}?amount=${amountMsats}`);
      if (!invoiceResponse.ok) {
        throw new Error(`Failed to fetch invoice: ${invoiceResponse.status}`);
      }
      
      const invoiceData: LightningPaymentRequest = await invoiceResponse.json();
      
      if (!invoiceData.pr) {
        throw new Error("No payment request found in response");
      }
      
      setLightningInvoice(invoiceData.pr);
      
      toast({
        title: "Invoice Generated",
        description: "Lightning invoice has been successfully generated",
      });
    } catch (error) {
      console.error("Error fetching lightning invoice:", error);
      setPaymentError(`Failed to generate Lightning invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: "Failed to generate Lightning invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(field);
        toast({
          title: "Copied!",
          description: `${field} copied to clipboard`,
          duration: 2000,
        });
        
        // Reset success message after 2 seconds
        setTimeout(() => setCopySuccess(null), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  const handlePayNow = async () => {
    setLoading(true);
    setPaymentError(null);
    
    try {
      // Using direct API endpoint
      const apiEndpoint = 'https://api.w4lkies.com/create-payment';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 4999, // £49.99 in pence
          productName: "Dog Walking Service"
        })
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Payment Form Opened",
          description: "Please complete your payment in the new tab",
        });
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError("There was an issue processing your payment. Please try again or use bank transfer instead.");
      toast({
        title: "Payment Error",
        description: "There was an issue processing your payment request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openLightningPayment = () => {
    if (lightningInvoice) {
      // Open the Lightning payment URL with the invoice
      window.location.href = `lightning:${lightningInvoice}`;
      
      toast({
        title: "Lightning Payment Initiated",
        description: "Please complete the payment in your Lightning wallet",
      });
    } else {
      fetchLightningInvoice();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="container max-w-4xl mx-auto my-10 px-4 flex-grow sm:my-12">
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
          Payment Details
        </h1>

        <Tabs defaultValue="fiat" className="mb-8">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="fiat">Bank & Card Payment</TabsTrigger>
            <TabsTrigger value="bitcoin">Bitcoin Payment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fiat">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Bank Transfer Section */}
              <Card className="border-border/70 bg-card shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Bank Transfer</CardTitle>
                    <BanknoteIcon className="w-8 h-8 text-primary" />
                  </div>
                  <CardDescription>
                    Pay directly to our business bank account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <div className="flex">
                      <Input 
                        id="accountName" 
                        value={bankDetails.accountName} 
                        readOnly 
                        className="rounded-r-none border-r-0"
                      />
                      <Button 
                        onClick={() => handleCopy(bankDetails.accountName, "Account name")}
                        variant="outline" 
                        className="rounded-l-none"
                      >
                        {copySuccess === "Account name" ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortCode">Sort Code</Label>
                    <div className="flex">
                      <Input 
                        id="sortCode" 
                        value={bankDetails.sortCode} 
                        readOnly 
                        className="rounded-r-none border-r-0"
                      />
                      <Button 
                        onClick={() => handleCopy(bankDetails.sortCode, "Sort code")}
                        variant="outline" 
                        className="rounded-l-none"
                      >
                        {copySuccess === "Sort code" ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <div className="flex">
                      <Input 
                        id="accountNumber" 
                        value={bankDetails.accountNumber} 
                        readOnly 
                        className="rounded-r-none border-r-0"
                      />
                      <Button 
                        onClick={() => handleCopy(bankDetails.accountNumber, "Account number")}
                        variant="outline" 
                        className="rounded-l-none"
                      >
                        {copySuccess === "Account number" ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <div className="flex">
                      <Input 
                        id="bankName" 
                        value={bankDetails.bankName} 
                        readOnly 
                        className="rounded-r-none border-r-0"
                      />
                      <Button 
                        onClick={() => handleCopy(bankDetails.bankName, "Bank name")}
                        variant="outline" 
                        className="rounded-l-none"
                      >
                        {copySuccess === "Bank name" ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full text-sm px-2 py-3 bg-muted rounded-md">
                    <p className="font-medium">Payment Reference</p>
                    <p className="text-muted-foreground">
                      Please use your dog's name as the payment reference to help us identify your payment.
                    </p>
                  </div>
                </CardFooter>
              </Card>

              {/* Online Payment Section - Card */}
              <Card className="border-border/70 bg-card shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Card Payment</CardTitle>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                  <CardDescription>
                    Pay instantly with your credit or debit card
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    You can make a secure online payment using your credit or debit card. Our payment system is fully encrypted and secure.
                  </p>
                  <div className="bg-muted rounded-md p-4">
                    <h3 className="font-medium text-lg mb-2">Benefits of Card Payment</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Instant payment confirmation</li>
                      <li>Secure transaction</li>
                      <li>No need for bank transfers</li>
                      <li>Payment receipt delivered to your email</li>
                    </ul>
                  </div>

                  {paymentError && (
                    <div className="rounded-md border border-red-300/70 bg-red-50 p-3 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                      {paymentError}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handlePayNow} 
                    disabled={loading} 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <>
                        Pay Now with Stripe
                        <DollarSign className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bitcoin">
            <Card className="border-border/70 bg-card shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Bitcoin Payment</CardTitle>
                  <Bitcoin className="w-8 h-8 text-primary" />
                </div>
                <CardDescription>
                  Pay securely using Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <p className="text-2xl font-bold">£49.99</p>
                  <Separator orientation="vertical" className="h-6" />
                  <p className="text-2xl font-bold">
                    {bitcoinPrice ? `≈ ${formatBitcoin(bitcoinAmount)}` : 'Loading...'}
                  </p>
                </div>
                
                <RadioGroup 
                  value={bitcoinMethod} 
                  onValueChange={(value) => {
                    setBitcoinMethod(value as "onchain" | "lightning");
                    // Reset lightning invoice when switching payment methods
                    if (value === "lightning") {
                      setLightningInvoice(null);
                    }
                  }}
                  className="flex flex-col space-y-4"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="onchain" id="onchain" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="onchain" className="flex items-center font-medium text-base">
                        <Bitcoin className="inline mr-2 h-4 w-4" />
                        On-chain Payment
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Standard Bitcoin transaction (may take 10-60 minutes to confirm)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="lightning" id="lightning" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="lightning" className="flex items-center font-medium text-base">
                        <Zap className="inline mr-2 h-4 w-4" />
                        Lightning Payment
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Instant payment using Lightning Network (requires a compatible wallet)
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                
                {/* Display relevant payment details based on selected method */}
                <div className="mt-6">
                  {bitcoinMethod === "onchain" ? (
                    <div className="space-y-4">
                      <Label>Bitcoin Address</Label>
                      <div className="p-4 bg-muted rounded-lg break-all">
                        {bitcoinDetails.onchainAddress}
                      </div>
                      <div className="flex justify-center mt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleCopy(bitcoinDetails.onchainAddress, "Bitcoin address")}
                          className="flex items-center"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {copySuccess === "Bitcoin address" ? "Copied!" : "Copy Address"}
                        </Button>
                      </div>
                      <div className="mt-2 text-center text-sm text-muted-foreground">
                        Please send exactly {formatBitcoin(bitcoinAmount)} to the address above
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lightningInvoice ? (
                        <>
                          <Label>Lightning Invoice</Label>
                          <div className="p-4 bg-muted rounded-lg break-all max-h-32 overflow-y-auto">
                            {lightningInvoice}
                          </div>
                          <div className="flex justify-center gap-2 mt-2">
                            <Button 
                              variant="outline"
                              onClick={() => handleCopy(lightningInvoice, "Lightning invoice")}
                              className="flex items-center"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {copySuccess === "Lightning invoice" ? "Copied!" : "Copy Invoice"}
                            </Button>
                            <Button 
                              onClick={openLightningPayment}
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Zap className="mr-2 h-4 w-4" />
                              Pay with Lightning
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Label>Lightning Address</Label>
                          <div className="p-4 bg-muted rounded-lg break-all">
                            {bitcoinDetails.lightningAddress}
                          </div>
                          <div className="flex justify-center gap-2 mt-2">
                            <Button 
                              variant="outline"
                              onClick={() => handleCopy(bitcoinDetails.lightningAddress, "Lightning address")}
                              className="flex items-center"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {copySuccess === "Lightning address" ? "Copied!" : "Copy Address"}
                            </Button>
                            <Button 
                              onClick={fetchLightningInvoice}
                              disabled={loadingInvoice}
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              {loadingInvoice ? (
                                <div className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Generating...
                                </div>
                              ) : (
                                <>
                                  <Zap className="mr-2 h-4 w-4" />
                                  Generate Invoice
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      )}
                      
                      {paymentError && (
                        <div className="rounded-md border border-red-300/70 bg-red-50 p-3 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                          {paymentError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 rounded-md border border-amber-300/70 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
                  <h4 className="mb-1 font-medium text-amber-800 dark:text-amber-300">Important</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-200">
                    After making your payment, please email us at <a href="mailto:hello@w4lkies.com" className="underline">hello@w4lkies.com</a> with 
                    your payment details and your dog's name so we can confirm your booking.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Instructions Section */}
        <Card className="mb-8 border-border/70 bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Payment Instructions</CardTitle>
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <CardDescription>
              How to make your payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Bank Transfer</h3>
                <div className="flex items-start gap-3">
                  <div className="bg-secondary/30 rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-foreground font-medium">1</span>
                  </div>
                  <p className="text-muted-foreground">
                    Log in to your banking app
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-secondary/30 rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-foreground font-medium">2</span>
                  </div>
                  <p className="text-muted-foreground">
                    Set up a new payee using our bank details
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-secondary/30 rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-foreground font-medium">3</span>
                  </div>
                  <p className="text-muted-foreground">
                    Include your dog's name as reference
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Card Payment</h3>
                <div className="flex items-start gap-3">
                  <div className="bg-secondary/30 rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-foreground font-medium">1</span>
                  </div>
                  <p className="text-muted-foreground">
                    Click the "Pay Now" button
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-secondary/30 rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-foreground font-medium">2</span>
                  </div>
                  <p className="text-muted-foreground">
                    Enter your card details on the secure page
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-secondary/30 rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-foreground font-medium">3</span>
                  </div>
                  <p className="text-muted-foreground">
                    Receive instant payment confirmation
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Bitcoin Payment</h3>
                <div className="flex items-start gap-3">
                  <div className="bg-secondary/30 rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-foreground font-medium">1</span>
                  </div>
                  <p className="text-muted-foreground">
                    Copy the Bitcoin/Lightning address
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-secondary/30 rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-foreground font-medium">2</span>
                  </div>
                  <p className="text-muted-foreground">
                    Send the exact BTC amount from your wallet
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-secondary/30 rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-foreground font-medium">3</span>
                  </div>
                  <p className="text-muted-foreground">
                    Email us with your payment details
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="p-6 bg-secondary/30 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-3 text-foreground">Need Help?</h3>
          <p className="mb-4 text-muted-foreground">
            If you have any questions about payments or need assistance, please don't hesitate to contact us.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="mailto:hello@w4lkies.com" 
              className="inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/90"
            >
              Email Us
            </a>
            <a 
              href="tel:+447534014933" 
              className="inline-block rounded-md border border-accent px-4 py-2 text-accent transition hover:bg-accent hover:text-accent-foreground"
            >
              Call Us
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PayUs;
