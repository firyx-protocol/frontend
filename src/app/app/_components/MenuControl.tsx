import { MenuContent, MenuItem, MenuItemGroup, MenuRoot, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { ROOT_DOMAIN } from "@/constants";
import { Box, ButtonProps, Icon, Link, MenuRootProps } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { BiHomeAlt2 } from "react-icons/bi";
import { FaFaucet } from "react-icons/fa6";
import { IoIosMenu, IoMdPaper } from "react-icons/io";
import { IoDocumentTextOutline } from "react-icons/io5";
import { PiProjectorScreenChartLight } from "react-icons/pi";

type ConnectButtonProps = ButtonProps;
type Props = Omit<MenuRootProps, 'children'> & {
    buttonProps?: ConnectButtonProps;
}
export const MenuControl = (props: Props) => {
    const { buttonProps, ...rest } = props;

    const items1 = [
        {
            value: "home",
            label: "Home",
            icon: BiHomeAlt2,
            href: `https://www.${ROOT_DOMAIN}`,
        },
        {
            value: "faucet",
            label: "Faucet",
            icon: FaFaucet,
            href: "https://www.thala.dev/faucet"
        }
    ];

    const items2 = [
        {
            value: "docs",
            label: "Docs",
            href: "https://docs.firyx.xyz",
            icon: IoDocumentTextOutline,
        },
        {
            value: "whitepaper",
            label: "Whitepaper",
            href: "https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FAYTxA1OvGXRxfbI4vn9p%2Fuploads%2FNSfoWuOq5r9LB7rhAK9f%2Ffiryx-protocol.pdf?alt=media&token=030a96af-ea2f-4ee7-b08c-c7b1388db50d",
            icon: IoMdPaper,
        },
        {
            value: "presentation",
            label: "Presentation",
            href: "https://pitch.firyx.xyz",
            icon: PiProjectorScreenChartLight
        }
    ];

    return (
        <MenuRoot size={"md"} {...rest}>
            <MenuTrigger cursor={"pointer"} _focus={{ outlineColor: "primary.solid", outlineOffset: "3px", outlineWidth: "3px" }} borderRadius={"xl"} >
                <Box borderRadius={"xl"} bg={"bg.panel"} shadow={"sm"} p={"2"} display={"flex"} alignItems={"center"} gap={"2"}>
                    <Icon as={IoIosMenu} size={"md"} color={"fg.subtle"} />
                </Box>
            </MenuTrigger>
            <MenuContent>
                <MenuItemGroup>
                    {items1.map((item, index) => (
                        <MenuItem key={index} value={item.value}>
                            <Link unstyled focusRing={"none"} href={item.href} target="_blank" display={"flex"} flexDirection={"row"} alignItems={"center"} gap={"2"}>
                                <item.icon />
                                {item.label}
                            </Link>
                        </MenuItem>
                    ))}
                </MenuItemGroup>
                <MenuSeparator/>
                <MenuItemGroup>
                    {items2.map((item, index) => (
                        <MenuItem key={index} value={item.value}>
                            <Link unstyled focusRing={"none"} href={item.href} target="_blank" display={"flex"} flexDirection={"row"} alignItems={"center"} gap={"2"}>
                                <item.icon />
                                {item.label}
                            </Link>
                        </MenuItem>
                    ))}
                </MenuItemGroup>
            </MenuContent>
        </MenuRoot>
    )
}