import React, { useEffect, useState } from "react";
import {
  render,
  Divider,
  Image,
  Banner,
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
} from "@shopify/checkout-ui-extensions-react";

render("Checkout::Dynamic::Render", () => <App />);

function App() {
  const { query, i18n } = useExtensionApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showError, setShowError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState("");
    // Preselect first variant
    useEffect(() => {
      if (products[0]) {
        const { variants } = products[0];
        if (variants && variants.nodes.length > 0) {
          setVariant(variants.nodes[0].id);
        }
      }
    }, [products]);
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
                  price {
                    amount
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
    variables: {first: 5, handle: "all-products-new"},
  },
)
    .then(({data}) => {
      const productsFromCollection = data.collectionByHandle.products.edges.map(edge => {
        const { node: productNode } = edge;
        return {
          ...productNode,
          images: { nodes: productNode.images.edges.map(edge => edge.node) },
          variants: { nodes: productNode.variants.edges.map(edge => edge.node) },
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
        <Heading level={2}>You might also like</Heading>
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
  const productsOnOffer = products.filter(
    (product) => {
      const isProductVariantInCart = product.variants.nodes.some(({id}) => cartLineProductVariantIds.includes(id));
      return !isProductVariantInCart;
    }
  );

  if (!productsOnOffer.length) {
    return null;
  }

  const { images, title, variants } = productsOnOffer[0];

  // // Preselect first variant
  // useEffect(() => {
  //   if (variants.nodes.length > 0) {
  //     setVariant(variants.nodes[0].id);
  //   }
  // }, [variants]);

  const renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);

  const imageUrl = images.nodes[0]?.url ?? "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  return (
    <BlockStack spacing="loose">
      <Divider />
      <Heading level={2}>You might also like</Heading>
      <BlockStack spacing="loose">
        <InlineLayout
          spacing="base"
          columns={[64, "fill", "auto"]}
          blockAlignment="center"
        >
          <Image
            border="base"
            borderWidth="base"
            borderRadius="loose"
            source={imageUrl}
            description={title}
            aspectRatio={1}
          />
          <BlockStack spacing="none">
            <Text size="medium" emphasis="strong">{title}</Text>
            <Text appearance="subdued">{renderPrice}</Text>
            {/* Show variant selector if variants count > 1 */}
            {variants.nodes.length > 1 && 
              <Select
                label='Variant'
                options={variants.nodes.map((variant) => ({ label:variant.title , value: variant.id }))}
                value={variant}
                onChange={(selected) => setVariant(selected)}
              />
            }
            <Stepper
              value={quantity}
              minValue={2} // Limit quantity to minimum 1
              onChange={setQuantity}
              onIncrement={() => setQuantity(quantity + 1)}
              onDecrement={() => quantity > 2 ? setQuantity(quantity - 1) : null} // Do nothing if quantity is 1 and decrementing
            />
          </BlockStack>
          <Button
            kind="secondary"
            loading={adding}
            accessibilityLabel={`Add ${title} to cart`}
            onPress={async () => {
              setAdding(true);
              const result = await applyCartLinesChange({
                type: "addCartLine",
                merchandiseId: variant,
                quantity: quantity,
              });
              setAdding(false);
              if (result.type === "error") {
                setShowError(true);
                console.error(result.message);
              }
            }}
          >
            Add
          </Button>
        </InlineLayout>
      </BlockStack>
      {showError && (
        <Banner status="critical">
          There was an issue adding this product. Please try again.
        </Banner>
      )}
    </BlockStack>
  );
}