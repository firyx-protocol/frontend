import { HStack } from "@chakra-ui/react"
import { DataArea } from "./_components/DataArea"
import { ActionArea } from "./_components/ActionArea"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <HStack width={"full"} height={"full"} gap={"6"} align={"start"} overflow={"auto"}>
      <DataArea flex={4} id={id} />
      <ActionArea flex={3} id={id} />
    </HStack>
  )
}