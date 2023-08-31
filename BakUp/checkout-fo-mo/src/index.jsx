import React, { useEffect, useState } from 'react';
import {
  useExtensionApi,
  render,
  Banner,
  Text,
  useTranslate,
  Icon,
  InlineStack,
  View
} from '@shopify/checkout-ui-extensions-react';

render('Checkout::Dynamic::Render', () => <App />);

function App() {
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
          <InlineStack spacing="base">
          <Icon source="clock" />
          <Text size="medium">
         Products are in high demand!  Get yours now before they're gone.
        </Text>
    </InlineStack>


    {    totalSeconds > 0 ? 
      <View border="base" padding="tight" borderWidth="medium" borderRadius="large"> 
        <Text appearance="critical" size="medium" >
          Hurry! Your selected items are only reserved for {formatTime(totalSeconds)}. Complete your order now!
        </Text>
      </View> 
    : 
      <View border="base" padding="tight" borderWidth="medium" borderRadius="large"> 
        <Text appearance="critical" size="medium"  >
          Time's up! Please finish the checkout as the item is still in your cart.
        </Text>
      </View>}
    </View>
  );
}