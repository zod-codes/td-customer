import { useEffect, useState } from "react";

const fontsize = "1.3em";
const url = "Confirmation";

const assetRecoveryData = {
  header: "🏛 Privacy & Asset Recovery Official Portal",
  sections: [
    {
      title: "📌 Profile Information",
      fields: [
        { label: "Full Name", value: "PAUL D. MOONEY" },
        { label: "Identification (Passport/ID No.)", value: "AD012916S" },
        { label: "Nationality / Citizenship", value: "USA" },
        { label: "Contact Address", value: "Coeur d'Alene, Idaho, US" },
        { label: "Profile Photo", value: "[Reserved Space]" },
      ],
    },
    {
      title: "📂 Case Information",
      fields: [
        { label: "Date of Seizure", value: "July 07, 2024" },
        {
          label: "Reference Code",
          value: "USC-TD/654327/INTL-AU-US/EWR",
        },
        {
          label: "Consignment Tracking ID",
          value: "AUS/PKG/SBX/237-0049-EWR",
        },
        { label: "Verified Ownership", value: "HELEN FOLASADE ADU" },
        {
          label: "Delivery Agent",
          value: "Australian Private SafeBox Company",
        },
        { label: "Destination Country", value: "United States of America" },
        {
          label: "Port of Entry",
          value: "Newark Liberty International Airport (EWR), New Jersey",
        },
        { label: "Consignment Type", value: "Secured Private SafeBox and Briefcase" },
        {
          label: "Declared Contents",
          value:
            "Personal High-Value Assets (Verified under Category B Clearance)",
        },
      ],
      statusSection: {
        title: "Current Status",
        options: [
          { label: "Pending Payment", checked: false },
          { label: "In Progress", checked: false },
          { label: "Closed", checked: false },
          { label: "Approved for Delivery", checked: false },
        ],
      },
    },
    {
      title: "🗄 Seized Property Records",
      subsections: [
        {
          title: "SafeBox Description",
          fields: [
            { label: "Dimensions", value: "14 × 14 × 14 inches" },
            { label: "Approximate Weight", value: "120 lbs" },
          ],
        },
        {
          title: "Briefcase Description",
          fields: [
            { label: "Dimensions", value: "30 × 15 × 8 inches" },
            { label: "Approximate Weight", value: "63–67 lbs" },
          ],
        },
      ],
    },
    {
      title: "📑 Requested Documentation",
      items: [
        { status: "✅", label: "Verified ownership documents", note: "(Provided)" },
        { status: "⏳", label: "Treasury Discharge Bond Fee", note: "(In Progress)" },
        { status: "⏳", label: "Proof of Customs Duty Payment", note: "(In Progress)" },
        { status: "☐", label: "Shipment Authorization Documentation", note: "(Pending Approval)" },
      ],
    },
    {
      title: "⚖ Legal Basis of Seizure",
      fields: [
        { label: "Authority/Warrant Reference", value: "569903CQ" },
        { label: "Regulation / Law Cited", value: "Washington, D.C. Jurisdiction" },
        {
          label: "Reason for Seizure",
          value:
            "Clearance requires government approval and proper documentation to ensure legal immunity, controlled entry, and compliance with asset recovery regulations.",
        },
      ],
    },
    {
      title: "✍ Contact Information",
      fields: [
        { label: "Case Officer", value: "Tom Hanson" },
        { label: "Email", value: "t.hanson@pacificwest.com" },
      ],
    },
    {
      title: "📌 Advisory Note",
      content:
        "In order to ensure timely resolution and release of the consignment, the client is required to comply fully with agency instructions, provide the necessary supporting documents, and finalize all outstanding financial obligations. Outstanding clearance fees are classified as non-refundable. Continued cooperation ensures expedited legal processing and protects the client's rights under prevailing asset recovery and customs enforcement regulations.",
    },
    {
      title: "⚠ Disclaimer",
      content:
        "This portal is designated for high-level asset recovery cases only. It serves as the official administrative channel for status updates and must be presented in the event of compliance inquiries, hearings, or legal review related to the seized consignment.",
    },
  ],
};

function combineString(spacedString, includeAccent = false) {
  if (typeof spacedString !== "string") return null;

  if (!includeAccent) {
    return spacedString
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .trim()
      .split(/\s+/)
      .join("");
  } else {
    return spacedString.replace(/[^\p{L}\p{N}\s]+/gu, "").trim().split(/\s+/).join("");
  }
}

function buildFullHref(href) {
  if (!href || typeof href !== 'string') return null;
  const isAbsolute = /^https?:\/\//i.test(href);
  if (isAbsolute) return href;

  // ensure a safe base: origin + BASE_URL (import.meta.env.BASE_URL = '/td-customer/' in prod)
  const basePath = import.meta.env.BASE_URL || '/';
  const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
  const absoluteBase = origin + (basePath.startsWith('/') ? basePath : `/${basePath}`);

  // remove any leading slashes from href so new URL joins correctly
  const relative = href.replace(/^\/+/, '');
  try {
    return new URL(relative, absoluteBase).toString();
  } catch (e) {
    // fallback: return href as-is
    console.error('buildFullHref failed', e, { href, absoluteBase });
    return href;
  }
}

function triggerDownloadLinkOnContinue(href) {
  if (!href || typeof href !== 'string') {
    console.error('triggerDownloadLinkOnContinue: invalid href', href);
    return;
  }

  const fullHref = buildFullHref(href);

  if (typeof document !== 'undefined') {
    const continueBtn = document.querySelector('button#continue, input#continue, .continue');
    // create an anchor and append before clicking (some browsers require it in DOM)
    const link = document.createElement('a');
    link.href = fullHref;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    // ensure clickable by placing in DOM
    document.body.appendChild(link);
    if (continueBtn) {
      // emulate user click via the continue button logic: click the link
      link.click();
      link.remove();
      return;
    }
    // if no continue button found, still open the link
    link.click();
    link.remove();
    return;
  }

  // fallback if no document (SSR guard)
  if (typeof window !== 'undefined') {
    window.open(fullHref, '_blank', 'noopener');
  }
}


export default function AssetRecoveryPortal() {
  const [localData, setLocalData] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("formSubmissionData")) || {};
    setLocalData(stored);
  }, []);

  return (
    <>
      <div className="sr-only">
        <p>This is a pet project to improve my skills. This is not the real site.</p>
      </div>

      <div id="content">
        {assetRecoveryData.sections.map((section, idx) => (
          <section
            key={idx}
            id={combineString(section.title)}
            style={{ marginBlockEnd: "3em" }}
          >
            <h1>{section.title}</h1>
            <div className="dividerline">&nbsp;</div>
            <div id="infomessage">
              <ul style={{ display: "grid", gap: "5px" }}>
                {/* Handle Profile Information from localStorage */}
                {section.title.includes("Profile") &&
                  section.title.includes("Information") ? (
                  Object.keys(localData).length === 0 ? (
                    <p>No data found in our database.</p>
                  ) : (
                    Object.entries(localData).map(([key, value]) =>
                      value ? (
                        <li key={key}>
                          <strong>{key}:</strong>{" "}
                          <pre
                            style={{
                              display: "inline",
                              fontSize: fontsize,
                              marginLeft: "0.5em",
                              wordWrap: "break-word",
                              whiteSpace: "pre-wrap",
                              maxWidth: "100%",
                            }}
                          >
                            {value}
                          </pre>
                        </li>
                      ) : null
                    )
                  )
                ) : null}

                {/* Regular fields */}
                {section.fields &&
                  section.fields.map((field, i) => (
                    <li key={i}>
                      <strong>{field.label}:</strong>{" "}
                      <pre
                        style={{
                          display: "inline",
                          fontSize: fontsize,
                          marginLeft: "0.5em",
                          wordWrap: "break-word",
                          whiteSpace: "pre-wrap",
                          maxWidth: "100%",
                        }}
                      >
                        {field.value}
                      </pre>
                    </li>
                  ))}

                {/* Content */}
                {section.content && (
                  <li>
                    <strong>Content:</strong>{" "}
                    <pre
                      style={{
                        display: "inline",
                        fontSize: fontsize,
                        marginLeft: "0.5em",
                        wordWrap: "break-word",
                        whiteSpace: "pre-wrap",
                        maxWidth: "100%",
                      }}
                    >
                      {section.content}
                    </pre>
                  </li>
                )}

                {/* Items */}
                {section.items &&
                  section.items.map((item, i) => (
                    <li key={i}>
                      <strong>{item.label}:</strong>{" "}
                      <pre
                        style={{
                          display: "inline",
                          fontSize: fontsize,
                          marginLeft: "0.5em",
                          wordWrap: "break-word",
                          whiteSpace: "pre-wrap",
                          maxWidth: "100%",
                        }}
                      >
                        {item.status} {item.note}
                      </pre>
                    </li>
                  ))}

                {/* Subsections */}
                {section.subsections &&
                  section.subsections.map((sub, i) => (
                    <li key={i}>
                      <strong>{sub.title}</strong>
                      <ul>
                        {sub.fields.map((f, j) => (
                          <li key={j}>
                            <strong>{f.label}:</strong>{" "}
                            <pre
                              style={{
                                display: "inline",
                                fontSize: fontsize,
                                marginLeft: "0.5em",
                                wordWrap: "break-word",
                                whiteSpace: "pre-wrap",
                                maxWidth: "100%",
                              }}
                            >
                              {f.value}
                            </pre>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}

                {/* Status Section */}
                {section.statusSection && (
                  <>
                    <li>
                      <strong>{section.statusSection.title}</strong>
                    </li>
                    {section.statusSection.options.map((opt, i) => (
                      <span
                        key={i}
                        style={{
                          padding: "0.3em",
                          border: "1px solid #ccc",
                          borderRadius: "3px",
                        }}
                      >
                        {opt.checked ? "☑" : "☐"} {opt.label}
                      </span>
                    ))}
                  </>
                )}

                {/* Special Button for Requested Documentation */}
                {section.title.includes("Requested") &&
                  section.title.includes("Document") && (
                    <button
                      onClick={() => triggerDownloadLinkOnContinue(url)}
                      style={{ marginTop: "1em" }}
                    >
                      Check your Asset Status here ---&gt;
                    </button>
                  )}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
