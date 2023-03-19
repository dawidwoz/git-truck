import { ReactNode, useState } from "react"
import styled from "styled-components"

export type ModalData = {
  link: ReactNode
  content: ReactNode
}

const ModalContainer = styled.div`
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  background-color: rgb(255, 255, 255);
  background-color: rgba(255, 255, 255, 0.5);
`

const ModalContent = styled.div`
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  width: 80%;
`

const ModalClose = styled.span`
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
`

export const Modal = (props: ModalData) => {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <span onClick={() => setShowModal(!showModal)}>{props.link}</span>
      {showModal && (
        <ModalContainer>
          <ModalContent>
            <ModalClose onClick={() => setShowModal(!showModal)}>&times;</ModalClose>
            {props.content}
          </ModalContent>
        </ModalContainer>
      )}
    </>
  )
}
