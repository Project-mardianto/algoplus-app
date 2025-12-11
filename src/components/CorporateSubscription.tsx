
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import BottomNav from "./BottomNav";
import { useEffect, useState } from "react";

// This component represents the loading state of the CorporateSubscription page.
// It mimics the page's layout using skeleton placeholders.
const CorporateSubscriptionSkeleton = () => {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="space-y-3 mb-8">
        <Skeleton className="h-8 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-5/6 rounded-lg" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-12 w-full mt-4" />
        </CardContent>
      </Card>
    </div>
  );
};


export default function CorporateSubscription() {
  const [loading, setLoading] = useState(true); // Set to true to show the skeleton initially

  // In a real app, you would fetch data and set loading to false when done.
  // For this demonstration, we'll switch from skeleton to real UI after 3 seconds.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
             <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold text-gray-900">Corporate Subscription</h1>
                </div>
            </div>
            <CorporateSubscriptionSkeleton />
            <BottomNav activeTab="profile" />
        </div>
    );
  }

  // This is the actual UI of the page that will be shown after loading
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
       <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Corporate Subscription</h1>
        </div>
      </div>
      
      <div className="p-4 max-w-3xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Level Up Your Office Hydration</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Provide your team with premium, reliable water delivery services. Fill out the form below to get a custom quote from our sales team.
            </p>
        </div>

        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold">Inquiry Form</h3>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input id="companyName" placeholder="e.g. Acme Inc." />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input id="contactPerson" placeholder="e.g. John Doe" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email">Work Email</Label>
                    <Input id="email" type="email" placeholder="e.g. john.doe@acme.com" />
                </div>
                 <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="e.g. 0812-3456-7890" />
                </div>
                <Button type="submit" className="w-full h-11 text-base mt-4">
                    Submit Inquiry
                </Button>
            </CardContent>
        </Card>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}
