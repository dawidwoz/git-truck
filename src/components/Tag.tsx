import styled from "styled-components"
import { Close as CloseIcon } from "@styled-icons/material"

export type TagData = {
  tags: Array<string>
  onRemove: (tag: string) => void
}

const TagContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  border-radius: 15%;
  width: fit-content;
  padding: 5px;
  background-color: #A9A9A9;
`

const TagContent = styled.span`
  color: var(--text-color);
`
const CloseButton = styled.span`
    display: inline-block;
    cursor: pointer;
    width: 1em;
`

CloseButton.defaultProps = { children: <CloseIcon /> }

export const Tag = (props: TagData) => {
  return (
    <>
      {props.tags.map((item, idx) => (
        <TagContainer key={idx + Math.random() + "--tags"}>
          <TagContent>{item}</TagContent>
          <CloseButton onClick={() => props.onRemove(item)}></CloseButton>
        </TagContainer>
      ))}
    </>
  )
}
