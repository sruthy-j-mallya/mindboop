import { useState } from "react";

import type { ParkingLotItemStatus } from "@/apis/types";
import { PARKING_LOT_TAGLINE } from "@/components/commons/ParkingLot/constants";
import ParkForm from "@/components/commons/ParkingLot/ParkForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DEFAULT_STATUS, TABS } from "./constants";
import ItemList from "./ItemList";

// Every thought parked so far, oldest first: look into one for a few minutes, add it to the Inbox, mark it addressed,
// or let it go.
const ParkingLot = () => {
  const [status, setStatus] = useState<ParkingLotItemStatus>(DEFAULT_STATUS);

  const handleStatusChange = (value: string) => setStatus(value as ParkingLotItemStatus);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-4">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold">Parking lot</h1>
        <p className="text-sm text-muted-foreground">{PARKING_LOT_TAGLINE}</p>
      </header>
      <ParkForm />
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
