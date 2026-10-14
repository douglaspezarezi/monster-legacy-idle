import type { Tipo } from '../conteudo/tipos.ts'
import { LADO, pixelsDoRetrato } from './retrato.ts'

type Props = {
  readonly especie: string
  readonly tipos: readonly Tipo[]
  readonly prismatica?: boolean
  readonly tamanho?: number
}

export function Retrato({ especie, tipos, prismatica = false, tamanho = 64 }: Props) {
  return (
    <svg
      className={prismatica ? 'retrato prismatico' : 'retrato'}
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
