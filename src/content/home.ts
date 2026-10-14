/**
 * Textos da página inicial. Separados dos componentes para facilitar revisão
 * e edição sem tocar no layout.
 *
 * Regras: não prometer resultados, prazos ou condições; não citar clientes,
 * métricas ou serviços que não estejam confirmados.
 */

export const hero = {
  eyebrow: "Sistemas sob medida para pequenos negócios",
  titleStart: "A rotina do seu negócio, organizada em um sistema",
  titleHighlight: "feito para ela.",
  lead: "A Servix desenvolve sistemas a partir da forma como o seu negócio funciona — para reunir informações que hoje ficam espalhadas entre planilhas, cadernos e conversas, e ajudar a tornar o dia a dia mais simples de acompanhar.",
  primaryCta: { label: "Conversar sobre meu negócio", href: "#contato" },
  secondaryCta: { label: "Ver como trabalhamos", href: "#processo" },
  highlights: [
    "Feito a partir do seu processo",
    "Escopo combinado antes de começar",
    "Validação com você antes da entrega",
  ],
} as const;

export const problem = {
  label: "O ponto de partida",
  title: "Quando o negócio cresce, a organização costuma ficar para depois.",
  intro:
    "Em muitos pequenos negócios, o controle do dia a dia nasce de forma improvisada. Funciona — até começar a pesar.",
  items: [
    {
      title: "Informações espalhadas",
      text: "Pedidos, clientes e pagamentos ficam divididos entre planilhas, cadernos, mensagens e a memória de quem atende.",
    },
    {
      title: "Trabalho repetido à mão",
      text: "As mesmas informações são copiadas de um lugar para outro, o que toma tempo e abre espaço para erros.",
    },
    {
      title: "Ferramentas que não se encaixam",
      text: "Programas genéricos pedem que o negócio se adapte a eles — e não o contrário.",
    },
    {
      title: "Pouca visão do todo",
      text: "Sem os dados reunidos, fica difícil saber com clareza o que está pendente, o que já foi feito e o que precisa de atenção.",
    },
  ],
  opportunity: {
    label: "A oportunidade",
    title: "Um sistema pensado para o seu processo.",
    text: "Quando o software é construído a partir da rotina real do negócio, ele pode concentrar informações, reduzir etapas manuais e acompanhar o ritmo de quem usa. É nesse trabalho que a Servix atua.",
  },
} as const;

export const solution = {
  label: "Solução",
  title: "Criação de sistemas para pequenos negócios",
  lead: "Desenvolvemos sistemas sob medida: ferramentas de software feitas para organizar e apoiar processos específicos do seu negócio.",
  points: [
    {
      title: "Feito a partir da sua rotina",
      text: "Começamos entendendo como o trabalho acontece hoje, quem participa e onde estão as dificuldades.",
    },
    {
      title: "Escopo do tamanho da necessidade",
      text: "As funcionalidades são definidas em conjunto, priorizando o que faz diferença para o negócio agora.",
    },
    {
      title: "Tecnologia na medida certa",
      text: "As tecnologias são escolhidas conforme cada projeto. A inteligência artificial faz parte do nosso campo de atuação, mas só entra quando faz sentido para o problema.",
    },
  ],
  composer: {
    title: "O que um sistema pode organizar?",
    hint: "Selecione as áreas que mais pesam na sua rotina.",
    disclaimer:
      "Ilustração. As funcionalidades de cada sistema são definidas com o cliente, conforme a necessidade do projeto.",
    core: "Seu sistema",
    cta: "Levar para a conversa",
    emptyCta: "Selecione ao menos uma área",
    areas: [
      "Cadastro de clientes",
      "Pedidos e vendas",
      "Agendamentos",
      "Estoque",
      "Financeiro do dia a dia",
      "Ordens de serviço",
      "Equipe e tarefas",
      "Relatórios",
    ],
  },
} as const;

export const process = {
  label: "Processo",
  title: "Etapas claras, do primeiro contato à entrega.",
  lead: "Uma forma de trabalhar pensada para que você acompanhe cada decisão. Prazos, investimento e condições são combinados para cada projeto.",
  steps: [
    {
      title: "Entendimento do negócio",
      text: "Conversamos sobre a rotina, as pessoas envolvidas e o problema que precisa ser resolvido.",
    },
    {
      title: "Requisitos e escopo",
      text: "Definimos juntos o que o sistema deve fazer agora e o que pode ficar para uma próxima etapa.",
    },
    {
      title: "Planejamento e desenvolvimento",
      text: "Organizamos o trabalho em etapas e construímos o sistema com base no escopo acordado.",
    },
    {
      title: "Testes e validação",
      text: "Você experimenta o sistema com situações reais do negócio, e avaliamos juntos os ajustes antes da entrega.",
    },
    {
      title: "Entrega e próximos passos",
      text: "O sistema é entregue, e os próximos passos — como evoluções futuras — são combinados com você.",
    },
  ],
} as const;

export const products = {
  label: "Produtos",
  title: "Produtos próprios em estruturação",
  text: "Além dos sistemas sob medida, a Servix está estruturando uma área de produtos próprios. Quando houver novidades, elas serão apresentadas aqui.",
} as const;

export const about = {
  label: "Sobre",
  title: "Tecnologia construída perto de quem vai usar.",
  text: "A Servix é uma empresa de tecnologia, software e inteligência artificial em fase de estruturação. Nosso foco é criar sistemas para pequenos negócios — com escuta atenta, comunicação clara e soluções do tamanho de cada necessidade.",
  principles: [
    {
      title: "Entender antes de construir",
      text: "Cada projeto começa pelo problema, não pela tecnologia.",
    },
    {
      title: "Clareza em cada etapa",
      text: "Escopo, decisões e próximos passos explicados sem jargão.",
    },
    {
      title: "Simplicidade de uso",
      text: "Um bom sistema precisa ser fácil para quem o usa todos os dias.",
    },
    {
      title: "Evolução gradual",
      text: "Começar pelo essencial e evoluir conforme o negócio precisar.",
    },
  ],
} as const;

export const contact = {
  label: "Contato",
  title: "Conte qual é o desafio do seu negócio.",
  text: "Descreva, com suas palavras, o que hoje dá mais trabalho na sua rotina. A partir daí, conversamos sobre se — e como — um sistema pode ajudar.",
  nextStepsTitle: "Como funciona",
  nextSteps: [
    "Você envia uma descrição breve da situação.",
    "Entramos em contato pelo canal que você indicar.",
    "Conversamos para entender melhor o contexto.",
  ],
  reassurance: "Enviar uma mensagem não gera nenhum compromisso.",
} as const;
