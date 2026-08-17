import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { download, downloadLogoPng, logoDataUrl, logoSvg, slugify } from "@/lib/nexa";
import type { Company } from "@/lib/types";
import { toast } from "sonner";

/** Miniatura da logo gerada da empresa. */
export function CompanyLogo({ company, size = 40 }: { company: Company; size?: number }) {
  return (
    <img
      src={logoDataUrl(company)}
      alt={`Logo da empresa ${company.name}`}
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0 rounded-lg"
      style={{ width: size, height: size }}
    />
  );
}

/** Logo + botões de download individual (SVG e PNG). */
export function CompanyLogoCell({ company }: { company: Company }) {
  return (
    <div className="flex items-center gap-2">
      <CompanyLogo company={company} />
      <div className="flex flex-col">
        <button
          type="button"
          className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => {
            download(`${slugify(company.name)}-logo.svg`, logoSvg(company), "image/svg+xml");
            toast.success("Logo SVG baixada");
          }}
        >
          SVG
        </button>
        <button
          type="button"
          className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => {
            void downloadLogoPng(company);
            toast.success("Logo PNG baixada");
          }}
        >
          PNG
        </button>
      </div>
    </div>
  );
}

export function DownloadLogoButtons({ company }: { company: Company }) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          download(`${slugify(company.name)}-logo.svg`, logoSvg(company), "image/svg+xml");
          toast.success("Logo SVG baixada");
        }}
      >
        <Download className="size-4" /> Logo SVG
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          void downloadLogoPng(company);
          toast.success("Logo PNG baixada");
        }}
      >
        <Download className="size-4" /> Logo PNG
      </Button>
    </div>
  );
}
