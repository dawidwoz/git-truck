import { ReactNode, useState } from "react"
import styled from "styled-components"

export type MenuItem = {
  title: string
  content: ReactNode
  onChange?: (index: number) => void
}

const TabContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  overflow: hidden;
  background-color: hsl(216, 0%, 95%);
  border-radius: calc(0.75 * var(--unit));
`

const TabLink = styled.div`
  background-color: inherit;
  float: left;
  text-align: center;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 7px 8px;
  transition: 0.3s;

  &:hover {
    background-color: #ddd;
  }
`

const TabContent = styled.div`
  padding: 6px 12px;
  border-top: none;
`

export const MenuTab = ({ items, isSelected }: { items: Array<MenuItem>, isSelected?: number }) => {
  const [currentIdx, setCurrentIdx] = useState(0)
  const equalSplitValue = 100 / items.length + "%"
  const selectedIdx = isSelected ? isSelected : currentIdx
  return (
    <>
      <TabContainer>
        {items.map((item, idx) => (
          <>
            <TabLink
              key={Math.random() + "--tab"}
              style={
                selectedIdx == idx
                  ? { fontWeight: "bold", textDecoration: "underline", width: equalSplitValue }
                  : { width: equalSplitValue }
              }
              onClick={() => {
                item.onChange ? item.onChange(idx) : null
                setCurrentIdx((currentValue) => (currentValue !== idx ? idx : currentValue))
              }}
            >
              {item.title}
            </TabLink>
          </>
        ))}
      </TabContainer>
      {items.map((item, idx) => (
        <>{idx == selectedIdx && <TabContent>{item.content}</TabContent>}</>
      ))}
    </>
  )
}
