"use client";

import { Tooltip } from "@/components/ui/tooltip";
import { PairTokensIcon } from "@/components/utils/pair-tokens-icon";
import { BPS, RISK_FACTOR_BFS_VECTOR } from "@/constants";
import { useHyperionGetPosition } from "@/hooks/useHyperionGetPosition";
import { shortenAddress } from "@/libs/helpers";
import { LoanPosition } from "@/types/core";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Text, Box, chakra, HStack, Icon, IconButton, TableBody, TableCell, TableCellProps, TableColumnHeader, TableHeader, TableRoot, TableRootProps, TableRow } from "@chakra-ui/react";
import { LuInfo } from "react-icons/lu";

type Props = TableRootProps;
type Item = {
    address: string;
    poolAddress: string;
    riskFactor: number;
    poolApr: string;
    borrowedApr: string;
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
    ];

export const LoanPositionTable = (props: Props) => {
    const { account } = useWallet();

    const data: Item[] = [
        { // example data
            address: '0xbffb8bf4ddb170ad72db6f82b0485cb9f4576d2f2037d322461eb4d93370bac3',
            poolAddress: '0xbffb8bf4ddb170ad72db6f82b0485cb9f4576d2f2037d322461eb4d93370bac3',
            riskFactor: 2,
            poolApr: '3.5%',
            borrowedApr: '7.2%',
        }
    ];

    return (
        <TableRoot rounded={"3xl"} overflow={"clip"} shadow={"md"} {...props} >
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
                    data.map((item, index) => (
                        <TableRow key={index}>
                            {/* Loan position address */}
                            <TableCell key={"address"}>
                                {shortenAddress(item.address)}
                            </TableCell>
                            {/* Pool address */}
                            <PoolCell loanPosition={{
                                posObject: { inner: "0x08731244c7d4e0c0924d9ae89be5a67e0753ab01213a4d5a0e55ac46b2c38fd4" }
                            } as LoanPosition} />
                            {/* Risk factor */}
                            <TableCell key={"riskFactor"}>
                                {columns[2].accessorFn ? columns[2].accessorFn(item) : item.riskFactor}
                            </TableCell>
                            {/* Pool APR */}
                            <TableCell key={"poolApr"}>
                                {item.poolApr}
                            </TableCell>
                            {/* Borrowed APR */}
                            <TableCell key={"borrowedApr"}>
                                {item.borrowedApr}
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </TableRoot>
    );
}

interface PoolRowProps extends TableCellProps {
    loanPosition: LoanPosition;
}
const PoolCell = (props: PoolRowProps) => {
    const { loanPosition, ...rest } = props;
    const { account } = useWallet();
    const { posObject } = loanPosition;

    const { data: position, error } = useHyperionGetPosition({
        payload: {
            address: account?.address?.toString() || "",
            positionId: posObject.inner,
        },
        options: {
            enabled: !!account,
            refetchOnWindowFocus: false,
        }
    })

    if (!position) return <TableCell {...rest}>Loading...</TableCell>
    if (error) return <TableCell {...rest}>-</TableCell>

    return (
        <TableCell key={"poolAddress"} {...rest}>
            <HStack alignItems={"center"} gap={"3"}>
                <PairTokensIcon
                    tokenAUri={position.pool[0].token1Info.logoUrl || ""}
                    tokenBUri={position.pool[0].token2Info.logoUrl || ""}
                    tokenASymbol={position.pool[0].token1Info.symbol || ""}
                    tokenBSymbol={position.pool[0].token2Info.symbol || ""}
                />
                <Text fontWeight={"normal"}>
                    {position.pool[0].token1Info.symbol}/{position.pool[0].token2Info.symbol}
                </Text>
            </HStack>
        </TableCell>
    )
}