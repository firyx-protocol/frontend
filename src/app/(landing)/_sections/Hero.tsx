"use client";

import { LinkButton } from "@/components/ui/link-button";
import { ROOT_DOMAIN } from "@/constants";
import { Button, Heading, HStack, Icon, Image, Span, Stack, StackProps, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaBoltLightning } from "react-icons/fa6";

type Props = StackProps;

export const HeroSection = (props: Props) => {
    return (
        <Stack
            w={"full"}
            flexDir={["column", "row"]}
            alignItems={"center"}
            justifyContent={"center"}
            gap={"6"}
            {...props}
        >
            <VStack
                align={["center", "flex-start"]}
                mt={["0", "16", "64"]}
                h={"full"}
                gap={"6"}
                flex={1}
            >
                <HStack gap={"2"}>
                    <Icon as={FaBoltLightning} color={"secondary.solid"} />
                    <Text fontWeight={"semibold"} color={"secondary.emphasized"}>NON-COLLATERAL</Text>
                </HStack>
                <Heading as={"h1"} fontSize={["3xl", "4xl", "5xl", "6xl"]} fontWeight={"extrabold"} textAlign={["center", "left"]} lineHeight={"1.1"}>
                    <Span color={"fg.subtle"}>Decentralized</Span>
                    <br />
                    Lending Protocol
                </Heading>
                <Text fontSize={["sm", "sm", "md", "lg"]} color={"fg.muted"} textAlign={["center", "left"]} maxW={["full", "md", "lg"]}>
                    Pioneer of <b>trustless non-collateral lending</b> &ndash; unlock capital with LP shares, ensuring safe returns for borrowers and lenders.
                </Text>
                <HStack>
                    <LinkButton
                        href={`https://app.${ROOT_DOMAIN}`}
                        transition={"all 0.5s linear"}
                        _hover={{ colorPalette: "primary" }}
                    >
                        Launch App
                    </LinkButton>
                    <LinkButton
                        href={`https://docs.${ROOT_DOMAIN}`}
                        variant={"ghost"}
                        color={"fg.subtle"}
                        target="_blank"
                    >
                        Read Docs
                        <Icon as={FaArrowRight} />
                    </LinkButton>
                </HStack>
            </VStack>
            <Image
                src={"assets/PosterBackground_1.png"}
                alt={"Hero Image"}
                flex={1}
                w={"full"}
                h={"full"}
                maxW={["full", "md", "lg"]}
                alignSelf={["center", "flex-end"]}
                mt={["8", "0"]}
                draggable={false}
                userSelect={"none"}
            />
        </Stack>
    )
}