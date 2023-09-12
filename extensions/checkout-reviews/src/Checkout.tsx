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
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));
type GridItemSize = "auto" | "fill" | `${number}%` | `${number}fr` | number;
import { Style, extension } from "@shopify/ui-extensions/checkout";
// shop_medals: [{
//   "type": "ver_rev",
//   "tier": "diamond",
//   "tier_key": 500,
//   "medal_image_url": "//cdn.judge.me/assets/review_site/medals/ver_rev/diamond-d17e55051276e78434944a46bcf9e44e10fca778d66a60222afdd1e57bd718fc.svg",
//   "title": "Diamond Verified Reviews Shop",
//   "description": "Obtained at least 1000 reviews submitted by genuine customers with proof of purchase history",
//   "value": "12.8K",
//   "value_is_long": true
// },
// {
//   "type": "mon_rec",
//   "tier": "diamond",
//   "tier_key": 500,
//   "medal_image_url": "//cdn.judge.me/assets/review_site/medals/mon_rec/diamond-d71639018b32fc036d5dc8182bf6b6729eb9228153815f8bf232dcf66389110e.svg",
//   "title": "Diamond Monthly Record Shop",
//   "description": "Achieved an all-time record of 250 published verified reviews within one calendar month."
// },]
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
  const [reviewData, setReviewData] = useState<ReviewData>({
    all_reviews_rating: "",
    all_reviews_count: 0,
    shop_medals: [],
  });

  useEffect(() => {
    fetch("https://lifebooxt.vercel.app/api/judgememedals")
      .then((response) => response.json())
      .then((data: ReviewData) => {
        setReviewData(data);
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
  console.log(reviewData);
  return (
    <View>
      <BlockLayout
        rows={Style.default([100, "fill"]).when(
          { viewportInlineSize: { min: "small" } },
          [80, "fill"]
        )}
      >
        <View border="base" padding="base">
          <View padding="base" inlineAlignment="center">
            <InlineLayout
              spacing={"large500"}
              columns={Style.default(["auto"]).when(
                { viewportInlineSize: { min: "small" } },
                ["auto", "auto", "auto"]
              )}
            >
              <Grid
                spacing={Style.default("none").when(
                  { viewportInlineSize: { min: "small" } },
                  "small100"
                )}
                columns={Style.default(["auto"]).when(
                  { viewportInlineSize: { min: "small" } },
                  ["auto", "auto", "auto"]
                )}
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
                  <Text> {reviewData.all_reviews_count} reviews</Text>
                </View>
              </Grid>

              <Grid
                spacing={Style.default("none").when(
                  { viewportInlineSize: { min: "small" } },
                  "small100"
                )}
                columns={Style.default(["auto"]).when(
                  { viewportInlineSize: { min: "small" } },
                  ["auto", "auto", "auto"]
                )}
              >
                <Text>Verified by</Text>
                <View>
                  <Image source="https://judgeme-public-images.imgix.net/judgeme/logos/logo-judgeme.svg?auto=format" />
                </View>
              </Grid>
            </InlineLayout>
          </View>
        </View>
        <View border="base" padding="base">
          <View>
            <Grid columns={gridColumns} spacing="base" padding="base">
              {listImages.map((item) => (
                <View
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
              {/* <View>
                <Image source="ver_rev/diamond.svg?auto=format" />
              </View>
              <View>
                <Image source="https://judgeme-public-images.imgix.net/judgeme/medals-v2/mon_rec/diamond.svg?auto=format" />
              </View>
              <View>
                <Image source="https://judgeme-public-images.imgix.net/judgeme/medals-v2/tops_trend/250.svg?auto=format" />
              </View>
              <View>
                <Image source="https://judgeme-public-images.imgix.net/judgeme/medals-v2/tran/bronze.svg?auto=format" />
              </View>
              <View>
                <Image source="https://judgeme-public-images.imgix.net/judgeme/medals-v2/tops/1-percent.svg?auto=format" />
              </View> */}
            </Grid>
          </View>
        </View>
      </BlockLayout>
    </View>
  );
}
