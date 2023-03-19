import { ReactNode, useState } from "react"
import styled from "styled-components"

export type MenuItem = {
  title: string
  content: ReactNode
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

export const MenuTab = ({ items }: { items: Array<MenuItem> }) => {
  const [currentIdx, setCurrentIdx] = useState(0)
  return (
    <>
      <TabContainer>
        {items.map((item, idx) => (
          <>
            <TabLink
              key={Math.random() + "--tab"}
              style={currentIdx == idx ? { fontWeight: "bold", textDecoration: "underline" } : {}}
              onClick={() => {
                setCurrentIdx((currentValue) => (currentValue !== idx ? idx : currentValue))
              }}
            >
              {item.title}
            </TabLink>
          </>
        ))}
      </TabContainer>
      {items.map((item, idx) => (
        <>{idx == currentIdx && <TabContent>{item.content}</TabContent>}</>
      ))}
    </>
  )
}
