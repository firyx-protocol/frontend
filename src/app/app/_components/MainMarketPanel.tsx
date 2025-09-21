import Glass from "@/components/utils/glass/glass";
import { Box, BoxProps, Heading, HStack, VStack, Text } from "@chakra-ui/react";

type Props = BoxProps;

export const MainMarketPanel = (props: Props) => {
    const TVLCard = () => {
        return (
            <Glass brightness={0} rounded={"full"}>
                <Box py={"1"} px={"3"}>
                    <Text fontSize={"2xl"} color={"primary.contrast"}>$125,124</Text>
                </Box>
            </Glass>
        )
    }

    const MetricField = (props: { label: string, value: string }) => {
        return (
            <VStack alignItems={"start"} gap={"1"}>
                <Text fontSize={"sm"} color={"primary.subtle"}>{props.label}</Text>
                <Text fontSize={"md"} fontWeight={"medium"} color={"primary.contrast"}>{props.value}</Text>
            </VStack>
        )
    }

    return (
        <Box
            w={"full"} h={"fit"}
            borderRadius={"4xl"}
            bg={"radial-gradient(118.39% 100% at 50% 0%, rgba(114, 242, 219, 0.25) 0%, #8573FD 58.98%, #000 100%)"}
            shadow={"2xl"}
            {...props}
        >
            <VStack w={"full"} h={"full"} p={"6"} justify={"center"} align={"start"} gap={"6"}>
                <Heading as={"h1"} fontSize={"4xl"} fontWeight={"extrabold"} color={"primary.contrast"}>Main Market</Heading>
                <HStack w={"full"} justify={"space-between"} alignItems={"center"}>
                    <TVLCard />
                    <HStack w={"full"} justify={"end"} gap={"6"}>
                        <MetricField label="Deposited" value="$1,567" />
                        <MetricField label="Borrowed" value="$5,890" />
                        <MetricField label="24h Change" value="+2.5%" />
                    </HStack>
                </HStack>
            </VStack>
        </Box>
    )
}