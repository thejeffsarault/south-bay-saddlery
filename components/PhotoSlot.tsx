"use client";

import { SELL_COPY, type PhotoAngleId } from "@/lib/catalog";

const actionClass =
  "block cursor-pointer text-sm text-sbs-text underline-offset-4 hover:underline";

function ChooseFromLabel() {
  return (
    <>
      <span className="sm:hidden">{SELL_COPY.fromLibrary}</span>
      <span className="hidden sm:inline">{SELL_COPY.fromFiles}</span>
    </>
  );
}

export function PhotoActionPair({
  id,
  libraryMultiple = false,
  align = "start",
  onCamera,
  onLibrary,
}: {
  id: string;
  libraryMultiple?: boolean;
  align?: "start" | "center";
  onCamera: (files: FileList | null) => void;
  onLibrary: (files: FileList | null) => void;
}) {
  return (
    <div
      className={`flex flex-col gap-2 ${
        align === "center" ? "items-center text-center" : "items-start"
      }`}
    >
      <label className={actionClass}>
        {SELL_COPY.takePhoto}
        <input
          id={`${id}-camera`}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            onCamera(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      <label className={actionClass}>
        <ChooseFromLabel />
        <input
          id={`${id}-library`}
          type="file"
          accept="image/*"
          multiple={libraryMultiple}
          className="sr-only"
          onChange={(e) => {
            onLibrary(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
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
  return (
    <div
      className={`relative flex aspect-[4/5] flex-col overflow-hidden border bg-sbs-white ${
        emphasized && !thumb ? "border-sbs-black" : "border-sbs-border"
      }`}
    >
      {thumb ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute right-1 top-1 bg-sbs-white px-1.5 py-0.5 text-[0.62rem] text-sbs-muted"
          >
            Clear
          </button>
        </>
      ) : (
        <div className="flex h-full flex-col justify-between p-2">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sbs-muted">
            {label}
          </span>
          <PhotoActionPair
            id={`slot-${id}`}
            onCamera={onCamera}
            onLibrary={onLibrary}
          />
        </div>
      )}
    </div>
  );
}
