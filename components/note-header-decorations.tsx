"use client";

import { useState } from "react";
import { Image as ImageIcon, Loader2, Smile, Trash2 } from "lucide-react";
import { pickImageFile, uploadNoteImageWithToast } from "@/lib/upload-image";
import { MAX_IMAGE_SIZE_MB } from "@/lib/uploads";
import { NoteIconPicker } from "@/components/note-icon-picker";
import { Button } from "@/components/ui/button";

type NoteHeaderDecorationsProps = {
  icon: string | null;
  coverImage: string | null;
  onIconChange: (icon: string | null) => void;
  onCoverChange: (url: string | null) => void;
};

/**
 * Note page decorations above the title: a full-width cover image (uploaded
 * to ImageKit) plus add-buttons for the cover and the emoji icon. The icon
 * itself is displayed beside the title by the note editor.
 */
export function NoteHeaderDecorations({
  icon,
  coverImage,
  onIconChange,
  onCoverChange,
}: NoteHeaderDecorationsProps) {
  const [uploadingCover, setUploadingCover] = useState(false);

  async function handleCoverUpload() {
    const file = await pickImageFile();
    if (!file) return;
    setUploadingCover(true);
    try {
      const uploaded = await uploadNoteImageWithToast(file);
      if (uploaded) onCoverChange(uploaded.url);
    } finally {
      setUploadingCover(false);
    }
  }

  return (
    <div className="group/decor">
      {coverImage && (
        <div className="relative h-32 w-full overflow-hidden max-sm:rounded-xl sm:h-44">
          {/* Covers come from ImageKit; a plain img avoids next/image domain config. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt="Note cover"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-2 right-3 flex items-center gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/decor:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs shadow-sm"
              onClick={handleCoverUpload}
              disabled={uploadingCover}
              title={`Upload a new cover (max ${MAX_IMAGE_SIZE_MB} MB)`}
            >
              {uploadingCover ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5" />
              )}
              Change cover
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs shadow-sm"
              onClick={() => onCoverChange(null)}
              title="Remove cover"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Matches the editor's centered column so icon/title/content line up.
          The icon itself renders beside the title (in the editor); here we
          only offer the add buttons for whichever decoration is missing. */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {(!icon || !coverImage) && (
          <div className="flex items-center gap-1 pt-2">
            {!icon && (
              <NoteIconPicker icon={icon} onSelect={onIconChange}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Smile className="h-3.5 w-3.5" />
                  Add icon
                </Button>
              </NoteIconPicker>
            )}
            {!coverImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleCoverUpload}
                disabled={uploadingCover}
                title={`Upload a cover image (max ${MAX_IMAGE_SIZE_MB} MB)`}
              >
                {uploadingCover ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5" />
                )}
                {uploadingCover ? "Uploading…" : "Add cover"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
