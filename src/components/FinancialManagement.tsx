import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileText, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";

export function FinancialManagement({ accessToken }: { accessToken: string }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Financial Management</h2>
        <p className="text-muted-foreground">
          Manage receipts, refunds, payments, and authorizations
        </p>
      </div>

      <Tabs defaultValue="receipts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="authorizations">Authorizations</TabsTrigger>
          <TabsTrigger value="permits">Permits</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <Badge className="bg-green-100 text-green-800">Paid</Badge>
                  </div>
                  <CardTitle className="text-base">Medical Visit #{i}</CardTitle>
                  <CardDescription>
                    {new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Amount:</span>
                    <span className="font-semibold">${(150 + i * 25).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Provider:</span>
                    <span className="text-muted-foreground">Dr. Smith</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Download Receipt
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <Badge
                      className={
                        i === 1
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {i === 1 ? "Processing" : "Completed"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">Refund Request #{i}</CardTitle>
                  <CardDescription>Submitted 2 weeks ago</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Amount:</span>
                    <span className="font-semibold">${(75 * i).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Reason:</span>
                    <span className="text-muted-foreground">Overpayment</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Payment #{1000 + i}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Date.now() - i * 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(200 + i * 50).toFixed(2)}</p>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authorizations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { status: "approved", type: "MRI Scan", expires: "30 days" },
              { status: "pending", type: "Physical Therapy", expires: "N/A" },
              { status: "approved", type: "Specialist Referral", expires: "60 days" },
            ].map((auth, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <Badge
                      className={
                        auth.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {auth.status === "approved" ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      )}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{auth.type}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Authorization #:</span>
                    <span className="font-mono text-xs">AUTH-2024-{i + 1}001</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Expires:</span>
                    <span className="text-muted-foreground">{auth.expires}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Parking Permit", expires: "Dec 2024", status: "active" },
              { name: "Medical Equipment", expires: "Mar 2025", status: "active" },
            ].map((permit, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <CardTitle className="text-base">{permit.name}</CardTitle>
                  <CardDescription>Expires: {permit.expires}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    View Permit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
