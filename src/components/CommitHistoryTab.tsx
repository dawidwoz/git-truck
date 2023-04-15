import { Fragment, useId, useRef, useState } from "react"
import DatePicker from "react-datepicker"
import { AutoTextSize } from "auto-text-size"
import styled from "styled-components"
import { oneDayInSecond } from "~/const"
import type { GitLogEntry } from "~/analyzer/model"
import { Spacer } from "~/components/Spacer"
import { Button, SearchField, BaseTitle } from "~/components/util"
import { useClickedObject } from "~/contexts/ClickedContext"
import { useData } from "~/contexts/DataContext"
import { useOptions } from "~/contexts/OptionsContext"
import { dateInputFormat } from "~/util"
import { calculateCommitsForSubTree, CommitDistFragment } from "./FileHistoryElement"
import { Checkbox } from "./Options"
import { Tag } from "./Tag"
import { useCommitTab } from "~/contexts/CommitTabContext"
import { useMetrics } from "~/contexts/MetricContext"
import { EnumSelect } from "./EnumSelect"
import Accordion, { AccordionData } from "./Accordion"


export function renderCommitHistoryTab() {
  const { setClickedObject, clickedObject } = useClickedObject()
  const { authorshipType } = useOptions()
  const { startDate, setStartDate, endDate, setEndDate } = useCommitTab()
  const [mergeCommitsEnabled, setMergeCommitsEnabled] = useState(true)
  const [includeAuthors, setIncludeAuthors] = useState(true)
  const [authors, setAuthors] = useState<Set<string>>(new Set([]))
  const [message, setMessage] = useState<string>("")
  const [metricsData] = useMetrics()
  if (!clickedObject) return null
  const searchFieldRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const iteratorAuthors = metricsData[authorshipType].get("TOP_CONTRIBUTOR")?.legend?.keys()
  const allAuthors: Record<string, string> = {}
  allAuthors[allAuthorsLabel] = ""
  iteratorAuthors !== undefined
    ? [...iteratorAuthors].map((item) => (allAuthors[item.toString()] = item.toString()))
    : null
  const { analyzerData } = useData()
  const commitCutoff = 10
  let fileCommits: GitLogEntry[] = []

  if (clickedObject.type === "blob") {
    if (!clickedObject.commits) clickedObject.commits = []
    fileCommits = clickedObject.commits
      .map((c) => analyzerData.commits[c])
      .filter((c) => (message ? c.message.includes(message) : true))
      .filter((c) => authorFilterLogic(c, includeAuthors, authors))
      .filter((c) => (!mergeCommitsEnabled ? !c.message.includes("Merge pull request") : true))
      .filter((c) => (startDate ? c.time * 1000 > startDate : true))
      .filter((c) => (endDate ? c.time * 1000 < endDate : true))
  } else {
    try {
      fileCommits = Array.from(calculateCommitsForSubTree(clickedObject))
        .map((c) => analyzerData.commits[c])
        .filter((c) => (message ? c.message.includes(message) : true))
        .filter((c) => authorFilterLogic(c, includeAuthors, authors))
        .filter((c) => (!mergeCommitsEnabled ? !c.message.includes("Merge pull request") : true))
        .filter((c) => (startDate ? c.time * 1000 > startDate : true))
        .filter((c) => (endDate ? c.time * 1000 < endDate : true))
        .sort((a, b) => b.time - a.time)
    } catch (e) {
      console.log(e)
    }
  }

  const startValue = startDate
    ? new Date(startDate)
    : fileCommits[fileCommits.length - 1] != undefined
    ? dateInputFormat(fileCommits[fileCommits.length - 1].time)
    : undefined
  const endValue = endDate
    ? new Date(endDate)
    : fileCommits[0] != undefined
    ? dateInputFormat(fileCommits[0].time + oneDayInSecond)
    : undefined

  const items: Array<AccordionData> = new Array<AccordionData>()
   items.push({
     title: "Filters",
     content: (
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
           <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly" }}>
             <Button onClick={() => setIncludeAuthors(true)} className={includeAuthors ? "active-button" : ""}>
               Include
             </Button>
             <Button onClick={() => setIncludeAuthors(false)} className={!includeAuthors ? "active-button" : ""}>
               Exclude
             </Button>
           </div>
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
           <div
             style={{
               display: "flex",
               flexDirection: "row",
               flexWrap: "wrap",
             }}
           >
             <HalfScreenFlex>From:</HalfScreenFlex>
             <HalfScreenFlex>To:</HalfScreenFlex>
           </div>
           <div
             style={{
               display: "flex",
               flexDirection: "row",
               flexWrap: "wrap",
             }}
           >
             <HalfScreenFlex>
               <DatePicker
                 className="dataPickerInput"
                 selected={startValue}
                 showTimeSelect
                 onChange={(date) => {
                   setStartDate(date ? date.valueOf() : 0)
                   setEndDate(endValue ? endValue.getTime() : 0)
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
           </div>
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
     ),
   })
  return (
    <>
      <div>
        <AutoTextSize maxFontSizePx={26} minFontSizePx={8}>
          <BaseTitle title={clickedObject.name}>{clickedObject.name}</BaseTitle>
        </AutoTextSize>
      </div>
      <Fragment key={new Date().toString()}>
        <Accordion multipleOpen={true} openByDefault={true} items={items} itemsCutoff={5}></Accordion>
      </Fragment>
      <hr />
      <Spacer md />
      <CommitDistFragment show={true} items={fileCommits} commitCutoff={commitCutoff} />
      <Spacer md />
    </>
  )
}

function authorFilterLogic(c: GitLogEntry, includeAuthors: boolean, authors: Set<string>) {
  if (authors.size == 0) return includeAuthors
  return includeAuthors ? authors.has(c.author) : !authors.has(c.author)
}

const allAuthorsLabel = "All"

const HalfScreenFlex = styled.div`
 display: flex;
 width: 50%;
 overflow: hidden;
`

const Label = styled.label`
    font-size: 14px;
`
