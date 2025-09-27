"use client";

import { toaster } from "@/components/ui/toaster";
import { SwapWidget } from "@/components/widgets/Swap";
import { BPS, DEFAULT_MIN_MAX_SCALING_BFS } from "@/constants";
import { useDepositLiquidity } from "@/hooks/useDepositLiquidity";
import { useGetFungibleTokenBalance } from "@/hooks/useGetFungibleTokenBalance";
import { useGetFungibleTokenBalances } from "@/hooks/useGetFungibleTokenBalances";
import { useGetLoanPositionById } from "@/hooks/useGetLoanPositionResource";
import { GetPoolByIdResponse, useHyperionGetPoolById } from "@/hooks/useHyperionGetPoolById";
import { GetPoolByTokenPairAndFeeTierResponse, useHyperionGetPoolInfo } from "@/hooks/useHyperionGetPoolInfo";
import { useHyperionGetPositionResource } from "@/hooks/useHyperionGetPositionResource";
import { LoanPosition, TokenMetadata } from "@/types/core";
import { hyperion } from "@/utils/hyperion";
import { MoveVector } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { StackProps, VStack } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { useEffect, useMemo, useState } from "react";

interface Props extends StackProps {
    id: string;
}

export const ActionArea = (props: Props) => {
    const { id } = props;

    const { account } = useWallet();

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
            flex={1}
            {...props}
        >
            <BorrowSwapWidget
                loanPositionId={id}
                loanPosition={loanPosition}
                pool={pool}
                poolInfo={poolInfo}
            />
        </VStack>
    );
}

interface BorrowSwapWidgetProps extends Omit<StackProps, 'children'> {
    loanPositionId: string;
    loanPosition: LoanPosition;
    pool: GetPoolByIdResponse;
    poolInfo: GetPoolByTokenPairAndFeeTierResponse;
}
export const BorrowSwapWidget = ({
    loanPositionId,
    loanPosition,
    pool,
    poolInfo,
    ...props
}: BorrowSwapWidgetProps) => {
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
            const amount = await hyperion.Pool.estCurrencyBAmountFromA({
                currencyA: pool.pool.token1,
                currencyB: pool.pool.token2,
                currencyAAmount: rawAmountA,
                currentPriceTick: Number(pool.pool.currentTick),
                feeTierIndex: pool.pool.feeTier,
                tickLower: loanPosition.parameters.tickLower,
                tickUpper: loanPosition.parameters.tickUpper,
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