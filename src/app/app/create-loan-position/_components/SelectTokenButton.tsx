import { Button, ButtonProps } from "@chakra-ui/react";
import { SelectOrImportTokenDialog } from "../../_components/SelectOrImportTokenDialog";

type Props = ButtonProps;

export const SelectTokenButton = (props: Props) => {
    
    return (
        <SelectOrImportTokenDialog>
            <Button w={"full"} {...props}>
                Select Token
            </Button>
        </SelectOrImportTokenDialog>
    )
}