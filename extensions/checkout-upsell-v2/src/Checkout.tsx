interface ImageNode {
  url: string;
}

interface ImageEdge {
  node: ImageNode;
}

interface Images {
  nodes: any;
  edges: ImageEdge[];
}

interface SellingPlan {
  priceAdjustments: any;
  id: string;
  name: string;
  discount?: number;
}

interface SellingPlanNode {
  sellingPlan: SellingPlan;
}

interface SellingPlanAllocations {
  nodes: SellingPlanNode[];
}

interface Price {
  amount: string;
}

interface VariantNode {
  id: string;
  title: string;
  price: Price;
  compareAtPrice: Price;
  image: ImageNode;
  sellingPlanAllocations: SellingPlanAllocations;
  availableForSale: boolean;
}

interface VariantEdge {
  node: VariantNode;
}

interface Variants {
  edges: VariantEdge[];
  nodes: VariantNode[];
}

interface ProductNode {
  id: string;
  title: string;
  images: Images;
  variants: Variants;
}

interface ProductEdge {
  node: ProductNode;
}

interface Products {
  edges: ProductEdge[];
}

interface CollectionByHandle {
  products: Products;
}

interface Data {
  collectionByHandle: CollectionByHandle;
}

interface QueryResponse {
  data: Data;
}

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
  Select,
  Stepper,
  Grid,
  InlineSpacer,
  InlineStack,
  Choice,
  ChoiceList,
  View,
  useSettings,
  Style,
  GridItemSize,
} from "@shopify/ui-extensions-react/checkout";
import { Coordinate, PositionType } from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/View/View";

import { useEffect, useState } from "react";
export default reactExtension("purchase.checkout.block.render", () => <App />);

function App() {
  const {
    title_text,
    collection_handle,
    enable_subscription,
    subscription_text,
    add_to_checkout_text,
    mobile_only,
    desktop_only,
  } = useSettings();

  const DesktopOnly = Style.default({
    type: "absolute",
    blockStart: "1000000%",
    inlineStart: "1000000%",
  }).when({viewportInlineSize: {min: 'small'}}, { 
    type: "relative" as PositionType,
    blockStart: undefined,
    inlineStart: undefined,
  })
  const MobileOnly = Style.default({
    type: "relative" as PositionType,
    blockStart: undefined,
    inlineStart: undefined,
  }).when({viewportInlineSize: {min: 'small'}}, {
    type: "absolute" as PositionType,
    blockStart: "1000000%" as unknown as Coordinate,
    inlineStart: "1000000%" as unknown as Coordinate,
  })

  const { query, i18n, analytics, buyerIdentity} = useApi();


  const titleText: string = title_text?.toString() ?? "You Might Also Like";
  const collectionHandle: string =
    collection_handle?.toString() ?? "BEST_SELLING";
  const enableSubscription: boolean = !!enable_subscription ?? false;
  const subscriptionText: string =
    subscription_text?.toString() ?? "Subscribe & save 25%";
  const addToCheckoutText: string = add_to_checkout_text?.toString() ?? "Add";

  const applyCartLinesChange = useApplyCartLinesChange();
  const [products, setProducts] = useState<ProductNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);
  const [addingSub, setAddingSub] = useState<boolean>(false);
  const [isSub, setIsSub] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [sellingPlan, setSellingPlan] = useState<string>("");
  const [variant, setVariant] = useState<string>("");
  useEffect(() => {
    setLoading(true);
    query<QueryResponse>(
      `query ($first: Int!, $handle: String!) {
    collectionByHandle(handle: $handle) {
      products(first: $first, sortKey: ${collectionHandle}) {
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
                  availableForSale
                  compareAtPrice{
                      amount
                  }
                  price{
                      amount
                  }
                  image{
                    url
                  }
                  sellingPlanAllocations(first: 100){
                      nodes{
                          sellingPlan{
                              id
                              name
                              priceAdjustments {
                                adjustmentValue {
                                  ... on SellingPlanFixedAmountPriceAdjustment {
                                    adjustmentAmount {
                                      amount
                                      currencyCode
                                    }
                                  }
                                  ... on SellingPlanFixedPriceAdjustment {
                                    price {
                                      amount
                                      currencyCode
                                    }
                                  }
                                  ... on SellingPlanPercentagePriceAdjustment {
                                    adjustmentPercentage
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
        }
      }
    }
  }`,
      {
        variables: { first: 5, handle: "all-products-new" },
      }

      
    )
      .then((response: any) => {
        const productsFromCollection =
          response.data?.collectionByHandle.products.edges.map((edge: any) => {
            const { node: productNode } = edge;
            return {
              ...productNode,
              images: {
                nodes: productNode.images.edges.map((edge: any) => edge.node),
              },
              variants: {
                nodes: productNode.variants.edges.map((edge: any) => edge.node),
              },
            };
          });
        setProducts(productsFromCollection || []);
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
      <View position={mobile_only ? MobileOnly : desktop_only ? DesktopOnly : undefined}>
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
      </View>

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

  const { images, title, variants: rawVariants } = productsOnOffer[0];
  const variants = {nodes: rawVariants.nodes.filter((variant) => variant.availableForSale)}
  const submitToCarLines = async () => {
    // console.log("buyerIdentity", )
    setAdding(true);
    const variantToAdd =
      !variants.nodes.some((node) => node.id === variant) ||
      variants.nodes.length == 1
        ? variants.nodes[0].id
        : variant;
    const result = await applyCartLinesChange({
      type: "addCartLine",
      merchandiseId: variantToAdd,
      quantity: quantity,
      attributes: [
        {
          key: "_placement",
          value: "Under Reviews in Right Column",
        },
        {
          key: "_upsell_type",
          value: "Regular Upsell",
        },
      ],
    });

    // In checkout, you can publish custom events from your checkout extensions.
    /**
     * event_name
     * type: string
     * description: The name of a single event or a group of events.
     */
    const event_name = "add_upsell"
    /**
     * event_data
     * type: Object
     * description: An object that contains metadata about the event.
     */
    const event_data = {
      type: "addCartLine",
      id: variantToAdd,
      quantity: quantity,
      value: variants.nodes.find((node) => node.id === variantToAdd)?.price?.amount ?? variants.nodes[0].price.amount,
      title: variants.nodes.find((node) => node.id === variantToAdd)?.title ?? variants.nodes[0].title,
      sellingPlan: null,
      attributes: [
        {
          key: "_placement",
          value: "Under Reviews in Right Column",
        },
        {
          key: "_upsell_type",
          value: "Regular Upsell",
        },
      ],
      customer: buyerIdentity?.customer?.current ?? null,
    }
    /**
     * @param: event_name
     * @param: event_data
     *
     */
    // const Product = variants.nodes.find((node) => node.id === variantToAdd)
    // console.log(event_name, event_data)
    // console.log("Product", Product)
    analytics.publish(event_name, event_data);

    setAdding(false);
    if (result.type === "error") {
      setShowError(true);
      console.error(result.message);
    }
  };

  const submitToCarLinesSub = async () => {
    // console.log("buyerIdentity", buyerIdentity?.customer)
    setAddingSub(true);
    const variantToAdd =
      !variants.nodes.some((node) => node.id === variant) ||
      variants.nodes.length == 1
        ? variants.nodes[0].id
        : variant;
    const SelectedVariant = variants.nodes.find(
      (myVariant) => myVariant.id === variantToAdd
    );
    console.log("heyy", SelectedVariant);
    const selectedSellingPlan = sellingPlan
      ? sellingPlan
      : SelectedVariant?.sellingPlanAllocations.nodes[0].sellingPlan.id;
    const result = await applyCartLinesChange({
      type: "addCartLine",
      merchandiseId: variantToAdd,
      quantity: quantity,
      attributes: [
        {
          key: "_placement",
          value: "Under Reviews in Right Column",
        },
        {
          key: "_upsell_type",
          value: "Subscription Upsell",
        },
      ],
      sellingPlanId:
        selectedSellingPlan ??
        undefined!,
    });


    // In checkout, you can publish custom events from your checkout extensions.
    /**
     * event_name
     * type: string
     * description: The name of a single event or a group of events.
     */
    const event_name = "add_upsell"
    /**
     * event_data
     * type: Object
     * description: An object that contains metadata about the event.
     */
    const event_data = {
      type: "addCartLine",
      id: variantToAdd,
      quantity: quantity,
      value: variants.nodes.find((node) => node.id === variantToAdd)?.price?.amount ?? variants.nodes[0].price.amount,
      title: variants.nodes.find((node) => node.id === variantToAdd)?.title ?? variants.nodes[0].title,
      sellingPlan: sellingPlan ?? SelectedVariant?.sellingPlanAllocations.nodes[0].sellingPlan ?? null,
      attributes: [
        {
          key: "_placement",
          value: "Under Reviews in Right Column",
        },
        {
          key: "_upsell_type",
          value: "Subscription Upsell",
        },
      ],
      customer: buyerIdentity?.customer?.current ?? null,
    } // add here product whole object
    /**
     * @param: event_name
     * @param: event_data
     *
     */
    // const Product = variants.nodes.find((node) => node.id === variantToAdd)
    // console.log(event_name, event_data)
    analytics.publish(event_name, event_data);


    setAddingSub(false);
    if (result.type === "error") {
      setShowError(true);
      console.error(result.message);
    }
  };

  const renderPrice = parseFloat(
    variants.nodes.find((node) => node.id === variant)?.price?.amount ??
      variants.nodes[0].price.amount
  );
  // if variants.nodes.find((node) => node.id === variant)?.compareAtPrice?.amount i18n.formatCurrency(parseFloat())
  // else if variants.nodes[0].compareAtPrice.amount  i18n.formatCurrency(parseFloat())
  // else return false
  const renderDiscount =
    variants.nodes.find((node) => node.id === variant)?.compareAtPrice
      ?.amount || variants?.nodes[0]?.compareAtPrice?.amount
      ? parseFloat(
          variants.nodes.find((node) => node.id === variant)?.compareAtPrice
            ?.amount ?? variants.nodes[0].compareAtPrice.amount
        )
      : false;

  // calculate % of the discount renderDiscount and renderPrice
  // const discount = Math.round()
  const sellingPlans =
    variants.nodes
      .find((node) => node.id === variant)
      ?.sellingPlanAllocations.nodes.map((plan) => ({
        id: plan.sellingPlan.id,
        name: plan.sellingPlan.name,
        discount:
          plan.sellingPlan?.priceAdjustments[0]?.adjustmentValue
            .adjustmentPercentage ?? 0,
      })) ??
    variants.nodes[0]?.sellingPlanAllocations.nodes.map((plan) => ({
      id: plan.sellingPlan.id,
      name: plan.sellingPlan.name,
      discount:
        plan.sellingPlan?.priceAdjustments[0]?.adjustmentValue
          .adjustmentPercentage ?? 0,
    })) ??
    false;

  const activeSellingPlan =
    sellingPlans.find((el) => el.id === sellingPlan) ?? sellingPlans[0] ?? null;

  // discount percentage sellingPlans.discount from price RenderPrice

  function calculateSalePrice(
    originalPrice: number,
    discountPercentage: number
  ) {
    var discountAmount = (originalPrice * discountPercentage) / 100;
    var salePrice = originalPrice - discountAmount;
    return salePrice;
  }

  const imageUrl =
    variants.nodes.find((node) => node.id === variant)?.image?.url ??
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";
  // images.nodes[0]?.url ??
  // "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  type GridItemSizeArray = GridItemSize[];
  const columnsValue: GridItemSizeArray =
    variants.nodes.length > 1 ? ["35%", "70%"] : ["25%", "75%"];

  const paddingValue = variants.nodes.length > 1 ? "small100" : "none";
  return (
    <View position={mobile_only ? MobileOnly : desktop_only ? DesktopOnly : undefined}>
          <BlockStack spacing="loose">
      <Divider />
      <Heading level={2}>{titleText}</Heading>
      <BlockStack spacing="loose">
        <InlineLayout
          spacing="base"
          columns={[64, "fill", "auto"]}
          blockAlignment="center"
        >
          <View
            border="base"
            borderWidth="base"
            borderRadius="loose"
            padding={"extraTight"}
          >
            <Image borderRadius="loose" source={imageUrl} aspectRatio={1} />
          </View>

          <BlockStack spacing="none">
            <Text size="base" emphasis="bold">
              {title}
            </Text>
            {renderDiscount ? (
              <InlineLayout columns={["auto", "auto"]} spacing={"small100"}>
                <Text accessibilityRole="deletion">
                  {i18n.formatCurrency(renderDiscount)}
                </Text>{" "}
                <Text appearance="subdued">
                  <Text>
                    {i18n.formatCurrency(
                      isSub && activeSellingPlan?.discount
                        ? calculateSalePrice(
                            renderPrice,
                            parseInt(activeSellingPlan?.discount)
                          )
                        : renderPrice
                    )}
                  </Text>
                </Text>{" "}
                {/* <Text appearance="subdued">Save {discount}%</Text>{" "} */}
              </InlineLayout>
            ) : (
              <Text appearance="subdued">
                <Text>
                  {i18n.formatCurrency(
                    isSub && activeSellingPlan?.discount
                      ? calculateSalePrice(
                          renderPrice,
                          parseInt(activeSellingPlan?.discount)
                        )
                      : renderPrice
                  )}
                </Text>
              </Text>
            )}

            {enableSubscription &&
              variants.nodes[0].sellingPlanAllocations.nodes.length > 0 && (
                <View>
                  <ChoiceList
                    name="Subscribe to save 25%"
                    value={isSub ? ["Subscribe"] : [""]}
                    onChange={(value) => {
                      setIsSub(!!value.includes("Subscribe"));
                    }}
                  >
                    <BlockStack>
                      <Choice id="Subscribe">{subscriptionText}</Choice>
                    </BlockStack>
                  </ChoiceList>
                </View>
              )}
          </BlockStack>
          <Button
            kind="primary"
            loading={adding}
            accessibilityLabel={`Add ${title} to cart`}
            onPress={isSub ? submitToCarLinesSub : submitToCarLines}
          >
            {addToCheckoutText}
          </Button>
        </InlineLayout>
        {variants.nodes.length > 1 ? (
        <View>
            <Select
              label="Variant / Quantity"
              options={variants.nodes.map((variante) => {
                return { label: variante.title, value: variante.id };
              })}
              value={
                !variants.nodes.some((node) => node.id === variant) ||
                variants.nodes.length == 1
                  ? variants.nodes[0].id
                  : variant
              }
              onChange={(selected) => setVariant(selected)}
            />
        </View>) : (
          ""
        )}
        {isSub && sellingPlans && (
        <View>
            <Select
              label="Delivery"
              value={
                sellingPlans.find((el) => el.id === sellingPlan)?.id ??
                sellingPlans[0].id
              }
              onChange={(target) => {
                setSellingPlan(target);
              }}
              options={[
                ...sellingPlans.map((sellPlan) => ({
                  value: sellPlan.id,
                  label: sellPlan.name,
                })),
              ]}
            />
        </View>)}
      </BlockStack>
      {showError && <ErrorBanner />}
    </BlockStack>
    </View>
  );
}

function ErrorBanner() {
  return (
    <Banner status="critical">
      There was an issue adding this product. Please try again.
    </Banner>
  );
}
