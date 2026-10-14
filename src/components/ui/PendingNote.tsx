import { showPendingNotes } from "@/config/site";

/**
 * Marca visualmente, apenas em desenvolvimento, um dado institucional que
 * ainda não foi definido. Em produção não renderiza nada.
 */
export function PendingNote({ children }: { children: React.ReactNode }) {
  if (!showPendingNotes) return null;
  return (
    <span className="pending-note" data-pending>
      <span aria-hidden="true">●</span> Pendente: {children}
    </span>
  );
}
