import { Box, BoxProps, chakra, TextProps } from "@chakra-ui/react";

interface Props extends BoxProps {
    tokenAUri?: string;
    tokenBUri?: string;
    tokenASymbol?: string;
    tokenBSymbol?: string;
}

export const PairTokensIcon = ({ tokenAUri, tokenBUri, tokenASymbol, tokenBSymbol, ...rest }: Props) => {
    const size = rest.w || rest.width || "6";
    const height = rest.h || rest.height || "6";
    
    return (
        <Box position="relative" w={size} h={height} rounded="full" overflow="hidden" {...rest}>
            <Box w="46%" position="absolute" overflow="hidden" h={height}>
                <Box w={size} h={height} display="flex" alignItems="center" justifyContent="center">
                    {tokenAUri ? (
                        <chakra.img
                            src={tokenAUri}
                            alt={tokenASymbol || ""}
                            objectFit="fill"
                            pointerEvents="none"
                        />
                    ) : (
                        <Box
                            w={size}
                            h={height}
                            bg="gray.200"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            fontWeight="bold"
                            color="gray.500"
                        >
                            {tokenASymbol?.charAt(0) || "?"}
                        </Box>
                    )}
                </Box>
            </Box>
            <Box w="46%" right="0" position="absolute" overflow="hidden" h={height} zIndex={1}>
                <Box w={size} h={height} display="flex" alignItems="center" justifyContent="center">
                    {tokenBUri ? (
                        <chakra.img
                            src={tokenBUri}
                            alt={tokenBSymbol || ""}
                            objectFit="fill"
                            transform="translateX(-50%)"
                            pointerEvents="none"
                        />
                    ) : (
                        <Box
                            w={size}
                            h={height}
                            bg="gray.200"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            fontWeight="extrabold"
                            color="gray.500"
                            transform="translateX(-50%)"
                        >
                            {tokenBSymbol?.charAt(0) || "?"}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}