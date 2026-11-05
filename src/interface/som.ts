// Música e efeitos gerados por código com a Web Audio API (GDD, seção 3).
import type { Evento } from '../engine/cacada.ts'

export type Efeito = 'abate' | 'chefe' | 'captura' | 'nivel' | 'evolucao' | 'conquista' | 'derrota'

// No máximo um efeito de cada tipo por passo da tela.
export function efeitosDosEventos(eventos: readonly Evento[]): Efeito[] {
  const efeitos = new Set<Efeito>()
  for (const evento of eventos) {
    if (evento.tipo === 'abate') efeitos.add(evento.chefe ? 'chefe' : 'abate')
    else if (evento.tipo === 'rota-liberada') efeitos.add('chefe')
    else if (evento.tipo === 'captura' && evento.sucesso) efeitos.add('captura')
    else if (evento.tipo === 'nivel' || evento.tipo === 'ovo') efeitos.add('nivel')
    else if (evento.tipo === 'evolucao') efeitos.add('evolucao')
    else if (evento.tipo === 'conquista') efeitos.add('conquista')
    else if (evento.tipo === 'derrota') efeitos.add('derrota')
  }
  return [...efeitos]
}

// Semitons acima da tônica, tempo de início em segundos e duração.
type Nota = readonly [semitom: number, inicio: number, duracao: number]

const NOTAS_DOS_EFEITOS: Readonly<Record<Efeito, readonly Nota[]>> = {
  abate: [[-12, 0, 0.12]],
  chefe: [[0, 0, 0.15], [7, 0.12, 0.3]],
  captura: [[0, 0, 0.12], [4, 0.1, 0.12], [7, 0.2, 0.3]],
  nivel: [[0, 0, 0.12], [4, 0.08, 0.12], [7, 0.16, 0.12], [12, 0.24, 0.3]],
  evolucao: [[0, 0, 0.2], [4, 0.15, 0.2], [7, 0.3, 0.2], [12, 0.45, 0.6]],
  conquista: [[12, 0, 0.6], [16, 0, 0.6], [19, 0, 0.6], [24, 0.05, 0.5]],
  derrota: [[7, 0, 0.2], [0, 0.18, 0.4]],
}

// Graus da escala maior de cada acorde, um a cada 8 s.
const ACORDES: readonly (readonly number[])[] = [
  [0, 4, 7],
  [9, 12, 16],
  [5, 9, 12],
  [7, 11, 14],
]
const PENTATONICA = [0, 2, 4, 7, 9, 12]
const COMPASSO_S = 8
const TRANSICAO_S = 2
// Lá 3 para a música, uma oitava acima para os efeitos.
const BASE_HZ = 220

function frequencia(semitons: number): number {
  return BASE_HZ * 2 ** (semitons / 12)
}

type Audio = {
  readonly contexto: AudioContext
  readonly musica: GainNode
  readonly efeitos: GainNode
}

let audio: Audio | null = null
let volumes = { musica: 0, efeitos: 0 }
let tonica = 0
let silenciado = false
let proximoCompasso = 0
let acorde = 0

function nota(destino: GainNode, hz: number, inicio: number, duracao: number, forma: OscillatorType, pico: number) {
  if (!audio) return
  const { contexto } = audio
  const oscilador = contexto.createOscillator()
  const envelope = contexto.createGain()
  oscilador.type = forma
  oscilador.frequency.value = hz
  envelope.gain.setValueAtTime(0.0001, inicio)
  envelope.gain.exponentialRampToValueAtTime(pico, inicio + Math.min(0.02, duracao / 4))
  envelope.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao)
  oscilador.connect(envelope).connect(destino)
  oscilador.start(inicio)
  oscilador.stop(inicio + duracao + 0.05)
}

// Um acorde longo de fundo e um arpejo lento na pentatônica, por compasso.
function agendarCompasso(inicio: number) {
  if (!audio) return
  const graus = ACORDES[acorde % ACORDES.length]
  acorde++
  for (const grau of graus) {
    const hz = frequencia(tonica + grau - 12)
    const envelope = audio.contexto.createGain()
    const oscilador = audio.contexto.createOscillator()
    oscilador.type = 'sine'
    oscilador.frequency.value = hz
    envelope.gain.setValueAtTime(0.0001, inicio)
    envelope.gain.linearRampToValueAtTime(0.06, inicio + 2)
    envelope.gain.linearRampToValueAtTime(0.0001, inicio + COMPASSO_S + 1)
    oscilador.connect(envelope).connect(audio.musica)
    oscilador.start(inicio)
    oscilador.stop(inicio + COMPASSO_S + 1.1)
  }
  for (let i = 0; i < 8; i++) {
    const semitom = graus[0] + PENTATONICA[(i * 3 + acorde) % PENTATONICA.length]
    nota(audio.musica, frequencia(tonica + semitom), inicio + i, 0.9, 'triangle', 0.05)
  }
}

// Agenda os compassos com antecedência; sem volume de música, não agenda nada.
function agendar() {
  if (!audio || silenciado || volumes.musica === 0) return
  const agora = audio.contexto.currentTime
  if (proximoCompasso < agora) proximoCompasso = agora + 0.1
  while (proximoCompasso < agora + 1) {
    agendarCompasso(proximoCompasso)
    proximoCompasso += COMPASSO_S
  }
}

function aplicarVolumes() {
  if (!audio) return
  const agora = audio.contexto.currentTime
  audio.musica.gain.setTargetAtTime(silenciado ? 0 : volumes.musica, agora, 0.1)
  audio.efeitos.gain.setTargetAtTime(silenciado ? 0 : volumes.efeitos, agora, 0.05)
}

// Os navegadores só liberam o som depois de um gesto do jogador.
export function liberarSom() {
  if (audio) {
    if (audio.contexto.state === 'suspended') void audio.contexto.resume()
    return
  }
  const contexto = new AudioContext()
  const musica = contexto.createGain()
  const efeitos = contexto.createGain()
  musica.gain.value = 0
  efeitos.gain.value = 0
  musica.connect(contexto.destination)
  efeitos.connect(contexto.destination)
  audio = { contexto, musica, efeitos }
  aplicarVolumes()
  setInterval(agendar, 250)
}

export function definirVolumes(musica: number, efeitos: number) {
  volumes = { musica, efeitos }
  aplicarVolumes()
}

// Com a aba escondida, o som para.
export function silenciar(ligado: boolean) {
  silenciado = ligado
  if (audio && !ligado && audio.contexto.state === 'suspended') void audio.contexto.resume()
  aplicarVolumes()
}

// Troca a tônica com a música abaixando e voltando em 2 s.
export function definirTonica(semitons: number) {
  if (semitons === tonica) return
  tonica = semitons
  if (!audio) return
  const agora = audio.contexto.currentTime
  const ganho = audio.musica.gain
  ganho.cancelScheduledValues(agora)
  ganho.setValueAtTime(ganho.value, agora)
  ganho.linearRampToValueAtTime(0, agora + TRANSICAO_S / 2)
  ganho.linearRampToValueAtTime(silenciado ? 0 : volumes.musica, agora + TRANSICAO_S)
  proximoCompasso = agora + TRANSICAO_S / 2
}

export function tocarEfeitos(efeitos: readonly Efeito[]) {
  if (!audio || silenciado || volumes.efeitos === 0) return
  const agora = audio.contexto.currentTime + 0.01
  for (const efeito of efeitos) {
    for (const [semitom, inicio, duracao] of NOTAS_DOS_EFEITOS[efeito]) {
      nota(audio.efeitos, frequencia(tonica + semitom + 12), agora + inicio, duracao, efeito === 'abate' ? 'triangle' : 'sine', 0.25)
    }
  }
}
