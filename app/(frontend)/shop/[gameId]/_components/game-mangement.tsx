"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  ChevronDown,
  Gamepad2,
  Headset,
  Server,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  UserRound,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Shell from "../../../_components/shared/shell";
import { GameDetail, GamePackage } from "../actions/get-gamedetail";
import FaqSection from "@/app/(frontend)/_components/shared/sections/faq-section";

export type GameManagementProps = {
  game: GameDetail;
};

const SHINE =
  "linear-gradient(115deg, transparent 0 20%, rgba(255,255,255,.14) 46% 60%, transparent 60% 70%, rgba(255,255,255,.1) 70% 80%, transparent 80%)";

const FIELD_ICONS = {
  user: UserRound,
  charname: Sparkles,
  server: Server,
} as const;

type FieldType = keyof typeof FIELD_ICONS;

function resolveField(field: string) {
  const normalized = field.trim().toLowerCase();
  const base = normalized.replace(/[_\s]*id$/, "").trim();
  const key = (base in FIELD_ICONS ? base : "user") as FieldType;

  // Display only: "userid" -> "user id", "serverid" -> "server id".
  // Anything without an "id" suffix (charname) is left as it came.
  const label = normalized.replace(/[_\s]*id$/, " id");

  return { key, Icon: FIELD_ICONS[key], label, normalized };
}

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(value);

function PackageCard({ pkg }: { pkg: GamePackage }) {
  return (
    <article className="group smooth motion-safe:hover:-translate-y-0.5 h-full">
      <div className="smooth relative flex h-full flex-col overflow-hidden rounded-xl border-2 border-border bg-card group-hover:bg-primary/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-1"
          style={{ backgroundImage: SHINE }}
        />

        <div className="relative z-2 flex min-h-11 flex-1 items-center px-3 py-2.5">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold leading-tight">
              {pkg.gameCurrencyName || pkg.catalogueName}
            </h3>
            {pkg.gameCurrencyName ? (
              <p className="mt-0.5 truncate text-xs font-medium text-white/75">
                {pkg.catalogueName}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-2 border-t-2 border-border bg-card px-3 py-2 text-xs">
          <span className="truncate text-sm font-bold tabular-nums">
            {money(Number(pkg.sellPriceNpr ?? 0))}
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary/20 px-2 py-1 text-xs font-semibold text-white/90">
            <ShoppingCart className="size-3.5" />
            Top up
          </span>
        </div>
      </div>
    </article>
  );
}

function GameAbout({ game }: { game: GameDetail }) {
  const fields = game.requiredFields ?? [];
  const servers = game.servers ?? [];

  return (
    <div className="col-span-2 space-y-6">
      <div className="relative w-full space-y-2">
        <div className="relative z-2 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border-2 border-border bg-muted sm:size-24">
            {game.imageUrl ? (
              <Image
                src={game.imageUrl}
                alt={game.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <span className="grid size-full place-items-center text-muted-foreground">
                <Gamepad2 className="size-8" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
              {game.name}
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-foreground/70">
              <BadgeCheck className="size-3.5 shrink-0 text-lime-400" />
              <span className="truncate font-semibold">{game.g2bulkCode}</span>
            </p>

            <ul className="mt-2 flex flex-wrap gap-1.5">
              {fields.map((field) => {
                const { Icon, label, normalized } = resolveField(field);
                return (
                  <li
                    key={normalized}
                    className="inline-flex items-center gap-1 rounded-4xl border border-border bg-background/60 px-2 py-0.5 text-xs font-medium"
                  >
                    <Icon className="size-3" />
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <ul className="flex w-fit items-center justify-center gap-2 text-center">
          <li className="flex w-fit items-center gap-2 rounded-lg border-2 border-border bg-background/50 px-3 py-1.5">
            <Zap className="size-3.5 text-lime-400" />
            <p className="text-xs font-semibold whitespace-nowrap">Instant</p>
          </li>
          <li className="flex w-fit items-center gap-2 rounded-lg border-2 border-border bg-background/50 px-3 py-1.5">
            <ShieldCheck className="size-3.5 text-lime-400" />
            <p className="text-xs font-semibold whitespace-nowrap">eSewa</p>
          </li>
          <li className="flex w-fit items-center gap-2 rounded-lg border-2 border-border bg-background/50 px-3 py-1.5">
            <Headset className="size-3.5 text-lime-400" />
            <p className="text-xs font-semibold whitespace-nowrap">Support</p>
          </li>
        </ul>

        {servers.length > 0 ? (
          <div className="relative z-10 flex flex-wrap items-center gap-2 border-t-2 border-border bg-background/40 px-4 py-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
              <Server className="size-3.5 text-lime-400" />
              Servers
            </span>
            <ul className="flex flex-wrap gap-1.5">
              {servers.map((server) => (
                <li
                  key={server}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
                >
                  {server}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <FaqSection
        showContact={false}
        headerClassName="p-0"
        contentClassName="p-0"
      />
    </div>
  );
}

function GameOrderPanel({ game }: { game: GameDetail }) {
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [values, setValues] = useState<Record<string, string>>({});

  const fields = game.requiredFields ?? [];
  const servers = game.servers ?? [];

  console.log(fields);

  const sorted = [...game.packages].sort((a, b) =>
    sort === "asc"
      ? Number(a.sellPriceNpr ?? 0) - Number(b.sellPriceNpr ?? 0)
      : Number(b.sellPriceNpr ?? 0) - Number(a.sellPriceNpr ?? 0),
  );

  const complete =
    fields.length > 0 &&
    fields.every((f) => values[f.trim().toLowerCase()]?.trim());

  console.log(`Complete: `, complete);

  const setValue = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <section
      aria-labelledby="packages-heading"
      className="space-y-3! pr-1 lg:sticky lg:top-16"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2
            id="packages-heading"
            className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl"
          >
            <ShoppingBag className="size-5 text-lime-400" />
            Order
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your details, then pick a package.
          </p>
        </div>
      </div>

      <div className="relative space-y-3 rounded-xl bg-card/20 backdrop-blur-lg p-3">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-1"
          style={{ backgroundImage: SHINE }}
        />

        <div className="relative z-2 space-y-2.5">
          {fields.map((field) => {
            const { key, Icon, label, normalized } = resolveField(field);

            return (
              <div key={normalized} className="space-y-1.5">
                <label
                  htmlFor={`field-${normalized}`}
                  className="flex items-center gap-1.5 text-xs font-semibold capitalize"
                >
                  <Icon className="size-3.5 shrink-0 text-lime-400" />
                  {label}
                </label>

                {key === "server" && servers.length > 0 ? (
                  <Select
                    value={values[normalized] ?? ""}
                    onValueChange={(v) => setValue(normalized, v)}
                  >
                    <SelectTrigger
                      id={`field-${normalized}`}
                      className="h-9 w-full text-sm"
                    >
                      <SelectValue placeholder="Select a server" />
                    </SelectTrigger>
                    <SelectContent>
                      {servers.map((server) => (
                        <SelectItem key={server} value={server}>
                          {server}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`field-${normalized}`}
                    value={values[normalized] ?? ""}
                    onChange={(e) => setValue(normalized, e.target.value)}
                    placeholder={`Enter ${label}`}
                    autoComplete="off"
                    className="h-9 text-sm bg-card! border-0 placeholder:capitalize"
                  />
                )}
              </div>
            );
          })}
        </div>

        {fields.length === 0 ? (
          <p className="relative z-2 text-xs text-muted-foreground">
            This game needs no extra details from you.
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="flex gap-2 items-center">
            <Tag className="size-4 text-lime-400" />
            Packages
          </span>
          <p className="text-muted-foreground">
            {sorted.length
              ? `${sorted.length} available for ${game.name}`
              : "No packages available yet."}
          </p>
        </h3>

        {sorted.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
              >
                {sort === "asc" ? "Lowest first" : "Highest first"}
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-(--radix-dropdown-menu-trigger-width)"
            >
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={(v) => setSort(v as "asc" | "desc")}
              >
                <DropdownMenuRadioItem value="asc">
                  Lowest first
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">
                  Highest first
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {sorted.length ? (
        <ScrollArea className="h-96 rounded-lg pr-3">
          <ul className="grid grid-cols-2 gap-2">
            {sorted.map((pkg) => (
              <li key={pkg.id}>
                <PackageCard pkg={pkg} />
              </li>
            ))}
          </ul>
        </ScrollArea>
      ) : (
        <div className="rounded-2xl bg-card/20 p-10 text-center backdrop-blur-lg">
          <Gamepad2 className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">
            No sellable packages for this game yet.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please check back later.
          </p>
        </div>
      )}

      <Button
        type="button"
        disabled={!complete || sorted.length === 0}
        className="w-full gap-2"
      >
        <ShoppingCart className="size-4" />
        {complete ? "Continue to checkout" : "Enter your details to continue"}
      </Button>
    </section>
  );
}

export default function GameManagement({ game }: GameManagementProps) {
  return (
    <Shell
      innerClassName="grid grid-cols-1 items-start gap-4 lg:grid-cols-3"
      className="pb-10"
    >
      <GameAbout game={game} />
      <GameOrderPanel game={game} />
    </Shell>
  );
}
