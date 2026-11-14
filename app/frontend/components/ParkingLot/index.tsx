import { useState } from "react";

import type { ParkingLotItemStatus } from "@/apis/types";
import ParkForm from "@/components/commons/ParkingLot/ParkForm";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DEFAULT_STATUS, TABS } from "./constants";
import ItemList from "./ItemList";

// Every thought parked so far, newest first: add one to the Inbox, mark it addressed, or discard it.
const ParkingLot = () => {
  const [status, setStatus] = useState<ParkingLotItemStatus>(DEFAULT_STATUS);

  const handleStatusChange = (value: string) => setStatus(value as ParkingLotItemStatus);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold">Parking lot</h1>
        <p className="text-muted-foreground">Park it, don&apos;t chase it. You&apos;ll get it back.</p>
      </header>
      <Card>
        <CardContent>
          <ParkForm />
        </CardContent>
      </Card>
      <Tabs value={status} onValueChange={handleStatusChange}>
        <TabsList>
          {TABS.map(({ status: tabStatus, label }) => (
            <TabsTrigger key={tabStatus} value={tabStatus}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.status} className="pt-2" value={tab.status}>
            <ItemList {...tab} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ParkingLot;
