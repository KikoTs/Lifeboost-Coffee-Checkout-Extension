// Interfaces

interface SellingPlan {
  id: string;
  name: string;
}

interface Merchandise {
  id: string;
  title: string;
  product: {
    id: string;
  };
  sellingPlan?: {
    id: string;
  };
}

interface ProductVariantNode {
  id: string;
  title: string;
  price: {
    amount: string;
  };
  sellingPlanAllocations: {
    nodes: Array<{ sellingPlan: SellingPlan }>;
  };
}

interface Product {
  id: string;
  title: string;
  variants: {
    edges: Array<{ node: ProductVariantNode }>;
  };
}

interface QueryResponse {
  product: Product;
}



import {
  reactExtension,
  Button,
  useTarget,
  Link,
  View,
  BlockStack,
  Select,
  useApi,
  useApplyCartLinesChange,
  useSettings,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />
);

function Extension() {
  const { enable_remove, enable_subscription } = useSettings();
  const enableRemove: boolean = typeof enable_remove === 'boolean' ? enable_remove : true;
  const enableSubscription: boolean = typeof enable_subscription === 'boolean' ? enable_subscription : true;

  return (
    <View blockAlignment="start">
      {enableSubscription && (
        <View>
          <SubscribeAndSave />
        </View>
      )}
      {enableRemove && (
        <View>
          <Remove />
        </View>
      )}
    </View>
  );
}

function SubscribeAndSave() {
  const { subscription_text } = useSettings();
  const subscriptionText: string = subscription_text?.toString() ?? "Subscribe & Save 25%";
  const { query } = useApi();
  const { merchandise, id, quantity, attributes } = useTarget();
  const applyCartLinesChange = useApplyCartLinesChange();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [sellPlanOptions, setSellPlanOptions] = useState<SellingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const fetchProductSellingPlans = async () => {
    try {
      setLoading(true);
      const { data } = await query<QueryResponse>(
        `
        query getProductById($id: ID!) {
          product(id: $id) {
            id
            title
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                  }
                  sellingPlanAllocations(first: 100) {
                    nodes {
                      sellingPlan {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        { variables: { id: merchandise.product.id } }
      );

      let products: ProductVariantNode[] = [];
      if (data && data?.product) {
        products = data.product.variants.edges.map((edge) => ({
          ...edge.node,
          sellingPlans: edge.node.sellingPlanAllocations.nodes.map(
            (plan) => plan.sellingPlan.id
          ),
        }));
      }

      const product = products.find((prod) => prod.id === merchandise.id);
      const sellingPlans =
        product?.sellingPlanAllocations.nodes.map((plan) => ({
          id: plan.sellingPlan.id,
          name: plan.sellingPlan.name,
        })) || [];
      setSellPlanOptions(sellingPlans);
    } catch (error) {
      console.error(error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductSellingPlans();
  }, [merchandise.id]);

  if (sellPlanOptions.length && merchandise.sellingPlan) {
    return (
      <Select
        label="Delivery"
        value={
          sellPlanOptions.find(
            (sellPlan) => sellPlan.id == merchandise?.sellingPlan?.id
          )?.id
        }
        onChange={async (selected) => {
          if (selected.toLowerCase() === "unsubscribe") {
            setIsSubscribed(false);
            const result = await applyCartLinesChange({
              type: "updateCartLine",
              id: id,
              merchandiseId: merchandise.id,
              quantity: quantity,
              sellingPlanId: null,
              attributes: attributes,
            });

            if (result.type === "error") {
              setShowError(true);
              console.error(result.message);
            }
          } else {
            const result = await applyCartLinesChange({
              type: "updateCartLine",
              id: id,
              merchandiseId: merchandise.id,
              quantity: quantity,
              sellingPlanId: selected,
              attributes: attributes,
            });

            if (result.type === "error") {
              setShowError(true);
              console.error(result.message);
            }
          }
        }}
        options={[
          ...sellPlanOptions.map((sellPlan) => ({
            value: sellPlan.id,
            label: sellPlan.name,
          })),
          { value: "Unsubscribe", label: "Unsubscribe" },
        ]}
      />
    );
  }

  if (sellPlanOptions.length && !merchandise.sellingPlan) {
    return (
      <Link
        appearance="monochrome"
        accessibilityLabel={`Subscribe to ${merchandise.title} from checkout and save 25%`}
        onPress={async () => {
          setIsSubscribed(true);
          const result = await applyCartLinesChange({
            type: "updateCartLine",
            id: id,
            merchandiseId: merchandise.id,
            quantity: quantity,
            sellingPlanId: sellPlanOptions[0].id,
            attributes: attributes,
          });
          setIsSubscribed(false);
          if (result.type === "error") {
            setShowError(true);
            console.error(result.message);
          }
        }}
      >
        {subscriptionText}
      </Link>
    );
  }
  return null;
}
function Remove() {
  const { remove_text } = useSettings();
  const removeText: string = remove_text?.toString() ?? "Remove";
  const applyCartLinesChange = useApplyCartLinesChange();
  const [removing, setRemoving] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const {
    merchandise: { title },
    id,
    quantity,
    attributes,
  } = useTarget();
  console.log(attributes);
  // if originalCartLines has id of current line item, dont show remove button else show remove button use includes to check
  if (
    attributes.find(
      (attribute) => attribute.key === "_placement" && attribute.value === "Under Reviews in Right Column"
    )
  ) {
    return (
      <Link
        appearance="monochrome"
        accessibilityLabel={`Remove ${title} from cart`}
        onPress={async () => {
          setRemoving(true);
          const result = await applyCartLinesChange({
            type: "removeCartLine",
            id: id,
            quantity: quantity,
          });
          setRemoving(false);
          if (result.type === "error") {
            setShowError(true);
            console.error(result.message);
          }
        }}
      >
        {removeText}
      </Link>
    );
  } else {
    return null;
  }
}
