import { Box, BoxProps, chakra } from "@chakra-ui/react";

interface Props extends BoxProps {
    tokenAUri?: string;
    tokenBUri?: string;
    tokenASymbol?: string;
    tokenBSymbol?: string;
}

export const PairTokensIcon = ({ tokenAUri, tokenBUri, tokenASymbol, tokenBSymbol, ...rest }: Props) => {
    return (
        <Box position="relative" w="6" h="6" rounded="full" overflow="hidden" {...rest}>
            <Box w="46%" position="absolute" overflow="hidden" h="6">
                <Box w="6" h="6" display="flex" alignItems="center" justifyContent="center">
                    <chakra.img
                        src={tokenAUri || ""}
                        alt={tokenASymbol || ""}
                        objectFit="fill"
                        pointerEvents="none"
                    />
                </Box>
            </Box>
            <Box w="46%" right="0" position="absolute" overflow="hidden" h="6" zIndex={1}>
                <Box w="6" h="6" display="flex" alignItems="center" justifyContent="center">
                    <chakra.img
                        src={tokenBUri || ""}
                        alt={tokenBSymbol || ""}
                        objectFit="fill"
                        transform="translateX(-50%)"
                        pointerEvents="none"
                    />
                </Box>
            </Box>
        </Box>
    );
}