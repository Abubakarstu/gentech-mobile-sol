"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Box, CheckCircle2, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  ASSET_EXTENSIONS,
  MAX_ASSET_BYTES,
  MAX_MODEL_ASSETS,
  MAX_MODEL_BYTES,
  MAX_MODEL_TOTAL_BYTES,
  fileExtension,
  isSafeAssetName,
  isSupportedAssetName,
  missingAssetUris,
  modelFormatFromName,
  referencedAssetUris,
} from "@/lib/model-assets";
import type { UploadedModel, UploadedModelAsset } from "@/features/listings/schemas/create-listing";

const ModelViewer = dynamic(
  () => import("./model-viewer").then((module) => module.ModelViewer),
  { ssr: false, loading: () => <p className="text-muted-foreground p-4 text-sm">Loading 3D viewer…</p> },
);

interface SignResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  resourceType: "raw";
}

interface UploadedRawFile {
  secure_url: string;
  public_id: string;
  bytes?: number;
}

async function requestSignature(): Promise<SignResponse> {
  const response = await fetch("/api/v1/uploads/sign-model", { method: "POST" });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "3D uploads are not available right now.");
  }
  return (await response.json()) as SignResponse;
}

function uploadRawFile(
  file: File,
  sign: SignResponse,
  onProgress: (percent: number) => void,
): Promise<UploadedRawFile> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sign.apiKey);
    form.append("timestamp", String(sign.timestamp));
    form.append("signature", sign.signature);
    form.append("folder", sign.folder);
    form.append("resource_type", "raw");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloudName}/raw/upload`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      const status = xhr.status;
      let data: UploadedRawFile | null = null;
      try {
        data = JSON.parse(xhr.responseText) as UploadedRawFile;
      } catch {
        data = null;
      }
      if (status >= 200 && status < 300 && data?.secure_url && data.public_id) {
        resolve(data);
      } else {
        reject(new Error(`Could not upload ${file.name}.`));
      }
    };
    xhr.onerror = () => reject(new Error(`Could not upload ${file.name}.`));
    xhr.send(form);
  });
}

/** Optional 3D model upload for sellers. Photos alone remain a valid listing. */
export function ModelUploader({
  value,
  onChange,
}: {
  value: UploadedModel | null;
  onChange: (model: UploadedModel | null) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [requiredUris, setRequiredUris] = React.useState<string[]>([]);
  const [preview, setPreview] = React.useState(false);
  const modelInput = React.useRef<HTMLInputElement>(null);
  const assetInput = React.useRef<HTMLInputElement>(null);

  async function handleModel(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const format = modelFormatFromName(file.name);
    if (!format) {
      toast.error("Only .glb and .gltf files are supported.");
      return;
    }
    if (!isSafeAssetName(file.name)) {
      toast.error("Use a simple model file name (letters, numbers, dots and dashes).");
      return;
    }
    if (file.size > MAX_MODEL_BYTES) {
      toast.error(`3D models must be under ${MAX_MODEL_BYTES / 1024 / 1024} MB.`);
      return;
    }

    let uris: string[] = [];
    if (format === "GLTF") {
      try {
        uris = referencedAssetUris(await file.text());
      } catch {
        toast.error("The .gltf file could not be read.");
        return;
      }
      if (uris.length === 0) {
        setRequiredUris([]);
      } else {
        setRequiredUris(uris);
        toast.info("Select the .bin and texture files referenced by this .gltf model.");
        return;
      }
    } else {
      setRequiredUris([]);
    }

    await uploadModel(file, format, []);
  }

  async function handleAssets(files: FileList | null) {
    const selected = Array.from(files ?? []);
    if (selected.length === 0) return;
    const invalid = selected.find((file) => !isSupportedAssetName(file.name));
    if (invalid) {
      toast.error(`Unsupported asset ${invalid.name}. Use .bin or image textures.`);
      return;
    }
    if (selected.length > MAX_MODEL_ASSETS) {
      toast.error(`A model can have at most ${MAX_MODEL_ASSETS} supporting assets.`);
      return;
    }
    if (selected.some((file) => file.size > MAX_ASSET_BYTES)) {
      toast.error(`Each model asset must be under ${MAX_ASSET_BYTES / 1024 / 1024} MB.`);
      return;
    }
    const missing = missingAssetUris(
      requiredUris,
      selected.map((file) => file.name),
    );
    if (missing.length > 0) {
      toast.error(`Missing supporting files: ${missing.join(", ")}`);
      return;
    }

    const input = modelInput.current?.files?.[0];
    if (!input) {
      toast.error("Choose the .gltf model file first.");
      return;
    }
    const format = modelFormatFromName(input.name);
    if (!format || fileExtension(input.name) !== "gltf") {
      toast.error("Supporting assets are only needed for .gltf models.");
      return;
    }
    await uploadModel(input, format, selected);
  }

  async function uploadModel(file: File, format: UploadedModel["format"], assets: File[]) {
    const totalBytes = file.size + assets.reduce((sum, asset) => sum + asset.size, 0);
    if (totalBytes > MAX_MODEL_TOTAL_BYTES) {
      toast.error("The model and its assets are too large.");
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const sign = await requestSignature();
      const modelUpload = await uploadRawFile(file, sign, (percent) => setProgress(percent));
      const uploadedAssets: UploadedModelAsset[] = [];
      for (const [index, asset] of assets.entries()) {
        const result = await uploadRawFile(asset, sign, (percent) => {
          setProgress(Math.round(((index + percent / 100) / (assets.length + 1)) * 100));
        });
        const uri = requiredUris.find((required) => required.endsWith(asset.name)) ?? asset.name;
        uploadedAssets.push({
          uri,
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes ?? asset.size,
        });
      }

      onChange({
        url: modelUpload.secure_url,
        publicId: modelUpload.public_id,
        format,
        sizeBytes: modelUpload.bytes ?? file.size,
        assets: uploadedAssets,
      });
      setPreview(false);
      toast.success("3D model uploaded. You can preview it before publishing.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "3D upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (modelInput.current) modelInput.current.value = "";
      if (assetInput.current) assetInput.current.value = "";
    }
  }

  function remove() {
    onChange(null);
    setRequiredUris([]);
    setPreview(false);
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">3D model (optional)</p>
          <p className="text-muted-foreground text-xs">
            GLB or GLTF with its textures. Photos alone are enough — nothing here is required.
          </p>
        </div>
        <Box className="text-brand size-5 shrink-0" />
      </div>

      <input
        ref={modelInput}
        type="file"
        accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
        onChange={(event) => void handleModel(event.target.files)}
        className="text-muted-foreground w-full text-xs"
        aria-label="Upload GLB or GLTF model"
      />

      {requiredUris.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium">Supporting assets for this .gltf:</p>
          <p className="text-muted-foreground break-all text-xs">{requiredUris.join(", ")}</p>
          <input
            ref={assetInput}
            type="file"
            multiple
            accept={ASSET_EXTENSIONS.map((extension) => `.${extension}`).join(",")}
            onChange={(event) => void handleAssets(event.target.files)}
            className="text-muted-foreground w-full text-xs"
            aria-label="Upload GLTF supporting assets"
          />
        </div>
      ) : null}

      {uploading ? (
        <div className="space-y-1" data-model-upload-progress>
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-brand h-full transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <Loader2 className="size-3 animate-spin" /> Uploading {progress}%
          </p>
        </div>
      ) : null}

      {value ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-brand-soft text-brand flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
            <CheckCircle2 className="size-3.5" />
            {value.format} model ready
          </span>
          <button
            type="button"
            onClick={() => setPreview((previous) => !previous)}
            className="rounded-full border px-2.5 py-1 text-xs transition-colors hover:border-brand"
          >
            {preview ? "Hide preview" : "Preview 3D"}
          </button>
          <button
            type="button"
            onClick={remove}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs",
              "transition-colors hover:border-destructive hover:text-destructive",
            )}
          >
            <Trash2 className="size-3.5" /> Remove
          </button>
        </div>
      ) : (
        <p className="text-muted-foreground flex items-center gap-1 text-xs">
          <UploadCloud className="size-3.5" /> Optional enhancement — not shown to buyers until you add one.
        </p>
      )}

      {value && preview ? (
        <div className="bg-muted h-72 overflow-hidden rounded-lg border" data-model-preview>
          <ModelViewer model={value} title="3D model preview" />
        </div>
      ) : null}
    </div>
  );
}
