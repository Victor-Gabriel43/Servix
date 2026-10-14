import {
  CalendarCheck,
  CheckCheck,
  Package,
  ShoppingBag,
  Users,
  Wallet,
  Zap,
  ChartColumn,
  Boxes,
  type LucideIcon,
} from "lucide-react";

/*
 * Mini-interfaces ILUSTRATIVAS da seção "Possibilidades". Dados fictícios,
 * animados só com CSS (transform/opacity). O estado final de cada animação é
 * o estado "completo", para que fique correto com movimento reduzido.
 */

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

type Tone = "cyan" | "green" | "amber" | "violet";
const toneClass: Record<Tone, string> = {
  cyan: "bg-accent/12 text-accent-strong ring-accent/25",
  green: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25",
  amber: "bg-amber-400/10 text-amber-200 ring-amber-400/25",
  violet: "bg-violet-400/10 text-violet-200 ring-violet-400/25",
};

function Chip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[0.7rem] font-medium ring-1 ring-inset ${toneClass[tone]}`}>
      {children}
    </span>
  );
}

function Token({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-fg ring-1 ring-inset ring-white/10">{children}</span>
  );
}

/* 1 — Linha do tempo de eventos do negócio (rola em loop). */
const events: { icon: LucideIcon; status: string; tone: Tone; time: string; parts: [string, string][] }[] = [
  { icon: ShoppingBag, status: "Novo pedido", tone: "cyan", time: "09:12", parts: [["de", "Ana"], ["pedido", "#1042"]] },
  { icon: Wallet, status: "Pago", tone: "green", time: "09:14", parts: [["via", "Pix"], ["valor", "R$ 89,90"]] },
  { icon: Package, status: "Separado", tone: "amber", time: "09:31", parts: [["itens", "3"], ["por", "Equipe"]] },
  { icon: CheckCheck, status: "Entregue", tone: "green", time: "11:05", parts: [["para", "Ana"], ["pedido", "#1042"]] },
  { icon: CalendarCheck, status: "Agendado", tone: "violet", time: "11:20", parts: [["cliente", "Bruno"], ["dia", "sexta"]] },
];

export function TimelineMock() {
  const list = (copy: number) =>
    events.map((e, i) => {
      const Icon = e.icon;
      return (
        <li key={`${copy}-${i}`} className="relative grid grid-cols-[2.25rem_1fr] gap-4 pb-7">
          <span className="relative z-10 flex size-9 items-center justify-center rounded-xl bg-surface-2 text-muted ring-1 ring-inset ring-white/10">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="pt-1 text-[0.8rem] text-subtle">
            <div className="flex items-center gap-3">
              <Chip tone={e.tone}>{e.status}</Chip>
              <span className="font-mono text-[0.7rem]">hoje {e.time}</span>
            </div>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
              {e.parts.map(([k, v]) => (
                <span key={k} className="inline-flex items-center gap-2">
                  {k} <Token>{v}</Token>
                </span>
              ))}
            </p>
          </div>
        </li>
      );
    });

  return (
    <div className="relative h-full overflow-hidden px-6 pt-6 [mask-image:linear-gradient(transparent,black_18%,black_70%,transparent)]">
      <span aria-hidden="true" className="absolute bottom-0 left-[2.6rem] top-0 w-px bg-white/10" />
      <ul className="mock-scroll">
        {list(0)}
        {list(1)}
      </ul>
    </div>
  );
}

/* 2 — Automação: tarefas executadas sozinhas após um evento. */
const tasks: [string, string][] = [
  ["estoque.atualizar", '{ "item": "Camiseta P", "qtd": -1 }'],
  ["cliente.avisar", '{ "canal": "mensagem" }'],
  ["financeiro.registrar", '{ "valor": "R$ 59,90" }'],
  ["relatorio.atualizar", '{ "dia": "hoje" }'],
];

export function AutomationMock() {
  return (
    <div className="flex h-full flex-col justify-center gap-7 px-5 sm:px-8">
      <div className="mx-auto flex w-full max-w-md items-center gap-3 rounded-xl bg-surface-2/80 p-1.5 pl-2 ring-1 ring-inset ring-white/10 backdrop-blur">
        <Chip tone="green">Automático</Chip>
        <span className="min-w-0 flex-1 truncate text-[0.8rem] text-fg">Pedido #1043 confirmado</span>
        <span className="mock-press inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-[0.75rem] text-fg ring-1 ring-inset ring-white/15">
          <Zap className="size-3.5" aria-hidden="true" /> Executar
        </span>
      </div>
      <ul className="space-y-2.5 font-mono text-[0.72rem] leading-relaxed [mask-image:linear-gradient(black_60%,transparent)] sm:text-[0.78rem]">
        {tasks.map(([name, args], i) => (
          <li key={name} className="mock-line flex gap-3 whitespace-nowrap" style={delay(400 + i * 450)}>
            <span className="text-emerald-300">OK</span>
            <span className="text-fg">{name}</span>
            <span className="truncate text-subtle">{args}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 3 — Painel do dia. */
export function OverviewMock() {
  const bars = [40, 62, 48, 80, 66, 92, 74];
  return (
    <div className="relative flex h-full items-center gap-4 overflow-hidden pl-6 sm:pl-10">
      <div className="relative w-[17rem] shrink-0 overflow-hidden rounded-2xl bg-surface-2/70 p-5 ring-1 ring-inset ring-white/10">
        <span aria-hidden="true" className="mock-glow absolute -right-8 -top-10 size-40 rounded-full bg-accent/30 blur-3xl" />
        <p className="relative font-mono text-[0.65rem] uppercase tracking-[0.14em] text-subtle">Pedidos de hoje</p>
        <p className="relative mt-2 text-4xl font-light text-fg">18</p>
        <div className="relative mt-4 flex h-12 items-end gap-1.5" aria-hidden="true">
          {bars.map((h, i) => (
            <span
              key={i}
              className="mock-bar flex-1 origin-bottom rounded-sm bg-gradient-to-t from-accent/20 to-accent/70"
              style={{ height: `${h}%`, ...delay(i * 90) }}
            />
          ))}
        </div>
        <ul className="relative mt-4 space-y-2 text-[0.8rem]">
          <li className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="flex items-center gap-2 text-fg">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Concluídos
            </span>
            <span className="text-subtle">15</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-fg">
              <span className="size-1.5 rounded-full bg-amber-300" /> Pendentes
            </span>
            <span className="text-subtle">3</span>
          </li>
        </ul>
      </div>
      <div className="w-[13rem] shrink-0 rounded-2xl bg-surface-2/50 p-5 opacity-60 ring-1 ring-inset ring-white/10">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-subtle">Atendimentos</p>
        <p className="mt-2 text-4xl font-light text-muted">7</p>
        <ul className="mt-[4.75rem] space-y-2 text-[0.8rem] text-muted">
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent" /> Agendados
          </li>
        </ul>
      </div>
    </div>
  );
}

/* 4 — Módulos que vão sendo ligados conforme a necessidade. */
const modules: { icon: LucideIcon; name: string }[] = [
  { icon: Users, name: "Clientes" },
  { icon: ShoppingBag, name: "Pedidos" },
  { icon: Boxes, name: "Estoque" },
  { icon: Wallet, name: "Financeiro" },
  { icon: ChartColumn, name: "Relatórios" },
];

export function ModulesMock() {
  return (
    <div className="flex h-full items-center justify-center px-5 sm:px-8">
      <ul className="w-full max-w-sm divide-y divide-white/5 rounded-2xl bg-surface-2/60 px-4 ring-1 ring-inset ring-white/10 [mask-image:linear-gradient(black_65%,transparent)]">
        {modules.map((m, i) => {
          const Icon = m.icon;
          return (
            <li key={m.name} className="flex items-center gap-3 py-3 text-[0.85rem]">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/[0.05] text-muted ring-1 ring-inset ring-white/10">
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="flex-1 text-fg">{m.name}</span>
              <span className="mock-toggle relative h-5 w-9 rounded-full ring-1 ring-inset ring-white/10" style={delay(300 + i * 600)}>
                <span className="mock-knob absolute left-0.5 top-0.5 size-4 rounded-full bg-white" />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
