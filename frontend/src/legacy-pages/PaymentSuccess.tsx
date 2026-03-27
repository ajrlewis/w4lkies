import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Footer from "@/components/Footer";
import AppNavbar from "@/components/AppNavbar";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNavbar />
      <main className="container mx-auto my-10 flex w-full max-w-4xl flex-grow items-center px-4 sm:my-12">
        <Card className="w-full border-border/70 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <div className="mb-4 flex w-full items-center justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl font-semibold text-foreground">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Thank you for your payment. We have received your payment successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border/70 bg-muted/40 p-6 text-center">
              <p className="mb-4 text-muted-foreground">
                A confirmation email has been sent to your registered email address. We look
                forward to walking your dog!
              </p>
              <Link to="/">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {loading ? "Loading..." : "Return to Home"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
