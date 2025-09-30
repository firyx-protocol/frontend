import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    ButtonProps,
    IconButton,
    Image,
    Center,
    NumberInputRoot,
    NumberInputControl,
    NumberInputInput,
    InputProps
} from "@chakra-ui/react";
import Glass from "../utils/glass/glass";
import { TokenMetadata } from "@/types/core";
import { IoSwapVertical } from "react-icons/io5";

interface Token extends TokenMetadata {
    balance?: string;
}

interface SwapWidgetProps extends Omit<ButtonProps, 'onClick'> {
    tokenA: Token;
    tokenB: Token;
    tokenAAmount?: string;
    tokenBAmount?: string;
    isLoading?: boolean;
    onTokenAAmountChange?: (amount: string) => void;
    onTokenBAmountChange?: (amount: string) => void;
    onSwapTokens?: () => void;
    onAction?: (tokenA: Token, tokenB: Token, amountA: string, amountB: string) => void;
    disabled?: boolean;
    actionButtonText?: string;
    loadingText?: string;
    // Token A Input Props
    tokenAInputProps?: InputProps & {
        maxLength?: number;
        min?: string | number;
        max?: string | number;
        step?: string | number;
    };
    // Token B Input Props
    tokenBInputProps?: InputProps &{
        maxLength?: number;
        min?: string | number;
        max?: string | number;
        step?: string | number;
    };
}

export const SwapWidget = ({
    tokenA,
    tokenB,
    tokenAAmount = "",
    tokenBAmount = "",
    isLoading = false,
    onTokenAAmountChange,
    onTokenBAmountChange,
    onSwapTokens,
    onAction,
    disabled = false,
    actionButtonText = "Action",
    loadingText = "Processing...",
    tokenAInputProps = {
        min: 0,
        max: Number.MAX_VALUE,
        step: 1,
    },
    tokenBInputProps = {
        min: 0,
        max: Number.MAX_VALUE,
        step: 1,
    },
    ...buttonProps
}: SwapWidgetProps) => {

    const handleAction = () => {
        if (onAction) {
            onAction(tokenA, tokenB, tokenAAmount, tokenBAmount);
        }
    };

    const handleTokenAAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTokenAAmountChange?.(e.target.value);
    };

    const handleTokenBAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTokenBAmountChange?.(e.target.value);
    };

    return (
        <VStack gap="2" w="full">
            <VStack w="full" align="center" gap="1" pos={"relative"}>
                <Box w="full" p="5" bg="bg.panel" borderRadius="3xl" shadow={"sm"}>
                    <Text fontSize="sm" color="fg">
                        Token A
                    </Text>
                    <HStack gap="3">
                        <NumberInputRoot
                            value={tokenAAmount}
                            onChange={handleTokenAAmountChange}
                            fontSize="2xl"
                            fontWeight="extrabold"
                            formatOptions={{
                                style: "decimal",
                                
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 18,
                                useGrouping: false
                            }}
                            disabled={disabled || tokenAInputProps.disabled}
                            readOnly={tokenAInputProps.readOnly}
                            min={Number(tokenAInputProps.min)}
                            max={Number(tokenAInputProps.max)}
                            step={Number(tokenAInputProps.step)}
                            flex="1"
                            unstyled
                        >
                            <NumberInputControl hidden />
                            <NumberInputInput
                                w={"full"} h={"full"}
                                placeholder={tokenAInputProps.placeholder || "0"}
                                focusVisibleRing={'none'}
                                {...tokenAInputProps}
                            />
                        </NumberInputRoot>

                        <HStack gap="2" p="2" borderRadius="md" justify="center" align={"end"}>
                            <Image
                                src={tokenA.logoUri!=="" ? tokenA.logoUri : undefined}
                                alt={tokenA.symbol}
                                borderRadius={'full'}
                                objectFit={'cover'}
                                w={"8"} h={"8"}
                            />
                            <Text fontSize="2xl" fontWeight="extrabold" textTransform={"uppercase"}>
                                {tokenA.symbol}
                            </Text>
                        </HStack>
                    </HStack>
                    <HStack justify="end">
                        <Text fontSize="sm" color="fg.subtle">
                            Balance: {Number(tokenA.balance).toFixed(2).replace(/\.?0+$/, '')} {tokenA.symbol?.toUpperCase()}
                        </Text>
                    </HStack>
                </Box>

                {/* Swap Icon */}
                <Center pos={"absolute"} top="50%" left="50%" transform={"translate(-50%, -50%)"}>
                    <Glass width={"fit"} h={"fit"}>
                        <IconButton
                            aria-label="Swap tokens"
                            variant="plain"
                            size="md"
                            bg="transparent"
                            onClick={onSwapTokens}
                            disabled={disabled}
                        >
                            <IoSwapVertical />
                        </IconButton>
                    </Glass>
                </Center>

                {/* Token B Section */}
                <Box w="full" p="5" bg="bg.panel" borderRadius="3xl" shadow={"sm"}>
                    <Text fontWeight={"medium"} color="fg">Token B</Text>
                    <HStack gap="3">
                        <NumberInputRoot
                            value={tokenBAmount}
                            onChange={handleTokenBAmountChange}
                            fontSize="2xl"
                            fontWeight="extrabold"
                            formatOptions={{
                                style: "decimal",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 18,
                                useGrouping: false
                            }}
                            disabled={disabled || tokenBInputProps.disabled}
                            readOnly={tokenBInputProps.readOnly}
                            min={Number(tokenBInputProps.min)}
                            max={Number(tokenBInputProps.max)}
                            step={Number(tokenBInputProps.step)}
                            flex="1"
                            unstyled
                        >
                            <NumberInputControl hidden />
                            <NumberInputInput
                                w={"full"} h={"full"}
                                placeholder={tokenBInputProps.placeholder || "0"}
                                focusVisibleRing={'none'}
                                {...tokenBInputProps}
                            />
                        </NumberInputRoot>

                        <HStack gap="2" p="2" borderRadius="md" justify="center" align={"end"}>
                            <Image
                                src={tokenB.logoUri!=="" ? tokenB.logoUri : undefined}
                                alt={tokenB.symbol}
                                borderRadius={'full'}
                                objectFit={'cover'}
                                w={"8"} h={"6"}
                            />
                            <Text fontSize="2xl" fontWeight="extrabold" textTransform={"uppercase"}>
                                {tokenB.symbol}
                            </Text>
                        </HStack>
                    </HStack>
                    <HStack justify="end">
                        <Text fontSize="sm" color="fg.subtle">
                            Balance: {Number(tokenB.balance).toFixed(2).replace(/\.?0+$/, '')} {tokenB.symbol?.toUpperCase()}
                        </Text>
                    </HStack>
                </Box>
            </VStack>

            {/* Action Button */}
            <Button
                {...buttonProps}
                w="full"
                size="2xl"
                color={"white"}
                bg={"radial-gradient(239.58% 100% at 50.49% 100%, #000 10%, #8573FD 41.02%, rgba(114, 242, 219, 0.25) 100%)"}
                onClick={handleAction}
                disabled={disabled || !tokenAAmount || !tokenBAmount}
                loading={isLoading}
                loadingText={loadingText}
            >
                {actionButtonText}
            </Button>
        </VStack>
    );
};
