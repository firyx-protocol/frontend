import { Container, VStack } from "@chakra-ui/react";
import { Header } from "./_components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Firyx - Decentralized Lending Protocol",
    description: "Firyx is a protocol for collateral-free lending designed to provide hybrid earnings safely.",
};

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <VStack height={"100vh"} width={"100vw"} gap={"6"} p={"4"}>
            <Header />
            <Container maxW={"8xl"} height={"full"} width={"full"}>
                {children}
            </Container>
        </VStack>
    );
}