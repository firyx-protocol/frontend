import { HStack, HtmlProps } from "@chakra-ui/react";
import { CreateLoanPositionButton } from "./CreateLoanPositionButton";

type Props = HtmlProps;

export const Toolbar = (props: Props) => {
    return (
        <HStack w={"full"} {...props}>
            <CreateLoanPositionButton />
        </HStack>
    );
}