"use client";

import { Button, ButtonProps, HStack, Icon, Image, Text } from "@chakra-ui/react";
import { SelectOrImportTokenDialog } from "../../_components/SelectOrImportTokenDialog";
import { useState } from "react";
import { TokenMetadata } from "@/types/core";
import { HiPlus } from "react-icons/hi";

interface SelectTokenButtonProps extends Omit<ButtonProps, 'onSelect'> {
    /** Callback when a token is selected */
    onTokenSelect?: (token: TokenMetadata & { asset_type: string }) => void;
    /** Initially selected token */
    defaultToken?: TokenMetadata & { asset_type: string };
    /** Controlled selected token */
    selectedToken?: TokenMetadata & { asset_type: string };
}

export const SelectTokenButton = ({
    onTokenSelect,
    defaultToken,
    selectedToken: controlledSelectedToken,
    ...props
}: SelectTokenButtonProps) => {
    const [internalSelectedToken, setInternalSelectedToken] = useState<TokenMetadata & { asset_type: string } | undefined>(defaultToken);

    // Use controlled token if provided, otherwise use internal state
    const selectedToken = controlledSelectedToken || internalSelectedToken;

    const handleTokenSelect = (token: TokenMetadata & { asset_type: string }) => {
        // Update internal state if not controlled
        if (!controlledSelectedToken) {
            setInternalSelectedToken(token);
        }

        // Call the callback
        onTokenSelect?.(token);
    };

    return (
        <SelectOrImportTokenDialog
            selectedToken={selectedToken}
            onTokenSelect={handleTokenSelect}
        >
            <Button
                w={"full"}
                maxW={"xs"}
                size={"2xl"}
                rounded={"2xl"}
                bg={"bg.panel"}
                color={selectedToken ? "fg" : "fg.subtle"}
                shadow={"sm"}
                fontWeight={"extrabold"}
                justifyContent={selectedToken ? "flex-start" : "center"}
                {...props}
            >
                {selectedToken ? (
                    <HStack w={"full"} gap={"3"} justify={"space-between"}>
                        <HStack>
                            <Image
                                src={selectedToken.logoUri}
                                alt={selectedToken.symbol}
                                boxSize={'6'}
                                borderRadius={'full'}
                                objectFit={'cover'}
                                bgColor={'gray.200'}
                            />
                            <Text fontWeight={"extrabold"} textTransform="uppercase">
                                {selectedToken.symbol}
                            </Text>
                        </HStack>
                        <Icon as={HiPlus} color={"fg.subtle"} />
                    </HStack>
                ) : (
                    "Select Token"
                )}
            </Button>
        </SelectOrImportTokenDialog>
    )
}