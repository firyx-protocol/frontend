"use client";

import { DialogBody, DialogContent, DialogRoot, DialogTrigger } from "@/components/ui/dialog";
import { TokenMetadata } from "@/types/core";
import { aptos } from "@/utils/aptos";
import { useWallet, } from "@aptos-labs/wallet-adapter-react";
import { Box, BoxProps, DialogHeader, DialogRootProps, HStack, Image, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { BUILT_IN_TOKEN_INFO_LIST } from "../data/built-in";
import { shortenAddress } from "@/libs/helpers";
import { BigNumber } from "bignumber.js";

type Props = DialogRootProps;

export const SelectOrImportTokenDialog = (props: Props) => {
    return (
        <DialogRoot {...props}>
            <DialogTrigger asChild>
                {props.children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <Text>Select or Import Token</Text>
                </DialogHeader>
                <DialogBody>
                    {BUILT_IN_TOKEN_INFO_LIST.map(token => (
                        <TokenCard key={token.address}
                            asset_type_v1={token.asset_type_v1}
                            asset_type_v2={token.asset_type_v2}
                            metadata={token} p={"2"} borderWidth={"1px"} borderRadius={"md"} mb={"2"} cursor={"pointer"} _hover={{ bgColor: 'gray.100' }} />
                    ))}
                </DialogBody>
            </DialogContent>
        </DialogRoot>
    )
}

interface TokenCardProps extends Omit<BoxProps, 'onSelect'> {
    metadata?: TokenMetadata;
    asset_type_v1?: string;
    asset_type_v2?: string;
    onSelect?: (address: string) => void;
}
export const TokenCard = ({ metadata, asset_type_v1, asset_type_v2, onSelect, ...rest }: TokenCardProps) => {
    const { account, } = useWallet();

    const { data: tokenInfo, isLoading, error } = useQuery({
        queryKey: ['token-metadata', asset_type_v1, asset_type_v2],
        queryFn: async () => {
            if(metadata) return metadata;
            if (!asset_type_v1 && !asset_type_v2) return null;

            const tokenInfos = await aptos.getFungibleAssetMetadata({
                options: {
                    where: {
                        asset_type: { _eq: asset_type_v1 || asset_type_v2 }
                    },
                }
            })
            
            return tokenInfos[0];
        },
        enabled: !!asset_type_v1 || !!asset_type_v2,
        refetchOnWindowFocus: false,
    });

    const { data: tokenInfoBalance } = useQuery({
        queryKey: ['token-balance', account?.address, tokenInfo, metadata],
        queryFn: async () => {
            if (!tokenInfo && !metadata) return 0;
            if (!account?.address) return 0;

            const decimals = tokenInfo?.decimals || metadata?.decimals || 0;

            const balances = await aptos.getCurrentFungibleAssetBalances({
                options: {
                    where: {
                        _or: [
                            {
                                asset_type_v1: { _eq: tokenInfo?.asset_type }
                            },
                            {
                                asset_type_v2: { _eq: tokenInfo?.asset_type }
                            }
                        ],
                        owner_address: {
                            _eq: account.address.toString()
                        },
                    }
                }
            });
            return balances.reduce((acc, curr) => acc + Number(curr.amount) / (BigNumber(10).pow(decimals).toNumber()), 0);
        },

        enabled: !!account?.address && (!!tokenInfo || !!metadata),
        refetchOnWindowFocus: false,
    });

    return (
        <Box {...rest}>
            <HStack>
                <Image
                    src={metadata?.logoUri || tokenInfo?.icon_uri || ''}
                    alt={metadata?.symbol || tokenInfo?.symbol || ''}
                    boxSize={'6'}
                    borderRadius={'full'}
                    objectFit={'cover'}
                    bgColor={'gray.200'}
                />
                <Box>
                    <Text>{(metadata?.symbol || tokenInfo?.symbol)?.toUpperCase()}</Text>
                    <Text fontSize={'xs'} color={'gray.500'}>{metadata?.name || tokenInfo?.name || address}</Text>
                </Box>
                <Box>
                    <Text fontWeight={"bold"}>{isLoading ? 'Loading...' : tokenInfoBalance}</Text>
                    <Text fontSize={'xs'} color={'gray.500'}>
                        {`${shortenAddress(tokenInfo?.asset_type.split('::')[0] || "")}`}
                    </Text>
                </Box>
            </HStack>
        </Box>
    )
}