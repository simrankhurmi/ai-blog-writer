function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const blocks = content.split("\n\n").filter(Boolean);

  return (
    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700">
      <div className="text-slate-700 leading-relaxed space-y-6">
        {blocks.map((block, index) => {
          if (block.startsWith("#")) {
            const level = block.match(/^#+/)?.[0].length || 1;
            const text = block.replace(/^#+\s/, "");
            const headingClass =
              {
                1: "text-3xl font-bold mt-12 mb-6",
                2: "text-2xl font-bold mt-10 mb-4",
                3: "text-xl font-bold mt-8 mb-3",
              }[level] || "text-lg font-bold mt-6 mb-2";

            const Tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
            return (
              <Tag key={index} className={`text-slate-900 ${headingClass}`}>
                {renderInlineMarkdown(text)}
              </Tag>
            );
          }

          if (block.startsWith("-") || block.startsWith("•") || block.startsWith("*")) {
            const items = block.split("\n").filter((line) => line.trim());
            return (
              <ul key={index} className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                {items.map((item, i) => (
                  <li key={i} className="ml-2">
                    {renderInlineMarkdown(item.replace(/^[-•*]\s+/, ""))}
                  </li>
                ))}
              </ul>
            );
          }

          if (/^\d+\./.test(block)) {
            const items = block.split("\n").filter((line) => line.trim());
            return (
              <ol key={index} className="list-decimal list-inside space-y-2 text-slate-700 ml-4">
                {items.map((item, i) => (
                  <li key={i} className="ml-2">
                    {renderInlineMarkdown(item.replace(/^\d+\.\s+/, ""))}
                  </li>
                ))}
              </ol>
            );
          }

          return (
            <p key={index} className="text-slate-700 leading-relaxed">
              {renderInlineMarkdown(block)}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export function getExcerpt(content: string, length = 150) {
  const plain = content
    .replace(/^#+\s/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (plain.length <= length) return plain;
  return `${plain.substring(0, length).trim()}...`;
}

export function formatDate(dateString: string, style: "short" | "long" = "short") {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  });
}
