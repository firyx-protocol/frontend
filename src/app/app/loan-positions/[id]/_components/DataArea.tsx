"use client";

import { PairTokensIcon } from "@/components/utils/pair-tokens-icon";
import { APTOS_EXPLORER_URL, BPS } from "@/constants";
import { useGetLoanPositionById } from "@/hooks/useGetLoanPositionResource";
import { useHyperionGetPoolById } from "@/hooks/useHyperionGetPoolById";
import { useHyperionGetPoolInfo } from "@/hooks/useHyperionGetPoolInfo";
import { useHyperionGetPositionResource } from "@/hooks/useHyperionGetPositionResource";
import { shortenAddress } from "@/libs/helpers";
import { LoanPosition } from "@/types/core";
import { HStack, Link, StackProps, Text, VStack } from "@chakra-ui/react";
import numeral from "numeral";
import BigNumber from "bignumber.js";

interface Props extends StackProps {
    id: string;
}
export const DataArea = (props: Props) => {
    const { id } = props;

    const { data: loanPosition } = useGetLoanPositionById({
        payload: {
            id,
        },
        options: {
            queryKey: ["loan-position", id],
            enabled: !!id,
            refetchOnWindowFocus: false,
        }
    });

    const { data: positionInfo, isLoading: isLoadingPosInfo } = useHyperionGetPositionResource({
        payload: {
            id: loanPosition?.posObject.inner || "",
        },
        options: {
            queryKey: ['hyperion', 'getPositionResource', loanPosition?.posObject.inner],
            enabled: !!loanPosition,
            refetchOnWindowFocus: false,
        }
    });

    const { data: poolInfo, isLoading: isLoadingPoolInfo } = useHyperionGetPoolInfo({
        payload: {
            tokenA: positionInfo?.tokenA.inner || "",
            tokenB: positionInfo?.tokenB.inner || "",
            feeTier: positionInfo?.feeTier || 0,
        },
        options: {
            queryKey: ['hyperion', 'getPoolInfo', positionInfo?.tokenA.inner, positionInfo?.tokenB.inner, positionInfo?.feeTier],
            enabled: !!positionInfo,
            refetchOnWindowFocus: false,
        }
    });

    const { data: pool, isLoading: isLoadingPool } = useHyperionGetPoolById({
        payload: {
            id: poolInfo?.poolId || "",
        }, options: {
            queryKey: ['hyperion', 'getPoolById', poolInfo?.poolId],
            enabled: !!poolInfo,
            refetchOnWindowFocus: false,
        }
    });

    if (!loanPosition || !positionInfo || !poolInfo || !pool) {
        return null;
    }

    return (
        <VStack
            flex={1}
            gap={"6"}
            height={"full"}
            {...props}
        >
            <HStack w={"full"}>
                <PairTokensIcon
                    tokenAUri={pool?.pool.token1Info.logoUrl}
                    tokenBUri={pool?.pool.token2Info.logoUrl}
                    tokenASymbol={pool?.pool.token1Info.symbol}
                    tokenBSymbol={pool?.pool.token2Info.symbol}
                    w={"8"}
                    h={"8"}
                />
                <Text fontSize={"4xl"} fontWeight={"extrabold"}>
                    {pool?.pool.token1Info.symbol}-{pool?.pool.token2Info.symbol}
                </Text>
            </HStack>

            <HStack w={"full"} justifyContent={"start"} gap={"4"}>
                <HStack gap={"4"}>
                    <Text color={"fg.subtle"}>
                        Loan position:
                    </Text>
                    <Link
                        color={"fg.subtle"}
                        href={`${APTOS_EXPLORER_URL}/object/${id}`}
                        target="_blank"
                    >
                        {shortenAddress(id)}
                    </Link>
                </HStack>
                <HStack gap={"4"}>
                    <Text color={"fg.subtle"}>
                        Pool:
                    </Text>
                    <Link
                        color={"fg.subtle"}
                        href={`${APTOS_EXPLORER_URL}/object/${id}`}
                        target="_blank"
                    >
                        {shortenAddress(poolInfo.poolId)}
                    </Link>
                </HStack>
            </HStack>
            <DetailsPanel loanPos={loanPosition} />
        </VStack>
    )
}

interface DetailsPanelProps extends StackProps {
    loanPos: LoanPosition;
}
const DetailsPanel = (props: DetailsPanelProps) => {
    const { loanPos } = props;
    
    const items = [
        {
            label: "Liquidity",
            value: numeral(loanPos.liquidity).format('0.[00]a').toUpperCase(),
            
        },
        {
            label: "Total Borrowed",
            value: numeral(BigNumber(loanPos.totalBorrowed).dividedBy(1e8).toString()).format('0.[00]a').toUpperCase(),
        },
        {
            label: "Available Borrow",
            value: numeral(BigNumber(loanPos.availableBorrow).dividedBy(1e8).toString()).format('0.[00]a').toUpperCase(),
        },
        {
            label: "Utilization Rate",
            value: (BigNumber(loanPos.utilization).dividedBy(BPS).toString()),
        },
        {
            label: "Risk Factor",
            value: loanPos.parameters.riskFactor
        }
    ];

    return (
        <VStack
            bg={"bg.panel"}
            p={"1"}
            rounded={"3xl"}
            shadow={"sm"}
            w={"full"}
            height={"fit"}
            align={"start"}
            {...props}
        >
            <HStack px={"2"} py={"1"}>
                <Text fontSize={"md"} fontWeight={"semibold"} textTransform="uppercase"># Details</Text>
            </HStack>
            <HStack w={"full"} rounded={"3xl"} p={"4"} bg={"bg.subtle"} shadow={"xs"} justify={"space-between"}>
                {items.map((item, index) => (
                    <VStack key={index} alignItems={"start"} gap={"1"}>
                        <Text fontSize={"sm"} color={"fg.subtle"}>{item.label}</Text>
                        <Text fontSize={"lg"} fontWeight={"extrabold"}>
                            {item.value}
                            {item.label === "Utilization" ? "%" : ""}
                        </Text>
                    </VStack>
                ))}
            </HStack>
        </VStack >
    )
}