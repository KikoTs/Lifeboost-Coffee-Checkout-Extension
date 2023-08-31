import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  Text,
  Icon,
  InlineLayout,
  View
} from '@shopify/ui-extensions-react/checkout';
import React, { useEffect, useState } from 'react';
export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />,
);

function Extension() {
  // const {extensionPoint} = useExtensionApi();
  // const translate = useTranslate();
  const [totalSeconds, setTotalSeconds] = useState(10 * 60); // Set initial counter to 10 minutes

  useEffect(() => {
    totalSeconds > 0 && setTimeout(() => setTotalSeconds(totalSeconds - 1), 1000);
  }, [totalSeconds]);

  const formatTime = (seconds) => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    seconds %= 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View>
          <InlineLayout columns={['5%', '95%']}>
      <View  padding="base">
      <Icon source="clock" />
      </View>
      <View padding="base">
      <Text size="base">
      Products are in high demand!  Get yours now before they're gone.
        </Text>
      
      </View>
    </InlineLayout>


    {    totalSeconds > 0 ? 
      <View border="base" padding="base"> 
        <Text appearance="accent" size="medium" >
          Hurry! Your selected items are only reserved for {formatTime(totalSeconds)}. Complete your order now!
        </Text>
      </View> 
    : 
      <View border="base" padding="base" borderWidth="base" borderRadius="large"> 
        <Text appearance="subdued" size="base"  >
          Time's up! Please finish the checkout as the item is still in your cart.
        </Text>
      </View>}
    </View>
  );
}