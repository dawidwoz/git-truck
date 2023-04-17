import { Spacer } from "~/components/Spacer"
import { Box, CloseButton } from "~/components/util"
import { useClickedObject } from "~/contexts/ClickedContext"
import { useCommitTab } from "~/contexts/CommitTabContext"
import { MenuTab, MenuItem } from "./MenuTab"
import { renderCommitHistoryTab } from "./CommitHistoryTab"
import { renderGeneralTab } from "./GeneralTab"

export function Details(props: { showUnionAuthorsModal: () => void }) {
  const { setClickedObject, clickedObject } = useClickedObject()
  const { startDate, setStartDate, endDate, setEndDate } = useCommitTab()
  if (!clickedObject) return null

  const items: Array<MenuItem> = new Array<MenuItem>()
  items.push({
    title: "General",
    content: renderGeneralTab(props.showUnionAuthorsModal),
  } as MenuItem)
  items.push({
    title: "Commits",
    content: renderCommitHistoryTab(),
  } as MenuItem)
  return (
    <Box>
      <CloseButton
        onClick={() => {
          setStartDate(null)
          setEndDate(null)
          setClickedObject(null)
        }}
      />
      <Spacer xl />
      <MenuTab items={items}></MenuTab>
    </Box>
  )
}
