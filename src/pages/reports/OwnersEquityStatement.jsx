import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OwnersEquityStatement = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-ecb-primary rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-white">Statement of Owner's Equity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-ecb-textDark">Statement of Owner's Equity details will be displayed here.</p>
          <p className="text-ecb-textDark mt-4">This section is under construction. 🚧</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnersEquityStatement;