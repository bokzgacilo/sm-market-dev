import ProductCard from "@/components/custom/ProductCard";
import { supabase } from "@/helper/supabase";
import { Box, Image, SimpleGrid, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Slider from "react-slick";

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const {data} = await supabase
        .from('products')
        .select('id')
        .limit(8)
      setFeaturedProducts(data)
    }
    fetchFeaturedProducts();
  }, [])

  return (
    <Stack alignItems="center" >
      <Box w={{base: "100%", lg: "100%"}}>
        <Slider {...settings}>
          {
            [1,2,3,4,5].map((index) => 
               <Image 
                key={index} 
                src={`../images/home-images/home-images (${index}).webp`}
                height={{base: "300px", lg: "600px"}}
              />
            )
          }
        </Slider>
      </Box>
      <Stack bg="yellow.500" p={{base: 2, lg: 4}} width="100%">
        <SimpleGrid columns={{base: 2, lg: 4}} gap={{base: 2, lg: 4}} width="100%">
          {featuredProducts.map((item) => (
            <ProductCard pid={item.id} key={item} bg="#fff" rounded="md"/>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  )
}
