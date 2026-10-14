import { describe, expect, it } from 'vitest'
import { VERSAO_DO_MOTOR } from '../src/engine/versao.ts'

describe('fundação', () => {
  it('o motor carrega sem tela', () => {
    expect(VERSAO_DO_MOTOR).toBe(0)
  })
})
