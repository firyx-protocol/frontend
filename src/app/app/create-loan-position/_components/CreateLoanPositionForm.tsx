import { BoxProps, StackProps, VStack } from "@chakra-ui/react";
import { SelectTokenButton } from "./SelectTokenButton";

type Props = StackProps;

export const CreateLoanPositionForm = (props: Props) => {

    return (
        <VStack w={"full"} h={"full"} {...props}>
            <SelectTokenButton />
        </VStack>
    )
}