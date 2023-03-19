import { GitLogEntry, HydratedGitObject, HydratedGitTreeObject } from "~/analyzer/model"
import { Fragment } from "react"
import { dateFormatLong } from "~/util"
import { Spacer } from "./Spacer"
import { AuthorDistEntries, AuthorDistHeader, DetailsHeading } from "./Details"
import styled from "styled-components"
import { useData } from "~/contexts/DataContext"
import Accordion, { AccordionData } from "./Accordion"
import { AccordionItemContent } from "./AccordionItem"
import commitIcon from "~/assets/commit_icon.png"

export type State = "idle" | "submitting" | "loading"
interface props {
  state: State
  clickedObject: HydratedGitObject
}

export function FileHistoryElement(props: props) {
  const { analyzerData } = useData()

  let fileCommits: GitLogEntry[] = []
  if (props.clickedObject.type === "blob") {
    fileCommits = props.clickedObject.commits.map((c) => analyzerData.commits[c])
  } else {
    try {
      fileCommits = Array.from(calculateCommitsForSubTree(props.clickedObject))
        .map((c) => analyzerData.commits[c])
        .sort((a, b) => b.time - a.time)
    } catch (e) {
      console.log(e)
    }
  }

  return <CommitHistory commits={fileCommits} />
}

interface CommitDistFragProps {
  items: GitLogEntry[]
  show: boolean
  commitCutoff: number
}

export function CommitDistFragment(props: CommitDistFragProps) {
  if (!props.show || !props.items) return null

  const cleanGroupByDateItems: { [key: string]: string[] } = {};
  props.items.map((commit) => {
    const date: string = dateFormatLong(commit.time);
    if (!cleanGroupByDateItems[date]) {
      cleanGroupByDateItems[date] = []
    }
    if (!cleanGroupByDateItems[date].includes(commit.message)) {
      cleanGroupByDateItems[date].push(commit.message)
    }
  })

  const items: Array<AccordionData> = new Array<AccordionData>
  for (const [key, values] of Object.entries(cleanGroupByDateItems)) {
    items.push({
      title: key,
      content: (
        <>
        {values.map((value: string) => {
          return (
            <>
              <AccordionItemContent key={Math.random() + "--itemContentAccordion"} image={commitIcon}>{value}</AccordionItemContent>
            </>
          )
        })}
        </>
      )
    })
  }

  return (
    <>
      <Fragment key={new Date().toString()}>
        <Accordion multipleOpen={true} openByDefault={true} items={items} commitCutoff={props.commitCutoff}></Accordion>
      </Fragment>
    </>
  )
}

function CommitHistory(props: { commits: GitLogEntry[] | undefined }) {
  const commits = props.commits ?? []
  const commitCutoff = 3

  if (commits.length == 0) {
    return (
      <>
        <DetailsHeading>Commit History</DetailsHeading>
        <Spacer />
        <AuthorDistEntries>{<p>No commits found</p>}</AuthorDistEntries>
      </>
    )
  }
  return (
    <>
      <AuthorDistHeader>
        <DetailsHeading>Commit History</DetailsHeading>
      </AuthorDistHeader>
      <Spacer xs />
      <AuthorDistEntries>
        <CommitDistFragment show={true} items={commits} commitCutoff={commitCutoff} />
        <Spacer />
      </AuthorDistEntries>
    </>
  )
}

interface CommitDistOtherProps {
  toggle: () => void
  items: Array<any>
  show: boolean
}

const OtherText = styled.span<{ grow?: boolean }>`
  white-space: pre;
  font-size: 0.7em;
  font-weight: 500;
  opacity: 0.7;
  &:hover {
    cursor: pointer;
  }
`

export function CommitDistOther(props: CommitDistOtherProps) {
  if (!props.show) return null
  return <OtherText onClick={props.toggle}>+ {props.items.length} more</OtherText>
}

export function calculateCommitsForSubTree(tree: HydratedGitTreeObject) {
  const commitSet = new Set<string>()
  subTree(tree)
  function subTree(tree: HydratedGitTreeObject) {
    for (const child of tree.children) {
      if (!child) continue
      if (child.type === "blob") {
        if (!child.commits) continue
        for (const commit of child.commits) {
          commitSet.add(commit)
        }
      } else if (child.type === "tree") {
        subTree(child)
      }
    }
  }
  return commitSet
}
