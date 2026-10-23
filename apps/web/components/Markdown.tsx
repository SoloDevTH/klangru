import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/** Markdown + ตาราง + สมการ KaTeX สำหรับบทเรียน โจทย์ และเฉลย */
export function Markdown({ children, inline = false }: { children: string; inline?: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={
        inline
          ? { p: ({ children }) => <>{children}</> }
          : { table: ({ children }) => <div className="table-scroll"><table>{children}</table></div> }
      }
    >
      {children}
    </ReactMarkdown>
  );
}
