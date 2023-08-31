import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  Divider,
  Image,
  Heading,
  Button,
  InlineLayout,
  BlockStack,
  Text,
  SkeletonText,
  SkeletonImage,
  useCartLines,
  useApplyCartLinesChange,
  useExtensionApi,
  Select,
  Stepper,
  Grid,
  InlineSpacer,
  InlineStack,
  Choice,
  ChoiceList,
  View,
} from "@shopify/ui-extensions-react/checkout";

import React, { useEffect, useState } from "react";
export default reactExtension(
  "purchase.checkout.block.render",
  () => <App />
);

function App() {
  const { extension } = useApi();
  const { target } = extension;
  const { query, i18n } = useExtensionApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addingSub, setAddingSub] = useState(false);
  const [isSub, setIsSub] = useState(false);
  const [showError, setShowError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState("");
  useEffect(() => {
    setLoading(true);
    query(
      `query ($first: Int!, $handle: String!) {
    collectionByHandle(handle: $handle) {
      products(first: $first, sortKey: BEST_SELLING) {
        edges {
          node {
            id
            title
            images(first:1){
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price{
                      amount
                  }
                  sellingPlanAllocations(first: 100){
                      nodes{
                          sellingPlan{
                              id
                              name
                          }
                      }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`,
      {
        variables: { first: 5, handle: "all-products-new" },
      }
    )
      .then(({ data }) => {
        const productsFromCollection =
          data.collectionByHandle.products.edges.map((edge) => {
            const { node: productNode } = edge;
            return {
              ...productNode,
              images: {
                nodes: productNode.images.edges.map((edge) => edge.node),
              },
              variants: {
                nodes: productNode.variants.edges.map((edge) => edge.node),
              },
            };
          });
        setProducts(productsFromCollection);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  // If an offer is added and an error occurs, then show some error feedback using a banner
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const lines = useCartLines();
  // Show a loading UI if you're waiting for product variant data
  // Use Skeleton components to keep placement from shifting when content loads
  if (loading) {
    return (
      <BlockStack spacing="loose">
        <Divider />
        <Heading level={3}>You might also like</Heading>
        <BlockStack spacing="loose">
          <InlineLayout
            spacing="base"
            columns={[64, "fill", "auto"]}
            blockAlignment="center"
          >
            <SkeletonImage aspectRatio={1} />
            <BlockStack spacing="none">
              <SkeletonText inlineSize="large" />
              <SkeletonText inlineSize="small" />
            </BlockStack>
            <Button kind="secondary" disabled={true}>
              Add
            </Button>
          </InlineLayout>
        </BlockStack>
      </BlockStack>
    );
  }
  // If product variants can't be loaded, then show nothing
  if (!loading && products.length === 0) {
    return null;
  }

  // Get the IDs of all product variants in the cart
  const cartLineProductVariantIds = lines.map((item) => item.merchandise.id);
  const productsOnOffer = products.filter((product) => {
    const isProductVariantInCart = product.variants.nodes.some(({ id }) =>
      cartLineProductVariantIds.includes(id)
    );
    return !isProductVariantInCart;
  });

  if (!productsOnOffer.length) {
    return null;
  }

  const { images, title, variants } = productsOnOffer[0];
  const submitToCarLines = async () => {
    setAdding(true);
    const variantToAdd =
      variant === "" ||
      !variants.nodes.includes(variant) ||
      variants.nodes.length == 1
        ? variants.nodes[0].id
        : variant;
    let carLines = {
      type: "addCartLine",
      merchandiseId: variantToAdd,
      quantity: quantity,
      attributes: [
        {
          key: "Special",
          value: "Offer",
        },
      ],
    };
    const result = await applyCartLinesChange(carLines);
    setAdding(false);
    if (result.type === "error") {
      setShowError(true);
      console.error(result.message);
    }
  };

  const submitToCarLinesSub = async () => {
    setAddingSub(true);
    const variantToAdd =
      variant === "" ||
      !variants.nodes.includes(variant) ||
      variants.nodes.length == 1
        ? variants.nodes[0].id
        : variant;
    const SelectedVariant = variants.nodes.find(
      (myVariant) => myVariant.id === variantToAdd
    );

    let carLines = {
      type: "addCartLine",
      merchandiseId: variantToAdd,
      quantity: quantity,
      attributes: [
        {
          key: "Special",
          value: "Offer",
        },
      ],
      sellingPlanId:
        SelectedVariant?.sellingPlanAllocations.nodes[0].sellingPlan.id ?? null,
    };
    const result = await applyCartLinesChange(carLines);
    setAddingSub(false);
    if (result.type === "error") {
      setShowError(true);
      console.error(result.message);
    }
  };

  const renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);

  const imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

    const columnsValue = variants.nodes.length > 1 ? ["30%", "70%"] : ["20%", "80%"];

  return (
    <View>
            <Text size="medium" emphasis="bold" >You Might Also Like</Text>
            <BlockStack border="base" spacing="none" padding="small100">

<View>
  <Grid columns={columnsValue} rows={["auto"]}>
    <View blockAlignment={'center'}>
      <Image
      cornerRadius="base"
        borderWidth="base"
        source={imageUrl}
        description={title}
        aspectRatio={1}
      />
    </View>
    <BlockStack spacing="small100" padding="small100">
      <View>
        <BlockStack spacing="small100">
          <View>
            <Text size="large" appearance="interactive">
              {title}
            </Text>
          </View>

          <View>
            <Text size="large" emphasis="bold">{renderPrice}</Text>
          </View>
        </BlockStack>
      </View>

      <View>
        <Grid columns={["100%"]} padding="">
          {/* <View>
        <Stepper
          label="Qunatity"
          value={quantity}
          min={1} // Limit quantity to minimum 1
          onChange={setQuantity}
          onIncrement={() => setQuantity(quantity + 1)}
          onDecrement={() =>
            quantity > 2 ? setQuantity(quantity - 1) : null
          } // Do nothing if quantity is 1 and decrementing
        />
      </View> */}

          <View>
            {variants.nodes.length > 1 ? (
              <Select
                label="Variant"
                options={variants.nodes.map((variante) => {
                  return { label: variante.title, value: variante.id };
                })}
                value={
                  variant === "" ||
                  !variants.nodes.includes(variant) ||
                  variants.nodes.length == 1
                    ? variants.nodes[0].id
                    : variant
                }
                onChange={(selected) => setVariant(selected)}
              />
            ) : ''}

          </View>


        </Grid>
                    <View padding={'small200'}>
   
            </View>
        {variants.nodes[0].sellingPlanAllocations.nodes.length > 0 && (

                                             <ChoiceList
                                             name="Subscribe to save 25%"
                                             value={isSub ? ['Subscribe'] : ['']}
                                             onChange={(value) => {
                                               setIsSub(!!value.includes('Subscribe'))
                                             }}
                                           >
                                             <BlockStack>
                                               <Choice id="Subscribe">
                                               Subscribe & save 25%
                                               </Choice>
                                             </BlockStack>
                                           </ChoiceList>
        )}
      </View>
    </BlockStack>
    <View>
      <View></View>
    </View>

    {/*
    {variants.nodes.length > 1 && 
      <Select
        label='Variant'
        options={variants.nodes.map((variante) => {
          
          return { label:variante.title , value: variante.id }
        })}
        value={(variant === '' || !variants.nodes.includes(variant) || variants.nodes.length == 1) ? variants.nodes[0].id : variant}
        onChange={(selected) => setVariant(selected)}
      />
    }
    <Stepper
      label='Qunatity'
      value={quantity}
      min={1} // Limit quantity to minimum 1
      onChange={setQuantity}
      onIncrement={() => setQuantity(quantity + 1)}
      onDecrement={() => quantity > 2 ? setQuantity(quantity - 1) : null} // Do nothing if quantity is 1 and decrementing
    /> */}
    {showError && (
      <Banner status="critical">
        There was an issue adding this product. Please try again.
      </Banner>
    )}
  </Grid>
</View>
<View>
  <View>
    <Grid columns={["100%"]}>
      <BlockStack spacing="base" padding="base">
        <Button
          kind="primary"
          loading={adding}
          accessibilityLabel={`Add ${title} to cart`}
          onPress={isSub ? submitToCarLinesSub  : submitToCarLines}
        >
          Add
        </Button>
      </BlockStack>
    </Grid>
  </View>

</View>
</BlockStack>
    </View>

  );
}
