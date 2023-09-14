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
} from "@shopify/ui-extensions-react/checkout";
import { SetStateAction, useState } from "react";
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
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
    <View>
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
