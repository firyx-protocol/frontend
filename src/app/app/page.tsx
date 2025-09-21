import { VStack } from "@chakra-ui/react";
import { AccountControl, ConnectButton } from "./_components/AccountControl";
import { MainMarketPanel } from "./_components/MainMarketPanel";
import { LoanPositionTable } from "./_components/LoanPositionTable";

export default function Home() {
  return (
    <VStack width={"full"} height={"full"}>
      <MainMarketPanel />
      <LoanPositionTable />
    </VStack>
  );
}
