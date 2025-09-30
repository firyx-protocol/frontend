import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    ButtonProps,
    NumberInputRoot,
    NumberInputControl,
    NumberInputInput,
    InputProps,
    Slider,
    ProgressCircleLabel
} from "@chakra-ui/react";
import { TokenMetadata } from "@/types/core";
import { ProgressCircleRing, ProgressCircleRoot, ProgressCircleValueText } from "../ui/progress-circle";

interface Token extends TokenMetadata {
    balance?: string;
}

interface BorrowShareProps {
    amount?: string;
    maxAmount?: string;
    selectedDurationIdx?: number;
    isLoading?: boolean;
    onAmountChange?: (amount: string) => void;
    onSliderChange?: (value: number[]) => void;
    onDurationChange?: (idx: number) => void;
    onAction?: (amount: string, durationIdx: number) => void;
    actionButtonText?: string;
    loadingText?: string;
    disabled?: boolean;
    inputProps?: InputProps & {
        maxLength?: number;
        min?: string | number;
        max?: string | number;
        step?: string | number;
    };
    buttonProps?: ButtonProps;
}

export const BorrowShare = ({
    amount = "",
    maxAmount = "100",
    selectedDurationIdx = 0,
    isLoading = false,
    onAmountChange,
    onSliderChange,
    onDurationChange,
    onAction,
    disabled = false,
    actionButtonText = "Borrow",
    loadingText = "Processing...",
    inputProps = {
        min: 0,
        max: Number.MAX_VALUE,
        step: 1,
    },
    buttonProps,
    ...rest
}: BorrowShareProps) => {

    // Duration options based on the contract constants
    const DURATION_OPTIONS = [
        { idx: 0, label: "0.25 Year", bps: 2500 },
        { idx: 1, label: "0.5 Year", bps: 5000 },
        { idx: 2, label: "1 Year", bps: 10000 },
        { idx: 3, label: "2 Years", bps: 20000 },
    ];

    const handleAction = () => {
        if (onAction) {
            onAction(amount, selectedDurationIdx);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onAmountChange?.(e.target.value);
    };

    const handleSliderChange = (details: { value: number[] }) => {
        const percentage = details.value[0];
        const calculatedAmount = (Number(maxAmount) * percentage / 100).toString();
        onAmountChange?.(calculatedAmount);
        onSliderChange?.(details.value);
    };

    // Calculate slider percentage based on current amount
    const currentPercentage = Number(maxAmount) > 0 ? (Number(amount) / Number(maxAmount)) * 100 : 0;

    return (
        <VStack gap="4" w="full">
            <Box w="full" p="5" bg="bg.panel" borderRadius="3xl" shadow={"sm"}>
                <Text fontSize="sm" color="fg" mb="3">
                    Share
                </Text>

                {/* Input Section */}
                <HStack gap="3" mb="4">
                    <NumberInputRoot
                        value={amount}
                        onChange={handleAmountChange}
                        fontSize="2xl"
                        fontWeight="extrabold"
                        formatOptions={{
                            style: "decimal",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 18,
                            useGrouping: false
                        }}
                        disabled={disabled || inputProps.disabled}
                        readOnly={inputProps.readOnly}
                        min={Number(inputProps.min)}
                        max={Number(inputProps.max)}
                        step={Number(inputProps.step)}
                        flex="1"
                        unstyled
                    >
                        <NumberInputControl hidden />
                        <NumberInputInput
                            w={"full"} h={"full"}
                            placeholder={inputProps.placeholder || "0"}
                            focusVisibleRing={'none'}
                            {...inputProps}
                        />
                    </NumberInputRoot>
                    <ProgressCircleRoot value={Number(amount)} strokeLinecap="round" colorPalette={"primary"}>
                        <ProgressCircleRing />
                        <ProgressCircleValueText />
                    </ProgressCircleRoot>
                </HStack>

                {/* Duration Selection */}
                <VStack gap="2" w="full" mb="4">
                    <Text fontSize="sm" color="fg" alignSelf="start">
                        Duration
                    </Text>
                    <HStack gap="2" w="full" justify="space-between">
                        {DURATION_OPTIONS.map((option) => (
                            <Button
                                key={option.idx}
                                size="sm"
                                variant={selectedDurationIdx === option.idx ? "solid" : "outline"}
                                colorScheme={selectedDurationIdx === option.idx ? "blue" : "gray"}
                                flex="1"
                                onClick={() => onDurationChange?.(option.idx)}
                                disabled={disabled}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </HStack>
                    <Text fontSize="xs" color="fg.subtle" alignSelf="start">
                        Selected: {DURATION_OPTIONS[selectedDurationIdx]?.label}
                    </Text>
                </VStack>

                {/* Slider Section */}
                <VStack gap="2" w="full">
                    <Slider.Root
                        width="100%"
                        value={[currentPercentage]}
                        onValueChange={handleSliderChange}
                        min={0}
                        max={100}
                        step={1}
                        disabled={disabled}
                    >
                        <Slider.Control>
                            <Slider.Track>
                                <Slider.Range />
                            </Slider.Track>
                            <Slider.Thumb index={0} />
                        </Slider.Control>
                    </Slider.Root>

                    {/* Percentage markers */}
                    <HStack justify="space-between" w="full" fontSize="xs" color="fg.subtle">
                        <Text>0%</Text>
                        <Text>25%</Text>
                        <Text>50%</Text>
                        <Text>75%</Text>
                        <Text>100%</Text>
                    </HStack>
                </VStack>

                {/* Max Display Only */}
                <HStack justify="end" mt="3">
                    <Text fontSize="sm" color="fg.subtle">
                        Max: {Number(maxAmount).toFixed(2).replace(/\.?0+$/, '')}
                    </Text>
                </HStack>
            </Box>

            {/* Action Button */}
            <Button
                w="full"
                size="2xl"
                color={"white"}
                bg={"radial-gradient(239.58% 100% at 50.49% 100%, #000 10%, #8573FD 41.02%, rgba(114, 242, 219, 0.25) 100%)"}
                onClick={handleAction}
                disabled={disabled || !amount || selectedDurationIdx === undefined}
                loading={isLoading}
                loadingText={loadingText}
                {...buttonProps}
            >
                {actionButtonText}
            </Button>
        </VStack>
    );
};