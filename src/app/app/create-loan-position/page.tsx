import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { CreateLoanPositionForm } from "./_components/CreateLoanPositionForm";

export default function Page() {
    return (
        <VStack width={"full"} height={"full"} gap={"6"} align={"start"} overflow={"auto"}>
            <Box>
                <Heading as={"h1"} size={"4xl"} fontWeight={"extrabold"}>Create Loan Position</Heading>
                <Text fontSize={"md"} color={"fg.subtle"}>Open a position integrated with a liquidity pool lending protocol.</Text>
            </Box>
            <CreateLoanPositionForm />
        </VStack>
    )
}