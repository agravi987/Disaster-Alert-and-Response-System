import { IconType } from "react-icons";

interface SummaryCard {
  label: string;
  value: string;
  helper: string;
  icon: IconType;
}

interface SummaryCardsProps {
  cards: SummaryCard[];
}

export default function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {card.label}
              </h2>
              <Icon className="text-lg text-teal-600 dark:text-teal-300" />
            </div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              {card.helper}
            </p>
          </article>
        );
      })}
    </div>
  );
}
