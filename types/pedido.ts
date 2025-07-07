export interface TamanhosAdulto {
  PP: { masculino: number; feminino: number }
  P: { masculino: number; feminino: number }
  M: { masculino: number; feminino: number }
  G: { masculino: number; feminino: number }
  GG: { masculino: number; feminino: number }
  EG: { masculino: number; feminino: number }
  G1: { masculino: number; feminino: number }
  G2: { masculino: number; feminino: number }
  G3: { masculino: number; feminino: number }
  G4: { masculino: number; feminino: number }
}

export interface TamanhosInfantil {
  [key: string]: number // "2", "4", "6", etc.
}

export interface InformacoesCongregacao {
  nome: string
  lider: string
}

export interface InstrucoesPagamento {
  pixCnpj: string
  whatsappComprovante: string
  dataLimite: string
  valorAntes: string
  valorApos: string
}

export interface Pedido {
  congregacao: InformacoesCongregacao
  tamanhosAdulto: TamanhosAdulto
  tamanhosInfantil: TamanhosInfantil
  observacoes: string
  instrucoesPagamento: InstrucoesPagamento
}
