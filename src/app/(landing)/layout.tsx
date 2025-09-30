import { Container, VStack } from "@chakra-ui/react";
import { Header } from "./_components/Header";

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