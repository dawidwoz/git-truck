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

function Accordion({
  items,
  commitCutoff,
  multipleOpen,
  openByDefault
}: {
  items: Array<AccordionData>
  commitCutoff: number
  multipleOpen: boolean
  openByDefault: boolean
}) {
  const [currentIdx, setCurrentIdx] = useState(new Array<number>())
  const [showFullList, setShowFullList] = useState(false)
  const btnOnClick = (idx: number) => {
    multipleOpen
      ? setCurrentIdx((currentValue) =>
          currentValue.includes(idx) ? currentValue.filter((item) => item !== idx) : [...currentValue, idx]
        )
      : setCurrentIdx((currentValue) => (currentValue.includes(idx) ? [] : [idx]))
  }
  const cutItems = showFullList ? items : items.slice(0, commitCutoff)
  openByDefault && !multipleOpen ? setCurrentIdx([0]) : null
  return (
    <AccordionContiner>
      {cutItems.map((item, idx) => (
        <>
          <AccordionItem
            key={Math.random() + "--accordion"}
            data={item}
            isOpen={openByDefault && multipleOpen ? !currentIdx.includes(idx) : currentIdx.includes(idx)}
            btnOnClick={() => btnOnClick(idx)}
          />
          <Spacer />
        </>
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
