"use client";

import { chakra, HStack, HtmlProps } from "@chakra-ui/react";
import { Logo } from "../../../components/brands/Logo";
import { AccountControl } from "@/app/app/_components/AccountControl";
import { LinkButton } from "@/components/ui/link-button";
import { MenuControl } from "./MenuControl";

type HeaderProps = HtmlProps;

export const Header = (props: HeaderProps) => {
    return (
        <chakra.header w={"full"} p={"2"} {...props} >
            <HStack justifyContent={"space-between"} direction={"row"} alignItems={"center"} width={"full"} height={"full"}>
                <LinkButton
                    variant={"plain"}
                    href={"/"}
                >
                    <Logo />
                </LinkButton>
                <HStack justify={"end"} gap={"4"}>
                    <MenuControl />
                    <AccountControl />
                </HStack>
            </HStack>
        </chakra.header>
    );
}