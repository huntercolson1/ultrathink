import type { ReactNode } from "react"

import { chartSvgPx } from "@/lib/chart-typography"

const chartInk = "var(--foreground)"
const chartMute = "var(--muted-foreground)"
const chartGrid = "var(--border)"
const chartPaper = "var(--background)"
const chartWarm = "var(--accent-warm)"
const chartSage = "var(--accent-sage)"
const chartBlue = "var(--accent-blue)"
const chartRadius = "6"

function ChartFigure({
  caption,
  children,
}: {
  caption?: string
  children: ReactNode
}) {
  return (
    <figure className="my-8 flex flex-col gap-3">
      {children}
      {caption ? (
        <figcaption className="text-caption-prose max-w-2xl text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

function axisY(value: number, max: number, top: number, height: number) {
  return top + height - (value / max) * height
}

export function FitzpatrickScaleExplainer() {
  const types = [
    { roman: "I", reaction: "Always burns, never tans" },
    { roman: "II", reaction: "Usually burns, tans minimally" },
    { roman: "III", reaction: "Sometimes mild burn, tans uniformly" },
    { roman: "IV", reaction: "Rarely burns, tans easily" },
    { roman: "V", reaction: "Very rarely burns, tans darkly" },
    { roman: "VI", reaction: "Almost never burns, deeply pigmented" },
  ]

  return (
    <aside
      role="note"
      aria-label="Simplified explainer of the six-step Fitzpatrick scale from Type I to Type VI."
      className="my-8 border-t border-border/70 pt-6"
    >
      <p className="text-eyebrow-ui m-0 text-muted-foreground/70">
        Quick reference
      </p>
      <p className="text-body m-0 mt-3 max-w-2xl text-muted-foreground">
        The Fitzpatrick scale classifies skin by its reaction to UV exposure,
        not its resting appearance. Each type describes a pattern of burning and
        tanning, not a color.
      </p>

      <dl className="m-0 mt-5 divide-y divide-border/60 border-t border-border/60">
        {types.map((type) => (
          <div
            key={type.roman}
            className="flex gap-4 py-3 first:pt-3 [&:last-child]:pb-0"
          >
            <dt className="text-label m-0 w-7 shrink-0 pt-[0.1em] text-center text-muted-foreground tabular-nums">
              {type.roman}
            </dt>
            <dd className="text-body m-0 flex-1 text-foreground">
              {type.reaction}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}

export function AgreementMetricsChart({ caption }: { caption?: string }) {
  const width = 760
  const height = 400
  const left = 72
  const right = 24
  const top = 52
  const bottom = 72
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom
  const slotWidth = plotWidth / 3
  const barWidth = 116
  const ticks = [0, 25, 50, 75, 100]
  const bars = [
    { label: ["Exact match"], value: 47.9, fill: chartWarm, opacity: 0.72 },
    { label: ["Within 1 type"], value: 91.0, fill: chartSage, opacity: 0.72 },
    { label: ["Within 2 types"], value: 98.4, fill: chartBlue, opacity: 0.72 },
  ]

  return (
    <ChartFigure caption={caption}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Bar chart showing exact agreement at 47.9 percent, within 1 step at 91.0 percent, and within 2 steps at 98.4 percent."
      >
        <text
          x={width / 2}
          y={30}
          fill={chartInk}
          fontFamily="var(--font-sans), sans-serif"
          fontSize={chartSvgPx.title}
          fontWeight="500"
          letterSpacing="-0.02em"
          textAnchor="middle"
        >
          Agreement looks different depending on the rule
        </text>

        {ticks.map((tick) => {
          const y = axisY(tick, 100, top, plotHeight)
          return (
            <g key={tick}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                stroke={chartGrid}
                strokeWidth="1"
              />
              <text
                x={left - 10}
                y={y + 4}
                fill={chartMute}
                fontFamily="var(--font-sans), sans-serif"
                fontSize={chartSvgPx.axis}
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          )
        })}

        <line
          x1={left}
          x2={left}
          y1={top}
          y2={height - bottom}
          stroke={chartMute}
          strokeWidth="1.25"
        />
        <line
          x1={left}
          x2={width - right}
          y1={height - bottom}
          y2={height - bottom}
          stroke={chartMute}
          strokeWidth="1.25"
        />

        <text
          x="22"
          y={top + plotHeight / 2}
          transform={`rotate(-90 22 ${top + plotHeight / 2})`}
          fill={chartMute}
          fontFamily="var(--font-sans), sans-serif"
          fontSize={chartSvgPx.axis}
          textAnchor="middle"
        >
          Percent of images
        </text>

        {bars.map((bar, index) => {
          const x = left + slotWidth * index + (slotWidth - barWidth) / 2
          const y = axisY(bar.value, 100, top, plotHeight)
          return (
            <g key={bar.label.join(" ")}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height - bottom - y}
                rx={chartRadius}
                fill={bar.fill}
                fillOpacity={bar.opacity}
              />
              <text
                x={x + barWidth / 2}
                y={y - 10}
                fill={chartInk}
                fontFamily="var(--font-sans), sans-serif"
                fontSize={chartSvgPx.dataValue}
                fontWeight="500"
                textAnchor="middle"
              >
                {bar.value.toFixed(1)}%
              </text>
              <text
                x={x + barWidth / 2}
                y={height - bottom + 24}
                fill={chartMute}
                fontFamily="var(--font-sans), sans-serif"
                fontSize={chartSvgPx.category}
                textAnchor="middle"
              >
                {bar.label.map((line, lineIndex) => (
                  <tspan
                    key={line}
                    x={x + barWidth / 2}
                    dy={lineIndex === 0 ? 0 : 15}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          )
        })}
      </svg>
    </ChartFigure>
  )
}

export function ConsensusConfusionMatrixChart({
  caption,
}: {
  caption?: string
}) {
  const matrix = [
    [2461, 291, 42, 9, 4, 1],
    [2400, 1559, 491, 67, 12, 4],
    [492, 880, 1288, 394, 43, 4],
    [97, 302, 949, 968, 327, 28],
    [18, 52, 122, 470, 667, 161],
    [18, 9, 9, 32, 209, 350],
  ]
  const labels = ["I", "II", "III", "IV", "V", "VI"]
  const n = 6
  const width = 760
  // Grid is n×(cell+gap) − gap tall; old viewBox was 520px but grid needed ~586px → clipping.
  const cell = 72
  const gap = 6
  const gridW = n * cell + (n - 1) * gap
  const gridH = gridW
  const padL = 132
  const padR = 32
  const padT = 48
  const titleY = 28
  const startX = padL + (width - padL - padR - gridW) / 2
  const startY = padT + 44
  const colLabelCenterY = startY - 14
  const rowLabelX = startX - 10
  const gridMidY = startY + gridH / 2
  const gridBottom = startY + gridH
  const xLabelY = gridBottom + 36
  // viewBox height: title + grid + x-axis caption + bottom breathing room
  const height = xLabelY + 28
  const max = 2461

  return (
    <ChartFigure caption={caption}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label="6 by 6 confusion matrix comparing the Scale AI and Centaur Labs consensus labels. Darker terracotta cells mean more images; counts concentrate along the diagonal."
      >
        <text
          x={width / 2}
          y={titleY}
          fill={chartInk}
          fontFamily="var(--font-sans), sans-serif"
          fontSize={chartSvgPx.title}
          fontWeight="500"
          letterSpacing="-0.02em"
          textAnchor="middle"
        >
          Most disagreements stay close to the diagonal
        </text>

        {labels.map((label, column) => {
          const cx = startX + column * (cell + gap) + cell / 2
          return (
            <text
              key={`col-${label}`}
              x={cx}
              y={colLabelCenterY}
              fill={chartMute}
              fontFamily="var(--font-sans), sans-serif"
              fontSize={chartSvgPx.category}
              fontWeight="500"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {label}
            </text>
          )
        })}

        {labels.map((label, row) => {
          const cy = startY + row * (cell + gap) + cell / 2
          return (
            <text
              key={`row-${label}`}
              x={rowLabelX}
              y={cy}
              fill={chartMute}
              fontFamily="var(--font-sans), sans-serif"
              fontSize={chartSvgPx.category}
              fontWeight="500"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {label}
            </text>
          )
        })}

        <text
          x={width / 2}
          y={xLabelY}
          fill={chartMute}
          fontFamily="var(--font-sans), sans-serif"
          fontSize={chartSvgPx.axis}
          textAnchor="middle"
        >
          Centaur Labs consensus type
        </text>
        <text
          x={Math.max(24, rowLabelX - 56)}
          y={gridMidY}
          transform={`rotate(-90 ${Math.max(24, rowLabelX - 56)} ${gridMidY})`}
          fill={chartMute}
          fontFamily="var(--font-sans), sans-serif"
          fontSize={chartSvgPx.axis}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          Scale AI consensus type
        </text>

        {matrix.map((row, rowIndex) =>
          row.map((value, columnIndex) => {
            const x = startX + columnIndex * (cell + gap)
            const y = startY + rowIndex * (cell + gap)
            // Brand accent: intensity = count (not skin-tone swatches; abstract data ink).
            const opacity = 0.1 + (value / max) * 0.78
            const fill = chartWarm
            const textFill = opacity > 0.36 ? chartPaper : chartInk

            return (
              <g key={`${rowIndex}-${columnIndex}`}>
                <rect
                  x={x}
                  y={y}
                  width={cell}
                  height={cell}
                  rx={chartRadius}
                  fill={fill}
                  fillOpacity={opacity}
                  stroke={chartGrid}
                  strokeOpacity={0.5}
                  strokeWidth={1}
                />
                <text
                  x={x + cell / 2}
                  y={y + cell / 2}
                  fill={textFill}
                  fontFamily="var(--font-sans), sans-serif"
                  fontSize={chartSvgPx.dataValue}
                  fontWeight="500"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontFeatureSettings: '"tnum" 1' }}
                >
                  {value}
                </text>
              </g>
            )
          })
        )}
      </svg>
    </ChartFigure>
  )
}

export function BucketConsistencyChart({ caption }: { caption?: string }) {
  const width = 760
  const height = 400
  const left = 72
  const right = 24
  const top = 52
  const bottom = 72
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom
  const slotWidth = plotWidth / 2
  const barWidth = 170
  const ticks = [0, 20, 40, 60, 80, 100]
  const bars = [
    {
      label: ["Same fairness", "bucket"],
      value: 76.8,
      fill: chartSage,
      opacity: 0.76,
    },
    {
      label: ["Different fairness", "bucket"],
      value: 23.2,
      fill: chartWarm,
      opacity: 0.76,
    },
  ]

  return (
    <ChartFigure caption={caption}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Bar chart showing how often images stay in the same broad subgroup versus move to a different one."
      >
        <text
          x={width / 2}
          y={30}
          fill={chartInk}
          fontFamily="var(--font-sans), sans-serif"
          fontSize={chartSvgPx.title}
          fontWeight="500"
          letterSpacing="-0.02em"
          textAnchor="middle"
        >
          Bucket changes are common enough to matter
        </text>

        {ticks.map((tick) => {
          const y = axisY(tick, 100, top, plotHeight)
          return (
            <g key={tick}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                stroke={chartGrid}
                strokeWidth="1"
              />
              <text
                x={left - 10}
                y={y + 4}
                fill={chartMute}
                fontFamily="var(--font-sans), sans-serif"
                fontSize={chartSvgPx.axis}
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          )
        })}

        <line
          x1={left}
          x2={left}
          y1={top}
          y2={height - bottom}
          stroke={chartMute}
          strokeWidth="1.25"
        />
        <line
          x1={left}
          x2={width - right}
          y1={height - bottom}
          y2={height - bottom}
          stroke={chartMute}
          strokeWidth="1.25"
        />

        <text
          x="22"
          y={top + plotHeight / 2}
          transform={`rotate(-90 22 ${top + plotHeight / 2})`}
          fill={chartMute}
          fontFamily="var(--font-sans), sans-serif"
          fontSize={chartSvgPx.axis}
          textAnchor="middle"
        >
          Percent of comparable images
        </text>

        {bars.map((bar, index) => {
          const x = left + slotWidth * index + (slotWidth - barWidth) / 2
          const y = axisY(bar.value, 100, top, plotHeight)
          return (
            <g key={bar.label.join(" ")}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height - bottom - y}
                rx={chartRadius}
                fill={bar.fill}
                fillOpacity={bar.opacity}
              />
              <text
                x={x + barWidth / 2}
                y={y - 10}
                fill={chartInk}
                fontFamily="var(--font-sans), sans-serif"
                fontSize={chartSvgPx.dataValue}
                fontWeight="500"
                textAnchor="middle"
              >
                {bar.value.toFixed(1)}%
              </text>
              <text
                x={x + barWidth / 2}
                y={height - bottom + 24}
                fill={chartMute}
                fontFamily="var(--font-sans), sans-serif"
                fontSize={chartSvgPx.category}
                textAnchor="middle"
              >
                {bar.label.map((line, lineIndex) => (
                  <tspan
                    key={line}
                    x={x + barWidth / 2}
                    dy={lineIndex === 0 ? 0 : 15}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          )
        })}
      </svg>
    </ChartFigure>
  )
}

export function RepresentationShiftChart({ caption }: { caption?: string }) {
  const width = 760
  const height = 400
  const left = 72
  const right = 24
  const top = 52
  const bottom = 72
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom
  const groupWidth = plotWidth / 3
  const barWidth = 54
  const ticks = [0, 10, 20, 30, 40, 50, 60]
  const groups = [
    { label: ["Light", "(I-II)"], scale: 48.2, centaur: 56.3 },
    { label: ["Medium", "(III-IV)"], scale: 37.9, centaur: 31.8 },
    { label: ["Dark", "(V-VI)"], scale: 13.9, centaur: 11.9 },
  ]

  return (
    <ChartFigure caption={caption}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Grouped bar chart comparing the distribution of images across light, medium, and dark groups for each pipeline."
      >
        <text
          x={width / 2}
          y={30}
          fill={chartInk}
          fontFamily="var(--font-sans), sans-serif"
          fontSize={chartSvgPx.title}
          fontWeight="500"
          letterSpacing="-0.02em"
          textAnchor="middle"
        >
          Pipeline choice shifts the subgroup mix
        </text>

        {ticks.map((tick) => {
          const y = axisY(tick, 60, top, plotHeight)
          return (
            <g key={tick}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                stroke={chartGrid}
                strokeWidth="1"
              />
              <text
                x={left - 10}
                y={y + 4}
                fill={chartMute}
                fontFamily="var(--font-sans), sans-serif"
                fontSize={chartSvgPx.axis}
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          )
        })}

        <line
          x1={left}
          x2={left}
          y1={top}
          y2={height - bottom}
          stroke={chartMute}
          strokeWidth="1.25"
        />
        <line
          x1={left}
          x2={width - right}
          y1={height - bottom}
          y2={height - bottom}
          stroke={chartMute}
          strokeWidth="1.25"
        />

        <text
          x="22"
          y={top + plotHeight / 2}
          transform={`rotate(-90 22 ${top + plotHeight / 2})`}
          fill={chartMute}
          fontFamily="var(--font-sans), sans-serif"
          fontSize={chartSvgPx.axis}
          textAnchor="middle"
        >
          Percent of labeled images
        </text>

        <g transform={`translate(${width - 208}, ${top + 6})`}>
          <rect
            x="0"
            y="0"
            width="14"
            height="14"
            rx="3"
            fill={chartWarm}
            fillOpacity="0.82"
          />
          <text
            x="22"
            y="11"
            fill={chartMute}
            fontFamily="var(--font-sans), sans-serif"
            fontSize={chartSvgPx.axis}
          >
            Scale AI consensus
          </text>
          <rect
            x="0"
            y="24"
            width="14"
            height="14"
            rx="3"
            fill={chartSage}
            fillOpacity="0.82"
          />
          <text
            x="22"
            y="35"
            fill={chartMute}
            fontFamily="var(--font-sans), sans-serif"
            fontSize={chartSvgPx.axis}
          >
            Centaur Labs consensus
          </text>
        </g>

        {groups.map((group, index) => {
          const groupX = left + groupWidth * index + groupWidth / 2
          const scaleX = groupX - barWidth - 7
          const centaurX = groupX + 7
          const scaleY = axisY(group.scale, 60, top, plotHeight)
          const centaurY = axisY(group.centaur, 60, top, plotHeight)

          return (
            <g key={group.label[0]}>
              <rect
                x={scaleX}
                y={scaleY}
                width={barWidth}
                height={height - bottom - scaleY}
                rx={chartRadius}
                fill={chartWarm}
                fillOpacity="0.82"
              />
              <text
                x={scaleX + barWidth / 2}
                y={scaleY - 10}
                fill={chartInk}
                fontFamily="var(--font-sans), sans-serif"
                fontSize={chartSvgPx.dataValue}
                fontWeight="500"
                textAnchor="middle"
              >
                {group.scale.toFixed(1)}%
              </text>
              <rect
                x={centaurX}
                y={centaurY}
                width={barWidth}
                height={height - bottom - centaurY}
                rx={chartRadius}
                fill={chartSage}
                fillOpacity="0.82"
              />
              <text
                x={centaurX + barWidth / 2}
                y={centaurY - 10}
                fill={chartInk}
                fontFamily="var(--font-sans), sans-serif"
                fontSize={chartSvgPx.dataValue}
                fontWeight="500"
                textAnchor="middle"
              >
                {group.centaur.toFixed(1)}%
              </text>
              <text
                x={groupX}
                y={height - bottom + 24}
                fill={chartMute}
                fontFamily="var(--font-sans), sans-serif"
                fontSize={chartSvgPx.category}
                textAnchor="middle"
              >
                {group.label.map((line, lineIndex) => (
                  <tspan key={line} x={groupX} dy={lineIndex === 0 ? 0 : 15}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          )
        })}
      </svg>
    </ChartFigure>
  )
}
