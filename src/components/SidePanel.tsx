import styled from "styled-components"

const SidePanelRoot = styled.aside`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  resize: horizontal;
  width: var(--side-panel-width);
`

export const SidePanelLeftElement = styled(SidePanelRoot)`
  width: var(--side-panel-width);
`

export const SidePanelRightElement = styled(SidePanelRoot)`
  width: calc(1.5 * var(--side-panel-width));
`


export function SidePanelLeft(props: { children: React.ReactNode }) {
  return <SidePanelLeftElement>{props.children}</SidePanelLeftElement>
}


export function SidePanelRight(props: { children: React.ReactNode }) {
  return <SidePanelRightElement>{props.children}</SidePanelRightElement>
}

