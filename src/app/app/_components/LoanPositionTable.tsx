"use client";

import { Tooltip } from "@/components/ui/tooltip";
import { PairTokensIcon } from "@/components/utils/pair-tokens-icon";
import { BASE_RATE_BPS, BPS, RISK_FACTOR_BFS_VECTOR } from "@/constants";
import { useGetLoanPositionById } from "@/hooks/useGetLoanPositionResource";
import { useHyperionGetPoolById } from "@/hooks/useHyperionGetPoolById";
import { useHyperionGetPoolInfo } from "@/hooks/useHyperionGetPoolInfo";
import { useHyperionGetPosition } from "@/hooks/useHyperionGetPosition";
import { useHyperionGetPositionResource } from "@/hooks/useHyperionGetPositionResource";
import { useViewLoanPosition } from "@/hooks/view/useViewLoanPosition";
import { shortenAddress } from "@/libs/helpers";
import { LoanPosition } from "@/types/core";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Text, Box, chakra, HStack, Icon, IconButton, TableBody, TableCell, TableCellProps, TableColumnHeader, TableHeader, TableRoot, TableRootProps, TableRow, TableRowProps, TableScrollArea } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { LuInfo } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

type Props = TableRootProps;
type Item = {
    address: string;
    poolAddress: string;
    riskFactor: number;
    poolApr: string;
    borrowedApr: string;
    dailyVolumeUSD?: string;
}

const columns: {
    header: string;
    accessorKey: keyof Item;
    description?: string;
    accessorFn?: (item: Item) => React.ReactNode;
}[] = [
        {
            header: 'Address',
            accessorKey: 'address',
            accessorFn: (item) => shortenAddress(item.address),
        },
        {
            header: 'Pool Address',
            accessorKey: 'poolAddress',
            accessorFn: (item) => shortenAddress(item.poolAddress),
        },
        {
            header: 'Risk Factor',
            accessorKey: 'riskFactor',
            description: 'Controls rate escalation steepness above optimal utilization',
            accessorFn: (item) => `${RISK_FACTOR_BFS_VECTOR[item.riskFactor] / BPS}`,
        },
        {
            header: 'Pool APR',
            accessorKey: 'poolApr',
        },
        {
            header: 'Borrowed APR',
            accessorKey: 'borrowedApr',
        },
        {
            header: 'Daily Volume (USD)',
            accessorKey: 'dailyVolumeUSD',
            description: 'The total trading volume in USD for the pool over the last 24 hours',
        },
    ];

export const LoanPositionTable = (props: Props) => {
    const { account } = useWallet();
    const { getAllPositions } = useViewLoanPosition()


    const { data: items, isLoading: isItemsLoading } = useQuery({
        queryKey: ['loan-positions'],
        queryFn: async () => {
            return await getAllPositions();
        },
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
    });

    return (
        <TableScrollArea rounded={"3xl"} overflow={"clip"} w={"full"} h={"full"} shadow={"md"} >
            <TableRoot {...props} >
                <TableHeader>
                    <TableRow className="dark">
                        {columns.map((column) => (
                            <TableColumnHeader key={column.accessorKey}>
                                {column.header}
                                {column.description && (
                                    <Tooltip content={column.description} positioning={{ placement: "top" }} >
                                        <IconButton size={"xs"} variant={"plain"}>
                                            <Icon color={"fg.subtle"} as={LuInfo} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </TableColumnHeader>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        isItemsLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    {[...Array(20)].map((_, idx) => (
                                        <Box key={idx} mb={"3"}>
                                            <Skeleton rounded={"xl"} height="8" width="100%" />
                                        </Box>
                                    ))}
                                </TableCell>
                            </TableRow>
                        ) : items && items.positions.length > 0 ? (
                            items.positions.map((item) => (
                                <CustomTableRow key={item} loanPositionId={item} />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <Text textAlign={"center"}>No loan positions found{account ? "" : ", connect your wallet to view"}</Text>
                                </TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
            </TableRoot>
        </TableScrollArea>
    );
}

interface PoolRowProps extends TableCellProps {
    loanPosition: LoanPosition;
}
const PoolCell = (props: PoolRowProps) => {
    const { loanPosition, ...rest } = props;
    const { posObject } = loanPosition;

    const { data: position, error } = useHyperionGetPositionResource({
        payload: {
            id: posObject.inner || "",
        },
        options: {
            queryKey: ['hyperion', 'getPositionResource', posObject.inner],
            enabled: !!posObject.inner,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
        }
    });

    const { data: poolInfo } = useHyperionGetPoolInfo({
        payload: {
            tokenA: position?.tokenA.inner || "",
            tokenB: position?.tokenB.inner || "",
            feeTier: position?.feeTier || 0,
        },
        options: {
            queryKey: ['hyperion', 'getPoolInfo', position?.tokenA.inner, position?.tokenB.inner, position?.feeTier],
            enabled: !!position,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
        }
    });

    const { data: pool } = useHyperionGetPoolById({
        payload: {
            id: poolInfo?.poolId || "",
        }, options: {
            queryKey: ['hyperion', 'getPoolById', poolInfo?.poolId],
            enabled: !!poolInfo,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
        }
    });

    if (!position) return <TableCell {...rest}>Loading...</TableCell>
    if (error) return <TableCell {...rest}>-</TableCell>

    return (
        <TableCell key={"poolAddress"} {...rest}>
            <HStack alignItems={"center"} gap={"3"}>
                <PairTokensIcon
                    tokenAUri={pool?.pool.token1Info.logoUrl || ""}
                    tokenBUri={pool?.pool.token2Info.logoUrl || ""}
                    tokenASymbol={pool?.pool.token1Info.symbol || ""}
                    tokenBSymbol={pool?.pool.token2Info.symbol || ""}
                />
                <Text fontWeight={"bold"}>
                    {pool?.pool.token1Info.symbol}/{pool?.pool.token2Info.symbol}
                </Text>
            </HStack>
        </TableCell>
    )
}

interface CustomTableRowProps extends TableRowProps {
    loanPositionId: string;
}
const CustomTableRow = (props: CustomTableRowProps) => {
    const { loanPositionId, ...rest } = props;
    const router = useRouter();
    
    const { data: loanPosition, isLoading: isLoadingLP } = useGetLoanPositionById({
        payload: {
            id: loanPositionId
        },
        options: {
            queryKey: ['loan-position-by-id', loanPositionId],
            enabled: !!loanPositionId,
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
    const item: Item | null = useMemo(() => {
        if (!loanPosition || !poolInfo) return null;

        const utilization = Number(loanPosition.utilization || "0");
        const kinkUtilization = Number(loanPosition.parameters.kinkUtilization || "0");
        const slopeBeforeKink = Number(loanPosition.parameters.slopeBeforeKink || "0") / BPS;
        const slopeAfterKink = Number(loanPosition.parameters.slopeAfterKink || "0") / BPS;
        const riskFactor = loanPosition.parameters.riskFactor || 0;
        // Formula: baseRate + (slopeBeforeKink * (utilization / kinkUtilization)) + (slopeAfterKink * ((utilization - kinkUtilization) / (1 - kinkUtilization)) ^ riskFactor)
        const borrowedApr = utilization < kinkUtilization
            ? (slopeBeforeKink * utilization / (kinkUtilization || 1))
            : ((BASE_RATE_BPS / BPS) + slopeBeforeKink + (slopeAfterKink * Math.pow(((utilization - kinkUtilization) * BPS / ((BPS - kinkUtilization) || 1)), riskFactor)));

        return {
            address: loanPositionId,
            poolAddress: poolInfo.poolId,
            riskFactor: loanPosition.parameters.riskFactor,
            poolApr: Number(pool?.feeAPR).toFixed(2) || "-",
            borrowedApr: `${Number((borrowedApr * 100)).toFixed(2)}%`,
            dailyVolumeUSD: pool?.dailyVolumeUSD,
        }
    }, [loanPosition, loanPositionId, poolInfo, pool]);

    if (isLoadingLP || isLoadingPosInfo || isLoadingPoolInfo || isLoadingPool) {
        return (
            <TableRow {...rest} >
                <TableCell colSpan={columns.length}>
                    <HStack>
                        <Skeleton rounded={"xl"} height="8" width="100%" />
                    </HStack>
                </TableCell>
            </TableRow>
        )
    }

    if (!item) return null;

    return (
        <TableRow
            transition={"all 0.25s ease-in-out"}
            cursor={"pointer"}
            _hover={{
                bg: "bg.emphasized",
            }}
            onClick={() => router.push(`/loan-positions/${loanPositionId}`)}
            {...rest}
        >
            <TableCell key={"address"}>
                {shortenAddress(loanPositionId)}
            </TableCell>
            <PoolCell loanPosition={{
                posObject: { inner: loanPosition?.posObject.inner }
            } as LoanPosition} />
            <TableCell key={"riskFactor"}>
                {columns[2].accessorFn ? columns[2].accessorFn(item) : item.riskFactor}
            </TableCell>
            <TableCell key={"poolApr"}>
                {item.poolApr}
            </TableCell>
            <TableCell key={"borrowedApr"}>
                {item.borrowedApr}
            </TableCell>
            <TableCell key={"dailyVolumeUSD"}>
                {item.dailyVolumeUSD ? `$${Number(item.dailyVolumeUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "-"}
            </TableCell>
        </TableRow>
    )
}