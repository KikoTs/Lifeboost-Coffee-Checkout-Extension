import React, { useEffect, useState } from 'react';
import {
  useExtensionApi,
  render,
  Banner,
  Text,
  useTranslate,
  View
} from '@shopify/checkout-ui-extensions-react';

render('Checkout::Dynamic::Render', () => <App />);

function App() {
  // const {extensionPoint} = useExtensionApi();
  // const translate = useTranslate();
  const [count, setCount] = useState(60); // Set initial counter

  useEffect(() => {
    count > 0 && setTimeout(() => setCount(count - 1), 1000);
  }, [count]);

  return (
    count > 0 ? 
      <View padding="tight"> 
        <Text appearance="critical" size="extraLarge">
          Complete your purchase within {count} seconds!
        </Text>
      </View> 
    : null
  );
}