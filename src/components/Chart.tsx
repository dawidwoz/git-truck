import { animated } from "@react-spring/web"
import type { HierarchyCircularNode, HierarchyNode, HierarchyRectangularNode } from "d3-hierarchy"
import { hierarchy, pack, treemap } from "d3-hierarchy"
import { memo, useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import type {
  HydratedGitBlobObject,
  HydratedGitCommitObject,
  HydratedGitObject,
  HydratedGitTreeObject,
} from "~/analyzer/model"
import { useClickedObject } from "~/contexts/ClickedContext"
import { useToggleableSpring } from "~/hooks"
import {
  bubblePadding,
  EstimatedLetterHeightForDirText,
  estimatedLetterWidth,
  searchMatchColor,
  textSpacingFromCircle,
  treemapPadding,
} from "../const"
import { useData } from "../contexts/DataContext"
import { useMetrics } from "../contexts/MetricContext"
import type { ChartType } from "../contexts/OptionsContext"
import { useOptions } from "../contexts/OptionsContext"
import { usePath } from "../contexts/PathContext"
import { blinkAnimation, pulseAnimation } from "./Animations"
import { Tooltip } from "./Tooltip"
import { useSubmit, useTransition } from "@remix-run/react"
import { getPathFromRepoAndHead } from "~/util"
import { LoadingIndicator } from "~/components/AnalyzingIndicator"

type CircleOrRectHiearchyNode = HierarchyCircularNode<HydratedGitObject> | HierarchyRectangularNode<HydratedGitObject>

const SVG = styled.svg<{ chartType: ChartType }>`
  display: grid;
  place-items: center;
  padding: ${(props) => getPaddingFromChartType(props.chartType)}px;
  width: 100%;
  height: 100%;
`

interface ChartProps {
  size: { width: number; height: number }
}

export function Chart(props: ChartProps) {
  const [hoveredBlob, setHoveredBlob] = useState<HydratedGitBlobObject | null>(null)
  const { analyzerData, editedFilesSingleCommit, repo } = useData()
  const { chartType, depthType } = useOptions()
  const { path } = usePath()
  const { state } = useTransition()
  const { clickedObject, setClickedObject } = useClickedObject()
  const { setPath } = usePath()
  const submit = useSubmit()

  function sendRequest(commitHash: string) {
    const form = new FormData()
    form.append("commitHash", commitHash)

    submit(form, {
      action: `/${getPathFromRepoAndHead(repo.name, repo.currentHead)}`,
      method: "post",
    })
  }

  let numberOfDepthLevels: number | undefined = undefined
  switch (depthType) {
    case "One":
      numberOfDepthLevels = 1
      break
    case "Two":
      numberOfDepthLevels = 2
      break
    case "Three":
      numberOfDepthLevels = 3
      break
    case "Four":
      numberOfDepthLevels = 4
      break
    case "Five":
      numberOfDepthLevels = 5
      break
    case "Full":
    default:
      numberOfDepthLevels = undefined
  }

  const nodes = useMemo(() => {
    return createPartitionedHiearchy(analyzerData.commit, getPaddedSizeProps(props.size, chartType), chartType, path)
  }, [depthType, chartType, analyzerData.commit, props.size, path])

  useEffect(() => setHoveredBlob(null), [depthType, chartType, analyzerData.commit, props.size])

  const createGroupHandlers = (d: CircleOrRectHiearchyNode, isCommitVisible: boolean) =>
    isBlob(d.data)
      ? {
          onClick: () => {
            if (state === "idle") {
              setClickedObject(d.data)
              isCommitVisible ? sendRequest("reset") : null
            }
          },
          onMouseOver: () => setHoveredBlob(d.data as HydratedGitBlobObject),
          onMouseOut: () => setHoveredBlob(null),
        }
      : {
          onClick: () => {
            if (state === "idle") {
              setClickedObject(d.data)
              setPath(d.data.path)
              isCommitVisible ? sendRequest("reset") : null
            }
          },
          onMouseOver: () => setHoveredBlob(null),
          onMouseOut: () => setHoveredBlob(null),
        }

  if (state == "idle") {
    return (
      <>
        <SVG
          chartType={chartType}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 ${-EstimatedLetterHeightForDirText} ${props.size.width} ${props.size.height}`}
        >
          {nodes?.descendants().map((d, i) => {
            if (numberOfDepthLevels !== undefined && d.depth > numberOfDepthLevels) return null
            return (
              <G
                blink={clickedObject?.path === d.data.path}
                shouldBeInForeground={
                  editedFilesSingleCommit.length == 0
                    ? true
                    : editedFilesSingleCommit.includes(d.data.path.slice(d.data.path.indexOf("/") + 1))
                }
                key={`${chartType}${d.data.path}`}
                {...createGroupHandlers(d, editedFilesSingleCommit.length != 0)}
              >
                <Node isRoot={i === 0} d={d} />
              </G>
            )
          })}
        </SVG>
        {typeof document !== "undefined" ? <Tooltip hoveredBlob={hoveredBlob} /> : null}
      </>
    )
  } else {
    return <LoadingIndicator />
  }
}

const G = styled.g<{ blink: boolean; shouldBeInForeground: boolean }>`
  animation-name: ${(props) => (props.blink ? blinkAnimation : "none")};
  animation-duration: 2s;
  animation-iteration-count: infinite;
  opacity: ${(props) => (props.shouldBeInForeground ? 1 : 0.1)};
`

const Node = memo(function Node({ d, isRoot }: { d: CircleOrRectHiearchyNode; isRoot: boolean }) {
  const { chartType, labelsVisible } = useOptions()
  let showLabel = isTree(d.data) && labelsVisible
  const { path } = usePath()
  let displayText = d.data.name
  type textIsTooLongFunction = (text: string) => boolean

  if (isRoot) {
    const pathSteps = path.split("/")
    const dispSteps = displayText.split("/")
    let ps = 0
    let ds = 0
    while (ps < pathSteps.length && ds < dispSteps.length) {
      if (pathSteps[ps] !== dispSteps[ds]) ps++
      else {
        ps++
        ds++
      }
    }

    displayText = dispSteps.slice(ds - 1).join("/")
  }

  switch (chartType) {
    case "BUBBLE_CHART":
      const circleDatum = d as HierarchyCircularNode<HydratedGitObject>
      collapseDisplayText_mut((text: string) => circleDatum.r * Math.PI < text.length * estimatedLetterWidth)

      return (
        <>
          <Circle d={circleDatum} isSearchMatch={d.data.isSearchResult ?? false} />
          {showLabel ? (
            <CircleText d={circleDatum} displayText={displayText} isSearchMatch={d.data.isSearchResult ?? false} />
          ) : null}
        </>
      )
    case "TREE_MAP":
      const rectDatum = d as HierarchyRectangularNode<HydratedGitObject>
      collapseDisplayText_mut(
        (text: string) => rectDatum.x1 - rectDatum.x0 < displayText.length * estimatedLetterWidth,
        (text: string) => rectDatum.y1 - rectDatum.y0 < EstimatedLetterHeightForDirText
      )

      return (
        <>
          <Rect d={rectDatum} isSearchMatch={d.data.isSearchResult ?? false} />
          {showLabel ? (
            <RectText d={rectDatum} displayText={displayText} isSearchMatch={d.data.isSearchResult ?? false} />
          ) : null}
        </>
      )
    default:
      throw Error("Unknown chart type")
  }

  function collapseDisplayText_mut(textIsTooLong: textIsTooLongFunction, textIsTooTall?: textIsTooLongFunction) {
    if (textIsTooLong(displayText)) {
      displayText = displayText.replace(/\/.+\//gm, "/.../")
      if (textIsTooLong(displayText)) {
        showLabel = false
      }
    }

    if (textIsTooTall && textIsTooTall(displayText)) {
      displayText = displayText.replace(/\/.+\//gm, "/.../")

      if (textIsTooTall(displayText)) {
        showLabel = false
      }
    }
  }
})

function Circle({ d, isSearchMatch }: { d: HierarchyCircularNode<HydratedGitObject>; isSearchMatch: boolean }) {
  const [metricsData] = useMetrics()
  const { metricType, authorshipType } = useOptions()

  const props = useToggleableSpring({
    cx: d.x,
    cy: d.y,
    r: Math.max(d.r - 1, 0),
    stroke: isSearchMatch ? searchMatchColor : "transparent",
    strokeWidth: "1px",
    fill: metricsData[authorshipType].get(metricType)?.colormap.get(d.data.path) ?? "grey",
  })

  return <CircleSVG pulse={isSearchMatch} {...props} className={d.data.type} />
}

const CircleSVG = styled(animated.circle)<{ pulse: boolean }>`
  animation-name: ${(props) => (props.pulse ? pulseAnimation : "none")};
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
`

function Rect({ d, isSearchMatch }: { d: HierarchyRectangularNode<HydratedGitObject>; isSearchMatch: boolean }) {
  const [metricsData] = useMetrics()
  const { metricType, authorshipType } = useOptions()

  const props = useToggleableSpring({
    x: d.x0,
    y: d.y0,
    width: d.x1 - d.x0,
    height: d.y1 - d.y0,

    stroke: isSearchMatch ? searchMatchColor : "transparent",
    strokeWidth: "1px",

    fill:
      d.data.type === "blob"
        ? metricsData[authorshipType].get(metricType)?.colormap.get(d.data.path) ?? "grey"
        : "transparent",
  })

  return <RectSVG pulse={isSearchMatch} {...props} className={d.data.type} />
}

const RectSVG = styled(animated.rect)<{ pulse: boolean }>`
  animation-name: ${(props) => (props.pulse ? pulseAnimation : "none")};
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
`

function CircleText({
  d,
  displayText,
  isSearchMatch,
}: {
  d: HierarchyCircularNode<HydratedGitObject>
  displayText: string
  isSearchMatch: boolean
}) {
  const props = useToggleableSpring({
    d: circlePathFromCircle(d.x, d.y, d.r + textSpacingFromCircle),
  })

  return (
    <>
      <animated.path {...props} id={d.data.path} className="name-path" />
      <Text
        style={{
          stroke: "var(--global-bg-color)",
        }}
        strokeWidth="7"
        strokeLinecap="round"
      >
        <textPath
          fill={isSearchMatch ? searchMatchColor : "#333"}
          className="object-name"
          startOffset="50%"
          dominantBaseline="central"
          textAnchor="middle"
          xlinkHref={`#${d.data.path}`}
        >
          {displayText}
        </textPath>
      </Text>
      <Text>
        <textPath
          fill={isSearchMatch ? searchMatchColor : "#333"}
          className="object-name"
          startOffset="50%"
          dominantBaseline="central"
          textAnchor="middle"
          xlinkHref={`#${d.data.path}`}
        >
          {displayText}
        </textPath>
      </Text>
    </>
  )
}

function RectText({
  d,
  displayText,
  isSearchMatch,
}: {
  d: HierarchyRectangularNode<HydratedGitObject>
  displayText: string
  isSearchMatch: boolean
}) {
  const props = useToggleableSpring({
    x: d.x0 + 4,
    y: d.y0 + 12,
    fill: isSearchMatch ? searchMatchColor : "#333",
  })

  return (
    <Text {...props} className="object-name">
      {displayText}
    </Text>
  )
}

function createPartitionedHiearchy(
  data: HydratedGitCommitObject,
  paddedSizeProps: { height: number; width: number },
  chartType: ChartType,
  path: string
) {
  const root = data.tree as HydratedGitTreeObject

  let currentTree = root
  const steps = path.substring(data.tree.name.length + 1).split("/")

  for (let i = 0; i < steps.length; i++) {
    for (const child of currentTree.children) {
      if (child.type === "tree") {
        const childSteps = child.name.split("/")
        if (childSteps[0] === steps[i]) {
          currentTree = child
          i += childSteps.length - 1
          break
        }
      }
    }
  }

  const castedTree = currentTree as HydratedGitObject

  const hiearchy = hierarchy(castedTree)
    .sum((d) => {
      const lineCount = (d as HydratedGitBlobObject).sizeInBytes
      return lineCount ? lineCount : 1
    })
    .sort((a, b) => (b.value !== undefined && a.value !== undefined ? b.value - a.value : 0))

  switch (chartType) {
    case "TREE_MAP":
      const treeMapPartition = treemap<HydratedGitObject>()
        .size([paddedSizeProps.width, paddedSizeProps.height])
        .paddingInner(2)
        .paddingOuter(4)
        .paddingTop(treemapPadding)

      const tmPartition = treeMapPartition(hiearchy)

      filterTree(tmPartition, (child) => {
        const cast = child as HierarchyRectangularNode<HydratedGitObject>
        return (child.data.type === "blob" && cast.x0 >= 1 && cast.y0 >= 1) || child.data.type === "tree"
      })

      return tmPartition

    case "BUBBLE_CHART":
      const bubbleChartPartition = pack<HydratedGitObject>()
        .size([paddedSizeProps.width, paddedSizeProps.height])
        .padding(bubblePadding)

      const bPartition = bubbleChartPartition(hiearchy)

      filterTree(bPartition, (child) => {
        const cast = child as HierarchyCircularNode<HydratedGitObject>
        return (child.data.type === "blob" && cast.r >= 1) || child.data.type === "tree"
      })

      return bPartition
    default:
      throw Error("Invalid chart type")
  }
}

function filterTree(
  node: HierarchyNode<HydratedGitObject>,
  filter: (child: HierarchyNode<HydratedGitObject>) => boolean
) {
  node.children = node.children?.filter((c) => filter(c))
  for (const child of node.children ?? []) {
    if ((child.children?.length ?? 0) > 0) filterTree(child, filter)
  }
}

// a rx ry angle large-arc-flag sweep-flag dx dy
// rx and ry are the two radii of the ellipse
// angle represents a rotation (in degrees) of the ellipse relative to the x-axis;
// large-arc-flag and sweep-flag allows to chose which arc must be drawn as 4 possible arcs can be drawn out of the other parameters.
/**
 * This function generates a path for a circle with a given radius and center
 * @param x x-coordinate of circle center
 * @param y y-coordinate of circle center
 * @param r radius of circle
 * @returns A string meant to be passed as the d attribute to a path element
 */
function circlePathFromCircle(x: number, y: number, r: number) {
  return `M${x},${y}
          m0,${r}
          a${r},${r} 0 1,1 0,${-r * 2}
          a${r},${r} 0 1,1 0,${r * 2}`
}

function getPaddedSizeProps(sizeProps: { height: number; width: number }, chartType: ChartType) {
  const padding = getPaddingFromChartType(chartType)
  return {
    height: sizeProps.height - padding * 2,
    width: sizeProps.width - padding * 2,
  }
}

function getPaddingFromChartType(chartType: ChartType) {
  switch (chartType) {
    case "BUBBLE_CHART":
      return bubblePadding
    case "TREE_MAP":
      return treemapPadding
    default:
      throw new Error("Chart type is invalid")
  }
}

const isTree = (d: HydratedGitObject): d is HydratedGitTreeObject => d.type === "tree"
const isBlob = (d: HydratedGitObject): d is HydratedGitBlobObject => d.type === "blob"
const Text = styled(animated.text)`
  pointer-events: none;
`
