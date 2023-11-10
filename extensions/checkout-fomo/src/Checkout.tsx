import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  Text,
  Icon,
  InlineLayout,
  View,
  useSettings,
  BlockLayout,
  Style,

} from "@shopify/ui-extensions-react/checkout";
import { IconSource } from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/Icon/Icon";
import { Coordinate, PositionType } from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/View/View";
import { useEffect, useState } from "react";
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const {storage} = useApi();
  const {
    fomo_title,
    fomo_icon,
    hurry_text,
    end_text,
    fomo_time,
    mobile_only,
    desktop_only,
  } = useSettings<{ fomo_title?: string; fomo_icon?: string; hurry_text?: string; end_text?: string; fomo_time?: number; mobile_only?: boolean; desktop_only?: boolean;}>();
  
  // const {extensionPoint} = useExtensionApi();
  // const translate = useTranslate();

  // storage.write("checkout", 'wtffff')
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
  

  const fomoTitle: string = fomo_title ?? "Products are in high demand! Get yours now before they're gone.";
  const fomoIcon: IconSource = (fomo_icon ?? "clock") as IconSource;
  const hurryText: string = hurry_text ?? "Hurry! Your selected items are only reserved for <critical>{time}</critical>, complete your order now!";
  const endText: string = end_text ?? "Time's up! Please finish the checkout as the item is still in your cart.";
  const fomoTime: number = fomo_time ?? 12;

  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  
  useEffect(() => {

    storage.read("fomo").then(el => {
      if(el){
        setTotalSeconds(parseInt(el.toString()))
      }else{
        setTotalSeconds(parseInt((fomoTime * 60).toString()))
      }
      
    }).catch(err => {
      setTotalSeconds(parseInt((fomoTime * 60).toString()))
    })
  }, []);

  useEffect(() => {
    totalSeconds > 0 &&
      (setTimeout(() => (setTotalSeconds(totalSeconds - 1), storage.write("fomo", (totalSeconds - 1))), 1000));
  }, [totalSeconds]);

  const formatTime = (seconds: number) => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    seconds %= 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  function parseText(text: string) {
    return text.split(/<bold>|<\/bold>|<critical>|<\/critical>/g).map((part, index) => {
      if (text.includes(`<bold>${part}</bold>`)) {
        return <Text key={index} emphasis="bold" size="base">{part}</Text>;
      }
      if (text.includes(`<critical>${part}</critical>`)) {
        return <Text key={index} size="medium" emphasis="bold" appearance="critical">{part}</Text>;
      }
      return part;
    });
  }
  return (
    <View position={mobile_only ? MobileOnly : desktop_only ? DesktopOnly : undefined}>
      {totalSeconds > 0 ? (
        <View padding="small400"  border="base" borderWidth="base" borderRadius="small">

          
<BlockLayout spacing="none" padding="base" rows={[50, 'fill']}>
      <View >
      <InlineLayout spacing="base" columns={Style.default(["10%", "90%"])
                    .when({viewportInlineSize: {min: 'small'}}, ["6%", "94%"])
                    .when({viewportInlineSize: {min: 'medium'}}, ["6%", "94%"])
                    .when({viewportInlineSize: {min: 'large'}}, ["6%", "94%"])}>
            <View>
              <Icon size="fill" source={fomoIcon} appearance='critical' />
            </View>
            <View padding="none" blockAlignment={"center"}>
              <Text size="medium" emphasis="bold">
                {fomoTitle}
              </Text>
            </View>
          </InlineLayout>
      </View>
      <View>
      <View>
         <Text size="base">
         {parseText(hurryText.replace("{time}", formatTime(totalSeconds)))}
          </Text>
         </View>
      </View>
    </BlockLayout>

       
          
         
       

        </View>
      ) : (
        <View
        padding="small400"  border="base" borderWidth="base" borderRadius="small"
        >
          <Text appearance="subdued" size="base">
            {endText}
          </Text>
        </View>
      )}
    </View>
  );
}
