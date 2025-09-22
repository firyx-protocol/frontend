import { VStack } from "@chakra-ui/react";
import { AccountControl, ConnectButton } from "./_components/AccountControl";
import { MainMarketPanel } from "./_components/MainMarketPanel";
import { LoanPositionTable } from "./_components/LoanPositionTable";
import { Toolbar } from "./_components/Toolbar";

export default function Home() {
  return (
    <VStack width={"full"} height={"full"} gap={"6"}>
      <MainMarketPanel />
      <Toolbar />
      <LoanPositionTable />
    </VStack>
  );
}
