import { useEffect, useState } from "react"
import styled from "styled-components"
import { AccordionData } from "./Accordion"

const AccordionItemElement = styled.li`
  border: 0;
  &:not(:first-of-type) {
    border-top: 0;
  }
`
const AccordionItemTitle = styled.h2`
  width: 100%;
  margin: 0;
`

const AccordionItemButton = styled.div<{ rotation: number; titleLabels?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  border: 0;
  font-size: ${({ titleLabels }) => (!titleLabels ? "16px" : "14px")};
  font-weight: ${({ titleLabels }) => (!titleLabels ? "500" : "400")};
  cursor: pointer;
  user-select: none;

  &::after {
    content: "";
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    margin-left: auto;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23212529'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-size: 14px;
    transition: transform 0.2s ease-in-out;
    transform: rotate(-${({ rotation }) => rotation}deg);
  }
`
const AccordionItemContainer = styled.ul`
  display: block;
  margin: 0;
  padding: 0;
  transition: height 0.2s ease-in-out;
  font-size: 14px;
`

export const StandartAccordionItemContent = styled.li<{ image: string }>`
  list-style-image: url(${({ image }) => image});
  margin: 5px;
  margin-left: 15px;
`

function AccordionItem({
  data,
  isOpen,
  btnOnClick,
  titleLabels
}: {
  data: AccordionData
  isOpen: boolean
  btnOnClick: () => void
  titleLabels?: boolean
}) {
  const [height, setHeight] = useState("")

  useEffect(() => {
    if (isOpen) {
      setHeight("auto")
    } else {
      setHeight("0")
    }
  }, [isOpen])

  return (
    <AccordionItemElement>
      <AccordionItemTitle>
        <AccordionItemButton titleLabels={titleLabels} rotation={isOpen ? 180 : 0} onClick={btnOnClick}>
          {data.title}
        </AccordionItemButton>
      </AccordionItemTitle>
      <AccordionItemContainer style={{ height }}>
        {isOpen && <div>{data.content}</div>}
      </AccordionItemContainer>
    </AccordionItemElement>
  )
}

export default AccordionItem
