import { VStack } from "@chakra-ui/react";
import { HeroSection } from "./_sections/Hero";

export default function Home() {
  return (
    <VStack height={"full"} width={"full"} justifyContent={"center"} alignItems={"top"}>
      <HeroSection />
    </VStack>
  );
}
