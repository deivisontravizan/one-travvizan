"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  MessageSquare,
  Instagram,
  Lightbulb,
  Copy,
  Sparkles,
  Send
} from 'lucide-react';

const predefinedPrompts = {
  whatsapp: [
    "Resposta para orçamento de tatuagem fine line",
    "Follow-up para cliente que não respondeu",
    "Mensagem de confirmação de agendamento",
    "Resposta para cliente interessado em realismo"
  ],
  instagram: [
    "Post sobre cuidados pós-tatuagem",
    "Story para mostrar trabalho do dia",
    "Reel sobre processo de criação",
    "Post promocional para dezembro"
  ],
  business: [
    "Como captar mais clientes?",
    "Ideias de promoção para o fim do ano",
    "Como aumentar ticket médio?",
    "Estratégias para fidelizar clientes"
  ]
};

const aiResponses = {
  whatsapp: {
    "Resposta para orçamento de tatuagem fine line": "Oi! 😊 Que bom que você se interessou pelo estilo fine line! Para fazer um orçamento preciso, preciso saber:\n\n• Qual o tamanho aproximado?\n• Onde seria no corpo?\n• Você tem alguma referência?\n\nMeus valores para fine line começam em R$ 300 para peças pequenas. Posso agendar uma conversa para te mostrar meu portfólio e definirmos todos os detalhes! ✨",
    
    "Follow-up para cliente que não respondeu": "Oi! Tudo bem? 😊\n\nVi que você demonstrou interesse na tatuagem que conversamos. Ainda está pensando no projeto?\n\nSe tiver alguma dúvida ou quiser ajustar alguma coisa, estou aqui! Minha agenda está bem corrida, mas sempre dou um jeitinho para projetos especiais como o seu 😉\n\nMe avisa se ainda tem interesse! 🎨",
    
    "Mensagem de confirmação de agendamento": "Perfeito! ✅ Seu agendamento está confirmado:\n\n📅 Data: [DATA]\n⏰ Horário: [HORÁRIO]\n📍 Local: [ENDEREÇO]\n💰 Valor: R$ [VALOR]\n\nLembretes importantes:\n• Venha alimentado e hidratado\n• Evite álcool 24h antes\n• Use roupas confortáveis\n• Traga documento com foto\n\nQualquer dúvida, me chama! Mal posso esperar para criar essa arte em você! 🎨✨"
  },
  
  instagram: {
    "Post sobre cuidados pós-tatuagem": "🩹 CUIDADOS PÓS-TATUAGEM: O GUIA COMPLETO\n\nSua tattoo ficou incrível, agora vamos cuidar dela direitinho! 💙\n\n✅ PRIMEIRAS 24H:\n• Mantenha o filme protetor\n• Não molhe nem esfregue\n• Evite sol direto\n\n✅ PRÓXIMOS DIAS:\n• Lave com sabonete neutro\n• Hidrate com pomada específica\n• Não coce nem arranque casquinhas\n\n✅ CICATRIZAÇÃO (2-4 semanas):\n• Use protetor solar sempre\n• Evite piscina e mar\n• Hidrate diariamente\n\nDúvidas? Me chama no direct! 💬\n\n#cuidadostatuagem #tattoocare #cicatrizacao #tatuagem #tattoo",
    
    "Story para mostrar trabalho do dia": "🎨 TRABALHO DO DIA\n\nMais uma arte saindo do forno! ✨\n\nEstilo: Fine Line\nTempo: 3h\nCliente: Primeira tattoo 💙\n\nO nervosismo no início e o sorriso no final... isso não tem preço! 😊\n\n#tattooartist #fineline #primeiratat #tattooday",
    
    "Reel sobre processo de criação": "🎬 ROTEIRO PARA REEL - PROCESSO DE CRIAÇÃO\n\n1. ABERTURA (2s): Folha em branco + música inspiradora\n2. SKETCH (3s): Mão desenhando o rascunho\n3. REFINAMENTO (2s): Detalhes sendo adicionados\n4. STENCIL (2s): Transferindo para o papel transfer\n5. APLICAÇÃO (3s): Colocando o stencil na pele\n6. RESULTADO (3s): Tatuagem finalizada\n\n💡 TEXTO: 'Do papel para a pele: o processo que transforma ideias em arte'\n\n🎵 MÚSICA: Algo inspirador e suave\n\n#processo #tattooartist #bastidores #arte"
  },
  
  business: {
    "Como captar mais clientes?": "🎯 ESTRATÉGIAS PARA CAPTAR MAIS CLIENTES:\n\n1. **REDES SOCIAIS**\n• Poste diariamente no Instagram\n• Use hashtags locais (#tattooSP #tatuagemSP)\n• Faça parcerias com outros artistas\n• Stories interativos (enquetes, perguntas)\n\n2. **INDICAÇÕES**\n• Ofereça desconto para quem indica\n• Peça para clientes satisfeitos avaliarem\n• Mantenha contato pós-tatuagem\n\n3. **PRESENÇA LOCAL**\n• Participe de convenções\n• Faça parcerias com estúdios\n• Networking com outros profissionais\n\n4. **ATENDIMENTO DIFERENCIADO**\n• Responda rápido no WhatsApp\n• Seja consultivo, não apenas vendedor\n• Ofereça experiência completa\n\n💡 DICA EXTRA: Clientes satisfeitos são seus melhores vendedores!",
    
    "Ideias de promoção para dezembro": "🎄 PROMOÇÕES DE DEZEMBRO - IDEIAS CRIATIVAS:\n\n1. **NATAL TATTOO**\n• 'Presente para si mesmo' - 15% off\n• Vale-presente para dar de presente\n• Promoção 'Amigo Secreto' - desconto duplo\n\n2. **RÉVEILLON**\n• 'Novo ano, nova tattoo' - pacote especial\n• Desconto progressivo (quanto mais próximo do ano novo, maior o desconto)\n\n3. **COMBOS ESPECIAIS**\n• Tattoo + retoque grátis\n• 2 tattoos pequenas pelo preço de 1 grande\n• Desconto para grupos (amigos/casais)\n\n4. **MARKETING EMOCIONAL**\n• 'Marque 2024 na pele'\n• 'Termine o ano com arte'\n• Stories com depoimentos de clientes\n\n💰 ESTRUTURA: Desconto real + valor percebido alto",
    
    "Como aumentar ticket médio?": "💰 ESTRATÉGIAS PARA AUMENTAR TICKET MÉDIO:\n\n1. **UPSELL INTELIGENTE**\n• Sugira adicionar elementos à tattoo\n• Ofereça upgrade de tamanho\n• Proponha sombreado/cor extra\n\n2. **PACOTES DE VALOR**\n• Tattoo + retoque + cuidados\n• Sessão + produtos pós-tattoo\n• Múltiplas sessões com desconto\n\n3. **CONSULTORIA ESPECIALIZADA**\n• Seja consultivo no atendimento\n• Eduque sobre qualidade vs preço\n• Mostre portfolio de trabalhos premium\n\n4. **EXPERIÊNCIA PREMIUM**\n• Ambiente diferenciado\n• Atendimento personalizado\n• Follow-up pós-tattoo\n\n5. **POSICIONAMENTO**\n• Foque na qualidade, não no preço\n• Destaque sua especialização\n• Mostre resultados de longo prazo\n\n🎯 META: Transformar orçamento em experiência completa!"
  }
};

export function AIAssistant() {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedResponse, setSelectedResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePredefinedPrompt = (prompt: string) => {
    setIsGenerating(true);
    
    // Simular delay da IA
    setTimeout(() => {
      const response = aiResponses[activeTab as keyof typeof aiResponses]?.[prompt] || 
                      "Resposta gerada pela IA baseada no seu prompt.";
      setSelectedResponse(response);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCustomPrompt = () => {
    if (!customPrompt.trim()) return;
    
    setIsGenerating(true);
    
    setTimeout(() => {
      setSelectedResponse(`Resposta personalizada para: "${customPrompt}"\n\nEsta é uma resposta gerada pela IA baseada no seu prompt específico. O sistema analisou seu contexto e gerou uma resposta otimizada para tatuadores.`);
      setIsGenerating(false);
      setCustomPrompt('');
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedResponse);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6" />
        <h2 className="text-2xl font-bold">IA Assistant</h2>
        <Badge variant="secondary" className="ml-2">
          <Sparkles className="h-3 w-3 mr-1" />
          Powered by AI
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Negócio
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Prompts Predefinidos */}
          <Card>
            <CardHeader>
              <CardTitle>Prompts Prontos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {predefinedPrompts[activeTab as keyof typeof predefinedPrompts].map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => handlePredefinedPrompt(prompt)}
                  disabled={isGenerating}
                >
                  {prompt}
                </Button>
              ))}
              
              <div className="pt-4 border-t">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Ou escreva seu próprio prompt..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={handleCustomPrompt}
                    disabled={!customPrompt.trim() || isGenerating}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Gerar Resposta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resposta Gerada */}
          <Card>
            <CardHeader>
              <CardTitle>Resposta Gerada</CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">IA gerando resposta...</p>
                  </div>
                </div>
              ) : selectedResponse ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{selectedResponse}</pre>
                  </div>
                  <Button onClick={copyToClipboard} className="w-full">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Resposta
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um prompt para gerar uma resposta</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dicas por categoria */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>💡 Dicas para WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm font-medium">Resposta Rápida</p>
                  <p className="text-xs text-muted-foreground">Responda em até 2 horas para não perder leads</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm font-medium">Tom Pessoal</p>
                  <p className="text-xs text-muted-foreground">Use emojis e seja amigável, mas profissional</p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-sm font-medium">Call to Action</p>
                  <p className="text-xs text-muted-foreground">Sempre termine com uma pergunta ou próximo passo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instagram">
          <Card>
            <CardHeader>
              <CardTitle>📱 Dicas para Instagram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-sm font-medium">Hashtags Locais</p>
                  <p className="text-xs text-muted-foreground">Use hashtags da sua cidade para alcance local</p>
                </div>
                <div className="p-3 bg-pink-50 dark:bg-pink-950 rounded-lg">
                  <p className="text-sm font-medium">Stories Diários</p>
                  <p className="text-xs text-muted-foreground">Poste nos stories para manter engajamento</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <p className="text-sm font-medium">Processo</p>
                  <p className="text-xs text-muted-foreground">Mostre o antes, durante e depois</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>💼 Dicas de Negócio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                  <p className="text-sm font-medium">Especialização</p>
                  <p className="text-xs text-muted-foreground">Foque em 1-2 estilos para se tornar referência</p>
                </div>
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950 rounded-lg">
                  <p className="text-sm font-medium">Precificação</p>
                  <p className="text-xs text-muted-foreground">Valorize seu trabalho, qualidade tem preço</p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                  <p className="text-sm font-medium">Relacionamento</p>
                  <p className="text-xs text-muted-foreground">Cliente satisfeito é marketing gratuito</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}