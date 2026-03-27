import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Camera, Cookie, ShoppingBag, Mail, BookOpen, Bitcoin } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SectionNavigation from "./SectionNavigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  coverImage: string;
  category: "photoBooks" | "snacks";
}

interface BitcoinRate {
  rate: number;
  lastUpdated: Date;
}

const specificAlbums = [
  {
    id: 1,
    name: "W4lkies",
    price: 15.99,
    description: "A beautiful collection of photos featuring our dogs on various walks and adventures.",
    coverImage: "/img/shop-dog-photo-album-w4lkies-cover.png",
    category: "photoBooks" as const,
  },
  {
    id: 2,
    name: "I am Hugo",
    price: 9.99,
    description: "An artistic photo journal showcasing the daily life and personality of Hugo.",
    coverImage: "/img/shop-dog-photo-album-i-am-hugo-cover.png",
    category: "photoBooks" as const,
  },
  {
    id: 3,
    name: "I am Stormi",
    price: 9.99,
    description: "Adorable moments captured of our smallest friend in the most unexpected places.",
    coverImage: "/img/shop-dog-photo-album-i-am-stormi-cover.png",
    category: "photoBooks" as const,
  }
  // ,
  // {
  //   id: 4,
  //   name: "Street Dogs",
  //   price: 9.99,
  //   description: "Adorable moments captured of our smallest friend in the most unexpected places.",
  //   coverImage: "/img/shop-dog-photo-album-street-dogs-cover.png",
  //   category: "photoBooks" as const,
  // }
  // {
  //   id: 4,
  //   name: "I am Elva",
  //   price: 9.99,
  //   description: "Adorable moments captured of our smallest friend in the most unexpected places.",
  //   coverImage: "/img/shop-dog-photo-album-i-am-elva.png",
  //   category: "photoBooks" as const,
  // }
  // ,{
  //   id: 4,
  //   name: "I am Harry",
  //   price: 9.99,
  //   description: "Adorable moments captured of our smallest friend in the most unexpected places.",
  //   coverImage: "/img/shop-dog-photo-album-i-am-harry.png",
  //   category: "photoBooks" as const,
  // }
];

const snacks = [
  {
    id: 101,
    name: "Natural Dog Treats Pack",
    price: 12.99,
    description: "Wholesome and natural treats for your furry friend. Made with high-quality ingredients.",
    coverImage: "/img/dog-billy-01.png",
    category: "snacks" as const,
  }
];

const products: Product[] = [
  // Photo Albums
  ...specificAlbums,
  
  // Dog Snacks
  ...snacks
];

const EcommerceSection = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("shop");
  const [productCategory, setProductCategory] = useState<"photoBooks" | "snacks">("photoBooks");
  const [bitcoinRate, setBitcoinRate] = useState<BitcoinRate>({ rate: 0, lastUpdated: new Date() });
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  
  // Custom book request form states
  const [customBookFormData, setCustomBookFormData] = useState({
    name: "",
    email: "",
    dogName: "",
    message: "",
    requestType: "custom" // or "iAmSeries"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Bitcoin exchange rate
  useEffect(() => {
    const fetchBitcoinRate = async () => {
      try {
        setIsLoadingRate(true);
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=gbp');
        const data = await response.json();
        if (data && data.bitcoin && data.bitcoin.gbp) {
          setBitcoinRate({
            rate: data.bitcoin.gbp,
            lastUpdated: new Date()
          });
        }
      } catch (error) {
        console.error('Failed to fetch Bitcoin rate:', error);
        // Use fallback rate
        setBitcoinRate({
          rate: 50000, // Fallback rate if API fails
          lastUpdated: new Date()
        });
      } finally {
        setIsLoadingRate(false);
      }
    };

    fetchBitcoinRate();
    // Refresh rate every 15 minutes
    const interval = setInterval(fetchBitcoinRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert GBP to BTC with more readable formatting
  const convertToBTC = (priceGBP: number): string => {
    if (bitcoinRate.rate <= 0) return "...";
    const btcAmount = priceGBP / bitcoinRate.rate;
    
    // Format to appropriate number of decimal places based on amount
    if (btcAmount < 0.0001) {
      // For very small amounts, show in satoshis (100 million sats = 1 BTC)
      const satoshis = Math.round(btcAmount * 100000000);
      return `${satoshis} sats`;
    } else if (btcAmount < 0.001) {
      // For small amounts, show more precision
      return btcAmount.toFixed(6);
    } else if (btcAmount < 0.01) {
      // For medium amounts
      return btcAmount.toFixed(5);
    } else {
      // For larger amounts
      return btcAmount.toFixed(4);
    }
  };

  const addToCart = (product: Product) => {
    if (!cart.some(item => item.id === product.id)) {
      setCart([...cart, product]);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } else {
      toast({
        title: "Already in cart",
        description: `${product.name} is already in your cart.`,
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleCustomFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomBookFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestTypeChange = (type: "custom" | "iAmSeries") => {
    setCustomBookFormData(prev => ({
      ...prev,
      requestType: type
    }));
  };

  const handleCustomBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, this would send the form data to a backend service
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Request Submitted",
        description: "We've received your custom book request and will contact you soon!",
      });
      
      // Reset the form
      setCustomBookFormData({
        name: "",
        email: "",
        dogName: "",
        message: "",
        requestType: "custom"
      });
      
      // Close the dialog by simulating an Escape key press
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    }, 1500);
  };

  const filteredProducts = products.filter(product => product.category === productCategory);

  const categoryIcons = {
    photoBooks: <Camera className="h-5 w-5" />,
    snacks: <Cookie className="h-5 w-5" />
  };

  return (
    <section id="shop" className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4">
        <h2 
          className="text-3xl font-bold text-center mb-8 text-[rgb(var(--color-accent))] dark:text-white"
          data-aos="fade-up"
        >
          Our Shop
        </h2>
        
        <p 
          className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center mb-10" 
          data-aos="fade-up" 
          data-aos-delay="100"
        >
          Take home beautiful memories and essentials for your pup
        </p>

        <Tabs defaultValue="shop" className="mb-12" onValueChange={handleTabChange} value={activeTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="shop">Browse Products</TabsTrigger>
            <TabsTrigger value="cart">
              Cart ({cart.length}) <ShoppingCart className="ml-2 h-4 w-4" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="shop">
            <div className="flex justify-center mb-8 mt-4">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setProductCategory("photoBooks")}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium border ${
                    productCategory === "photoBooks" 
                      ? "bg-[rgb(var(--color-primary))] text-white border-[rgb(var(--color-primary))]" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  } rounded-l-lg`}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Coffee Table Doggie Books
                </button>
                {/*<button
                  type="button"
                  onClick={() => setProductCategory("snacks")}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium border-t border-b border-r ${
                    productCategory === "snacks" 
                      ? "bg-[rgb(var(--color-primary))] text-white border-[rgb(var(--color-primary))]" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  } rounded-r-lg`}
                >
                  <Cookie className="mr-2 h-4 w-4" />
                  Essential Dog Snacks
                </button>*/}
              </div>
            </div>

            {/* Bitcoin rate indicator */}
            <div className="flex justify-center items-center mb-8 text-sm">
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md flex items-center gap-2">
                <Bitcoin className="h-4 w-4 text-amber-500" />
                {isLoadingRate ? (
                  <span>Loading Bitcoin rate...</span>
                ) : (
                  <span>1 BTC = £{bitcoinRate.rate.toLocaleString()} GBP</span>
                )}
              </div>
            </div>

            {/* Custom book request cards */}
            {productCategory === "photoBooks" && (
              <div className="mb-12 grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {filteredProducts.map((product, index) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden transition-shadow hover:shadow-lg dark:bg-gray-800"
                  data-aos="fade-up"
                  data-aos-delay={100 + (index * 50)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={product.coverImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-semibold">
                      £{product.price.toFixed(2)}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {product.category === "photoBooks" ? <Camera className="h-5 w-5" /> : <Cookie className="h-5 w-5" />}
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{product.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="text-gray-700 dark:text-gray-300">Price:</span>
                      <span className="flex items-center gap-1">
                        £{product.price.toFixed(2)} <span className="text-gray-500">or</span>
                        <Bitcoin className="h-4 w-4 text-amber-500" />
                        {isLoadingRate ? "..." : convertToBTC(product.price)}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => addToCart(product)}
                      className="w-full"
                    >
                      Add to Cart <ShoppingCart className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="cart">
            {cart.length > 0 ? (
              <div className="mt-8">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img 
                          src={item.coverImage} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold dark:text-white">{item.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          £{item.price.toFixed(2)} / <Bitcoin className="inline h-3 w-3 text-amber-500" /> {isLoadingRate ? "..." : convertToBTC(item.price)}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setCart(cart.filter(cartItem => cartItem.id !== item.id));
                          toast({
                            title: "Removed from cart",
                            description: `${item.name} has been removed from your cart.`,
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold dark:text-white">Total</span>
                    <div className="text-right">
                      <div className="font-semibold dark:text-white">
                        £{cart.reduce((total, item) => total + item.price, 0).toFixed(2)}
                      </div>
                      <div className="text-sm flex items-center justify-end gap-1">
                        <Bitcoin className="h-3 w-3 text-amber-500" />
                        {isLoadingRate 
                          ? "..." 
                          : convertToBTC(cart.reduce((total, item) => total + item.price, 0))
                        } BTC
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      toast({
                        title: "Checkout",
                        description: "Thank you for your purchase! This is just a demo.",
                      });
                      setCart([]);
                      setActiveTab("shop");
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-12 w-12 mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Your cart is empty</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Add some products to get started</p>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab("shop")}
                >
                  Browse Products
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <SectionNavigation targetId="contact" label="Contact Us" />
    </section>
  );
};

export default EcommerceSection;
