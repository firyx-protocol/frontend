"use client";

import { Text, HStack, StackProps, VStack, StepsTitle, Icon } from "@chakra-ui/react";
import { SelectTokenButton } from "./SelectTokenButton";
import { ReactNode, useState } from "react";
import { StepsContent, StepsIndicator, StepsItem, StepsList, StepsRoot } from "@/components/ui/steps";
import { HiCheck } from "react-icons/hi2";
import { CreateLoanPositionPayload } from "@/hooks/useCreateLoanPosition";
import { useForm } from "react-hook-form";

type Props = StackProps;

interface Steps1Props extends StackProps { }
const Step1 = (props: Steps1Props) => {
    return (
        <VStack w={"full"} h={"full"} gap={"8"} {...props}>
            <Wrapper label="Select pair tokens" w={"full"}>
                <HStack w={"full"} gap={"6"}>
                    <SelectTokenButton />
                    <SelectTokenButton />
                </HStack>
            </Wrapper>
        </VStack>
    )
}

interface Steps2Props extends StackProps { }
const Step2 = (props: Steps2Props) => {
    return (
        <></>
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
    const [step, setStep] = useState(0)
    const {
        register, handleSubmit,
        formState: { errors },
        watch,
        setValue,
        getValues, control,
    } = useForm<FormInput>();

    return (
        <VStack w={"full"} h={"full"} {...props}>
            <StepsRoot
                step={step}
                onStepChange={(e) => setStep(e.step)}
                count={steps.length}
                colorPalette={"primary"}
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
                        <s.component />
                    </StepsContent>
                ))}
            </StepsRoot>
        </VStack>
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