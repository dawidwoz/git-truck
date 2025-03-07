import { useMemo, useState } from "react"
import type { HydratedGitBlobObject, HydratedGitObject } from "~/analyzer/model"
import { ClickedObjectContext } from "~/contexts/ClickedContext"
import { CommitTab, CommitTabContext, getDefaultCommitTab } from "~/contexts/CommitTabContext"
import type { RepoData } from "~/routes/$repo.$"
import { DataContext } from "../contexts/DataContext"
import { MetricsContext } from "../contexts/MetricContext"
import type { ChartType, Options } from "../contexts/OptionsContext"
import { getDefaultOptions, OptionsContext } from "../contexts/OptionsContext"
import { PathContext } from "../contexts/PathContext"
import { SearchContext } from "../contexts/SearchContext"
import type { AuthorshipType, DepthType, MetricsData, MetricType } from "../metrics/metrics"
import { createMetricData as createMetricsData } from "../metrics/metrics"

interface ProvidersProps {
  children: React.ReactNode
  data: RepoData
}

export function Providers({ children, data }: ProvidersProps) {
  const [options, setOptions] = useState<Options | null>(null)
  const [commitTab, setCommitTab] = useState<CommitTab | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchResults, setSearchResults] = useState<HydratedGitObject[]>([])
  const [path, setPath] = useState(data.repo.name)
  const [clickedObject, setClickedObject] = useState<HydratedGitObject | null>(null)

  const metricsData: MetricsData = useMemo(() => createMetricsData(data.analyzerData), [data])

  const commitTabValue = useMemo(
    () => ({
      ...getDefaultCommitTab(),
      ...commitTab,
      setStartDate: (newDate: number | null) => {
        setCommitTab((prevValue) => ({
          ...(prevValue ?? getDefaultCommitTab()),
          startDate: newDate,
        }))
      },
      setEndDate: (newDate: number | null) => {
        setCommitTab((prevValue) => ({
          ...(prevValue ?? getDefaultCommitTab()),
          endDate: newDate,
        }))
      },
    }),
    [commitTab]
  )

  const optionsValue = useMemo(
    () => ({
      ...getDefaultOptions(),
      ...options,
      setMetricType: (metricType: MetricType) =>
        setOptions((prevOptions) => ({
          ...(prevOptions ?? getDefaultOptions()),
          metricType,
        })),
      setChartType: (chartType: ChartType) =>
        setOptions((prevOptions) => ({
          ...(prevOptions ?? getDefaultOptions()),
          chartType,
        })),
      setAuthorshipType: (authorshipType: AuthorshipType) =>
        setOptions((prevOptions) => ({
          ...(prevOptions ?? getDefaultOptions()),
          authorshipType,
        })),
      setDepthType: (depthType: DepthType) =>
        setOptions((prevOptions) => ({
          ...(prevOptions ?? getDefaultOptions()),
          depthType,
        })),
      setHoveredBlob: (blob: HydratedGitBlobObject | null) =>
        setOptions((prevOptions) => ({
          ...(prevOptions ?? getDefaultOptions()),
          hoveredBlob: blob,
        })),
      setClickedObject: (object: HydratedGitObject | null) =>
        setOptions((prevOptions) => ({
          ...(prevOptions ?? getDefaultOptions()),
          clickedObject: object,
        })),
      setAnimationsEnabled: (enabled: boolean) =>
        setOptions((prevOptions) => ({
          ...(prevOptions ?? getDefaultOptions()),
          animationsEnabled: enabled,
        })),
      setLabelsVisible: (visible: boolean) =>
        setOptions((prevOptions) => ({
          ...(prevOptions ?? getDefaultOptions()),
          labelsVisible: visible,
        })),
    }),
    [options]
  )

  return (
    <DataContext.Provider value={data}>
      <MetricsContext.Provider value={metricsData}>
        <OptionsContext.Provider value={optionsValue}>
          <SearchContext.Provider
            value={{
              searchText,
              setSearchText,
              searchResults,
              setSearchResults,
            }}
          >
            <PathContext.Provider value={{ path, setPath }}>
              <ClickedObjectContext.Provider value={{ clickedObject, setClickedObject }}>
                <CommitTabContext.Provider value={commitTabValue}>{children}</CommitTabContext.Provider>
              </ClickedObjectContext.Provider>
            </PathContext.Provider>
          </SearchContext.Provider>
        </OptionsContext.Provider>
      </MetricsContext.Provider>
    </DataContext.Provider>
  )
}
