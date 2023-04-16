import { Fragment, useId, useRef, useState } from "react"
import DatePicker from "react-datepicker"
import { AutoTextSize } from "auto-text-size"
import styled from "styled-components"
import type { GitLogEntry, HydratedGitObject } from "~/analyzer/model"
import { Spacer } from "~/components/Spacer"
import { Button, SearchField, BaseTitle } from "~/components/util"
import { useClickedObject } from "~/contexts/ClickedContext"
import { useData } from "~/contexts/DataContext"
import { useOptions } from "~/contexts/OptionsContext"
import { dateInputFormat } from "~/util"
import { calculateCommitsForSubTree, CommitDistFragment, SortCommitsMethods } from "./FileHistoryElement"
import { SingleCommitView } from "./SingleCommitView"
import { Checkbox } from "./Options"
import { Tag } from "./Tag"
import { useCommitTab } from "~/contexts/CommitTabContext"
import { useMetrics } from "~/contexts/MetricContext"
import { EnumSelect } from "./EnumSelect"
import Accordion, { AccordionData } from "./Accordion"
import { RowWrapFlex } from "./pure/Flex"

const commitCutoff = 10

export function renderCommitHistoryTab() {
  const { setClickedObject, clickedObject } = useClickedObject()
  const { startDate, setStartDate, endDate, setEndDate } = useCommitTab()
  const [mergeCommitsEnabled, setMergeCommitsEnabled] = useState(true)
  const [includeAuthors, setIncludeAuthors] = useState(true)
  const [authors, setAuthors] = useState<Set<string>>(new Set([]))
  const [sortMethods, setSortMethods] = useState<SortCommitsMethods>("date")
  const [selectedCommit, setSelectedCommit] = useState<GitLogEntry | undefined>(undefined)
  const [message, setMessage] = useState<string>("")
  const [openFilters, setOpenFilters] = useState(false)
  const [openSorting, setOpenSorting] = useState(false)
  const [isAscendingOrder, setIsAscendingOrder] = useState(true)

  if (!clickedObject) return null

  const fileCommits: GitLogEntry[] = getAllCommits(
    clickedObject,
    message,
    includeAuthors,
    mergeCommitsEnabled,
    authors,
    startDate,
    endDate
  )

  const startValue = startDate
    ? new Date(startDate)
    : fileCommits[fileCommits.length - 1] != undefined
    ? dateInputFormat(fileCommits[fileCommits.length - 1].time)
    : undefined
  const endValue = endDate
    ? new Date(endDate)
    : fileCommits[0] != undefined
    ? dateInputFormat(fileCommits[0].time)
    : undefined

  const items: Array<AccordionData> = new Array<AccordionData>()
  items.push({
    title: "Filters",
    content: createFilters(
      authors,
      setAuthors,
      setMessage,
      includeAuthors,
      setIncludeAuthors,
      mergeCommitsEnabled,
      setMergeCommitsEnabled,
      setStartDate,
      setEndDate,
      endValue,
      startValue
    ),
  })
  items.push({
    title: "Sorting",
    content: createSorting(isAscendingOrder, setIsAscendingOrder, setSortMethods),
  })

  return (
    <>
      {!selectedCommit ? (
        <>
          <div>
            <AutoTextSize maxFontSizePx={26} minFontSizePx={8}>
              <BaseTitle title={clickedObject.name}>{clickedObject.name}</BaseTitle>
            </AutoTextSize>
          </div>
          <Spacer xl />
          <Fragment key={new Date().toString()}>
            <Accordion
              multipleOpen={true}
              openByDefault={false}
              currentState={[openFilters, openSorting]}
              actionClickLabels={(idx) => (idx == 0 ? setOpenFilters(!openFilters) : setOpenSorting(!openSorting))}
              items={items}
              itemsCutoff={5}
            ></Accordion>
          </Fragment>
          <Spacer sm />
          <Spacer xl />
          <Spacer sm />
          <CommitDistFragment
            show={true}
            sortBy={sortMethods}
            handleOnClick={(commit: GitLogEntry) => setSelectedCommit(commit)}
            items={isAscendingOrder ? fileCommits : fileCommits.reverse()}
            commitCutoff={commitCutoff}
          />
          <Spacer md />
        </>
      ) : (
        <>
          <SingleCommitView commit={selectedCommit} onClose={() => setSelectedCommit(undefined)} />
        </>
      )}
    </>
  )
}

function createFilters(
  authors: Set<string>,
  setAuthors: (t: Set<string>) => void,
  setMessage: (t: string) => void,
  includeAuthors: boolean,
  setIncludeAuthors: (t: boolean) => void,
  mergeCommitsEnabled: boolean,
  setMergeCommitsEnabled: (t: boolean) => void,
  setStartDate: (t: number) => void,
  setEndDate: (t: number) => void,
  endValue?: Date,
  startValue?: Date
): React.ReactNode {
  const searchFieldRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const allAuthors: Record<string, string> = getAllAuthors()

  return (
    <>
      <Spacer md />
      <SearchField
        ref={searchFieldRef}
        onChange={(e) => setMessage(e.target.value)}
        id={id}
        type="search"
        placeholder="Search for commits..."
      />
      <Spacer lg />

      <div>
        <EnumSelect
          label="Author(s):"
          enum={allAuthors}
          showNoLabelWhenInactive={true}
          onChange={(selectedAuthor: string) => {
            if (selectedAuthor != allAuthorsLabel) {
              setAuthors(new Set([...authors]).add(selectedAuthor))
            }
          }}
        />
        <Spacer md />
        <RowSpaceFlex>
          <Button onClick={() => setIncludeAuthors(true)} className={includeAuthors ? "active-button" : ""}>
            Include
          </Button>
          <Button onClick={() => setIncludeAuthors(false)} className={!includeAuthors ? "active-button" : ""}>
            Exclude
          </Button>
        </RowSpaceFlex>
        <Spacer lg />
        <Tag
          tags={Array.from(authors.size == 0 ? new Set([allAuthorsLabel]) : authors)}
          noClosableValues={[allAuthorsLabel]}
          onRemove={(selectedAuthor: string) => {
            const newAuthors = new Set([...authors])
            newAuthors.delete(selectedAuthor)
            setAuthors(newAuthors)
          }}
        ></Tag>
        <Spacer md />
        <RowWrapFlex>
          <HalfScreenFlex>From:</HalfScreenFlex>
          <HalfScreenFlex>To:</HalfScreenFlex>
        </RowWrapFlex>
        <RowWrapFlex>
          <HalfScreenFlex>
            <DatePicker
              className="dataPickerInput"
              selected={startValue}
              showTimeSelect
              onChange={(date) => {
                setStartDate(date ? date.valueOf() : 0)
                setEndDate(endValue ? endValue.valueOf() : 0)
              }}
            />
          </HalfScreenFlex>
          <HalfScreenFlex>
            <DatePicker
              className="dataPickerInput"
              selected={endValue}
              showTimeSelect
              onChange={(date) => {
                setEndDate(date ? date.valueOf() : 0)
                setStartDate(startValue ? startValue.getTime() : 0)
              }}
            />
          </HalfScreenFlex>
        </RowWrapFlex>
        <Label>
          <Checkbox
            type="checkbox"
            checked={mergeCommitsEnabled}
            onChange={(e) => setMergeCommitsEnabled(e.target.checked)}
          />
          <span>Show merge commits</span>
        </Label>
      </div>
    </>
  )
}

function createSorting(
  isAscendingOrder: boolean,
  setIsAscendingOrder: (t: boolean) => void,
  setSortMethods: (t: SortCommitsMethods) => void
): React.ReactNode {
  return (
    <>
      <EnumSelect
        label=""
        enum={sortOptions}
        showNoLabelWhenInactive={false}
        onChange={(selectedOption: string) => {
          // Dirty trick to display the right option first
          if (selectedOption == "Date") {
            setSortMethods("date")
            sortOptions = {
              Date: "Date",
              Author: "Author",
            }
          } else {
            setSortMethods("author")
            sortOptions = {
              Author: "Author",
              Date: "Date",
            }
          }
        }}
      />
      <Spacer md />
      <RowSpaceFlex>
        <Button onClick={() => setIsAscendingOrder(true)} className={isAscendingOrder ? "active-button" : ""}>
          Ascending
        </Button>
        <Button onClick={() => setIsAscendingOrder(false)} className={!isAscendingOrder ? "active-button" : ""}>
          Descending
        </Button>
      </RowSpaceFlex>
    </>
  )
}

function getAllAuthors(): Record<string, string> {
  const { authorshipType } = useOptions()
  const [metricsData] = useMetrics()

  const iteratorAuthors = metricsData[authorshipType].get("TOP_CONTRIBUTOR")?.legend?.keys()
  const allAuthors: Record<string, string> = {}
  allAuthors[allAuthorsLabel] = ""
  iteratorAuthors !== undefined
    ? [...iteratorAuthors].map((item) => (allAuthors[item.toString()] = item.toString()))
    : null
  return allAuthors
}

function getAllCommits(
  clickedObject: HydratedGitObject,
  message: string,
  includeAuthors: boolean,
  mergeCommitsEnabled: boolean,
  authors: Set<string>,
  startDate: number | null,
  endDate: number | null
): GitLogEntry[] {
  const { analyzerData } = useData()

  let fileCommits: GitLogEntry[] = []
  let rowCommits: string[] = []

  try {
    rowCommits =
      clickedObject.type === "blob"
        ? clickedObject.commits
          ? clickedObject.commits
          : []
        : Array.from(calculateCommitsForSubTree(clickedObject))
  } catch (e) {
    rowCommits = []
    console.log(e)
  }

  fileCommits = rowCommits
    .map((c) => analyzerData.commits[c])
    .filter((c) => (message ? c.message.includes(message) : true))
    .filter((c) => authorFilterLogic(c, includeAuthors, authors))
    .filter((c) => (!mergeCommitsEnabled ? !c.message.includes("Merge pull request") : true))
    .filter((c) => (startDate ? c.time * 1000 > startDate : true))
    .filter((c) => (endDate ? c.time * 1000 < endDate : true))
    .sort((a, b) => b.time - a.time)

  return fileCommits
}

function authorFilterLogic(c: GitLogEntry, includeAuthors: boolean, authors: Set<string>): boolean {
  if (authors.size == 0) return includeAuthors
  return includeAuthors ? authors.has(c.author) : !authors.has(c.author)
}

let sortOptions: Record<string, string> = {
  Date: "Date",
  Author: "Author",
}

const allAuthorsLabel = "All"

const RowSpaceFlex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
`



const HalfScreenFlex = styled.div`
  display: flex;
  width: 50%;
  overflow: hidden;
`

const Label = styled.label`
  font-size: 14px;
`
