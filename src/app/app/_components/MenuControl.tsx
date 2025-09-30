import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@/components/ui/menu";
import { ROOT_DOMAIN } from "@/constants";
import { Box, ButtonProps, Icon, MenuRootProps } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { BiHomeAlt2 } from "react-icons/bi";
import { IoIosMenu } from "react-icons/io";

type ConnectButtonProps = ButtonProps;
type Props = Omit<MenuRootProps, 'children'> & {
    buttonProps?: ConnectButtonProps;
}
export const MenuControl = (props: Props) => {
    const { buttonProps, ...rest } = props;
    const router = useRouter();

    const items = [
        {
            value: "home",
            label: "Home",
            icon: BiHomeAlt2,
            onClick: () => {
               router.push(ROOT_DOMAIN);
            }
        },
    ];

    return (
        <MenuRoot size={"md"} {...rest}>
            <MenuTrigger cursor={"pointer"} _focus={{ outlineColor: "primary.solid", outlineOffset: "3px", outlineWidth: "3px" }} borderRadius={"xl"} >
                <Box borderRadius={"xl"} bg={"bg.panel"} shadow={"sm"} p={"2"} display={"flex"} alignItems={"center"} gap={"2"}>
                    <Icon as={IoIosMenu} size={"md"} color={"fg.subtle"} />
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