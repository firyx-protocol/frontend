import { Box, BoxProps, HStack, Text } from "@chakra-ui/react";
import { Favicon } from "./Favicon";

interface Props extends BoxProps {
    size?: "sm" | "md" | "lg";
}

export const Logo = (props: Props) => {
    return (
        <Box
            width={props.size === "sm" ? "80px" : props.size === "md" ? "120px" : "160px"}
            aspectRatio={"4 / 1"}
            {...props}
        >
            <HStack width={"full"} height={"full"} alignItems={"center"} gap={"3"}>
                <Favicon size={props.size === "sm" ? "sm" : props.size === "md" ? "md" : "lg"} />
                <Text fontSize={"3xl"} fontWeight={"extrabold"}>
                    Firyx
                </Text>
            </HStack>
        </Box>
    );
}