'use client'

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'

import styles from './hero.module.css'

type RimEdge = 'top' | 'right' | 'bottom' | 'left'

/** Speed of the light travelling from the wordmark to each service button, in px per second. */
const FLOW_SPEED = 80

function currentPath(
  map: DOMRect,
  word: DOMRect,
  button: DOMRect,
  edge: RimEdge,
  slot: number,
  phone: boolean,
  service: boolean,
) {
  const centerX = button.left + button.width / 2 - map.left
  const centerY = button.top + button.height / 2 - map.top
  const startY = word.top + word.height / 2 - map.top
  const above = centerY < startY
  const leftButton = centerX < word.left + word.width / 2 - map.left
  const leftPort = phone ? above : leftButton
  const startX = (leftPort ? word.left : word.right) - map.left
  const outward = leftPort ? -1 : 1

  // Allow for the side bearings of the italic R and o at the height of the connection.
  const inkX = service ? startX : startX - outward * word.height * (leftPort ? 0.22 : 0.13)
  const start = `M ${inkX} ${startY} H ${startX}`

  // Land on the centerline of the one-pixel border, perpendicular to the chosen edge.
  const sideEntry = edge === 'right' || edge === 'left'
  const endX = sideEntry
    ? (edge === 'right' ? button.right - 0.5 : button.left + 0.5) - map.left
    : centerX
  const endY = sideEntry
    ? centerY
    : (edge === 'bottom' ? button.bottom - 0.5 : button.top + 0.5) - map.top

  if (service && phone) {
    // Use the gap between the badge columns so paths can reach either row.
    const middle = word.left + word.width / 2 - map.left
    const side = edge === 'right' ? -1 : 1
    const laneX = middle + side * (Math.abs(endY - startY) > 130 ? 6 : 11)
    const originY = (above ? word.top : word.bottom) - map.top
    const bendY = endY + (above ? 1 : -1) * Math.min(20, Math.abs(originY - endY) / 2)
    return `M ${laneX} ${originY} V ${bendY} Q ${laneX} ${endY}, ${endX} ${endY}`
  }

  if (!phone) {
    if (sideEntry) {
      const bendX = (startX + endX) / 2
      const bendY = (startY + endY) / 2
      const dx = endX - startX
      const swell = outward * Math.min(15, Math.abs(dx) * 0.07)
      return [
        start,
        `C ${startX + dx * 0.24} ${startY}, ${bendX - dx * 0.16} ${bendY + swell}, ${bendX} ${bendY}`,
        `S ${endX - dx * 0.24} ${endY}, ${endX} ${endY}`,
      ].join(' ')
    }
    const bendX = startX + (endX - startX) * 0.65
    const bendY = endY + (startY - endY) * 0.56
    return `${start} C ${bendX} ${startY}, ${endX} ${bendY}, ${endX} ${endY}`
  }

  // Route through the gutters and turn in the space between the stacked phone buttons.
  const lane = map.width * (0.025 + 0.045 * Math.min(slot, 5 - slot))
  const laneX = leftPort
    ? Math.min(lane, button.left - map.left - 3)
    : Math.max(map.width - lane, button.right - map.left + 3)
  const vertical = above ? -1 : 1
  const landing = sideEntry ? 0 : Math.min(16, Math.abs(endY - startY) * 0.18)
  const approachX = endX + outward * landing
  const approachY = endY - vertical * landing
  const turn = Math.min(32, Math.abs(approachY - startY) * 0.38)
  const curve = [
    start,
    `C ${(startX + laneX) / 2} ${startY}, ${laneX} ${startY}, ${laneX} ${startY + vertical * turn}`,
    `V ${approachY - vertical * turn}`,
    `C ${laneX} ${approachY}, ${(laneX + approachX) / 2} ${approachY}, ${approachX} ${approachY}`,
  ]
  if (!sideEntry) curve.push(`Q ${endX} ${approachY}, ${endX} ${endY}`)
  return curve.join(' ')
}

// A second hairline crosses the main stroke like an engraved ribbon, tapering into it at both ends.
function engravedFilament(path: SVGPathElement, length: number) {
  const steps = 24
  const samples = Array.from({ length: steps + 1 }, (_, i) =>
    path.getPointAtLength(length * (0.16 + (0.68 * i) / steps)),
  )
  const points = samples.map((point, i) => {
    const before = samples[Math.max(0, i - 1)]
    const after = samples[Math.min(steps, i + 1)]
    const dx = after.x - before.x
    const dy = after.y - before.y
    const phase = (Math.PI * i) / steps
    const offset = Math.min(6, length / 38) * Math.sin(phase) ** 2 * Math.sin(phase * 2)
    const scale = offset / (Math.hypot(dx, dy) || 1)
    return { x: point.x - dy * scale, y: point.y + dx * scale }
  })
  const segments = [`M ${points[0].x} ${points[0].y}`]
  for (let i = 1; i < steps; i++) {
    const point = points[i]
    const next = points[i + 1]
    const endX = i === steps - 1 ? next.x : (point.x + next.x) / 2
    const endY = i === steps - 1 ? next.y : (point.y + next.y) / 2
    segments.push(`Q ${point.x} ${point.y}, ${endX} ${endY}`)
  }
  return segments.join(' ')
}

export function HeroMap({
  children,
  variant = 'home',
  style,
}: {
  children: ReactNode
  variant?: 'home' | 'service'
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const map = ref.current!
    const word = map.querySelector<HTMLElement>(`.${styles.wordmark}`)!
    const nodes = Array.from(map.querySelectorAll<HTMLElement>('[data-slot]'), (node) => ({
      node,
      slot: Number(node.dataset.slot),
      button: node.querySelector<HTMLElement>('[data-glass-service]')!,
      path: node.querySelector<SVGPathElement>('defs path')!,
      filament: node.querySelector<SVGPathElement>(`.${styles.filament}`)!,
    }))
    if (!nodes.length) return

    function draw() {
      const bounds = map.getBoundingClientRect()
      const title = word.getBoundingClientRect()
      const phone = getComputedStyle(map).getPropertyValue('--stacked-links').trim() === '1'
      const curves = nodes.map(({ button, slot }) => {
        const edge = getComputedStyle(button).getPropertyValue('--rim-joint').trim() as RimEdge
        return currentPath(
          bounds,
          title,
          button.getBoundingClientRect(),
          edge,
          slot,
          phone,
          variant === 'service',
        )
      })
      nodes.forEach(({ path }, i) => path.setAttribute('d', curves[i]))
      nodes.forEach(({ node, path, filament }) => {
        const length = path.getTotalLength()
        filament.setAttribute('d', engravedFilament(path, length))
        node.style.setProperty('--track-length', `${length}px`)
        node.style.setProperty('--travel-time', `${(length + 24) / FLOW_SPEED}s`)
      })
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(map)
    observer.observe(word)
    observer.observe(map.querySelector(`.${styles.identity}`)!)
    nodes.forEach(({ button }) => observer.observe(button))
    return () => observer.disconnect()
  }, [children, variant])

  return (
    <div
      ref={ref}
      className={variant === 'service' ? `${styles.map} ${styles.serviceMap}` : styles.map}
      style={style}
    >
      {children}
    </div>
  )
}
