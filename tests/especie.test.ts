import { describe, expect, it } from 'vitest'
import { ESPECIES } from '../src/conteudo/especies.ts'
import { TECNICAS } from '../src/conteudo/tecnicas.ts'
import { especieDo, porNome, somaDasBases, tecnicasDa } from '../src/engine/especie.ts'

const catalogo = { especies: porNome(ESPECIES), tecnicas: porNome(TECNICAS) }

describe('catálogo de espécies', () => {
  it('acha a espécie e as técnicas na ordem de prioridade', () => {
    const raizudo = especieDo(catalogo, 'Raizudo')
    expect(tecnicasDa(catalogo, raizudo).map((t) => t.nome)).toEqual(['Esporos', 'Pedrisco', 'Golpe de Galho'])
    expect(somaDasBases(raizudo)).toBe(102)
  })

  it('recusa espécie ou técnica desconhecida', () => {
    expect(() => especieDo(catalogo, 'ninguém')).toThrow(RangeError)
    const semTecnica = { ...especieDo(catalogo, 'Brotelho'), tecnicas: ['nenhuma'] }
    expect(() => tecnicasDa(catalogo, semTecnica)).toThrow(RangeError)
  })
})
