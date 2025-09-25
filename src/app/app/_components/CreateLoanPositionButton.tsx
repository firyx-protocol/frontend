"use client";

import { Button, ButtonProps, Icon } from "@chakra-ui/react";
import { } from "next/font/google";
import { useRouter } from "next/navigation";
import { TiPlus } from "react-icons/ti";

type Props = ButtonProps;

export const CreateLoanPositionButton = (props: Props) => {
    const router = useRouter();

    const handleClick = () => {
        router.push('/create-loan-position');
    }

    return (
        <Button onClick={handleClick} {...props}>
            Create Loan Position
            <Icon as={TiPlus} />
        </Button>
    )
}