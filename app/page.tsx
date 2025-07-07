"use client"

import type React from "react"

import { useState } from "react"
import { Shirt, Users, StickyNote, FileDown, ShoppingCart, CreditCard, Copy, Phone, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import type { Pedido, TamanhosAdulto, TamanhosInfantil, InstrucoesPagamento } from "../types/pedido"
import { gerarPDF } from "../utils/pdf-generator"

const tamanhosAdultoList = ["PP", "P", "M", "G", "GG", "EG", "G1", "G2", "G3", "G4"] as const
const tamanhosInfantilList = ["2", "4", "6", "8", "10", "12", "14", "16"] as const

export default function PedidosCamisetas() {
  const { toast } = useToast()
  const [salvandoPDF, setSalvandoPDF] = useState(false)

  // Estados do formulário
  const [congregacao, setCongregacao] = useState({
    nome: "",
    lider: "",
  })

  const [tamanhosAdulto, setTamanhosAdulto] = useState<TamanhosAdulto>({
    PP: { masculino: 0, feminino: 0 },
    P: { masculino: 0, feminino: 0 },
    M: { masculino: 0, feminino: 0 },
    G: { masculino: 0, feminino: 0 },
    GG: { masculino: 0, feminino: 0 },
    EG: { masculino: 0, feminino: 0 },
    G1: { masculino: 0, feminino: 0 },
    G2: { masculino: 0, feminino: 0 },
    G3: { masculino: 0, feminino: 0 },
    G4: { masculino: 0, feminino: 0 },
  })

  const [tamanhosInfantil, setTamanhosInfantil] = useState<TamanhosInfantil>(
    tamanhosInfantilList.reduce((acc, tamanho) => ({ ...acc, [tamanho]: 0 }), {}),
  )

  const [observacoes, setObservacoes] = useState("")

  const [instrucoesPagamento, setInstrucoesPagamento] = useState<InstrucoesPagamento>({
    pixCnpj: "12.345.678/0001-90",
    whatsappComprovante: "(11) 99999-9999",
    dataLimite: "16 de Fevereiro de 2025",
    valorAntes: "R$ 40,00",
    valorApos: "R$ 50,00",
  })

  // Função para lidar com foco nos inputs (resolve o problema do 0)
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "0") {
      e.target.select()
    }
  }

  // Função para lidar com mudança nos inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Se o usuário digitou algo e o primeiro caractere é 0, remove o 0
    if (value.length > 1 && value.startsWith("0")) {
      e.target.value = value.substring(1)
    }
  }

  // Função para atualizar tamanhos adulto
  const atualizarTamanhoAdulto = (tamanho: keyof TamanhosAdulto, tipo: "masculino" | "feminino", valor: number) => {
    setTamanhosAdulto((prev) => ({
      ...prev,
      [tamanho]: {
        ...prev[tamanho],
        [tipo]: Math.max(0, valor),
      },
    }))
  }

  // Função para incrementar/decrementar tamanhos adulto
  const ajustarTamanhoAdulto = (tamanho: keyof TamanhosAdulto, tipo: "masculino" | "feminino", incremento: number) => {
    const valorAtual = tamanhosAdulto[tamanho][tipo]
    const novoValor = Math.max(0, valorAtual + incremento)
    atualizarTamanhoAdulto(tamanho, tipo, novoValor)
  }

  // Função para atualizar tamanhos infantil
  const atualizarTamanhoInfantil = (tamanho: string, valor: number) => {
    setTamanhosInfantil((prev) => ({
      ...prev,
      [tamanho]: Math.max(0, valor),
    }))
  }

  // Função para incrementar/decrementar tamanhos infantil
  const ajustarTamanhoInfantil = (tamanho: string, incremento: number) => {
    const valorAtual = tamanhosInfantil[tamanho]
    const novoValor = Math.max(0, valorAtual + incremento)
    atualizarTamanhoInfantil(tamanho, novoValor)
  }

  // Função para copiar PIX
  const copiarPix = async () => {
    try {
      await navigator.clipboard.writeText(instrucoesPagamento.pixCnpj)
      toast({
        title: "🎉 PIX copiado com sucesso!",
        description: "A chave PIX foi copiada para a área de transferência.",
        className: "animate-toast-in",
      })
    } catch (error) {
      toast({
        title: "❌ Erro ao copiar",
        description: "Não foi possível copiar a chave PIX.",
        variant: "destructive",
        className: "animate-toast-in",
      })
    }
  }

  // Função para calcular resumo
  const calcularResumo = () => {
    const itens: Array<{ tamanho: string; quantidade: number }> = []

    // Adicionar tamanhos adulto
    Object.entries(tamanhosAdulto).forEach(([tamanho, quantidades]) => {
      const totalMasculino = quantidades.masculino
      const totalFeminino = quantidades.feminino

      if (totalMasculino > 0) {
        itens.push({ tamanho: `${tamanho} Masc`, quantidade: totalMasculino })
      }
      if (totalFeminino > 0) {
        itens.push({ tamanho: `${tamanho} Fem`, quantidade: totalFeminino })
      }
    })

    // Adicionar tamanhos infantil
    Object.entries(tamanhosInfantil).forEach(([tamanho, quantidade]) => {
      if (quantidade > 0) {
        itens.push({ tamanho: `Nº ${tamanho}`, quantidade })
      }
    })

    return itens
  }

  // Função para validar e salvar PDF
  const salvarPDF = async () => {
    // Validação
    if (!congregacao.nome.trim() || !congregacao.lider.trim()) {
      toast({
        title: "⚠️ Campos obrigatórios",
        description: "Por favor, preencha o nome da congregação e do líder.",
        variant: "destructive",
        className: "animate-toast-in",
      })
      return
    }

    const resumo = calcularResumo()
    if (resumo.length === 0) {
      toast({
        title: "🛍️ Nenhuma camiseta selecionada",
        description: "Por favor, adicione pelo menos uma camiseta ao pedido.",
        variant: "destructive",
        className: "animate-toast-in",
      })
      return
    }

    setSalvandoPDF(true)

    try {
      const pedido: Pedido = {
        congregacao,
        tamanhosAdulto,
        tamanhosInfantil,
        observacoes,
        instrucoesPagamento,
      }

      await gerarPDF(pedido, resumo)

      toast({
        title: "🎉 PDF gerado com sucesso!",
        description: "O pedido foi salvo em PDF e está sendo baixado.",
        className: "animate-toast-success",
      })

      // Limpar formulário
      setCongregacao({ nome: "", lider: "" })
      setTamanhosAdulto({
        PP: { masculino: 0, feminino: 0 },
        P: { masculino: 0, feminino: 0 },
        M: { masculino: 0, feminino: 0 },
        G: { masculino: 0, feminino: 0 },
        GG: { masculino: 0, feminino: 0 },
        EG: { masculino: 0, feminino: 0 },
        G1: { masculino: 0, feminino: 0 },
        G2: { masculino: 0, feminino: 0 },
        G3: { masculino: 0, feminino: 0 },
        G4: { masculino: 0, feminino: 0 },
      })
      setTamanhosInfantil(tamanhosInfantilList.reduce((acc, tamanho) => ({ ...acc, [tamanho]: 0 }), {}))
      setObservacoes("")
    } catch (error) {
      toast({
        title: "❌ Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
        className: "animate-toast-in",
      })
    } finally {
      setSalvandoPDF(false)
    }
  }

  const resumo = calcularResumo()
  const totalItens = resumo.reduce((total, item) => total + item.quantidade, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Simplificado */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.05%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center animate-fade-in-up">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/20 backdrop-blur-sm p-6 rounded-full border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <Shirt className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 hover:scale-105 transition-transform duration-300">
              UMADCLI Store
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Faça seu pedido de camisetas com facilidade e praticidade. Sistema profissional para congregações da
              UMADCLI.
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Formulário Principal (3/4) */}
          <div className="xl:col-span-3">
            <div className="space-y-8">
              {/* Card de Informações da Congregação */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-slide-in-left">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors duration-300">
                      <Users className="h-6 w-6" />
                    </div>
                    Informações da Congregação
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 group">
                      <Label
                        htmlFor="nome-congregacao"
                        className="text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-300"
                      >
                        Nome da Congregação *
                      </Label>
                      <Input
                        id="nome-congregacao"
                        value={congregacao.nome}
                        onChange={(e) => setCongregacao((prev) => ({ ...prev, nome: e.target.value }))}
                        placeholder="Digite o nome da congregação"
                        className="h-12 text-base hover:border-blue-400 focus:border-blue-500 transition-colors duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-3 group">
                      <Label
                        htmlFor="lider-whatsapp"
                        className="text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-300"
                      >
                        Nome do Líder / WhatsApp *
                      </Label>
                      <Input
                        id="lider-whatsapp"
                        value={congregacao.lider}
                        onChange={(e) => setCongregacao((prev) => ({ ...prev, lider: e.target.value }))}
                        placeholder="Nome e WhatsApp do líder"
                        className="h-12 text-base hover:border-blue-400 focus:border-blue-500 transition-colors duration-300"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Tamanhos Adulto - Melhorado para Mobile */}
              <Card
                className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-slide-in-left"
                style={{ animationDelay: "0.1s" }}
              >
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors duration-300">
                      <Shirt className="h-6 w-6" />
                    </div>
                    Camisetas Adulto
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Layout Desktop - Tabela */}
                  <div className="hidden md:block">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-bold text-gray-700">Tamanho</TableHead>
                            <TableHead className="font-bold text-gray-700 text-center">Masculino</TableHead>
                            <TableHead className="font-bold text-gray-700 text-center">Feminino</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tamanhosAdultoList.map((tamanho, index) => (
                            <TableRow
                              key={tamanho}
                              className="hover:bg-gray-50/50 transition-colors duration-200"
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <TableCell className="font-semibold text-gray-800">
                                <Badge
                                  variant="outline"
                                  className="font-bold hover:bg-gray-100 transition-colors duration-200"
                                >
                                  {tamanho}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => ajustarTamanhoAdulto(tamanho, "masculino", -1)}
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={tamanhosAdulto[tamanho].masculino || ""}
                                    onChange={(e) => {
                                      handleInputChange(e)
                                      atualizarTamanhoAdulto(tamanho, "masculino", Number.parseInt(e.target.value) || 0)
                                    }}
                                    onFocus={handleInputFocus}
                                    className="w-16 text-center hover:border-emerald-400 focus:border-emerald-500 transition-colors duration-300"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => ajustarTamanhoAdulto(tamanho, "masculino", 1)}
                                    className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => ajustarTamanhoAdulto(tamanho, "feminino", -1)}
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={tamanhosAdulto[tamanho].feminino || ""}
                                    onChange={(e) => {
                                      handleInputChange(e)
                                      atualizarTamanhoAdulto(tamanho, "feminino", Number.parseInt(e.target.value) || 0)
                                    }}
                                    onFocus={handleInputFocus}
                                    className="w-16 text-center hover:border-emerald-400 focus:border-emerald-500 transition-colors duration-300"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => ajustarTamanhoAdulto(tamanho, "feminino", 1)}
                                    className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Layout Mobile - Cards */}
                  <div className="md:hidden space-y-4">
                    {tamanhosAdultoList.map((tamanho, index) => (
                      <div
                        key={tamanho}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center justify-center mb-4">
                          <Badge variant="outline" className="font-bold text-lg px-4 py-2">
                            Tamanho {tamanho}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Masculino */}
                          <div className="text-center">
                            <Label className="text-sm font-semibold text-blue-700 mb-2 block">👨 Masculino</Label>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => ajustarTamanhoAdulto(tamanho, "masculino", -1)}
                                className="h-10 w-10 p-0 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                min="0"
                                value={tamanhosAdulto[tamanho].masculino || ""}
                                onChange={(e) => {
                                  handleInputChange(e)
                                  atualizarTamanhoAdulto(tamanho, "masculino", Number.parseInt(e.target.value) || 0)
                                }}
                                onFocus={handleInputFocus}
                                className="w-16 text-center text-lg font-bold hover:border-blue-400 focus:border-blue-500 transition-colors duration-300"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => ajustarTamanhoAdulto(tamanho, "masculino", 1)}
                                className="h-10 w-10 p-0 hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Feminino */}
                          <div className="text-center">
                            <Label className="text-sm font-semibold text-pink-700 mb-2 block">👩 Feminino</Label>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => ajustarTamanhoAdulto(tamanho, "feminino", -1)}
                                className="h-10 w-10 p-0 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                min="0"
                                value={tamanhosAdulto[tamanho].feminino || ""}
                                onChange={(e) => {
                                  handleInputChange(e)
                                  atualizarTamanhoAdulto(tamanho, "feminino", Number.parseInt(e.target.value) || 0)
                                }}
                                onFocus={handleInputFocus}
                                className="w-16 text-center text-lg font-bold hover:border-pink-400 focus:border-pink-500 transition-colors duration-300"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => ajustarTamanhoAdulto(tamanho, "feminino", 1)}
                                className="h-10 w-10 p-0 hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Card de Tamanhos Infantil */}
              <Card
                className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-slide-in-left"
                style={{ animationDelay: "0.2s" }}
              >
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors duration-300">
                      <Shirt className="h-5 w-5" />
                    </div>
                    Camisetas Infantil
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {tamanhosInfantilList.map((tamanho, index) => (
                      <div
                        key={tamanho}
                        className="text-center group animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Label
                          htmlFor={`infantil-${tamanho}`}
                          className="block mb-2 font-semibold text-gray-700 group-hover:text-purple-600 transition-colors duration-300"
                        >
                          <Badge
                            variant="outline"
                            className="font-bold group-hover:bg-purple-50 transition-colors duration-200"
                          >
                            Nº {tamanho}
                          </Badge>
                        </Label>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => ajustarTamanhoInfantil(tamanho, -1)}
                              className="h-6 w-6 p-0 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                            >
                              <Minus className="h-2 w-2" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => ajustarTamanhoInfantil(tamanho, 1)}
                              className="h-6 w-6 p-0 hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                            >
                              <Plus className="h-2 w-2" />
                            </Button>
                          </div>
                          <Input
                            id={`infantil-${tamanho}`}
                            type="number"
                            min="0"
                            value={tamanhosInfantil[tamanho] || ""}
                            onChange={(e) => {
                              handleInputChange(e)
                              atualizarTamanhoInfantil(tamanho, Number.parseInt(e.target.value) || 0)
                            }}
                            onFocus={handleInputFocus}
                            className="text-center hover:border-purple-400 focus:border-purple-500 transition-colors duration-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Card de Observações */}
              <Card
                className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-slide-in-left"
                style={{ animationDelay: "0.3s" }}
              >
                <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors duration-300">
                      <StickyNote className="h-6 w-6" />
                    </div>
                    Observações Especiais
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Adicione observações especiais sobre o pedido, cores específicas, detalhes de entrega, etc..."
                    rows={4}
                    className="text-base hover:border-orange-400 focus:border-orange-500 transition-colors duration-300"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar (1/4) */}
          <div className="xl:col-span-1">
            <div className="sticky top-8 space-y-6 animate-slide-in-right" id="sidebar-content">
              {/* Card de Resumo */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5" />
                    Seu Pedido
                    {totalItens > 0 && (
                      <Badge className="bg-white text-green-600 ml-auto animate-bounce">
                        {totalItens} {totalItens === 1 ? "item" : "itens"}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {resumo.length > 0 ? (
                    <div className="space-y-3">
                      {resumo.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <span className="font-medium text-gray-700">{item.tamanho}</span>
                          <Badge
                            variant="secondary"
                            className="font-bold hover:bg-green-100 transition-colors duration-200"
                          >
                            {item.quantidade}
                          </Badge>
                        </div>
                      ))}
                      <div className="border-t pt-3 mt-4 animate-fade-in">
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total:</span>
                          <Badge className="bg-green-600 text-white text-base px-3 py-1 hover:bg-green-700 transition-colors duration-200">
                            {totalItens} {totalItens === 1 ? "camiseta" : "camisetas"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-pulse" />
                      <p className="text-gray-500">Nenhum item adicionado</p>
                      <p className="text-sm text-gray-400">Selecione os tamanhos acima</p>
                    </div>
                  )}
                </CardContent>
                {resumo.length > 0 && (
                  <CardFooter className="p-4 pt-0">
                    <Button
                      onClick={salvarPDF}
                      disabled={salvandoPDF}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 transition-all duration-300"
                      size="lg"
                    >
                      <FileDown className={`h-5 w-5 mr-2 ${salvandoPDF ? "animate-spin" : ""}`} />
                      {salvandoPDF ? "Gerando PDF..." : "Finalizar Pedido"}
                    </Button>
                  </CardFooter>
                )}
              </Card>

              {/* Card de Pagamento */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2 group">
                    <Label className="text-sm font-semibold text-gray-700 group-hover:text-yellow-600 transition-colors duration-300">
                      PIX (CNPJ)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={instrucoesPagamento.pixCnpj}
                        onChange={(e) => setInstrucoesPagamento((prev) => ({ ...prev, pixCnpj: e.target.value }))}
                        className="text-sm hover:border-yellow-400 focus:border-yellow-500 transition-colors duration-300"
                      />
                      <Button
                        onClick={copiarPix}
                        size="sm"
                        variant="outline"
                        className="shrink-0 bg-transparent hover:bg-yellow-50 hover:border-yellow-300 transition-colors duration-200"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 group-hover:text-yellow-600 transition-colors duration-300">
                      <Phone className="h-4 w-4" />
                      Enviar Comprovante
                    </Label>
                    <Input
                      value={instrucoesPagamento.whatsappComprovante}
                      onChange={(e) =>
                        setInstrucoesPagamento((prev) => ({ ...prev, whatsappComprovante: e.target.value }))
                      }
                      className="text-sm hover:border-yellow-400 focus:border-yellow-500 transition-colors duration-300"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-3 hover:bg-yellow-100 transition-colors duration-300">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Prazo Limite</Label>
                      <Input
                        value={instrucoesPagamento.dataLimite}
                        onChange={(e) => setInstrucoesPagamento((prev) => ({ ...prev, dataLimite: e.target.value }))}
                        className="text-sm hover:border-yellow-400 focus:border-yellow-500 transition-colors duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-green-700">Até o prazo</Label>
                        <Input
                          value={instrucoesPagamento.valorAntes}
                          onChange={(e) => setInstrucoesPagamento((prev) => ({ ...prev, valorAntes: e.target.value }))}
                          className="text-sm text-green-700 font-bold hover:border-green-400 focus:border-green-500 transition-colors duration-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-red-700">Após o prazo</Label>
                        <Input
                          value={instrucoesPagamento.valorApos}
                          onChange={(e) => setInstrucoesPagamento((prev) => ({ ...prev, valorApos: e.target.value }))}
                          className="text-sm text-red-700 font-bold hover:border-red-400 focus:border-red-500 transition-colors duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
