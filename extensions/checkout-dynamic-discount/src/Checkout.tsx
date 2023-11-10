import {
  Banner,
  useApi,
  reactExtension,
  View,
  Button,
  TextField,
  Grid,
  useApplyDiscountCodeChange,
  Text,
  Tag,
  Icon,
  Style,
  useSettings,
} from "@shopify/ui-extensions-react/checkout";
import { Coordinate, PositionType } from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/View/View";
import { SetStateAction, useState } from "react";
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

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

  const { discountCodes } = useApi();
  const applyDiscountCode = useApplyDiscountCodeChange();
  const [discount, setDiscount] = useState("");
  const [loading, setLoading] = useState(false);

  const [warningText, setWarningText] = useState<string | false>(false);
  const [errorText, setErrorText] = useState<string | false>(false);


  const handleTextFieldChange = (value: SetStateAction<string>) => {
    setDiscount(value);
  };
  const removeDiscount = async (discountCode: string) => {
    setLoading(true);
    setErrorText(false);
    setWarningText(false);
    const result = await applyDiscountCode({
      type: "removeDiscountCode",
      code: discountCode,
    });

    console.log("Discount Code Change result", result);
    setDiscount("");
    setLoading(false);
  };


  return (
    <View position={mobile_only ? MobileOnly : desktop_only ? DesktopOnly : undefined}>
      <Grid columns={["80%", "auto"]} spacing="loose">
        <TextField
          error={errorText ? errorText?.toString() : ''}
          value={discount}
          onInput={handleTextFieldChange}
          label="Gift card or discount code"
        />
        <View blockAlignment={"center"}>
          <Button
            kind="primary"
            loading={loading}
            disabled={!discount}
            onPress={async () => {
              setLoading(true);
              setErrorText(false);
              setWarningText(false);
              const result = await applyDiscountCode({
                type: "addDiscountCode",
                code: discount,
              });

              if (result.type === "error") {
                if (result.message.includes("mapped to neither")) {
                  setErrorText("Enter a valid discount code or gift card");
                } else {
                  setWarningText(result?.message);
                }
              } else if (result.type === "success") {
              } else {
                console.log("Discount Code Change result", result);
              }
              setDiscount("");
              setLoading(false);
            }}
          >
            Apply
          </Button>
        </View>
      </Grid>
      <View padding={'small100'} />
      {/* Make first word in the warning bold and upper case */}
      {!!warningText && <Banner status="warning" onDismiss={() => setWarningText(false)} >{warningText.split(' ').map((word, index) => index === 0 ? <Text size='base' emphasis='bold'>{word.toUpperCase()} </Text> : word + ' ')}</Banner>}

      {discountCodes?.current.map((discount, index) => (
        <Tag key={`${index}`} id={`${index}`} icon="discount">
          {/* @ts-ignore IT DOES WORK THIS WAY STUPID TS*/}
          <Grid columns={["95%", "auto"]} spacing="loose">
            {discount.code.toUpperCase()}

            <Button kind="plain" onPress={() => removeDiscount(discount.code)}>
              <Icon source="close" />
            </Button>
          </Grid>
        </Tag>
      ))}
    </View>
  );
}
