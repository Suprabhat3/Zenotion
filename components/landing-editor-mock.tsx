export function LandingEditorMock() {
  return (
    <div className="landing-editor-mock overflow-hidden rounded-xl bg-card">
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          api-design.md
        </span>
      </div>

      <div className="grid divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <pre className="landing-editor-source max-h-56 overflow-hidden p-4 text-left font-mono text-xs leading-relaxed sm:max-h-none sm:text-sm">
          <code className="block whitespace-pre">
            <span className="landing-md-h1"># API design notes</span>
            {"\n\n"}
            <span className="landing-md-h2">## Endpoints</span>
            {"\n"}
            <span className="landing-md-list">- </span>
            <span className="landing-md-code">`POST /notes`</span>
            <span className="landing-md-list"> — create</span>
            {"\n"}
            <span className="landing-md-list">- </span>
            <span className="landing-md-code">`GET /notes/:id`</span>
            <span className="landing-md-list"> — fetch</span>
            {"\n\n"}
            <span className="landing-md-h2">## Open questions</span>
            {"\n"}
            <span className="landing-md-checkbox">- [ ]</span>
            <span className="landing-md-list"> Pagination strategy</span>
            {"\n"}
            <span className="landing-md-checkbox">- [ ]</span>
            <span className="landing-md-list"> Auth middleware scope</span>
          </code>
        </pre>

        <div className="landing-editor-preview p-4 text-left text-sm">
          <p className="landing-preview-h1 mb-3 text-base font-bold">
            API design notes
          </p>
          <p className="landing-preview-h2 mb-1 text-xs font-semibold uppercase tracking-wide">
            Endpoints
          </p>
          <ul className="mb-3 list-disc space-y-1 pl-5">
            <li className="text-muted-foreground">
              <code className="landing-preview-code rounded px-1.5 py-0.5 text-xs">
                POST /notes
              </code>{" "}
              — create
            </li>
            <li className="text-muted-foreground">
              <code className="landing-preview-code rounded px-1.5 py-0.5 text-xs">
                GET /notes/:id
              </code>{" "}
              — fetch
            </li>
          </ul>
          <p className="landing-preview-h2 mb-1 text-xs font-semibold uppercase tracking-wide">
            Open questions
          </p>
          <ul className="list-none space-y-1">
            <li className="landing-preview-task text-muted-foreground">
              ☐ Pagination strategy
            </li>
            <li className="landing-preview-task text-muted-foreground">
              ☐ Auth middleware scope
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
