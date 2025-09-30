"use client";

import {
    Text,
    HStack,
    StackProps,
    VStack,
    StepsTitle,
    Icon,
    createListCollection,
    Box,
    Button,
    Center,
    Image,
    FieldRoot,
    FieldLabel,
    FieldHelperText,
    Link
} from "@chakra-ui/react";
import { ReactNode, useMemo, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Controller, FormProvider, SubmitErrorHandler, SubmitHandler, useForm, useFormContext } from "react-hook-form";
import { HiCheck } from "react-icons/hi2";

import { StepsContent, StepsIndicator, StepsItem, StepsList, StepsRoot } from "@/components/ui/steps";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@/components/ui/select";
import { RadioCardRoot, RadioCardItem } from "@/components/ui/radio-card";
import { Tooltip } from "@/components/ui/tooltip";
import Glass from "@/components/utils/glass/glass";

import { CreateLoanPositionPayload, useCreateLoanPosition } from "@/hooks/useCreateLoanPosition";
import { BPS, DEFAULT_KINK_UTILIZATION, DEFAULT_SLOPE_AFTER_KINK, DEFAULT_SLOPE_BEFORE_KINK, DEFAULT_TICK_SCALING_BFS, U32_MAX } from "@/constants/core";
import { TokenMetadata } from "@/types/core";
import { toaster } from "@/components/ui/toaster";
import { useHyperionGetPoolIds } from "@/hooks/useHyperionGetPoolIds";
import { shortenAddress } from "@/libs/helpers";
import { useHyperionGetPoolById } from "@/hooks/useHyperionGetPoolById";
import { useHyperionGetPoolResource } from "@/hooks/useHyperionGetPoolResource";
import { roundTickBySpacing, priceToTick, tickToPrice } from "@hyperionxyz/sdk";
import { sqrtPriceX64ToPrice } from "@/libs/helpers/math";
import { NumberInputField, NumberInputRoot } from "@/components/ui/number-input";
import { PairTokensIcon } from "@/components/utils/pair-tokens-icon";
import numeral from "numeral";
import { NETWORK } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";

const RISK_FACTOR_GRAPHS = [
    '/assets/ConservativeGraph.svg',
    '/assets/StandardGraph.svg',
    '/assets/AggressiveGraph.svg',
    '/assets/RestrictiveGraph.svg',
] as const;

const ANIMATION_CONFIG = {
    initial: { scale: 1.2, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { duration: 0.4, ease: "easeInOut" as const }
};

type Props = StackProps;
type FormInput = Pick<CreateLoanPositionPayload, "feeTier" | "riskFactor" | "slopeBeforeKink" | "slopeAfterKink" | "kinkUtilization"> & {
    poolId: string;
    minPrice: number;
    maxPrice: number;
};

const FIXED_DISPLAY_DECIMALS = 6;

// Custom hook để tránh duplicate pool fetching
const usePoolData = (poolId: string) => {
    const { data: poolResource } = useHyperionGetPoolResource({
        payload: { id: poolId },
        options: {
            enabled: !!poolId,
            staleTime: 5 * 60 * 1000, // 5 minutes for pool resource
        }
    });

    const { data: pool } = useHyperionGetPoolById({
        payload: { id: poolId },
        options: {
            queryKey: ['hyperion', 'getPoolById', poolId],
            enabled: !!poolId,
            staleTime: 30 * 1000, // 30 seconds for pool data (more dynamic)
        }
    });

    return { poolResource, pool };
};

const formatPercentage = (value: number | undefined): string =>
    value ? `${(value / 100).toFixed(2)}%` : 'N/A';

interface TokenImageProps {
    logoUri: string | null;
    symbol: string;
    size?: string;
}

const TokenImage = ({ logoUri, symbol, size = '6' }: TokenImageProps) => (
    logoUri ? (
        <Image
            src={logoUri}
            alt={symbol}
            boxSize={size}
            borderRadius="full"
            objectFit="cover"
            bgColor="gray.200"
        />
    ) : (
        <Box
            boxSize={size}
            borderRadius="full"
            bgColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <Text fontSize="xs" fontWeight="bold" color="gray.500">?</Text>
        </Box>
    )
);

interface TokenPairProps {
    tokens: TokenMetadata[];
}

const TokenPair = ({ tokens }: TokenPairProps) => (
    <HStack w="full" flexShrink={0} justify="center" p="4">
        {tokens.map((token, index) => (
            <HStack key={index} w="fit" gap="4">
                <TokenImage logoUri={token.logoUri!} symbol={token.symbol!} />
                <Text fontWeight="extrabold" textTransform="uppercase" color="fg" fontSize="2xl">
                    {token.symbol || '-'}
                </Text>
                {index === 0 && <Text fontWeight="extrabold" color="fg">/</Text>}
            </HStack>
        ))}
    </HStack>
);

interface AnimatedGraphProps {
    riskFactor: number;
}

const AnimatedGraph = ({ riskFactor }: AnimatedGraphProps) => (
    <Tooltip content="Risk Factor Graph">
        <Box w="full" flex="1 1 0" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={riskFactor}
                    {...ANIMATION_CONFIG}
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <Image
                        src={RISK_FACTOR_GRAPHS[riskFactor] || RISK_FACTOR_GRAPHS[1]}
                        alt="Risk Factor Graph"
                        maxW="100%"
                        maxH="100%"
                        objectFit="contain"
                        w="auto"
                        h="auto"
                    />
                </motion.div>
            </AnimatePresence>
        </Box>
    </Tooltip>
);

interface Steps1Props extends StackProps {
    setStep?: (step: number) => void;
}
const Step1 = (props: Steps1Props) => {
    const { control, watch, setValue } = useFormContext<FormInput>();
    const { setStep } = props;
    const poolId = watch("poolId");
    const { poolResource, pool } = usePoolData(poolId);

    const { data: pools, isLoading: isLoadingPools } = useHyperionGetPoolIds({
        options: {
            staleTime: Infinity,
        }
    });


    const poolCollection = useMemo(() => {
        return createListCollection({
            items: pools?.map((pool) => ({
                label: shortenAddress(pool.id),
                value: pool.id,
                pool
            })) || [],
            itemToString: (item) => item?.label || '',
        })
    }, [pools]);

    const tokenAInfo = useMemo(() => {
        if (!pool) return null;

        return pool.pool.token1Info;
    }, [pool]);

    const tokenBInfo = useMemo(() => {
        if (!pool) return null;

        return pool.pool.token2Info;
    }, [pool]);

    const currentPrice = useMemo(() => {
        if (!pool && !tokenAInfo && !tokenBInfo) return null;

        return sqrtPriceX64ToPrice(pool?.pool.sqrtPrice || "", tokenAInfo?.decimals || 8, tokenBInfo?.decimals || 8);
    }, [pool, tokenAInfo, tokenBInfo]);

    const defaultMinPrice = useMemo(() => {
        if (!currentPrice || currentPrice === 0) return 0;

        return currentPrice * (1 - (DEFAULT_TICK_SCALING_BFS / BPS));
    }, [currentPrice]);

    const defaultMaxPrice = useMemo(() => {
        if (!currentPrice || currentPrice === 0) return 0;

        return currentPrice * (1 + (DEFAULT_TICK_SCALING_BFS / BPS));
    }, [currentPrice]);

    // Reset price values when pool changes
    useEffect(() => {
        if (poolId && defaultMinPrice && defaultMaxPrice) {
            setValue("minPrice", defaultMinPrice);
            setValue("maxPrice", defaultMaxPrice);
        }
    }, [poolId, defaultMinPrice, defaultMaxPrice, setValue]);

    const handlePriceBlur = useCallback((priceValue: string, fieldOnChange: (value: number | string) => void) => {
        if (priceValue === "∞" || priceValue === "" || parseFloat(priceValue) === 0) {
            fieldOnChange(0);
            return;
        }

        if (!pool || !tokenAInfo || !tokenBInfo) {
            return;
        }

        const decimalsRatio = Math.pow(10, (tokenAInfo?.decimals || 8) - (tokenBInfo?.decimals || 8));

        const tick = priceToTick({
            price: parseFloat(priceValue),
            feeTierIndex: pool.pool.feeTier,
            decimalsRatio,
        });

        if (tick !== null) {
            const roundedTick = roundTickBySpacing(Number(tick), pool.pool.feeTier);
            fieldOnChange(tickToPrice({
                tick: roundedTick,
                decimalsRatio,
            }));
        }
    }, [pool, tokenAInfo, tokenBInfo]);

    return (
        <VStack w={"full"} h={"full"} gap={"8"} {...props}>
            <Wrapper label="Select pool" w={"full"}>
                <HStack w={"full"} gap={"6"}>
                    <Controller
                        control={control}
                        name="poolId"
                        render={({ field }) => (
                            <SelectRoot
                                size={"lg"}
                                name={field.name}
                                disabled={isLoadingPools}
                                onValueChange={({ value }) => field.onChange(value[0])}
                                onInteractOutside={() => field.onBlur()}
                                collection={poolCollection}
                            >
                                <SelectTrigger cursor={"pointer"}>
                                    <SelectValueText
                                        placeholder={
                                            isLoadingPools ? "Loading pools..." : "Choose pool id"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {poolCollection.items.map((item) => (
                                        <SelectItem
                                            rounded={"2xl"}
                                            key={item.value}
                                            item={item}
                                        >
                                            <HStack w={"full"} gap={"4"} justify={'space-between'}>
                                                <HStack>
                                                    <PairTokensIcon
                                                        tokenASymbol={item.pool?.pool.token1Info.symbol || '-'}
                                                        tokenAUri={item.pool?.pool.token1Info.logoUrl || undefined}
                                                        tokenBSymbol={item.pool?.pool.token2Info.symbol || '-'}
                                                        tokenBUri={item.pool?.pool.token2Info.logoUrl || undefined}
                                                    />
                                                    <Text fontSize={"sm"} fontWeight={"bold"} color={"fg"}>
                                                        {item.pool.pool.token1Info.symbol || '-'} / {item.pool.pool.token2Info.symbol || '-'}
                                                    </Text>
                                                </HStack>
                                                <Tooltip
                                                    content={"TVL"}
                                                    positioning={{
                                                        placement: "right"
                                                    }}
                                                >
                                                    <Text fontSize={"sm"} fontWeight={"bold"} color={"fg.subtle"}>
                                                        {numeral(item.pool.tvlUSD).format("$0,0.[00]")}
                                                    </Text>
                                                </Tooltip>
                                                <Link
                                                    fontSize={"md"}
                                                    color={"fg.subtle"}
                                                    href={`https://explorer.aptoslabs.com/fungible_asset/${item.value}?network=${NETWORK}`}
                                                    target={"_blank"}
                                                    onClick={(e) => e.stopPropagation()}
                                                    transition={"all 0.3s ease-in-out"}
                                                    _hover={{ color: "fg", textDecor: "none" }}
                                                >
                                                    {shortenAddress(item.value)}
                                                </Link>
                                            </HStack>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        )}
                    />

                </HStack>
            </Wrapper>
            <Wrapper label="Set tick range" w={"full"}>
                <VStack w="full" gap="4">
                    {pool && (
                        <><Text fontSize="xs" color="fg.muted" textAlign="center">
                            Current price: 1 {tokenAInfo?.symbol} = {currentPrice} {tokenBInfo?.symbol}
                        </Text><HStack w="full" gap="4">
                                <Controller
                                    control={control}
                                    name="minPrice"
                                    defaultValue={defaultMinPrice}
                                    render={({ field }) => {
                                        return (
                                            <FieldRoot>
                                                <FieldLabel>Min Price</FieldLabel>
                                                <NumberInputRoot
                                                    w={"full"}
                                                    value={Number(field.value).toString()}
                                                    onValueChange={(e) => field.onChange(e.value)}
                                                    onBlur={() => handlePriceBlur(Number(field.value).toString(), field.onChange)}
                                                    step={1}
                                                    formatOptions={{
                                                        compactDisplay: 'short',
                                                        maximumFractionDigits: FIXED_DISPLAY_DECIMALS,
                                                    }}
                                                >
                                                    <NumberInputField />
                                                </NumberInputRoot>
                                                <FieldHelperText>
                                                    {pool?.pool.token2Info.symbol} PER {pool?.pool.token1Info.symbol}
                                                </FieldHelperText>
                                            </FieldRoot>
                                        );
                                    }} />
                                <Text fontSize="3xl" fontWeight="extrabold" color="fg">-</Text>
                                <Controller
                                    control={control}
                                    name="maxPrice"
                                    defaultValue={defaultMaxPrice}
                                    render={({ field }) => {
                                        return (
                                            <FieldRoot>
                                                <FieldLabel>Max Price</FieldLabel>
                                                <NumberInputRoot
                                                    w={"full"}
                                                    value={Number(field.value).toString()}
                                                    onValueChange={(e) => field.onChange(e.value)}
                                                    onBlur={() => handlePriceBlur(Number(field.value).toString(), field.onChange)}
                                                    step={poolResource?.tickSpacing}
                                                    formatOptions={{
                                                        compactDisplay: 'short',
                                                        maximumFractionDigits: FIXED_DISPLAY_DECIMALS,
                                                    }}
                                                >
                                                    <NumberInputField />
                                                </NumberInputRoot>
                                                <FieldHelperText>
                                                    {pool?.pool.token2Info.symbol} PER {pool?.pool.token1Info.symbol}
                                                </FieldHelperText>
                                            </FieldRoot>
                                        );
                                    }} />
                            </HStack>
                        </>
                    )}
                </VStack>
            </Wrapper>
            <Button
                size={"2xl"}
                w={"full"}
                colorPalette={"gray"}
                onClick={() => setStep?.(1)}
            >
                Next
            </Button>
        </VStack>
    )
}

const riskFactorOptions = [
    {
        label: '0.5',
        value: 0,
        level: 'Conservative',
        description: 'Gradual interest escalation for stable borrowing',
    },
    {
        label: '1.0',
        value: 1,
        level: 'Standard',
        description: 'Linear interest increase matching market conditions',
    },
    {
        label: '1.5',
        value: 2,
        level: 'Aggressive',
        description: 'Accelerated interest curve to discourage over-borrowing',
    },
    {
        label: '2.0',
        value: 3,
        level: 'Restrictive',
        description: 'Steep penalty curve for maximum utilization control',
    }
];

type Steps2Props = StackProps & {
    onSubmit?: () => void;
}

const Step2 = ({ onSubmit, ...props }: Steps2Props) => {
    const { control } = useFormContext<FormInput>();

    return (
        <VStack w={"full"} h={"full"} gap={"8"} {...props}>
            <Controller
                control={control}
                name="riskFactor"
                render={({ field }) => (
                    <RadioCardRoot
                        value={field.value.toString()}
                        onValueChange={(e) => field.onChange(parseInt(e.value!))}
                    >
                        <HStack gap={"6"} align="stretch" flexWrap={"wrap"}>
                            {riskFactorOptions.map((option) => (
                                <RadioCardItem
                                    key={option.value}
                                    value={option.value.toString()}
                                    label={option.label}
                                    maxW={"64"}
                                    description={
                                        <Box>
                                            <Text fontSize={"lg"} fontWeight={"bold"} color={"fg"}>
                                                {option.level}
                                            </Text>
                                            <Text fontSize={"sm"} color={"fg.subtle"}>
                                                {option.description}
                                            </Text>
                                        </Box>
                                    }
                                />
                            ))}
                        </HStack>
                    </RadioCardRoot>
                )}
            />
            <Button
                size={"2xl"}
                w={"full"}
                colorPalette={"primary"}
                onClick={onSubmit}
            >
                Create
            </Button>
        </VStack>
    )
}

type PreviewProps = StackProps;

const Preview = (props: PreviewProps) => {
    const { watch } = useFormContext<FormInput>();
    const slopeBeforeKink = watch("slopeBeforeKink");
    const slopeAfterKink = watch("slopeAfterKink");
    const kinkUtilization = watch("kinkUtilization");
    const riskFactor = watch("riskFactor");
    const poolId = watch("poolId");
    const { pool } = usePoolData(poolId);

    const items = [
        { label: 'Slope Before Kink', value: formatPercentage(slopeBeforeKink) },
        { label: 'Slope After Kink', value: formatPercentage(slopeAfterKink) },
        { label: 'Kink Utilization', value: formatPercentage(kinkUtilization) },
    ];

    const tokens = useMemo<TokenMetadata[]>(() => {
        if (!pool) return [];

        return [
            {
                name: pool.pool.token1Info.name,
                symbol: pool.pool.token1Info.symbol,
                decimals: pool.pool.token1Info.decimals,
                logoUri: pool.pool.token1Info.logoUrl,
            },
            {
                name: pool.pool.token2Info.name,
                symbol: pool.pool.token2Info.symbol,
                decimals: pool.pool.token2Info.decimals,
                logoUri: pool.pool.token2Info.logoUrl,
            }
        ];
    }, [pool]);

    return (
        <VStack
            rounded="3xl"
            flex={2}
            shadow="md"
            aspectRatio="3/4"
            overflow="hidden"
            justify="space-between"
            bg="bg.panel"
            {...props}
        >
            <Box w="full" p="4" flexShrink={0}>
                <Text fontSize="2xl" fontWeight="extrabold" color="fg">Preview</Text>
            </Box>

            <TokenPair tokens={tokens} />
            <AnimatedGraph riskFactor={riskFactor} />

            <Center
                w="full"
                flexShrink={0}
                pt="8"
                bg="radial-gradient(355.18% 100% at 53.17% 100%, #000 6.13%, #8573FD 54.54%, rgba(133, 115, 253, 0.00) 100%)"
            >
                <Center p="4" w="full" h="full">
                    <Glass w="full" height="fit" rounded="3xl" bg="black/25">
                        <VStack w="full" h="fit" align="start" p="4">
                            {items.map((item, index) => (
                                <HStack key={index} w="full" justify="space-between">
                                    <Text fontSize="xs" color="primary.subtle">{item.label}</Text>
                                    <Text fontSize="sm" fontWeight="medium" color="primary.contrast">{item.value}</Text>
                                </HStack>
                            ))}
                        </VStack>
                    </Glass>
                </Center>
            </Center>
        </VStack>
    )
}

const steps = [
    {
        title: "Select pair tokens",
        description: "Select the token pair you want to borrow and collateralize",
        component: Step1,
    },
    {
        title: "Choose loan params",
        description: "Set the loan parameters",
        component: Step2,
    }
];

export const CreateLoanPositionForm = (props: Props) => {
    const queryClient = useQueryClient();
    const [step, setStep] = useState(0);
    const form = useForm<FormInput>({
        defaultValues: {
            riskFactor: 1,
            slopeBeforeKink: DEFAULT_SLOPE_BEFORE_KINK,
            slopeAfterKink: DEFAULT_SLOPE_AFTER_KINK,
            kinkUtilization: DEFAULT_KINK_UTILIZATION,
        },
        mode: "onBlur",
        reValidateMode: "onBlur",
    });

    const { mutateAsync: createLoanPosition } = useCreateLoanPosition({
        options: {
            onSuccess: (data) => {
                queryClient.invalidateQueries();
                toaster.success({
                    title: "Loan position created successfully!",
                    description: `Address ${data.positionAddress}`,
                });
            },
            onError: (error) => {
                toaster.error({
                    title: "Error creating loan position",
                    description: error?.message || "Please try again.",
                });
            }
        }
    });

    const poolId = form.watch("poolId");
    const { pool } = usePoolData(poolId);

    const onSubmitHandler: SubmitHandler<FormInput> = async (data) => {
        if (!pool) return;

        const decimalsRatio = Math.pow(10, (pool.pool.token1Info.decimals || 8) - (pool.pool.token2Info.decimals || 8));
        const tickLower = priceToTick({
            price: data.minPrice,
            feeTierIndex: pool.pool.feeTier,
            decimalsRatio,
        })?.toNumber();

        const tickUpper = priceToTick({
            price: data.maxPrice,
            feeTierIndex: pool.pool.feeTier,
            decimalsRatio,
        })?.toNumber();

        const offset = U32_MAX + 1;

        if (tickLower === undefined || tickUpper === undefined) throw new Error("Invalid tick range");

        const convertedData: CreateLoanPositionPayload = {
            tokenA: pool.pool.token1,
            tokenB: pool.pool.token2,
            tokenFee: pool.pool.token1,
            feeTier: pool.pool.feeTier,
            tickLower: tickLower < 0 ? offset + tickLower : tickLower,
            tickUpper: tickUpper < 0 ? offset + tickUpper : tickUpper,
            slopeBeforeKink: data.slopeBeforeKink,
            slopeAfterKink: data.slopeAfterKink,
            kinkUtilization: data.kinkUtilization,
            riskFactor: data.riskFactor,
        };

        await createLoanPosition(convertedData);
    };

    const onErrorHandler: SubmitErrorHandler<FormInput> = () => {
    };

    const handleManualSubmit = () => {
        form.handleSubmit(onSubmitHandler, onErrorHandler)();
    };

    return (
        <FormProvider {...form}>
            <HStack w={"full"} h={"full"} justify={"center"} align={"start"} gap={"6"} {...props}>
                <StepsRoot
                    h={"full"}
                    flex={"4"}
                    step={step}
                    onStepChange={(e) => setStep(e.step)}
                    count={steps.length}
                >
                    <StepsList>
                        {steps.map((s, index) => (
                            <StepsItem
                                key={index}
                                title={s.title}
                                index={index}
                            >
                                <StepsTitle>
                                    {s.title}
                                </StepsTitle>
                                <StepsIndicator completedIcon={<Icon as={HiCheck} />} />
                            </StepsItem>
                        ))}
                    </StepsList>
                    {steps.map((s, index) => (
                        <StepsContent
                            key={index}
                            index={index}
                        >
                            {index === 0 &&
                                <Step1
                                    setStep={setStep}
                                />
                            }
                            {index === 1 && <Step2 onSubmit={handleManualSubmit} />}
                        </StepsContent>
                    ))}
                </StepsRoot>
                <Preview />
            </HStack>
        </FormProvider>
    );
};

interface WrapperProps extends StackProps {
    label?: ReactNode;
}

export const Wrapper = ({ label, children, ...rest }: WrapperProps) => {
    return (
        <VStack w="full" align="flex-start" gap="4" {...rest}>
            <Text fontSize="2xl" fontWeight="semibold" color="fg">
                {label}
            </Text>
            {children}
        </VStack>
    );
};