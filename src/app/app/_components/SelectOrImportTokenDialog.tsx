"use client";

import { DialogBody, DialogContent, DialogRoot, DialogTrigger } from "@/components/ui/dialog";
import { useWallet, } from "@aptos-labs/wallet-adapter-react";
import { Box, BoxProps, DialogHeader, DialogRootProps, HStack, Image, Link, Text, VStack } from "@chakra-ui/react";
import { BUILT_IN_TOKEN_INFO_LIST } from "../data/built-in";
import { BigNumber } from "bignumber.js";
import { useGetFungibleToken } from "@/hooks/useGetFungibleToken";
import { useGetFungibleTokenBalance } from "@/hooks/useGetFungibleTokenBalance";
import { ClipboardIconButton, ClipboardRoot } from "@/components/ui/clipboard";
import { shortenAddress } from "@/libs/helpers";
import { APTOS_EXPLORER_URL } from "@/constants";
import { useState } from "react";
import { TokenMetadata } from "@/types/core";

interface SelectOrImportTokenDialogProps extends DialogRootProps {
    /** Callback when a token is selected */
    onTokenSelect?: (tokenData: TokenMetadata & { asset_type: string }) => void;
    /** Currently selected token */
    selectedToken?: TokenMetadata & { asset_type: string };
    /** Whether to show balance information */
    showBalance?: boolean;
    /** Whether to close dialog after selection */
    closeOnSelect?: boolean;
}

export const SelectOrImportTokenDialog = ({
    onTokenSelect,
    selectedToken,
    showBalance = true,
    closeOnSelect = true,
    ...props
}: SelectOrImportTokenDialogProps) => {
    const [open, setOpen] = useState(false);

    const handleTokenSelect = (tokenData: TokenMetadata & { asset_type: string }) => {
        onTokenSelect?.(tokenData);

        if (closeOnSelect) {
            setOpen(false);
        }
    };

    return (
        <DialogRoot
            size={"sm"}
            motionPreset="slide-in-top"
            open={open}
            onOpenChange={({ open }) => setOpen(open)}
            {...props}
        >
            <DialogTrigger asChild>
                {props.children}
            </DialogTrigger>
            <DialogContent rounded={"3xl"} bg={"bg.subtle"} backdrop={false}>
                <DialogHeader>
                    <Text fontSize={"2xl"} fontWeight={"extrabold"}>Select Token</Text>
                </DialogHeader>
                <DialogBody>
                    <VStack w={"full"} h={"full"} gap={"2"}>
                        {BUILT_IN_TOKEN_INFO_LIST.map(token => (
                            <TokenCard
                                key={token.address}
                                asset_type={token.address}
                                onSelect={(tokenData) => handleTokenSelect({ ...tokenData, asset_type: token.address })}
                                isSelected={selectedToken?.asset_type === token.address}
                                showBalance={showBalance}
                                cursor="pointer"
                            />
                        ))}
                    </VStack>
                </DialogBody>
            </DialogContent>
        </DialogRoot>
    )
}

interface TokenCardProps extends Omit<BoxProps, 'onSelect'> {
    asset_type?: string;
    onSelect?: (tokenData: TokenMetadata) => void;
    /** Whether this token is currently selected */
    isSelected?: boolean;
    /** Whether to show balance information */
    showBalance?: boolean;
}

export const TokenCard = ({
    asset_type,
    onSelect,
    isSelected = false,
    showBalance = true,
    ...rest
}: TokenCardProps) => {
    const { account, network } = useWallet();

    if (!asset_type) {
        throw new Error("asset_type is required");
    }

    const { data: tokenInfo, isLoading } = useGetFungibleToken({
        payload: {
            asset_type: asset_type
        },
        options: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        }
    });

    const { data: balance } = useGetFungibleTokenBalance({
        payload: {
            asset_type: asset_type,
            owner: account?.address.toString() as string,
        },
        options: {
            enabled: !!account?.address && showBalance,
        }
    });

    const handleClick = () => {
        const tokenData: TokenMetadata = {
            symbol: tokenInfo?.symbol,
            name: tokenInfo?.name,
            decimals: tokenInfo?.decimals,
            logoUri: tokenInfo?.logoUri,
        };

        onSelect?.(tokenData);
    };

    return (
        <Box
            w={"full"}
            bg={isSelected ? "bg.panel" : "transparent"}
            rounded={"2xl"}
            p={"2"}
            shadow={isSelected ? "sm" : "none"}
            _hover={{
                bg: isSelected ? 'transparent' : 'bg.panel',
                shadow: 'sm',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s'
            }}
            transition="all 0.2s"
            {...rest}
            onClick={handleClick}
        >
            <HStack justify={"space-between"} gap={"4"}>
                <HStack gap={"2"}>
                    <Image
                        src={tokenInfo?.logoUri}
                        alt={tokenInfo?.symbol}
                        boxSize={'6'}
                        borderRadius={'full'}
                        objectFit={'cover'}
                        bgColor={'gray.200'}
                    />
                    <Box>
                        <Text fontWeight={"bold"}>{isLoading ? 'Loading...' : (tokenInfo?.symbol)}</Text>
                        <Text fontSize={'xs'} color={'gray.500'}>{tokenInfo?.name}</Text>
                    </Box>
                </HStack>

                {showBalance && (
                    <VStack alignItems={"flex-end"} gap={0}>
                        <Text fontSize={'md'} fontWeight={"bold"}>
                            {balance ? BigNumber(balance).dividedBy(BigNumber(10).pow(tokenInfo?.decimals || 0)).toFixed() : '0'}
                        </Text>
                        <HStack>
                            <Link fontSize={'xs'} color={'gray.500'} href={`${APTOS_EXPLORER_URL}/fungible_asset/${asset_type}?network=${network}`} target="_blank" rel="noopener noreferrer">
                                {shortenAddress(asset_type, 4)}
                            </Link>
                            <ClipboardRoot>
                                <ClipboardIconButton
                                    value={asset_type}
                                    size={'2xs'}
                                />
                            </ClipboardRoot>
                        </HStack>
                    </VStack>
                )}
            </HStack>
        </Box>
    )
}