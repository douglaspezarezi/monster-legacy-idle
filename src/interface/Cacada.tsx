// Tela da caçada: desenha o estado e envia comandos ao motor.
import { Fragment, useState } from 'react'
import { CATALOGO, CONFIGURACAO } from '../conteudo/jogo.ts'
import { BIOMAS } from '../conteudo/biomas.ts'
import { colocarNaForja, colocarNaMina, fragmentosPorHoraDaMina, ouroPorHoraDaForja, tirarDaForja, tirarDaMina } from '../engine/base.ts'
import { ABATES_PARA_O_CHEFE } from '../engine/cacada.ts'
import { dadosDaEra, podeReiniciarEra, reiniciarEra } from '../engine/era.ts'
import { ESPACOS_NA_RESERVA } from '../engine/captura.ts'
import type { Combatente } from '../engine/combate.ts'
import type { Criatura } from '../engine/criatura.ts'
import { ESSENCIAS_DO_DESPERTAR, FRAGMENTOS_DO_DESPERTAR, NIVEL_DO_DESPERTAR, despertar, impedimentoDoDespertar, tipoDaEssencia } from '../engine/despertar.ts'
import { especieDo } from '../engine/especie.ts'
import type { Raridade } from '../engine/genes.ts'
import { FAIXAS_DE_RARIDADE, raridadeDosGenes } from '../engine/genes.ts'
import type { EstadoDoJogo, ItemDaLoja, Membro } from '../engine/jogo.ts'
import {
  PRECOS,
  abrirMatrizDoInventario,
  comprar,
  definirReposicao,
  definirAvancoAutomatico,
  definirFiltroDeCaptura,
  definirGatilhoDeCura,
  escolherBioma,
  escolherRota,
  retomarCacada,
  trocarAtiva,
  vidaAtual,
  vidaMaxima,
} from '../engine/jogo.ts'
import { xpParaSubir } from '../engine/nivel.ts'
import type { Tipo } from '../conteudo/tipos.ts'
import { PainelDasIlhas } from './PainelDasIlhas.tsx'
import { PainelDeCruzamento } from './PainelDeCruzamento.tsx'
import { PainelDeEquipamentos } from './PainelDeEquipamentos.tsx'
import { Retrato } from './Retrato.tsx'
import { NOME_DA_RARIDADE, NOME_DO_ITEM, descreverGenes, formatarTempo } from './textos.ts'
import type { Comando, Sessao } from './useJogo.ts'

type Props = { readonly sessao: Sessao; readonly executar: (comando: Comando) => void }

const ITENS: readonly ItemDaLoja[] = ['capsula', 'tonicoDeCura', 'tonicoDeRetorno']

function rotuloDaCriatura(criatura: Criatura): string {
  const raridade = NOME_DA_RARIDADE[raridadeDosGenes(criatura.genes)]
  return `${criatura.especie} ${raridade}${criatura.prismatica ? ' prismática' : ''}${criatura.despertada ? ' desperta' : ''}`
}

// Só aparece para quem chegou ao nível do Despertar e ainda não despertou; o título diz o que falta.
type PropsDoDespertar = { readonly estado: EstadoDoJogo<Tipo>; readonly membro: Membro; readonly executar: (comando: Comando) => void }

function BotaoDeDespertar({ estado, membro, executar }: PropsDoDespertar) {
  if (membro.despertada || membro.nivel < NIVEL_DO_DESPERTAR) return null
  const impedimento = impedimentoDoDespertar(CATALOGO, estado, membro.id)
  const tipo = tipoDaEssencia(CATALOGO, membro.especie)
  return (
    <button
      disabled={impedimento !== null}
      title={impedimento ?? `Gasta ${FRAGMENTOS_DO_DESPERTAR} Fragmentos e ${ESSENCIAS_DO_DESPERTAR} Essências de ${tipo}`}
      onClick={() => executar((e, t) => despertar(CATALOGO, e, membro.id, t))}
    >
      Despertar
    </button>
  )
}

function Barra({ valor, maximo, classe }: { readonly valor: number; readonly maximo: number; readonly classe: string }) {
  const fracao = maximo > 0 ? Math.max(0, Math.min(1, valor / maximo)) : 0
  return (
    <div className={`barra ${classe}`}>
      <div className="preenchimento" style={{ width: `${fracao * 100}%` }} />
      <span>
        {Math.ceil(valor)} / {Math.ceil(maximo)}
      </span>
    </div>
  )
}

function Lutador({ titulo, criatura, combatente }: { readonly titulo: string; readonly criatura: Criatura; readonly combatente: Combatente<Tipo> }) {
  return (
    <div className="lutador">
      <Retrato especie={criatura.especie} tipos={combatente.tipos} prismatica={criatura.prismatica} desperta={criatura.despertada} />
      <small>{titulo}</small>
      <strong>
        {rotuloDaCriatura(criatura)} · nível {criatura.nivel}
      </strong>
      <span className="tipos">{combatente.tipos.join(' / ')}</span>
      <Barra valor={combatente.vida} maximo={combatente.atributos.vida} classe="vida" />
    </div>
  )
}

export function Cacada({ sessao, executar }: Props) {
  const { estado, agora, registros } = sessao
  const { ativa, inventario, encontro } = estado
  const maximaDaAtiva = vidaMaxima(CATALOGO, ativa)
  const abates = estado.abatesPorRota[estado.rota - 1] ?? 0
  const fadigaRestante = estado.fadigaAte - agora
  const era = dadosDaEra(CONFIGURACAO.eras, estado.era)
  const bioma = BIOMAS[estado.bioma]
  // As espécies do bioma atual e as já marcadas em outros biomas.
  const especiesDoFiltro = [...new Set([...bioma.especiesPorRota.flat(), ...estado.filtroDeCaptura.especies])]
  const [selecionados, setSelecionados] = useState<readonly number[]>([])
  const naForja = (id: number) => estado.forja.trabalhadores.includes(id)
  const naMina = (id: number) => estado.mina.trabalhadores.includes(id)
  const ocupada = (id: number) => naForja(id) || naMina(id)
  // Some da seleção quem saiu da reserva ou foi trabalhar.
  const pais = selecionados.flatMap((id) => estado.reserva.filter((m) => m.id === id && !ocupada(id)))
  const forjaCheia = estado.forja.trabalhadores.length >= CONFIGURACAO.forja.vagas
  const minaCheia = estado.mina.trabalhadores.length >= CONFIGURACAO.mina.vagas
  const essencias = Object.entries(inventario.essencias).filter(([, quantidade]) => quantidade > 0)

  function alternarPai(membro: Membro) {
    setSelecionados(pais.some((p) => p.id === membro.id) ? pais.filter((p) => p.id !== membro.id).map((p) => p.id) : [...pais.map((p) => p.id), membro.id].slice(-2))
  }

  return (
    <div className="cacada">
      <section className="painel luta">
        <header>
          <h2>
            Era {estado.era} · {bioma.nome} · Rota {estado.rota}
          </h2>
          <span>
            {encontro?.chefe ? 'Chefe da rota!' : `Chefe em ${ABATES_PARA_O_CHEFE - abates} abates`}
          </span>
        </header>
        {podeReiniciarEra(CONFIGURACAO.eras, estado) && (
          <p className="aviso">
            {ativa.especie} chegou ao nível {era.teto}, o teto da Era {estado.era}. Reiniciar a Era leva o monstro ativo ao nível 1, com os
            mesmos genes, e libera a Era {estado.era + 1}. Ouro, itens, reserva, equipamentos, Forja, Mina e Despertar ficam.{' '}
            <button onClick={() => executar((e, t) => reiniciarEra(CONFIGURACAO, e, t))}>Reiniciar a Era</button>
          </p>
        )}
        {fadigaRestante > 0 && <p className="aviso">Fadiga: metade de XP e ouro por mais {formatarTempo(fadigaRestante)}</p>}
        {estado.pausada && (
          <p className="aviso">
            Caçada pausada sem Tônico de Retorno.{' '}
            <button onClick={() => executar((e, t) => retomarCacada(e, CATALOGO, t))}>Retomar</button>
          </p>
        )}
        <div className="lutadores">
          <div className="lutador">
            <Retrato especie={ativa.especie} tipos={especieDo(CATALOGO, ativa.especie).tipos} prismatica={ativa.prismatica} desperta={ativa.despertada} />
            <small>Seu monstro</small>
            <strong>
              {rotuloDaCriatura(ativa)} · nível {ativa.nivel} de {era.teto}
            </strong>
            <span className="tipos">{especieDo(CATALOGO, ativa.especie).tipos.join(' / ')}</span>
            <Barra valor={vidaAtual(estado)} maximo={maximaDaAtiva} classe="vida" />
            <Barra valor={ativa.xpNoNivel} maximo={xpParaSubir(ativa.nivel)} classe="xp" />
            <BotaoDeDespertar estado={estado} membro={ativa} executar={executar} />
          </div>
          {encontro ? (
            <Lutador titulo={encontro.chefe ? 'Chefe' : 'Selvagem'} criatura={encontro.selvagem} combatente={encontro.luta.selvagem} />
          ) : (
            <div className="lutador vazio">{estado.pausada ? '' : 'Procurando…'}</div>
          )}
        </div>
      </section>

      <section className="painel rotas">
        <h3>Biomas</h3>
        <div className="botoes biomas">
          {BIOMAS.map((b, i) => (
            <button
              key={b.nome}
              className={i === estado.bioma ? 'escolhida' : ''}
              disabled={b.era > estado.era}
              title={b.era > estado.era ? `Abre na Era ${b.era}` : undefined}
              onClick={() => executar((e, t) => escolherBioma(e, BIOMAS, i, t))}
            >
              {b.nome}
              <small>{b.tipo}</small>
            </button>
          ))}
        </div>
        <h3>Rotas</h3>
        <div className="botoes">
          {/* Os biomas das Eras 1 e 2 não têm a rota 6. */}
          {CONFIGURACAO.rotas.slice(0, bioma.especiesPorRota.length).map((rota, i) => {
            const numero = i + 1
            return (
              <button
                key={numero}
                className={numero === estado.rota ? 'escolhida' : ''}
                disabled={numero > estado.rotasLiberadas}
                onClick={() => executar((e, t) => escolherRota(e, numero, t))}
                title={numero > era.rotas ? `Liberada numa Era seguinte` : `Níveis ${rota.faixaDeNivel[0]} a ${rota.faixaDeNivel[1]}: ${bioma.especiesPorRota[i].join(', ')}`}
              >
                {numero}
                <small>
                  {rota.faixaDeNivel[0]}–{rota.faixaDeNivel[1]}
                </small>
              </button>
            )
          })}
        </div>
        <label className="opcao">
          <input
            type="checkbox"
            checked={estado.avancoAutomatico}
            onChange={(ev) => {
              const ligado = ev.target.checked
              executar((e) => definirAvancoAutomatico(e, ligado))
            }}
          />
          Avanço automático depois do chefe
        </label>
      </section>

      <section className="painel inventario">
        <h3>Inventário</h3>
        <dl>
          <dt>Ouro</dt>
          <dd>{inventario.ouro}</dd>
          <dt>Cápsulas</dt>
          <dd>{inventario.capsulas}</dd>
          <dt>Tônicos de Cura</dt>
          <dd>{inventario.tonicosDeCura}</dd>
          <dt>Tônicos de Retorno</dt>
          <dd>{inventario.tonicosDeRetorno}</dd>
          <dt>Fragmentos</dt>
          <dd>{inventario.fragmentos}</dd>
          <dt>Chaves da Ilha</dt>
          <dd>{inventario.chaves}</dd>
          {essencias.map(([tipo, quantidade]) => (
            <Fragment key={tipo}>
              <dt>Essências de {tipo}</dt>
              <dd>{quantidade}</dd>
            </Fragment>
          ))}
        </dl>
        <h4>Loja da Cidade</h4>
        <p className="dica">Em “mín.”, a Loja repõe sozinha até esse estoque, também com o jogo fechado.</p>
        {ITENS.map((item) => (
          <div key={item} className="item-da-loja">
            <span>
              {NOME_DO_ITEM[item]} · {PRECOS[item]}
            </span>
            {[1, 10].map((quantidade) => (
              <button
                key={quantidade}
                disabled={PRECOS[item] * quantidade > inventario.ouro}
                onClick={() => executar((e) => comprar(e, item, quantidade))}
              >
                +{quantidade}
              </button>
            ))}
            <label className="minimo" title="A Loja repõe sozinha até este estoque, também com o jogo fechado. 0 desliga.">
              mín.
              <input
                type="number"
                min={0}
                max={999}
                value={estado.reposicao[item]}
                onChange={(ev) => {
                  const minimo = Math.max(0, Math.min(999, Math.floor(Number(ev.target.value) || 0)))
                  executar((e) => definirReposicao(e, item, minimo))
                }}
              />
            </label>
          </div>
        ))}
        <label className="opcao">
          Usar Tônico de Cura abaixo de {Math.round(estado.gatilhoDeCura * 100)}% da vida
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round(estado.gatilhoDeCura * 100)}
            onChange={(ev) => {
              const gatilho = Number(ev.target.value) / 100
              executar((e) => definirGatilhoDeCura(e, gatilho))
            }}
          />
        </label>
      </section>

      <section className="painel captura">
        <h3>Captura</h3>
        <p>Uma Cápsula é usada em cada selvagem vencido que passa no filtro.</p>
        <div className="especies">
          {especiesDoFiltro.map((nome) => {
            const marcada = estado.filtroDeCaptura.especies.includes(nome)
            return (
              <label key={nome} className="opcao">
                <input
                  type="checkbox"
                  checked={marcada}
                  onChange={() =>
                    executar((e) => {
                      const especies = marcada
                        ? e.filtroDeCaptura.especies.filter((n) => n !== nome)
                        : [...e.filtroDeCaptura.especies, nome]
                      return definirFiltroDeCaptura(e, { ...e.filtroDeCaptura, especies })
                    })
                  }
                />
                {nome}
              </label>
            )
          })}
        </div>
        <label className="opcao">
          Raridade mínima
          <select
            value={estado.filtroDeCaptura.raridadeMinima}
            onChange={(ev) => {
              const raridadeMinima = ev.target.value as Raridade
              executar((e) => definirFiltroDeCaptura(e, { ...e.filtroDeCaptura, raridadeMinima }))
            }}
          >
            {FAIXAS_DE_RARIDADE.map(({ raridade }) => (
              <option key={raridade} value={raridade}>
                {NOME_DA_RARIDADE[raridade]}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="painel reserva">
        <h3>
          Reserva ({estado.reserva.length}/{ESPACOS_NA_RESERVA})
        </h3>
        {inventario.matrizes.length > 0 && (
          <ul className="lista">
            {inventario.matrizes.map((matriz, i) => (
              <li key={i}>
                <span>
                  Matriz: {matriz.especie} {NOME_DA_RARIDADE[matriz.raridade]}
                </span>
                <button
                  disabled={estado.reserva.length >= ESPACOS_NA_RESERVA}
                  onClick={() => executar((e, _t, g) => abrirMatrizDoInventario(e, i, g))}
                >
                  Abrir
                </button>
              </li>
            ))}
          </ul>
        )}
        {estado.reserva.length === 0 ? (
          <p>Nenhum monstro na reserva.</p>
        ) : (
          <ul className="lista">
            {estado.reserva.map((membro) => (
              <li key={membro.id} className={pais.some((p) => p.id === membro.id) ? 'selecionado' : ''}>
                <Retrato
                  especie={membro.especie}
                  tipos={especieDo(CATALOGO, membro.especie).tipos}
                  prismatica={membro.prismatica}
                  desperta={membro.despertada}
                  tamanho={32}
                />
                <div className="membro">
                  <span>
                    {rotuloDaCriatura(membro)} · nível {membro.nivel}
                    {naForja(membro.id) && ' · na Forja'}
                    {naMina(membro.id) && ' · na Mina'}
                  </span>
                  <small>{descreverGenes(membro.genes)}</small>
                </div>
                <div className="acoes">
                  <button disabled={ocupada(membro.id)} onClick={() => executar((e, t) => trocarAtiva(e, CATALOGO, membro.id, t))}>
                    Ativar
                  </button>
                  {naForja(membro.id) ? (
                    <button onClick={() => executar((e) => tirarDaForja(e, membro.id))}>Sair da Forja</button>
                  ) : naMina(membro.id) ? (
                    <button onClick={() => executar((e) => tirarDaMina(e, membro.id))}>Sair da Mina</button>
                  ) : (
                    <>
                      <button disabled={forjaCheia} onClick={() => executar((e) => colocarNaForja(CONFIGURACAO, e, membro.id))}>
                        Forja
                      </button>
                      <button disabled={minaCheia} onClick={() => executar((e) => colocarNaMina(CONFIGURACAO, e, membro.id))}>
                        Mina
                      </button>
                    </>
                  )}
                  <BotaoDeDespertar estado={estado} membro={membro} executar={executar} />
                  <button disabled={ocupada(membro.id)} onClick={() => alternarPai(membro)}>
                    {pais.some((p) => p.id === membro.id) ? 'Desmarcar' : 'Cruzar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="painel base">
        <h3>
          Forja ({estado.forja.trabalhadores.length}/{CONFIGURACAO.forja.vagas})
        </h3>
        <p>
          Produz {Math.floor(ouroPorHoraDaForja(CONFIGURACAO, estado))} de ouro por hora, também com o jogo fechado. Tipos Chama e Faísca
          rendem +25%; Maré, Rocha e Bruma, −50%.
        </p>
        <h3>
          Mina ({estado.mina.trabalhadores.length}/{CONFIGURACAO.mina.vagas})
        </h3>
        <p>
          Produz {Math.floor(fragmentosPorHoraDaMina(CONFIGURACAO, estado))} Fragmentos por hora, também com o jogo fechado. Tipos Rocha,
          Cristal e Liga rendem +25%; Maré, Brota, Astro, Penumbra, Faísca e Eco, −50%. O Despertar, a partir do nível {NIVEL_DO_DESPERTAR}, gasta{' '}
          {FRAGMENTOS_DO_DESPERTAR} Fragmentos e {ESSENCIAS_DO_DESPERTAR} Essências do primeiro tipo do monstro, que caem nas rotas 5 a 7.
        </p>
        <h3>Cruzamento</h3>
        {pais.length === 2 ? (
          <PainelDeCruzamento
            key={pais.map((p) => p.id).join('-')}
            estado={estado}
            pais={[pais[0], pais[1]]}
            executar={executar}
            aoCruzar={() => setSelecionados([])}
          />
        ) : (
          <p>Marque dois pais da mesma linhagem na reserva ({pais.length}/2).</p>
        )}
      </section>

      <PainelDasIlhas estado={estado} executar={executar} />

      <PainelDeEquipamentos estado={estado} executar={executar} />

      <section className="painel registro">
        <h3>Acontecimentos</h3>
        <ul>
          {registros.map((r) => (
            <li key={r.id}>{r.texto}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
