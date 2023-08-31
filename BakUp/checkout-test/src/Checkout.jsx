import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,

} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <App />,
);

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();

  return (
    <Banner title="checkout-test">
      {translate('welcome', {target: extension.target})}
    </Banner>
  );
}

