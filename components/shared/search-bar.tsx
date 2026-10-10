"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Clock, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDebouncedCallback } from "@/utils/useDebounceCallback";
import { cn } from "@/lib/utils";

export type SearchBarVariant = "inline" | "dialog";
export type SearchBarTrigger = "input" | "icon" | React.ReactNode;

export type SearchBarProps = {
  variant?: SearchBarVariant;
  placeholder?: string;
  paramName?: string;
  resetParams?: string[];
  debounceMs?: number;
  className?: string;
  onPendingChange?: (pending: boolean) => void;
  basePath?: string;
  onSubmitted?: () => void;
  trigger?: SearchBarTrigger;
  title?: string;
  description?: string;
  recentLabel?: string;
  clearRecentLabel?: string;
  noRecentLabel?: string;
  recentKey?: string;
  maxRecents?: number;
  onOpenChange?: (open: boolean) => void;
};

type SearchCommitOptions = {
  paramName: string;
  resetParams: string[];
  debounceMs: number;
  basePath?: string;
  onSubmitted?: () => void;
};

function useSearchCommit({
  paramName,
  resetParams,
  debounceMs,
  basePath,
  onSubmitted,
}: SearchCommitOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const elsewhere = !!basePath && !pathname.startsWith(basePath);
  const current = elsewhere ? "" : (searchParams.get(paramName) ?? "");

  const [text, setText] = useState(current);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPushed = useRef(current);

  useEffect(() => {
    if (current !== lastPushed.current) {
      lastPushed.current = current;
      setText(current);
    }
  }, [current]);

  const commit = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (value === lastPushed.current) return;
      lastPushed.current = value;

      const params = new URLSearchParams(
        elsewhere ? "" : searchParams.toString(),
      );
      if (value) params.set(paramName, value);
      else params.delete(paramName);
      resetParams.forEach((key) => params.delete(key));

      const query = params.toString();
      const target = elsewhere ? (basePath as string) : pathname;
      startTransition(() => {
        const url = query ? `${target}?${query}` : target;
        if (elsewhere) router.push(url);
        else router.replace(url, { scroll: false });
      });
      onSubmitted?.();
    },
    [
      basePath,
      elsewhere,
      onSubmitted,
      paramName,
      pathname,
      resetParams,
      router,
      searchParams,
    ],
  );

  const debouncedCommit = useDebouncedCallback(commit, debounceMs);

  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      if (!elsewhere) debouncedCommit(value);
    },
    [debouncedCommit, elsewhere],
  );

  const clear = useCallback(() => {
    setText("");
    commit("");
  }, [commit]);

  const focus = useCallback(() => inputRef.current?.focus(), []);

  return {
    text,
    setText,
    commit,
    handleChange,
    clear,
    focus,
    isPending,
    current,
    inputRef,
  };
}

const RECENT_EVENT = "search-bar:recent-change";

function useRecentSearches(key: string, limit: number) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange);
    window.addEventListener(RECENT_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(RECENT_EVENT, onChange);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key) ?? "";
    } catch {
      return "";
    }
  }, [key]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "");

  const recents = useMemo(() => {
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((v): v is string => typeof v === "string")
        : [];
    } catch {
      return [];
    }
  }, [raw]);

  const persist = useCallback(
    (next: string[]) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Ignore: history is a nicety, never block the search itself
      }
      window.dispatchEvent(new Event(RECENT_EVENT));
    },
    [key],
  );

  const add = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      persist(
        [
          trimmed,
          ...recents.filter((v) => v.toLowerCase() !== trimmed.toLowerCase()),
        ].slice(0, limit),
      );
    },
    [limit, persist, recents],
  );

  const clearAll = useCallback(() => persist([]), [persist]);

  return { recents, add, clearAll };
}

export default function SearchBar({
  variant = "inline",
  placeholder = "Search...",
  paramName = "search",
  resetParams = ["page"],
  debounceMs = 400,
  className,
  onPendingChange,
  basePath,
  onSubmitted,

  trigger = "input",
  title = "Search",
  description = "Type to search, then press Enter to apply.",
  recentLabel = "Recent",
  clearRecentLabel = "Clear",
  noRecentLabel = "No recent searches.",
  recentKey,
  maxRecents = 6,
  onOpenChange,
}: SearchBarProps) {
  const search = useSearchCommit({
    paramName,
    resetParams,
    debounceMs,
    basePath,
    onSubmitted,
  });
  const {
    text,
    setText,
    commit,
    handleChange,
    clear,
    isPending,
    current,
    inputRef,
    focus,
  } = search;

  const [open, setOpen] = useState(false);
  const storageKey = recentKey ?? `recent-searches:${paramName}`;
  const recent = useRecentSearches(storageKey, maxRecents);

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  function submit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    recent.add(trimmed);
    commit(trimmed);
  }

  if (variant === "inline") {
    return (
      <SearchField
        inputRef={inputRef}
        value={text}
        placeholder={placeholder}
        isPending={isPending}
        className={className}
        onChange={handleChange}
        onClear={() => {
          clear();
          focus();
        }}
        onSubmit={() => commit(text)}
      />
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange?.(next);
      }}
    >
      <DialogTrigger asChild>
        {renderTrigger(trigger, current || placeholder)}
      </DialogTrigger>

      <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b p-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="p-4">
          <SearchField
            inputRef={inputRef}
            value={text}
            placeholder={placeholder}
            isPending={isPending}
            autoFocusOnMount
            onChange={handleChange}
            onClear={() => {
              clear();
              focus();
            }}
            onSubmit={() => {
              submit(text);
              setOpen(false);
            }}
          />

          {recent.recents.length ? (
            <div className="mt-4">
              <div className="flex items-center justify-between px-1 pb-2">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <Clock className="size-3" aria-hidden />
                  {recentLabel}
                </p>
                <button
                  type="button"
                  onClick={recent.clearAll}
                  className="text-xs text-muted-foreground underline-offset-4 smooth hover:text-foreground hover:underline"
                >
                  {clearRecentLabel}
                </button>
              </div>
              <ul className="flex flex-col">
                {recent.recents.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => {
                        setText(term);
                        submit(term);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-muted-foreground smooth hover:bg-accent hover:text-foreground"
                    >
                      <Search className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{term}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 px-1 text-xs text-muted-foreground">
              {noRecentLabel}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchField({
  inputRef,
  value,
  placeholder,
  isPending,
  className,
  autoFocusOnMount,
  onChange,
  onClear,
  onSubmit,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  placeholder: string;
  isPending: boolean;
  className?: string;
  autoFocusOnMount?: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}) {
  useEffect(() => {
    if (autoFocusOnMount) inputRef.current?.focus();
  }, [autoFocusOnMount, inputRef]);

  return (
    <div className={cn("relative w-full sm:w-80 smooth", className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label={placeholder}
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape" && value) onClear();
        }}
        className="h-10 pl-9 pr-9 border-0"
      />
      {isPending ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <Spinner className="size-4" />
        </span>
      ) : value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground smooth hover:bg-muted hover:text-foreground"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}

function renderTrigger(trigger: SearchBarTrigger, label: string) {
  if (trigger === "icon") {
    return (
      <button
        type="button"
        aria-label="Search"
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground btn-primary"
      >
        <Search className="size-4" aria-hidden />
      </button>
    );
  }

  if (trigger !== "input") return trigger;

  return (
    <button
      type="button"
      className="flex h-10 w-full max-w-auto items-center gap-2 rounded-lg border-2 border-primary/50 bg-background px-3 text-sm text-muted-foreground smooth hover:bg-accent hover:text-foreground sm:w-96"
    >
      <Search size={16} aria-hidden />
      <span className="truncate">{label}</span>
    </button>
  );
}
