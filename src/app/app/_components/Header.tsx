"use client";

import { Button, chakra, HStack, HtmlProps } from "@chakra-ui/react";
import { Logo } from "../../../components/brands/Logo";
import { AccountControl } from "@/app/app/_components/AccountControl";
import { MenuControl } from "./MenuControl";
import { useRouter } from "next/navigation";

type HeaderProps = HtmlProps;

export const Header = (props: HeaderProps) => {
    const router = useRouter();

    return (
        <chakra.header w={"full"} p={"2"} {...props} >
            <HStack justifyContent={"space-between"} direction={"row"} alignItems={"center"} width={"full"} height={"full"}>
                <Button
                    variant={"plain"}
                    onClick={() => router.push("/")}
                >
                    <Logo />
                </Button>
                <HStack justify={"end"} gap={"4"}>
                    <MenuControl />
                    <AccountControl />
                </HStack>
            </HStack>
        </chakra.header>
    );
}