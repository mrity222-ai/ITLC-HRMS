"use client";

import React from "react";
import { useHRMS } from "../context/HRMSContext";
import { Card, Button, Badge } from "../UI";
import {
  Laptop,
  Monitor,
  Keyboard,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export const AssetManagement: React.FC = () => {
  const { assets, requestAssetReturn } = useHRMS();

  const getAssetIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("macbook") || lowerName.includes("laptop")) {
      return <Laptop className="h-6 w-6 text-indigo-500" />;
    }
    if (lowerName.includes("monitor") || lowerName.includes("dell")) {
      return <Monitor className="h-6 w-6 text-emerald-500" />;
    }
    return <Keyboard className="h-6 w-6 text-amber-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Assigned":
        return <Badge variant="success">Assigned</Badge>;
      case "Return Requested":
        return <Badge variant="warning">Return Requested</Badge>;
      case "Returned":
        return <Badge variant="neutral">Returned</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Information Header Card */}
      <div className="p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" /> IT Asset Custody Inventory
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            View security asset registrations allocated to your workspace profile
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-card/65 px-3 py-1.5 rounded-lg border border-border">
          Total Custody: <strong>{assets.filter(a => a.status !== "Returned").length} Devices</strong>
        </div>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <Card key={asset.id} className="flex flex-col justify-between p-5 space-y-4" hover>
            
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-lg bg-secondary/60 shrink-0">
                {getAssetIcon(asset.name)}
              </div>
              {getStatusBadge(asset.status)}
            </div>

            {/* Asset details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2" title={asset.name}>
                {asset.name}
              </h4>
              
              <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground border-t border-border/60">
                <div>
                  <span className="font-bold block uppercase scale-90 origin-left">Asset Code</span>
                  <span className="font-mono font-semibold text-foreground">{asset.code}</span>
                </div>
                <div>
                  <span className="font-bold block uppercase scale-90 origin-left">Allocated On</span>
                  <span className="font-semibold text-foreground">{asset.issueDate}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {asset.status === "Assigned" && (
              <div className="pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RotateCcw className="h-3 w-3" />}
                  onClick={() => requestAssetReturn(asset.id)}
                  className="w-full text-[11px] py-1.5 cursor-pointer"
                >
                  Initiate Return Process
                </Button>
              </div>
            )}

            {asset.status === "Return Requested" && (
              <div className="pt-2 text-center text-[10px] text-amber-500 font-semibold bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                Return collection pending IT courier scheduling
              </div>
            )}
          </Card>
        ))}
      </div>

    </div>
  );
};
