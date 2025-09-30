"use client";

import { Grid, GridItem, HStack, HtmlProps, Link, TagLabel, TagRoot } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brands/Logo";
import { VERSION } from "@/constants";
import { motion } from "framer-motion";

const MotionHStack = motion.create(HStack);

type HeaderProps = HtmlProps;

export const Header = (props: HeaderProps) => {
    const [padding, setPadding] = useState(24);
    useEffect(() => {
        const handleScroll = () => {
            const delta = window.scrollY;
            setPadding(Math.max(16, 24 - delta));
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const items = [
        {
            label: "Docs",
            href: "https://docs.firyx.xyz",
        },
        {
            label: "Whitepaper",
            href: "https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FAYTxA1OvGXRxfbI4vn9p%2Fuploads%2FNSfoWuOq5r9LB7rhAK9f%2Ffiryx-protocol.pdf?alt=media&token=030a96af-ea2f-4ee7-b08c-c7b1388db50d",
        },
        {
            label: "Presentation",
            href: "https://pitch.firyx.xyz",
        }
    ];

    return (
        <MotionHStack
            position="fixed"
            w={"full"}
            top={0}
            zIndex={100}
            bg={"bg"}
            initial={{ paddingTop: padding }}
            animate={{ paddingTop: padding }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
                padding: 16,
                paddingTop: 24,
                transition: "background 0.3s, backdrop-filter 0.3s, box-shadow 0.3s, top 0.3s"
            }}
            {...props}
        >
            <Grid templateColumns="1fr auto 1fr" alignItems="center" w="full">
                <GridItem>
                    <Logo />
                </GridItem>

                <GridItem justifySelf="center">
                    <HStack gap="4">
                        {items.map((item, index) => (
                            <Link variant={"plain"} key={index} href={item.href} target="_blank" fontWeight={"medium"} color={"fg.subtle"} transition={"all 0.5s ease-in-out"} _hover={{ color: "fg", textDecor: "none" }} > {item.label} </Link>
                        ))}
                    </HStack>
                </GridItem>

                <GridItem justifySelf="end">
                    <TagRoot rounded="full" size="lg">
                        <TagLabel>v{VERSION}</TagLabel>
                    </TagRoot>
                </GridItem>
            </Grid>
        </MotionHStack>
    );
}