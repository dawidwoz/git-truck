import styled from "styled-components"
import { Close as CloseIcon } from "@styled-icons/material"

export type TagData = {
  tags: Array<string>
  onRemove: (tag: string) => void
}

const Tags = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`

const TagContainer = styled.div`
  display: flex;
  justify-content: center;
  border-radius: 15%;
  width: fit-content;
  padding: 5px;
  margin: 5px;
  background-color: var(--button-hovered-bg);
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
    <Tags>
      {props.tags.map((item, idx) => (
        <TagContainer key={idx + Math.random() + "--tags"}>
          <TagContent>{item}</TagContent>
          <CloseButton onClick={() => props.onRemove(item)}></CloseButton>
        </TagContainer>
      ))}
      </Tags>
    </>
  )
}
