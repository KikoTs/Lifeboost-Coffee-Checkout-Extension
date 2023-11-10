import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  Image,
  View,
  Grid,
  GridItem,
  Text,
  BlockStack,
  Divider,
  BlockLayout,
  InlineLayout,
  SkeletonImage,
  SkeletonText,
  TextBlock,
  useSettings,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";
import { Coordinate, PositionType } from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/View/View";

// purchase.checkout.cart-line-list.render-after
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));
type GridItemSize = "auto" | "fill" | `${number}%` | `${number}fr` | number;
import { Style } from "@shopify/ui-extensions/checkout";

interface ShopMedals {
  type: string;
  tier: string;
  tier_key: number;
  medal_image_url: string;
  title: string;
  description: string;
  value?: string;
  value_is_long?: boolean;
}

interface ReviewData {
  all_reviews_rating: string;
  all_reviews_count: number;
  shop_medals: Array<ShopMedals>;
}

function Extension() {
  const {
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

  const [reviewData, setReviewData] = useState<ReviewData>({
    all_reviews_rating: "",
    all_reviews_count: 0,
    shop_medals: [],
  });
  const [loading, setLoading] = useState(true);
  const [skeletonBlocks, setSkeletonBlocks] = useState([1,2,3,4,5]);

  useEffect(() => {
    fetch("https://lifebooxt.vercel.app/api/judgememedals")
      .then((response) => response.json())
      .then((data: ReviewData) => {
        setReviewData(data);
        setLoading(false);
      });
  }, []);
  const listImages = reviewData.shop_medals.map((item) => ({
    img: "https://judgeme-public-images.imgix.net/judgeme/medals-v2/" +
      item.type +
      "/" +
      item.tier.replace(" ", "-") +
      ".svg?auto=format",
    value: item.value
  }));
  const gridColumns: GridItemSize[] = listImages.map(
    () => `${100 / listImages.length}%` as GridItemSize
  );
  const gridColumnsSkeleton: GridItemSize[] = skeletonBlocks.map(
    () => `${100 / listImages.length}%` as GridItemSize
  );
  if (loading) {
    return (
<View position={mobile_only ? MobileOnly : desktop_only ? DesktopOnly : undefined}>
  <Divider></Divider>
  <BlockLayout rows={[100, "fill"]}>
    <View padding="base">
      <View padding="base" inlineAlignment="center">
        <InlineLayout spacing={"large500"} columns={["auto"]}>
          <Grid spacing={"none"} columns={["auto"]}>
            <View inlineAlignment="center" blockAlignment={"center"}>
            <SkeletonText />
            </View>
            <View inlineAlignment="center" blockAlignment={"center"}>
              <SkeletonText /> 
            </View>
          </Grid>
          <Grid spacing={"none"} columns={["auto"]}>
            <SkeletonText />
            <View>
            <SkeletonText />
            </View>
          </Grid>
        </InlineLayout>
      </View>
    </View>
    <View>
      <View>
        <Grid columns={gridColumnsSkeleton} spacing="base">
          {skeletonBlocks.map((item, index) => (
            <View key={index} position={{ type: "relative", }}>
              <SkeletonImage aspectRatio={1} />
              </View>
            ))}
            </Grid>
        </View>
        </View>
      </BlockLayout>
  </View>
    );
  }
  return (
    <View position={mobile_only ? MobileOnly : desktop_only ? DesktopOnly : undefined}>
      <Divider></Divider>
      <BlockLayout
        rows={[100, "fill"]}
      >
        <View padding="base">
          <View padding="base" inlineAlignment="center">
            <InlineLayout
              spacing={"large500"}
              columns={["auto"]}
            >
              <Grid
                spacing={"none"}
                columns={["auto"]}
              >
                <View inlineAlignment="center" blockAlignment={"center"}>
                  {" "}
                  <Image
                    source={
                      "https://lifebooxt.vercel.app/api/judgememedals.svg"
                    }
                  />
                </View>
                <View inlineAlignment="center" blockAlignment={"center"}>
                  <TextBlock inlineAlignment={'center'}> {reviewData.all_reviews_count} reviews</TextBlock>
                </View>
              </Grid>

              <Grid
                spacing={"none"}
                columns={["auto"]}
              >
                <TextBlock inlineAlignment={'center'} >Verified by</TextBlock>
                <View>
                  <Image source="https://judgeme-public-images.imgix.net/judgeme/logos/logo-judgeme.svg?auto=format" />
                </View>
              </Grid>
            </InlineLayout>
          </View>
        </View>

        <View>
          <View>
            <Grid columns={gridColumns} spacing="base">
              {listImages.map((item, index) => (
                <View
                key={index}
                  position={{
                    type: "relative",
                  }}
                >
                  <Image source={item.img} />
                  {item.value && (
                  <View
                    position={Style.default({
                      type: "absolute",
                      blockStart: "50%",
                      inlineStart: "50%",
                    })}
                    translate={Style.default({
                      block: "-20%",
                      inline: "-50%",
                    }).when(
                      { viewportInlineSize: { min: "small" } },
                      {
                        block: "0%",
                        inline: "-50%",
                      }
                    )}
                  >
                    <Text emphasis="bold" appearance="info">
                    {item.value}
                    </Text>
                  </View>
                  )}
                </View>
              ))}
            </Grid>
          </View>
        </View>
      </BlockLayout>
    </View>
  );
}
