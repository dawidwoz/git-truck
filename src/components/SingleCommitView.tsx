import { GitLogEntry } from "~/analyzer/model"
import { BaseTitle, Button, CloseButton, DetailsKey, DetailsValue, isItValidPath } from "~/components/util"
import { useSubmit, useTransition } from "@remix-run/react"
import { useData } from "~/contexts/DataContext"
import { Spacer } from "~/components/Spacer"
import styled from "styled-components"
import { ArrowBack as ArrowBackIcon } from "@styled-icons/material"
import { dateTimeFormatLong } from "~/util"
import { DetailsEntries, DetailsHeading, DistEntries } from "./GeneralTab"
import { RowWrapFlex } from "./pure/Flex"
import { getPathFromRepoAndHead } from "~/util"

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
  const { repo, analyzerData, editedFilesSingleCommit } = useData()
  const { state } = useTransition()
  const submit = useSubmit()

  function sendRequest(commitHash: string) {
    const form = new FormData()
    form.append("commitHash", commitHash)

    submit(form, {
      action: `/${getPathFromRepoAndHead(repo.name, repo.currentHead)}`,
      method: "post",
    })
  }

  return (
    <>
      <RowWrapFlex>
        <BackArrow
          onClick={() => {
            props.onClose()
            editedFilesSingleCommit.length != 0 ? sendRequest("reset") : null
          }}
        >
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
      <Spacer md />
      <Button
        title="All files that were touched with this commit and are still present in the repository will be highlighted."
        disabled={state !== "idle"}
        onClick={() => sendRequest(props.commit.hash)}
      >
        Show edited files
      </Button>
      {editedFilesSingleCommit.length != 0 && (
        <>
          <DetailsHeading>File edited with this commit and still present in the repository</DetailsHeading>
          <DistEntries>
            {editedFilesSingleCommit.map((file) => {
              if (!isItValidPath(analyzerData, file)) return null
              return (
                <>
                  <DetailsKey grow key={file}>
                    {file}
                  </DetailsKey>
                  <DetailsValue></DetailsValue>
                </>
              )
            })}
          </DistEntries>
        </>
      )}
    </>
  )
}
