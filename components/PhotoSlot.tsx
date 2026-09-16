"use client";

import { useRef } from "react";
import { SELL_COPY, type PhotoAngleId } from "@/lib/catalog";

const actionClass = {
  plain: "w-full px-0 py-2 text-left text-sm leading-snug text-sbs-text",
  hero: "w-full px-0 py-3 text-left text-base text-sbs-text",
} as const;

function ChooseFromLabel() {
  return (
    <>
      <span className="sm:hidden">{SELL_COPY.fromLibrary}</span>
      <span className="hidden sm:inline">{SELL_COPY.fromFiles}</span>
    </>
  );
}

function FileTrigger({
  id,
  capture,
  multiple,
  variant = "plain",
  children,
  onFiles,
}: {
  id: string;
  capture?: boolean;
  multiple?: boolean;
  variant?: keyof typeof actionClass;
  children: React.ReactNode;
  onFiles: (files: FileList | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        className={actionClass[variant]}
        onClick={() => inputRef.current?.click()}
      >
        {children}
      </button>
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        {...(capture ? { capture: "environment" } : {})}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
}

export function PhotoActionPair({
  id,
  libraryMultiple = false,
  align = "start",
  variant = "plain",
  onCamera,
  onLibrary,
}: {
  id: string;
  libraryMultiple?: boolean;
  align?: "start" | "center";
  variant?: keyof typeof actionClass;
  onCamera: (files: FileList | null) => void;
  onLibrary: (files: FileList | null) => void;
}) {
  const centered = align === "center";
  return (
    <div
      className={`flex w-full flex-col gap-2 ${centered ? "items-center text-center" : "items-stretch"}`}
    >
      <FileTrigger
        id={`${id}-camera`}
        capture
        variant={variant}
        onFiles={onCamera}
      >
        {SELL_COPY.takePhoto}
      </FileTrigger>
      <FileTrigger
        id={`${id}-library`}
        multiple={libraryMultiple}
        variant={variant}
        onFiles={onLibrary}
      >
        <ChooseFromLabel />
      </FileTrigger>
    </div>
  );
}

export function PhotoSlot({
  id,
  label,
  emphasized,
  thumb,
  onCamera,
  onLibrary,
  onClear,
}: {
  id: PhotoAngleId;
  label: string;
  emphasized?: boolean;
  thumb?: string;
  onCamera: (files: FileList | null) => void;
  onLibrary: (files: FileList | null) => void;
  onClear: () => void;
}) {
  if (thumb) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden border border-sbs-border bg-sbs-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb} alt="" className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={onClear}
          className="absolute right-1 top-1 bg-sbs-white px-1.5 py-0.5 text-[0.62rem] text-sbs-muted"
        >
          Clear
        </button>
      </div>
    );
  }

  return (
    <div
      className={`border bg-sbs-white ${
        emphasized ? "border-sbs-black" : "border-sbs-border"
      }`}
    >
      <p className="px-2.5 pt-2.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sbs-muted">
        {label}
      </p>
      <PhotoActionPair
        id={`slot-${id}`}
        onCamera={onCamera}
        onLibrary={onLibrary}
      />
    </div>
  );
}
