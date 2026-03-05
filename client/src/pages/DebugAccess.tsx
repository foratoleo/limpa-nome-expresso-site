import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentStatus } from "@/contexts/PaymentContext";
import { useAccessStatus } from "@/hooks/useAccessStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DirectApiResponse {
  has_access: boolean;
  has_manual_access: boolean;
  access_type: "subscription" | "one_time" | "manual" | null;
  expires_at: string | null;
  trial_ends_at: string | null;
  subscription_status: string | null;
  error?: string;
}

export default function DebugAccess() {
  const { user, session } = useAuth();
  const paymentContext = usePaymentStatus();
  const accessHook = useAccessStatus();
  const [directApiResult, setDirectApiResult] = useState<DirectApiResponse | null>(null);
  const [loadingDirect, setLoadingDirect] = useState(false);

  const fetchDirectApi = async () => {
    setLoadingDirect(true);
    try {
      const response = await fetch("/api/payments/status");
      const data = await response.json();
      setDirectApiResult(data);
      toast.success("API response fetched successfully");
    } catch (error) {
      console.error("Error fetching direct API:", error);
      toast.error("Failed to fetch API response");
      setDirectApiResult({ error: "Failed to fetch" } as any);
    } finally {
      setLoadingDirect(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  const renderBoolean = (value: boolean, label: string) => (
    <div className="flex items-center gap-2">
      <Badge variant={value ? "default" : "secondary"} className={value ? "bg-green-500" : "bg-gray-500"}>
        {value ? "TRUE" : "FALSE"}
      </Badge>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Access Debug Panel</h1>
        <p className="text-muted-foreground">Real-time access control information for debugging</p>
      </div>

      <div className="grid gap-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Email:</span>
                <p className="text-lg">{user?.email || "Not logged in"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">User ID:</span>
                <p className="text-sm font-mono bg-muted p-2 rounded">{user?.id || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Role:</span>
                <p className="text-lg">{user?.user_metadata?.role || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Session Active:</span>
                {renderBoolean(!!session, session ? "Yes" : "No")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PaymentContext Values */}
        <Card>
          <CardHeader>
            <CardTitle>PaymentContext Values</CardTitle>
            <CardDescription>Values from usePaymentStatus hook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {renderBoolean(paymentContext.hasActiveAccess, "hasActiveAccess")}
              {renderBoolean(paymentContext.hasManualAccess, "hasManualAccess")}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-sm font-medium">Access Type:</span>
                <p className="text-lg">{paymentContext.accessType || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Expires At:</span>
                <p className="text-sm">{formatDate(paymentContext.expiresAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Loading:</span>
                {renderBoolean(paymentContext.loading, paymentContext.loading ? "Loading..." : "Ready")}
              </div>
              <div>
                <span className="text-sm font-medium">Initialized:</span>
                {renderBoolean(paymentContext.initialized, paymentContext.initialized ? "Yes" : "No")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* useAccessStatus Hook Values */}
        <Card>
          <CardHeader>
            <CardTitle>useAccessStatus Hook Values</CardTitle>
            <CardDescription>Raw values from the access status hook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {renderBoolean(accessHook.hasAccess, "hasAccess")}
              {renderBoolean(accessHook.hasManualAccess, "hasManualAccess")}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-sm font-medium">Access Type:</span>
                <p className="text-lg">{accessHook.accessType || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Expires At:</span>
                <p className="text-sm">{formatDate(accessHook.expiresAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Trial Ends At:</span>
                <p className="text-sm">{formatDate(accessHook.trialEndsAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Subscription Status:</span>
                <p className="text-lg">{accessHook.subscriptionStatus || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Is Loading:</span>
                {renderBoolean(accessHook.isLoading, accessHook.isLoading ? "Loading..." : "Ready")}
              </div>
              <div>
                <span className="text-sm font-medium">Initialized:</span>
                {renderBoolean(accessHook.initialized, accessHook.initialized ? "Yes" : "No")}
              </div>
            </div>
            {accessHook.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <span className="text-sm font-medium text-red-900">Error:</span>
                <p className="text-sm text-red-700">{accessHook.error.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Direct API Response */}
        <Card>
          <CardHeader>
            <CardTitle>Direct API Response</CardTitle>
            <CardDescription>Raw response from /api/payments/status endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={fetchDirectApi} disabled={loadingDirect}>
                {loadingDirect ? "Fetching..." : "Test Access Endpoint"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDirectApiResult(null);
                  toast.info("Cleared");
                }}
              >
                Clear
              </Button>
            </div>

            {directApiResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {renderBoolean(directApiResult.has_access, "has_access (API)")}
                  {renderBoolean(directApiResult.has_manual_access, "has_manual_access (API)")}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="text-sm font-medium">Access Type (API):</span>
                    <p className="text-lg">{directApiResult.access_type || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Expires At (API):</span>
                    <p className="text-sm">{formatDate(directApiResult.expires_at)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Trial Ends At (API):</span>
                    <p className="text-sm">{formatDate(directApiResult.trial_ends_at)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Subscription Status (API):</span>
                    <p className="text-lg">{directApiResult.subscription_status || "N/A"}</p>
                  </div>
                </div>

                {/* Raw JSON */}
                <div className="mt-4">
                  <span className="text-sm font-medium">Raw JSON Response:</span>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(directApiResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {!directApiResult && (
              <p className="text-sm text-muted-foreground italic">
                Click "Test Access Endpoint" to fetch the raw API response
              </p>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Access Summary</CardTitle>
            <CardDescription>Quick overview of current access state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="font-medium">Final Access Decision:</span>
                <Badge
                  variant={paymentContext.hasActiveAccess ? "default" : "secondary"}
                  className={paymentContext.hasActiveAccess ? "bg-green-500 text-lg px-4 py-1" : "bg-red-500 text-lg px-4 py-1"}
                >
                  {paymentContext.hasActiveAccess ? "GRANTED" : "DENIED"}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Based on PaymentContext.hasActiveAccess (used by ProtectedRoute)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
