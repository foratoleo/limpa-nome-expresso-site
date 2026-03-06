import { DownloadIcon } from "@/utils/icons";

interface DualActionCardDownload {
  label: string;
  file: string;
  description: string;
  template?: "form-fillable";
}

interface DualActionCardProps {
  download: DualActionCardDownload;
  onDownload: () => void;
  onFillOnline: () => void;
}

export function DualActionCard({ download, onDownload, onFillOnline }: DualActionCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
        borderRadius: "12px",
        backgroundColor: "rgba(211, 158, 23, 0.08)",
        border: "1px solid rgba(211, 158, 23, 0.2)",
      }}
    >
      {/* Header with icon and title */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(211, 158, 23, 0.15)",
            flexShrink: 0,
          }}
        >
          <DownloadIcon size="medium" label="" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 600,
              fontSize: "15px",
              color: "#d39e17",
              margin: 0,
              marginBottom: "4px",
            }}
          >
            {download.label}
          </p>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
            {download.description}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexDirection: "column",
        }}
        className="sm:flex-row"
      >
        {/* Download button (outlined) */}
        <button
          onClick={onDownload}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(211, 158, 23, 0.4)",
            backgroundColor: "transparent",
            color: "#d39e17",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(211, 158, 23, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <DownloadIcon size="small" label="" />
          Baixar
        </button>

        {/* Fill Online button (filled gold) */}
        <button
          onClick={onFillOnline}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#d39e17",
            color: "#12110d",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#c49314";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(211, 158, 23, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#d39e17";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Preencher Online
        </button>
      </div>
    </div>
  );
}
