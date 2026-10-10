"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Headphones,
  LayoutGrid,
  Search,
  SearchX,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Section, { type SectionProps } from "../section";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  type FaqCategory,
  type FaqItem,
} from "../../../data/index";
import type { FaqCategoryId } from "../../../data/faq-content";

export type { FaqCategory, FaqCategoryId, FaqItem };

export type FaqSectionProps = {
  items?: FaqItem[];
  categories?: FaqCategory[];
  title?: string;
  description?: string;
  initialVisible?: number;
  contactHref?: string;
  /** Shows the "Can't find your answer?" support card in the sidebar */
  showContact?: boolean;
  width?: SectionProps["width"];
  headerWidth?: SectionProps["headerWidth"];
  contentWidth?: SectionProps["contentWidth"];
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

const SHINE =
  "linear-gradient(115deg, transparent 0 20%, rgba(255,255,255,.14) 46% 60%, transparent 60% 70%, rgba(255,255,255,.1) 70% 80%, transparent 80%)";

function FaqRow({
  item,
  category,
  open,
  onOpenChange,
}: {
  item: FaqItem;
  category?: FaqCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const Icon = category?.icon;

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="relative group smooth overflow-hidden rounded-xl border-l-4 border-b-4 border-border bg-card smooth hover:border-primary/40 data-[state=open]:border-primary/60"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-1 smooth"
        style={{ backgroundImage: SHINE }}
      />

      <CollapsibleTrigger className="flex w-full items-center gap-2.5 py-2 px-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {Icon ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary smooth group-hover:bg-primary group-hover:text-white group-data-[state=open]:bg-primary group-data-[state=open]:text-white">
            <Icon className="size-4" />
          </span>
        ) : null}

        <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">
          {item.question}
        </span>

        {category ? (
          <span className="inline-block rounded bg-primary/15 px-2 py-0.5 text-[11px] group-hover:text-white group-data-[state=open]:text-white font-semibold text-primary smooth">
            {category.label}
          </span>
        ) : null}

        <span className="grid size-6 shrink-0 place-items-center rounded-md border-2 border-border bg-card text-foreground/60 smooth group-hover:text-foreground group-data-[state=open]:border-lime-400 group-data-[state=open]:bg-lime-400 group-data-[state=open]:text-black">
          <ChevronDown className="size-3.5 smooth group-data-[state=open]:rotate-180" />
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="space-y-2.5 border-t-2 border-border bg-card px-3 py-2.5">
          <p className="text-xs leading-relaxed text-foreground/75 font-medium">
            {item.answer}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function FaqSection({
  items = FAQ_ITEMS,
  categories = FAQ_CATEGORIES,
  title = "Questions & answers",
  description = "Quick answers about orders, payments, delivery and rewards.",
  initialVisible = 6,
  contactHref = "/contact",
  showContact = true,
  width,
  headerWidth,
  contentWidth,
  className,
  headerClassName,
  contentClassName,
}: FaqSectionProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => map.set(i.category, (map.get(i.category) ?? 0) + 1));
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return `${item.question} ${item.keywords ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, category]);

  if (items.length === 0) return null;

  const filtering = query.trim() !== "" || category !== "all";
  const visible =
    filtering || expanded ? filtered : filtered.slice(0, initialVisible);
  const hidden = filtered.length - visible.length;

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <Section
      title={title}
      description={description}
      width={width}
      headerWidth={headerWidth}
      contentWidth={contentWidth}
      className={className}
      headerClassName={headerClassName}
      contentClassName={contentClassName}
    >
      <div
        className={cn(
          "grid items-start gap-6",
          showContact ? "lg:grid-cols-[300px_1fr]" : "lg:grid-cols-1",
        )}
      >
        {showContact ? (
          <aside className="overflow-hidden rounded-xl bg-card lg:sticky lg:top-18">
            <div className="space-y-3 p-4">
              <span className="grid size-10 place-items-center rounded-xl border-2 border-border bg-primary/20 text-primary">
                <Headphones className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold leading-tight">
                  Can&apos;t find your answer?
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground/70">
                  Message support with your order reference and we&apos;ll sort
                  it out.
                </p>
              </div>
            </div>
            <div className="border-t-2 border-border bg-card p-3">
              <Button asChild className="h-9 w-full text-sm">
                <Link href={contactHref}>Contact support</Link>
              </Button>
            </div>
          </aside>
        ) : null}

        <div className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions..."
                aria-label="Search questions"
                autoComplete="off"
                className="h-9 pl-9 text-sm border-0"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                aria-label="Filter by topic"
                className="h-9! w-full text-sm sm:w-48 border-0"
              >
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <LayoutGrid className="size-4" />
                  All topics ({items.length})
                </SelectItem>
                {categories.map(({ id, label, icon: Icon }) => (
                  <SelectItem key={id} value={id}>
                    <Icon className="size-4" />
                    {label} ({counts.get(id) ?? 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p aria-live="polite" className="mb-3 text-xs text-muted-foreground">
            Showing {visible.length} of {filtered.length}{" "}
            {filtered.length === 1 ? "question" : "questions"}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed bg-card p-8 text-center">
              <SearchX className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No questions match</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try different words, or pick another topic.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {visible.map((item) => (
                <li key={item.id}>
                  <FaqRow
                    item={item}
                    category={categoryMap.get(item.category)}
                    open={openId === item.id}
                    onOpenChange={(o) => setOpenId(o ? item.id : null)}
                  />
                </li>
              ))}
            </ul>
          )}

          {!filtering &&
          (hidden > 0 || expanded) &&
          filtered.length > initialVisible ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-4 w-full gap-2 border-0"
            >
              {expanded
                ? "Show fewer"
                : `Show all ${filtered.length} questions`}
              <ChevronDown
                className={cn("size-4 smooth", expanded && "rotate-180")}
              />
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
