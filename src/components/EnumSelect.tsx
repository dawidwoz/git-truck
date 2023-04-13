import { useId } from "react"
import { Spacer } from "./Spacer"
import { Label, SelectWithEllipsis } from "./util"

interface EnumSelectProps<T extends string> {
  label: string
  enum: Record<T, string>
  onChange: (metric: T) => void
  hidden?: boolean
  showNoLabelWhenInactive?: boolean 
}

export function EnumSelect<T extends string>(props: EnumSelectProps<T>) {
  const id = useId()
  const enumEntries = Object.entries(props.enum) as [T, string][]

  return (
    <div style={props.hidden ? { display: "none" } : {}}>
      <Label htmlFor={id}>{props.label}</Label>
      <Spacer xs />
      <SelectWithEllipsis
        id={id}
        showNoLabelWhenInactive={props.showNoLabelWhenInactive}
        onChange={(event) => props.onChange(event.target.value as T)}
      >
        {enumEntries.map(([key, value]) => (
          <option key={value} value={key}>
            {value}
          </option>
        ))}
      </SelectWithEllipsis>
    </div>
  )
}
