"use client";

import { Text, HStack, StackProps, VStack, StepsTitle, Icon, createListCollection, Box, Button, Center, Image } from "@chakra-ui/react";
import { SelectTokenButton } from "./SelectTokenButton";
import { ReactNode, useEffect, useState } from "react";
import { StepsContent, StepsIndicator, StepsItem, StepsList, StepsRoot } from "@/components/ui/steps";
import { HiCheck } from "react-icons/hi2";
import { CreateLoanPositionPayload } from "@/hooks/useCreateLoanPosition";
import { Controller, FormProvider, SubmitErrorHandler, SubmitHandler, useForm, useFormContext } from "react-hook-form";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@/components/ui/select";
import { DEFAULT_KINK_UTILIZATION, DEFAULT_SLOPE_AFTER_KINK, DEFAULT_SLOPE_BEFORE_KINK, FEE_TIER_VECTOR_BPS } from "@/constants/core"
import { RadioCardRoot, RadioCardItem } from "@/components/ui/radio-card";
import Glass from "@/components/utils/glass/glass";
import { shortenAddress } from "@/libs/helpers";
import { TokenMetadata } from "@/types/core";
import NextImage from "next/image";
import { Tooltip } from "@/components/ui/tooltip";

type Props = StackProps;

const feeTierOptions = createListCollection({
    items: FEE_TIER_VECTOR_BPS.map((fee, index) => ({
        label: `${fee / 100}%`,
        value: index
    })),
    itemToString: (item) => item?.label || '',
});

interface Steps1Props extends StackProps {
    selectTokenA?: (token: TokenMetadata) => void;
    selectTokenB?: (token: TokenMetadata) => void;
    setStep?: (step: number) => void;
}
const Step1 = (props: Steps1Props) => {
    const { control, formState: { validatingFields } } = useFormContext<FormInput>();
    const { selectTokenA, selectTokenB, setStep } = props;

    return (
        <VStack w={"full"} h={"full"} gap={"8"} {...props}>
            <Wrapper label="Select pair tokens" w={"full"}>
                <HStack w={"full"} gap={"6"}>
                    <Controller
                        control={control}
                        name="tokenA"
                        render={({ field }) => (
                            <SelectTokenButton
                                onTokenSelect={(token) => {
                                    selectTokenA?.(token);
                                    field.onChange(token.asset_type);
                                }}
                                flex={1}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="tokenB"
                        render={({ field }) => (
                            <SelectTokenButton
                                onTokenSelect={(token) => {
                                    selectTokenB?.(token);
                                    field.onChange(token.asset_type);
                                }}
                                flex={1}
                            />
                        )}
                    />
                </HStack>
            </Wrapper>
            <Wrapper label="Choose fee tier" w={"full"}>
                <Controller
                    control={control}
                    name="feeTier"
                    render={({ field }) => (
                        <SelectRoot
                            size={"lg"}
                            name={field.name}
                            onValueChange={({ value }) => field.onChange(value[0])}
                            onInteractOutside={() => field.onBlur()}
                            collection={feeTierOptions}
                        >
                            <SelectTrigger cursor={"pointer"}>
                                <SelectValueText placeholder="Choose fee tier" />
                            </SelectTrigger>
                            <SelectContent >
                                {feeTierOptions.items.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        item={option}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    )}
                />
            </Wrapper>
            <HStack w={"full"} justify={"end"}>
                <Button
                    size={"2xl"}
                    w={"full"}
                    colorPalette={"gray"}
                    onClick={() => setStep?.(1)}
                >
                    Next
                </Button>
            </HStack>
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

interface PreviewProps extends StackProps {
    tokenAMetadata?: TokenMetadata;
    tokenBMetadata?: TokenMetadata;
}

const Preview = (props: PreviewProps) => {
    const { watch } = useFormContext<FormInput>();
    const tokenA = watch("tokenA");
    const tokenB = watch("tokenB");
    const slopeBeforeKink = watch("slopeBeforeKink");
    const slopeAfterKink = watch("slopeAfterKink");
    const kinkUtilization = watch("kinkUtilization");
    const feeTier = watch("feeTier");
    const riskFactor = watch("riskFactor");
    const { tokenAMetadata, tokenBMetadata } = props;

    const items = [
        { label: 'Slope Before Kink', value: slopeBeforeKink ? `${(slopeBeforeKink / 100).toFixed(2)}%` : 'N/A' },
        { label: 'Slope After Kink', value: slopeAfterKink ? `${(slopeAfterKink / 100).toFixed(2)}%` : 'N/A' },
        { label: 'Kink Utilization', value: kinkUtilization ? `${(kinkUtilization / 100).toFixed(2)}%` : 'N/A' },
    ];

    const pariTokens = [
        {
            symbol: tokenAMetadata?.symbol || '',
            logoUri: tokenAMetadata?.logoUri || '',
            asset_type: tokenA || '',
        },
        {
            symbol: tokenBMetadata?.symbol || '',
            logoUri: tokenBMetadata?.logoUri || '',
            asset_type: tokenB || '',
        }
    ];

    const riskFactorMapGraphSvg = [
        '/assets/ConservativeGraph.svg',
        '/assets/StandardGraph.svg',
        '/assets/AggressiveGraph.svg',
        '/assets/RestrictiveGraph.svg',
    ];

    return (
        <VStack
            rounded={"3xl"}
            flex={2}
            shadow={"sm"}
            aspectRatio={"3/4"}
            overflow={"hidden"}
            justify={"space-between"}
            {...props}

        >
            <Box w={"full"} p={"4"} flexShrink={0}>
                <Text fontSize={"2xl"} fontWeight={"extrabold"} color={"fg"}>Preview</Text>
            </Box>
            <HStack w={"full"} flexShrink={0} justify={"center"} p={"4"}>
                {pariTokens.map((token, index) => (
                    <HStack key={index} w={"fit"} gap={"4"}>
                        <Image
                            src={token.logoUri}
                            alt={token.symbol}
                            boxSize={'6'}
                            borderRadius={'full'}
                            objectFit={'cover'}
                            bgColor={'gray.200'}
                        />
                        <Text fontWeight={"extrabold"} textTransform="uppercase" color={"fg"} fontSize={"2xl"}>
                            {token.symbol || '-'}
                        </Text>
                        {index === 0 && <Text fontWeight={"extrabold"} color={"fg"}>/</Text>}
                    </HStack>
                ))}
            </HStack>
            <Tooltip content={'Risk Factor Graph'}>
                <Box
                    w={"full"}
                    flex={"1 1 0"}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    overflow={"hidden"}
                >
                    <Image
                        src={riskFactorMapGraphSvg[riskFactor] || '/assets/StandardGraph.svg'}
                        alt="Risk Factor Graph"
                        maxW={"100%"}
                        maxH={"100%"}
                        objectFit={"contain"}
                        w={"auto"}
                        h={"auto"}
                    />
                </Box>
            </Tooltip>
            <Center
                w={"full"}
                flexShrink={0}
                pt={"8"}
                bg={"radial-gradient(355.18% 100% at 53.17% 100%, #000 6.13%, #8573FD 54.54%, rgba(133, 115, 253, 0.00) 100%)"}
            >
                <Center p={"4"} w={"full"} h={"full"}>
                    <Glass w={"full"} height={"fit"} rounded={"3xl"} bg={"black/25"}>
                        <VStack w={"full"} h={"fit"} align={"start"} p={"4"}>
                            {items.map((item, index) => (
                                <HStack key={index} w={"full"} h={"full"} justify={"space-between"}>
                                    <Text fontSize={"xs"} color={"primary.subtle"}>{item.label}</Text>
                                    <Text fontSize={"sm"} fontWeight={"medium"} color={"primary.contrast"}>{item.value}</Text>
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

type FormInput = CreateLoanPositionPayload;

export const CreateLoanPositionForm = (props: Props) => {
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

    const [tokenAMetadata, setTokenAMetadata] = useState<TokenMetadata | null>(null);
    const [tokenBMetadata, setTokenBMetadata] = useState<TokenMetadata | null>(null);

    const onSubmitHandler: SubmitHandler<FormInput> = (data) => {
        console.log("Form data:", data);
    }

    const onErrorHandler: SubmitErrorHandler<FormInput> = (errors) => {
        console.log("Form errors:", errors);
    }

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
                                    selectTokenA={setTokenAMetadata}
                                    selectTokenB={setTokenBMetadata}
                                    setStep={setStep}
                                />
                            }
                            {index === 1 && <Step2 onSubmit={handleManualSubmit} />}
                        </StepsContent>
                    ))}
                </StepsRoot>
                <Preview
                    tokenAMetadata={tokenAMetadata || undefined}
                    tokenBMetadata={tokenBMetadata || undefined}
                />
            </HStack>
        </FormProvider>
    )
}

interface WrapperProps extends StackProps {
    label?: ReactNode;
};
export const Wrapper = ({ label, children, ...rest }: WrapperProps) => {
    return (
        <VStack w={"full"} align={"flex-start"} gap={"4"} {...rest}>
            <Text fontSize={"2xl"} fontWeight={"semibold"} color={"fg"}>
                {label}
            </Text>
            {children}
        </VStack>
    )
}
