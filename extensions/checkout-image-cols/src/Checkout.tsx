import {
  reactExtension,
  Image,
  Grid,
  useSettings,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

type GridItemSize = 'auto' | 'fill' | `${number}%` | `${number}fr` | number;

function Extension() {
  const { list_images } = useSettings();
  const listImages = (typeof list_images === 'string' ? list_images.trim().split(",") : [
    "https://lifeboostcoffee.com/cdn/shop/files/bm-icon-1_1cefa441-5f03-48fe-9572-42c2f3617e10.png",
    "https://lifeboostcoffee.com/cdn/shop/files/bm-icon-6_9e4fbfb1-5638-45ad-b07f-8f701c7b6a31.png?v=1674068780",
    "https://lifeboostcoffee.com/cdn/shop/files/bm-icon-3_44cc6cba-f3c9-47c9-8f17-630a557210e2.png?v=1674068780",
    "https://lifeboostcoffee.com/cdn/shop/files/bm-icon-4_3e9bab57-0c68-470b-81b0-b6746246b721.png?v=1674068781",
  ]);
  //dynamically count the columens in the grid from 100% using the following structure columns={['25%', '25%', '25%', '25%']}
  // 100 / listImages.length = 25 make is string and append '%' at the end
  const gridColumns: GridItemSize[] = listImages.map(() => `${100 / listImages.length}%` as GridItemSize);
  return (
    <Grid columns={gridColumns} spacing="loose">
      {listImages.map((image, index) => (
        <Image key={index} source={image} />
      ))}
    </Grid>
  );
}
