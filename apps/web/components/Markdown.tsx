import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/** Markdown + สมการ KaTeX สำหรับบทเรียน โจทย์ และเฉลย */
export function Markdown({ children, inline = false }: { children: string; inline?: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={inline ? { p: ({ children }) => <>{children}</> } : undefined}
    >
      {children}
    </ReactMarkdown>
  );
}
