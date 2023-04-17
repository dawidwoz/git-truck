import { GitLogEntry } from "~/analyzer/model"
import { BaseTitle, CloseButton, DetailsKey, DetailsValue } from "~/components/util"
import { Spacer } from "~/components/Spacer"
import styled from "styled-components"
import { ArrowBack as ArrowBackIcon } from "@styled-icons/material"
import { dateTimeFormatLong } from "~/util"
import { DetailsEntries } from "./GeneralTab"
import { RowWrapFlex } from "./pure/Flex"

interface SingleCommitViewProps {
  onClose: () => void
  commit: GitLogEntry
}

const BackArrow = styled(CloseButton)`
  right: auto;
  top: auto;
  left: calc(2 * var(--unit));
  cursor: pointer;
  display: contents;
`

export function SingleCommitView(props: SingleCommitViewProps) {
  return (
    <>
      <RowWrapFlex>
        <BackArrow onClick={props.onClose}>
          <ArrowBackIcon size="24" />
        </BackArrow>
        <BaseTitle style={{ marginLeft: "5%" }} title="Commit View">
          Commit View
        </BaseTitle>
      </RowWrapFlex>
      <Spacer md />
      <DetailsEntries>
        <DetailsKey grow>Message</DetailsKey>
        <DetailsValue>{props.commit.message}</DetailsValue>
        <DetailsKey grow>Description</DetailsKey>
        <DetailsValue>{props.commit.body}</DetailsValue>
        <DetailsKey grow>Hash</DetailsKey>
        <DetailsValue>{props.commit.hash}</DetailsValue>
        <DetailsKey grow>Created at</DetailsKey>
        <DetailsValue>{dateTimeFormatLong(props.commit.time * 1000)}</DetailsValue>
        <DetailsKey grow>Created by</DetailsKey>
        <DetailsValue>{props.commit.author}</DetailsValue>
      </DetailsEntries>
    </>
  )
}
