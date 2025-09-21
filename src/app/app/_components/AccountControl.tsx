"use client";

import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@/components/ui/menu";
import { APTOS_EXPORER_URL } from "@/constants";
import { shortenAddress } from "@/libs/helpers";
import { SupportedWallets } from "@/utils/support-wallets";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Text, Button, ButtonProps, MenuRootProps, Box, Icon } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineWaterDrop } from "react-icons/md";
import { PiSignOutBold } from "react-icons/pi";
import { RxSwitch } from "react-icons/rx";

type ConnectButtonProps = ButtonProps;
type Props = Omit<MenuRootProps, 'children'> & {
    buttonProps?: ConnectButtonProps;
}
export const ConnectButton = (props: ConnectButtonProps) => {
    const { connect, connected, isLoading } = useWallet();

    if (connected) return null;

    return (
        <Button
            loading={isLoading}
            loadingText="Connecting"
            onClick={() => connect(SupportedWallets.Petra)}
            {...props}
        >
            Connect
        </Button>
    )
}
export const AccountControl = (props: Props) => {
    const { buttonProps, ...rest } = props;
    const { account, connected, disconnect } = useWallet();
    const router = useRouter()

    if (!connected || !account) {
        return (<ConnectButton {...buttonProps} />);
    }

    const items = [
        { value: "view", label: "View on Explorer", icon: FaRegUser, onClick: () => { router.push(`${APTOS_EXPORER_URL}&address=${account.address.toString()}`) } },
        { value: "settings", label: "Setings", icon: RxSwitch, onClick: () => { } },
        { value: "disconnect", label: "Disconnect", icon: PiSignOutBold, onClick: () => disconnect() }
    ];

    return (
        <MenuRoot size={"md"} {...rest}>
            <MenuTrigger cursor={"pointer"} _focus={{ outlineColor: "primary.solid", outlineOffset: "3px", outlineWidth: "3px" }} borderRadius={"xl"} >
                <Box borderRadius={"xl"} bg={"bg.panel"} shadow={"sm"} px={"2"} py={"1.5"} display={"flex"} alignItems={"center"} gap={"2"}>
                    <Text fontSize={"medium"}>
                        {shortenAddress(account.address.toString())}
                    </Text>
                    <Icon as={MdOutlineWaterDrop} color={"fg.subtle"} />
                </Box>
            </MenuTrigger>
            <MenuContent>
                {items.map((item, index) => (
                    <MenuItem key={index} value={item.value} onClick={item.onClick}>
                        <item.icon />
                        {item.label}
                    </MenuItem>
                ))}
            </MenuContent>
        </MenuRoot>
    )
}
