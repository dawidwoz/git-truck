import styled, { css } from "styled-components"
import { Modal } from "./Modal"

type FooterProps = { name?: string }

const FooterNode = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  cursor: pointer;
  padding: 0px 5px;
  color: ${css`var(--text-color)`};
  font-size: 14px;
`

const TextFooterModal = styled.div`
  font-size: 14px;
  padding: 5px;
`

export const Footer = (props: FooterProps) => {
  const link = (
    <FooterNode>
      {props.name} &#174; {new Date().getFullYear()}
    </FooterNode>
  )
  const content = (
    <>
      <div style={{ textAlign: "center", padding: "10px" }}>
        <h1>Git Truck Beta 0.0.41</h1>
        <TextFooterModal>
          GitHub repository:
          <a href="https://github.com/dawidwoz/git-truck/tree/main">github.com/dawidwoz/git-truck/tree/main</a>
        </TextFooterModal>
        <TextFooterModal>
          We use following assets:
          <br /> 
          <a href="https://www.flaticon.com/free-icons/pull" title="pull icons">
            Pull icons created by edt.im - Flaticon
          </a>
        </TextFooterModal>
      </div>
    </>
  )
  return (
    <Modal link={link} content={content}></Modal>
  )
}

Footer.defaultProps = {
  name: "Git Truck Beta"
}
