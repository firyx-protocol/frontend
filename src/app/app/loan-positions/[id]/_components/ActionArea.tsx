"use client";

import { DataListItem, DataListRoot } from "@/components/ui/data-list";
import { toaster } from "@/components/ui/toaster";
import { BorrowShare } from "@/components/widgets/BorrowShare";
import { SwapWidget } from "@/components/widgets/Swap";
import { BPS, DEFAULT_MIN_MAX_SCALING_BFS } from "@/constants";
import { useBorrowLiquidity } from "@/hooks/useBorrowLiquidity";
import { useDepositLiquidity } from "@/hooks/useDepositLiquidity";
import { useGetFungibleToken } from "@/hooks/useGetFungibleToken";
import { useGetFungibleTokenBalance } from "@/hooks/useGetFungibleTokenBalance";
import { useGetFungibleTokenBalances } from "@/hooks/useGetFungibleTokenBalances";
import { useGetLoanPositionById } from "@/hooks/useGetLoanPositionResource";
import { GetPoolByIdResponse, useHyperionGetPoolById } from "@/hooks/useHyperionGetPoolById";
import { GetPoolByTokenPairAndFeeTierResponse, useHyperionGetPoolInfo } from "@/hooks/useHyperionGetPoolInfo";
import { useHyperionGetPositionResource } from "@/hooks/useHyperionGetPositionResource";
import { useViewLoanPosition } from "@/hooks/view/useViewLoanPosition";
import { LoanPosition, TokenMetadata } from "@/types/core";
import { hyperion } from "@/utils/hyperion";
import { MoveVector } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ButtonProps, StackProps, TabsContent, TabsList, TabsRoot, TabsTrigger, VStack } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import numeral from "numeral";
import { useEffect, useMemo, useState } from "react";

interface Props extends StackProps {
    id: string;
}

export const ActionArea = (props: Props) => {
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
            staleTime: 1000 * 60 * 5, // 5 minutes
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
            staleTime: 1000 * 60 * 5, // 5 minutes
        }
    });

    if (!loanPosition || !positionInfo || !poolInfo || !pool) {
        return null;
    }

    return (
        <VStack
            w={"full"}
            flex={1}
            {...props}
        >
            <TabsRoot w={"full"} defaultValue="deposit">
                <TabsList>
                    <TabsTrigger value="deposit">
                        Deposit
                    </TabsTrigger>
                    <TabsTrigger value="borrow">
                        Borrow
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="deposit">
                    <DepositWidget
                        loanPositionId={id}
                        loanPosition={loanPosition}
                        pool={pool}
                        poolInfo={poolInfo}
                    />
                </TabsContent>
                <TabsContent value="borrow">
                    <BorrowShareWidget
                        id={id}
                        loanPos={loanPosition}
                    />
                </TabsContent>
            </TabsRoot>
        </VStack>
    );
}

interface DepositWidgetProps extends Omit<StackProps, 'children'> {
    loanPositionId: string;
    loanPosition: LoanPosition;
    pool: GetPoolByIdResponse;
    poolInfo: GetPoolByTokenPairAndFeeTierResponse;
}
export const DepositWidget = ({
    loanPositionId,
    loanPosition,
    pool,
    poolInfo,
    ...props
}: DepositWidgetProps) => {
    const { account } = useWallet();
    const queryClient = useQueryClient();

    // Raw values (10^8 format)
    const [rawAmountA, setRawAmountA] = useState<string>("");
    const [rawAmountB, setRawAmountB] = useState<string>("");

    // Display values (human readable)
    const [displayAmountA, setDisplayAmountA] = useState<string>("");
    const [displayAmountB, setDisplayAmountB] = useState<string>("");

    const { mutateAsync: depositLiquidiy } = useDepositLiquidity({
        options: {
            onSuccess: () => {
                setRawAmountA("");
                setRawAmountB("");
                setDisplayAmountA("");
                setDisplayAmountB("");

                queryClient.invalidateQueries();

                console.log("Liquidity deposited successfully");
                toaster.success({
                    title: "Success",
                    description: "Liquidity deposited successfully",
                });
            },
            onError: (error) => {
                toaster.error({
                    title: "Error",
                    description: error.message,
                })
            }
        }
    });

    const { data: balances } = useGetFungibleTokenBalances({
        payload: {
            owner: account?.address.toString() || "",
            asset_types: [
                poolInfo?.token1 || "",
                poolInfo?.token2 || "",
            ]
        },
        options: {
            queryKey: ['get-fungible-token-balances', account?.address.toString(), poolInfo?.token1, poolInfo?.token2],
            enabled: !!account?.address && !!poolInfo,
            refetchOnWindowFocus: false,
        }
    });

    const { data: liquidityAndOptimalAmountB, isLoading: isLoadingQuote } = useQuery({
        queryKey: ['hyperion', 'getSwapQuote', pool.id, rawAmountA],
        queryFn: async () => {
            if (!pool || !rawAmountA) return;
            // Use raw amount directly (already in 10^8 format)
            console.log({
                currencyA: pool.pool.token1,
                currencyB: pool.pool.token2,
                currencyAAmount: rawAmountA,
                currentPriceTick: Number(pool.pool.currentTick),
                feeTierIndex: pool.pool.feeTier,
                tickLower: loanPosition.parameters.tickLower,
                tickUpper: loanPosition.parameters.tickUpper,
            })

            const amount = await hyperion.Pool.estCurrencyBAmountFromA({
                tickLower: loanPosition.parameters.tickLower,
                tickUpper: loanPosition.parameters.tickUpper,
                currentPriceTick: Number(pool.pool.currentTick),
                currencyA: pool.pool.token1,
                currencyB: pool.pool.token2,
                feeTierIndex: pool.pool.feeTier,
                currencyAAmount: rawAmountA,
            });

            return amount;
        },
        enabled: !!pool && !!rawAmountA,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    const tokenAWithBalance: TokenMetadata & { balance: string } = useMemo(() => ({
        name: pool?.pool.token1Info.name,
        symbol: pool?.pool.token1Info.symbol,
        logoUri: pool?.pool.token1Info.logoUrl,
        decimals: pool?.pool.token1Info.decimals,
        balance: balances ? BigNumber(balances[0].amount)
            .dividedBy(BigNumber(10).pow(pool?.pool.token1Info.decimals || 0))
            .toString() : "0"
    }), [pool, balances]);

    const tokenBWithBalance: TokenMetadata & { balance: string } = useMemo(() => ({
        name: pool?.pool.token2Info.name,
        symbol: pool?.pool.token2Info.symbol,
        logoUri: pool?.pool.token2Info.logoUrl,
        decimals: pool?.pool.token2Info.decimals,
        balance: balances ? BigNumber(balances[1].amount)
            .dividedBy(BigNumber(10).pow(pool?.pool.token2Info.decimals || 0))
            .toString() : "0"
    }), [pool, balances]);

    // Handle display value change for token A
    const handleDisplayAmountAChange = (displayValue: string) => {
        setDisplayAmountA(displayValue);

        // Convert display value to raw value (multiply by 10^decimals)
        const rawValue = displayValue ?
            BigNumber(displayValue)
                .multipliedBy(BigNumber(10).pow(pool?.pool.token1Info.decimals || 0))
                .toFixed(0)
            : "";

        setRawAmountA(rawValue);
    };

    useEffect(() => {
        if (!liquidityAndOptimalAmountB || !tokenBWithBalance) return;

        const [_liquidity, optimalAmountB] = liquidityAndOptimalAmountB;

        // Set raw amount B
        setRawAmountB(optimalAmountB?.toString() || "");

        // Convert to display value (divide by 10^decimals)
        const displayValue = optimalAmountB ?
            BigNumber(optimalAmountB.toString())
                .dividedBy(BigNumber(10).pow(pool?.pool.token2Info.decimals || 0))
                .toString()
            : "";

        setDisplayAmountB(displayValue);
    }, [liquidityAndOptimalAmountB, tokenBWithBalance, pool]);

    const handleDeposit = async () => {
        await depositLiquidiy({
            positionAddress: loanPositionId,
            tokenA: poolInfo.token1,
            tokenB: poolInfo.token2,
            amountA: Number(rawAmountA || 0),
            amountB: Number(rawAmountB || 0),
            amountAMin: rawAmountA ? BigNumber(rawAmountA).multipliedBy(1 - DEFAULT_MIN_MAX_SCALING_BFS / BPS).integerValue().toNumber() : 0,
            amountBMin: rawAmountB ? BigNumber(rawAmountB).multipliedBy(1 - DEFAULT_MIN_MAX_SCALING_BFS / BPS).integerValue().toNumber() : 0,
        })
    };

    return (
        <SwapWidget
            tokenA={tokenAWithBalance}
            tokenB={tokenBWithBalance}
            tokenAAmount={displayAmountA}
            tokenBAmount={displayAmountB}
            onTokenAAmountChange={handleDisplayAmountAChange}
            tokenBInputProps={{
                readOnly: true,
            }}
            isLoading={isLoadingQuote}
            loadingText="Calculating..."
            actionButtonText="Deposit"
            onAction={handleDeposit}
        />
    )
}

const calculateAmount = (share: string, total: string) => {
    return BigNumber(share)
        .times(total)
        .dividedToIntegerBy(100)
};

interface BorrowShareProps {
    id: string;
    loanPos: LoanPosition;
}

export const BorrowShareWidget = (props: BorrowShareProps) => {
    const { id, loanPos } = props;
    const queryClient = useQueryClient();

    const [share, setShare] = useState<string>("25");
    const [durationIdx, setDurationIdx] = useState<number>(0);

    const { mutate: borrowLiquidity, isPending: isPendingBorrow } = useBorrowLiquidity({
        options: {
            onSuccess: () => {
                setShare("25");
                setDurationIdx(0);

                queryClient.invalidateQueries();
                
                toaster.success({
                    title: "Success",
                    description: "Liquidity borrowed successfully",
                });
            },
            onError: (error) => {
                toaster.error({
                    title: "Error",
                    description: error.message,
                })
            }
        }
    });
    const { calculateReserve } = useViewLoanPosition();

    const { data: reserve, isLoading: isLoadingReserve } = useQuery({
        queryKey: ['calculate-reserve', share, durationIdx, id, loanPos],
        queryFn: async () => {
            const reserve = await calculateReserve(
                id,
                calculateAmount(share, loanPos.liquidity).toString(),
                durationIdx
            );

            return reserve;
        },
        enabled: !!share,
        refetchOnWindowFocus: false,
    });

    const { data: tokenFeeInfo } = useGetFungibleToken({
        payload: {
            asset_type: loanPos.parameters.tokenFee.inner,
        }
    });

    const metadataItems = useMemo(() => ([
        {
            label: "Reserve Amount",
            value: `${numeral(BigNumber(reserve || "0").dividedBy(BigNumber(10).pow(tokenFeeInfo?.decimals || 8)).toNumber()).format(`0,0.0000`)} ${tokenFeeInfo?.symbol?.toUpperCase()}`,
        },
    ]), [reserve, tokenFeeInfo]);

    const handleAction = () => {
        borrowLiquidity({
            positionAddress: id,
            amount: calculateAmount(share, loanPos.liquidity).toNumber(),
            durationIndex: durationIdx,
            tokenFee: loanPos.parameters.tokenFee.inner,
        })
    };
    return (
        <VStack h={"full"}>
            <BorrowShare
                amount={Number(share) >= 100 ? "99" : share}
                maxAmount={(
                    Number(loanPos.availableBorrow) / Number(loanPos.liquidity) * 100
                ).toFixed(2)}
                selectedDurationIdx={durationIdx}
                onAmountChange={setShare}
                onDurationChange={setDurationIdx}
                onAction={handleAction}
                buttonProps={{
                    loading: isLoadingReserve || isPendingBorrow,
                    loadingText: isPendingBorrow ? "Processing..." : "Calculating...",
                    disabled: !share || isLoadingReserve,
                }}
            />
            <DataListRoot w={"full"} orientation={"horizontal"}>
                {metadataItems.map((item, index) => (
                    <DataListItem
                        key={index}
                        label={item.label}
                        value={item.value}
                        info={"This is some additional info about the item."}
                        justifyContent={"space-between"}
                    />
                ))}
            </DataListRoot>
        </VStack>
    )
}