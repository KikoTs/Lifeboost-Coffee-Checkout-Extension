import {
  View,
  useApi,
  reactExtension,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';


export default reactExtension(
  'purchase.checkout.block.render',
  () => <Tracktor />,
);

function Tracktor() {
  const { analytics, buyerIdentity } = useApi();
  useEffect(() => {
    const event_name = "checkoutExperiment"
    const event_data = {
      event: 'checkoutExperiment',
      variation: "Checkout v3.0",
      timestamp: Date.now(),
      customer: buyerIdentity?.customer?.current ?? null,
      }
    // console.log(event_name, event_data);
    analytics.publish(event_name, event_data);
  }, []);

  return (
    <View></View>
  );
}