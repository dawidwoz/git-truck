import styled from "styled-components"
import { ArrowDropUp, Close } from "@styled-icons/material"
import { Spacer } from "~/components/Spacer"
import { useMetrics } from "../../contexts/MetricContext"
import { useOptions } from "../../contexts/OptionsContext"
import type { MetricCache } from "../../metrics/metrics"
import { getMetricDescription, getMetricLegendType, Metric } from "../../metrics/metrics"
import { Box, BoxP, BoxSubTitle, Button, CloseButton } from "../util"
import { PeopleAlt } from "@styled-icons/material"
import { PointLegend } from "./PointLegend"
import { SegmentLegend } from "./SegmentLegend"
import { GradientLegend } from "./GradiantLegend"
import { useBoolean } from "react-use"
import { useClickedObject } from "~/contexts/ClickedContext"

const StyledBox = styled(Box)`
  position: sticky;
  bottom: 0;
`

const PointerMouse = styled.span`
  cursor: pointer;
`

export type LegendType = "POINT" | "GRADIENT" | "SEGMENTS"

export function Legend(props: { showUnionAuthorsModal: () => void }) {
  const { setClickedObject, clickedObject } = useClickedObject()
  const { metricType, authorshipType } = useOptions()
  const [collapse, setCollapse] = useBoolean(false)
  const [metricsData] = useMetrics()

  const metricCache = metricsData[authorshipType].get(metricType) ?? undefined

  if (metricCache === undefined) return null

  let legend: JSX.Element = <></>
  switch (getMetricLegendType(metricType)) {
    case "POINT":
      legend = <PointLegend metricCache={metricCache}></PointLegend>
      break
    case "GRADIENT":
      legend = <GradientLegend metricCache={metricCache}></GradientLegend>
      break
    case "SEGMENTS":
      legend = <SegmentLegend metricCache={metricCache}></SegmentLegend>
      break
  }

  if (clickedObject && collapse) return null
  return (
    <StyledBox>
      <CloseButton onClick={() => setCollapse(!collapse)}>
        {collapse ? <ArrowDropUp display="inline-block" height="2em" /> : <Close display="inline-block" height="1em" />}
      </CloseButton>
      <BoxSubTitle>
        {collapse ? <PointerMouse onClick={() => setCollapse(!collapse)}>See legend</PointerMouse> : Metric[metricType]}
      </BoxSubTitle>
      {!collapse ? (
        <>
          <Spacer />
          <BoxP>{getMetricDescription(metricType, authorshipType)}</BoxP>
          <Spacer lg />
        </>
      ) : null}
      {(metricType === "TOP_CONTRIBUTOR" || metricType === "SINGLE_AUTHOR") && !collapse ? (
        <>
          <Button onClick={props.showUnionAuthorsModal}>
            <PeopleAlt display="inline-block" height="1rem" />
            Merge duplicate users
          </Button>
          <Spacer lg />
        </>
      ) : null}
      {!collapse ? legend : null}
    </StyledBox>
  )
}

export interface MetricLegendProps {
  metricCache: MetricCache
}
