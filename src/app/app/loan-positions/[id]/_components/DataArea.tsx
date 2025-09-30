"use client";

import { PairTokensIcon } from "@/components/utils/pair-tokens-icon";
import { APTOS_EXPLORER_URL, BASE_RATE_BPS, BPS } from "@/constants";
import { useGetLoanPositionById } from "@/hooks/useGetLoanPositionResource";
import { useHyperionGetPoolById } from "@/hooks/useHyperionGetPoolById";
import { useHyperionGetPoolInfo } from "@/hooks/useHyperionGetPoolInfo";
import { useHyperionGetPositionResource } from "@/hooks/useHyperionGetPositionResource";
import { shortenAddress } from "@/libs/helpers";
import { LoanPosition } from "@/types/core";
import { HStack, Link, StackProps, TabsContent, TabsList, TabsRoot, TabsTrigger, Text, VStack, Skeleton } from "@chakra-ui/react";
// Skeleton loading component
const GeneralSkeleton = () => (
    <Skeleton rounded={"2xl"} w={"full"} h={"full"} />
);
import numeral from "numeral";
import BigNumber from "bignumber.js";
import { useViewDepositSlot } from "@/hooks/view/useViewDepositSlot";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { DepositSlotCard } from "./DepositSlotCard";
import { useViewLoanSlot } from "@/hooks/view/useViewLoanSlot";
import { LoanSlotCard } from "./LoanSlotCard";
import { useEffect, useMemo } from "react";

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
        }
    });

    const { data: positionInfo, isLoading: isLoadingPosInfo } = useHyperionGetPositionResource({
        payload: {
            id: loanPosition?.posObject.inner || "",
        },
        options: {
            queryKey: ['hyperion', 'getPositionResource', loanPosition?.posObject.inner],
            enabled: !!loanPosition,
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
        }
    });

    const { data: pool, isLoading: isLoadingPool } = useHyperionGetPoolById({
        payload: {
            id: poolInfo?.poolId || "",
        }, options: {
            queryKey: ['hyperion', 'getPoolById', poolInfo?.poolId],
            enabled: !!poolInfo,
        }
    });

    const borrowApr = useMemo(() => {
        if (!loanPosition || !poolInfo) {
            return 0;
        }

        const utilization = Number(loanPosition.utilization || "0");
        const kinkUtilization = Number(loanPosition.parameters.kinkUtilization || "0");
        const slopeBeforeKink = Number(loanPosition.parameters.slopeBeforeKink || "0") / BPS;
        const slopeAfterKink = Number(loanPosition.parameters.slopeAfterKink || "0") / BPS;
        const riskFactor = loanPosition.parameters.riskFactor || 0;
        // Formula: baseRate + (slopeBeforeKink * (utilization / kinkUtilization)) + (slopeAfterKink * ((utilization - kinkUtilization) / (1 - kinkUtilization)) ^ riskFactor)
        const borrowedApr = utilization < kinkUtilization
            ? (slopeBeforeKink * utilization / (kinkUtilization || 1))
            : ((BASE_RATE_BPS / BPS) + slopeBeforeKink + (slopeAfterKink * Math.pow(((utilization - kinkUtilization) * BPS / ((BPS - kinkUtilization) || 1)), riskFactor)));

        return borrowedApr * 100;
    }, [loanPosition, poolInfo]);

    if (!loanPosition || !positionInfo || !poolInfo || !pool) {
        return <GeneralSkeleton />;
    }

    return (
        <VStack
            flex={1}
            gap={"6"}
            w={"full"}
            h={"full"}
            overflow={"auto"}
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
                        href={`${APTOS_EXPLORER_URL}/object/${poolInfo.poolId}`}
                        target="_blank"
                    >
                        {shortenAddress(poolInfo.poolId)}
                    </Link>
                </HStack>
            </HStack>
            <DetailsAprPanel
                depositApr={Number(pool.feeAPR || Math.random()) / BPS * 100}
                borrowApr={borrowApr / BPS * 100}
                w={"full"}
            />
            <DetailsPanel loanPos={loanPosition} />
            <TabsRoot w={"full"} h={"full"} defaultValue="deposit-slots">
                <TabsList>
                    <TabsTrigger value="deposit-slots">
                        Deposit Slots
                    </TabsTrigger>
                    <TabsTrigger value="loan-slots">
                        Loan Slots
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="deposit-slots" w="full">
                    <OwnDepositSlots loanPos={loanPosition} />
                </TabsContent>
                <TabsContent value="loan-slots" w="full">
                    <OwnLoanSlots loanPos={loanPosition} />
                </TabsContent>
            </TabsRoot>
        </VStack>
    )
}
interface DetailsAprPanelProps extends StackProps {
    depositApr: number;
    borrowApr: number;
}
const DetailsAprPanel = (props: DetailsAprPanelProps) => {
    const { depositApr, borrowApr } = props;

    const items = [
        {
            label: "Deposit APR",
            value: numeral(depositApr).format('0.[00]%'),
        },
        {
            label: "Borrow APR",
            value: numeral(borrowApr).format('0.[00]%'),
        },
    ];

    return (
        <VStack
            bg={"primary.subtle"}
            p={"1"}
            rounded={"3xl"}
            shadow={"sm"}
            w={"full"}
            height={"fit"}
            align={"start"}
            {...props}
        >
            <HStack px={"2"} py={"1"}>
                <Text fontSize={"md"} fontWeight={"semibold"} textTransform="uppercase" color={"primary.fg"}># APR</Text>
            </HStack>
            <HStack w={"full"} rounded={"3xl"} p={"4"} bg={"primary.solid"} shadow={"xs"} justify={"space-between"}>
                {items.map((item, index) => (
                    <VStack key={index} alignItems={"start"} gap={"1"}>
                        <Text fontSize={"sm"} color={"primary.subtle"}>{item.label}</Text>
                        <Text fontSize={"2xl"} color={"primary.contrast"} fontWeight={"extrabold"}>
                            {numeral(item.value).format('0.[00]%')}
                        </Text>
                    </VStack>
                ))}
            </HStack>
        </VStack >
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
            value: numeral(BigNumber(loanPos.totalBorrowed).toString()).format('0.[00]a').toUpperCase(),
        },
        {
            label: "Available Borrow",
            value: numeral(BigNumber(loanPos.availableBorrow).dividedBy(loanPos.liquidity).toString()).format('0.[00]a%').toUpperCase(),
        },
        {
            label: "Utilization Rate",
            // value: (BigNumber(loanPos.utilization).dividedBy(BPS).multipliedBy(100).toString()),
            value: numeral(BigNumber(loanPos.utilization).dividedBy(BPS).toString()).format('0.[00]%'),
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

interface OwnDepositSlotsProps extends StackProps {
    loanPos: LoanPosition;
}

const OwnDepositSlots = (props: OwnDepositSlotsProps) => {
    const { loanPos } = props;
    const { account } = useWallet();
    const { getDepositSlots } = useViewDepositSlot()
    const { data: depositSlots, isLoading: isLoadingDepositSlots } = useQuery({
        queryKey: ['loan-position', 'deposit-slots', loanPos.posObject.inner],
        queryFn: async () => {
            if (!account?.address) {
                return [];
            }

            const result = await getDepositSlots({
                accountAddress: account.address.toString(),
            })

            return result;
        },
        enabled: !!loanPos,
        staleTime: Infinity,
    });

    if (isLoadingDepositSlots) {
        return <GeneralSkeleton />;
    };

    return (
        <VStack
            p={"1"}
            w={"full"}
            height={"fit"}
            align={"start"}
            {...props}
        >
            {depositSlots && depositSlots.length > 0 ? (
                <>
                    {depositSlots.map((slot, index) => (
                        <DepositSlotCard
                            key={index}
                            id={slot}
                            loanPos={loanPos}
                            filter={{
                                loanPosId: loanPos.id,
                            }}
                        />
                    ))}
                </>
            ) : (
                <Text px={"4"} py={"2"}>You have no deposit slots in this loan position.</Text>
            )}
        </VStack>
    );
}

interface OwnLoanSlotsProps extends StackProps {
    loanPos: LoanPosition;
}
const OwnLoanSlots = (props: OwnLoanSlotsProps) => {
    const { loanPos } = props;
    const { account } = useWallet();
    const { getLoanSlots } = useViewLoanSlot()
    const { data: loanSlots, isLoading: isLoadingLoanSlots } = useQuery({
        queryKey: ['loan-position', 'loan-slots', loanPos.posObject.inner],
        queryFn: async () => {
            if (!account?.address) {
                return [];
            }

            const result = await getLoanSlots({
                accountAddress: account.address.toString(),
            })

            return result;
        },
        enabled: !!loanPos && !!account,
        staleTime: Infinity,
    });

    if (isLoadingLoanSlots) {
        return <GeneralSkeleton />;
    }
    if (!loanSlots || loanSlots.length === 0) {
        return <Text px={"4"} py={"2"}>You have no loan slots in this loan position.</Text>;
    }
    return (
        <VStack
            p={"1"}
            w={"full"}
            height={"fit"}
            align={"start"}
            {...props}
        >
            {loanSlots.map((slot, index) => (
                <LoanSlotCard
                    key={index}
                    id={slot}
                    loanPos={loanPos}
                    filter={{
                        loanPosId: loanPos.id,
                    }}
                />
            ))}
        </VStack>
    );
}