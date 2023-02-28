import { ReactNode, useState } from "react"
import styled from "styled-components"
import AccordionItem from "./AccordionItem"
import { CommitDistOther } from "./FileHistoryElement"
import { Spacer } from "./Spacer"

export type AccordionData = {
  title: string
  content: ReactNode
}

const AccordionContiner = styled.ul`
  display: block;
  list-style: none;
  margin: 0;
  padding: 0;
`

function Accordion({ items, commitCutoff }: { items: Array<AccordionData>; commitCutoff: number }) {
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [showFullList, setShowFullList] = useState(false)
  const btnOnClick = (idx: number) => {
    setCurrentIdx((currentValue) => (currentValue !== idx ? idx : -1))
  }
  const cutItems = showFullList ? items : items.slice(0, commitCutoff)
  return (
    <AccordionContiner>
      {cutItems.map((item, idx) => (
        <><AccordionItem key={ idx } data={ item } isOpen={ idx === currentIdx } btnOnClick={ () => btnOnClick(idx) } /><Spacer /></>
      ))}
      <CommitDistOther
        show={!showFullList && items.length > commitCutoff}
        items={items.slice(commitCutoff)}
        toggle={() => setShowFullList(!showFullList)}
      />
    </AccordionContiner>
  )
}

export default Accordion
