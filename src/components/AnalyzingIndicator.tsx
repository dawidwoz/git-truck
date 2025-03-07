import styled from "styled-components"
import anitruck from "~/assets/truck.gif"

const LoadingPane = styled.div`
  padding: 0.5em 2em;
  display: flex;
  flex-direction: column;

  /* hide_initially animation */
  opacity: 0;
  animation: hide_initially 0s linear forwards;
  animation-delay: 1s;
`

const FullViewbox = styled.div`
  display: grid;
  place-items: center;
  height: 100vh;
  width: 100vw;
  background-color: var(--global-bg-color);
`

const LoadingText = styled.div`
  text-align: center;
`

export function AnalyzingIndicator() {
  return (
    <FullViewbox>
      <LoadingIndicator />
    </FullViewbox>
  )
}

export function LoadingIndicator() {
  return (
    <LoadingPane>
      <img src={anitruck} alt={"🚛"} width={400} />
      <LoadingText>Analyzing...</LoadingText>
    </LoadingPane>
  )
}
