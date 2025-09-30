import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { APTOS_EXPLORER_URL, DURATION_YEAR_VECTOR_BPS } from "@/constants";
import { useDepositSlotClaimYield } from "@/hooks/useDepositSlotClaimYield";
import { useGetDepositSlotById } from "@/hooks/useGetDepositSlotResource";
import { useHyperionGetPoolById } from "@/hooks/useHyperionGetPoolById";
import { useHyperionGetPoolInfo } from "@/hooks/useHyperionGetPoolInfo";
import { useHyperionGetPositionResource } from "@/hooks/useHyperionGetPositionResource";
import { useViewDepositSlot } from "@/hooks/view/useViewDepositSlot";
import { shortenAddress } from "@/libs/helpers";
import { LoanPosition } from "@/types/core";
import { Button, Center, HStack, Link, StackProps, Text, VStack } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";
import numeral from "numeral";

interface Props extends Omit<StackProps, 'filter'> {
    id: string;
    loanPos: LoanPosition;
    filter?: {
        loanPosId?: string;
        active?: boolean;
    }
};

export const DepositSlotCard = ({
    id,
    loanPos,
    filter,
    ...rest
}: Props) => {
    const queryClient = useQueryClient();
    const { calculatePendingYield } = useViewDepositSlot();
    const { mutate: claim, isPending: isPendingClaim } = useDepositSlotClaimYield({
        options: {
            onSuccess: () => {
                toaster.success({
                    title: "Claim yield successfully",
                    description: "Your yield has been claimed successfully",
                })
            },
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ['loan-position', 'deposit-slot', 'calculate-pending-yield', id] });
            }
        }
    })
    const { data: depositSlot, isLoading: isLoadingDeposit } = useGetDepositSlotById({
        payload: {
            id: id
        },
        options: {
            queryKey: ['loan-position', 'deposit-slot', id],
            enabled: !!id,
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
        }
    });
    const { data = {
        yieldAmount: "0",
        totalFeeA: "0",
        totalFeeB: "0",
        rewardAssetsCount: "0"
    }, isLoading: isCalculatingYield } = useQuery({
        queryKey: ['loan-position', 'deposit-slot', 'calculate-pending-yield', id],
        queryFn: async () => {
            const res = await calculatePendingYield(loanPos.id, id);

            return res;
        },
        enabled: !!calculatePendingYield && !!id && !!loanPos,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
    });

    const { data: positionInfo, isLoading: isLoadingPosInfo } = useHyperionGetPositionResource({
        payload: {
            id: loanPos?.posObject.inner || "",
        },
        options: {
            queryKey: ['hyperion', 'getPositionResource', loanPos?.posObject.inner],
            enabled: !!loanPos,
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

    if (!depositSlot) return null;
    if (!pool || !positionInfo) return null;

    if (filter) {
        if (filter.loanPosId && depositSlot.loanPosAddr !== filter.loanPosId) return null;
    };

    return (
        <HStack bg={"bg.subtle"} rounded={"2xl"} shadow={"sm"} w={"full"} h={"fit"} gap={"1"} {...rest}>
            <Text
                fontSize={"md"}
                fontWeight={"extrabold"}
                color={"fg.subtle"}
                textTransform={"uppercase"}
                transform="rotate(-90deg)"
                transformOrigin="center"
                whiteSpace="nowrap"
            >
                Deposit
            </Text>
            <HStack bg={"bg.panel"} shadow={"sm"} rounded={"2xl"} w={"full"} h={"full"} p={"2"}>
                <Center
                    h={"full"}
                    p={"2"}
                    aspectRatio={"1/1"}
                    rounded={"2xl"}
                    bg={"linear-gradient(0deg, #000 0%, #EE5047 15.29%, #F1ED0E 39.42%, #37DAFA 62.98%, #7F69F9 87.38%)"}
                >
                    <Text
                        color={"white"}
                        fontSize={"md"}
                        fontWeight={"extrabold"}
                        textAlign={"center"}
                        w={"fit"}
                        textShadow={"sm"}
                    >
                        {numeral(BigNumber(depositSlot.share).multipliedBy(100).dividedBy(loanPos.liquidity)).format("0,0.[00]")}%
                    </Text>
                </Center>
                <VStack align={"start"} w={"full"}>
                    <HStack w={"full"} justify={"space-between"}>
                        <Link
                            href={`${APTOS_EXPLORER_URL}/account/${id}`}
                            variant={"plain"}
                            fontWeight={"medium"}
                        >
                            {shortenAddress(id)}
                        </Link>
                    </HStack>
                    <HStack w={"full"} justify={"space-between"}>
                        <Button
                            size={"xs"}
                            loading={isPendingClaim}
                            loadingText={"Claiming"}
                            disabled={isPendingClaim || BigNumber(data?.totalFeeA || "0").isZero() && BigNumber(data?.totalFeeB || "0").isZero()}
                            onClick={() => claim({
                                depositSlotAddress: id,
                                positionAddress: loanPos.id
                            })}
                        >
                            Claim
                        </Button>
                        <Field
                            w={"fit"}
                            orientation={"vertical"}
                            label={"Pending Yield"}
                        >
                            <HStack>
                                <Text fontSize={"sm"} fontWeight={"bold"} color={"fg"}>
                                    {isCalculatingYield ? "..." : BigNumber(data?.totalFeeA || "0").dividedBy(BigNumber(10 ** pool.pool.token1Info.decimals)).decimalPlaces(2).toString()} {pool?.pool.token1Info.symbol || "A"}
                                </Text>
                                <Text fontSize={"sm"} fontWeight={"bold"} color={"fg"}>
                                    {isCalculatingYield ? "..." : BigNumber(data?.totalFeeB || "0").dividedBy(BigNumber(10 ** pool.pool.token2Info.decimals)).decimalPlaces(2).toString()} {pool?.pool.token2Info.symbol || "B"}
                                </Text>
                            </HStack>
                        </Field>
                    </HStack>
                </VStack>
            </HStack>
        </HStack>
    )
}