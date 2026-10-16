import type { Tipo } from '../conteudo/tipos.ts'
import { LADO, pixelsDoRetrato } from './retrato.ts'

type Props = {
  readonly especie: string
  readonly tipos: readonly Tipo[]
  readonly prismatica?: boolean
  readonly desperta?: boolean
  readonly tamanho?: number
}

export function Retrato({ especie, tipos, prismatica = false, desperta = false, tamanho = 64 }: Props) {
  const classes = ['retrato', prismatica && 'prismatico', desperta && 'desperto'].filter(Boolean).join(' ')
  return (
    <svg
      className={classes}
      width={tamanho}
      height={tamanho}
      viewBox={`0 0 ${LADO} ${LADO}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={especie}
    >
      {pixelsDoRetrato(especie, tipos).map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={1} height={1} fill={p.cor} />
      ))}
    </svg>
  )
}
