import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

const COLORS = {
  background: '#12110d',
  navy: '#162847',
  gold: '#d39e17',
  green: '#22c55e',
  blue: '#60a5fa',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
} as const;

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [
        rehypeSanitize,
        {
          allowedTags: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'a', 'ul', 'ol', 'li',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'code', 'pre', 'blockquote',
            'strong', 'em',
            'br', 'hr',
          ],
          allowedAttributes: {
            '*': ['className'],
            'a': ['href', 'target', 'rel'],
            'code': ['className'],
          },
          allowedClasses: {
            '*': ['language-*', 'text-*', 'bg-*', 'p-*', 'm-*', 'font-*', 'rounded*', 'border*'],
          },
        }
      ]]}
      components={{
        h1: ({ node, ...props }) => (
          <h1
            className="text-2xl md:text-3xl font-bold mt-8 mb-4"
            style={{ color: COLORS.textPrimary }}
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="text-xl md:text-2xl font-bold mt-6 mb-3"
            style={{ color: COLORS.textPrimary }}
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-lg md:text-xl font-semibold mt-5 mb-2"
            style={{ color: COLORS.textPrimary }}
            {...props}
          />
        ),
        h4: ({ node, ...props }) => (
          <h4
            className="text-base md:text-lg font-semibold mt-4 mb-2"
            style={{ color: COLORS.textPrimary }}
            {...props}
          />
        ),
        h5: ({ node, ...props }) => (
          <h5
            className="text-base font-semibold mt-3 mb-2"
            style={{ color: COLORS.textPrimary }}
            {...props}
          />
        ),
        h6: ({ node, ...props }) => (
          <h6
            className="text-sm font-semibold mt-3 mb-2"
            style={{ color: COLORS.textSecondary }}
            {...props}
          />
        ),
        p: ({ node, ...props }) => (
          <p
            className="text-sm md:text-base leading-relaxed mb-4"
            style={{ color: COLORS.textSecondary }}
            {...props}
          />
        ),
        a: ({ node, ...props }) => (
          <a
            className="underline hover:opacity-80 transition-opacity"
            style={{ color: COLORS.gold }}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        ul: ({ node, ...props }) => (
          <ul
            className="list-disc list-inside mb-4 space-y-2"
            style={{ color: COLORS.textSecondary, paddingLeft: '1rem' }}
            {...props}
          />
        ),
        ol: ({ node, ...props }) => (
          <ol
            className="list-decimal list-inside mb-4 space-y-2"
            style={{ color: COLORS.textSecondary, paddingLeft: '1rem' }}
            {...props}
          />
        ),
        li: ({ node, ...props }) => (
          <li
            className="text-sm md:text-base leading-relaxed"
            style={{ color: COLORS.textSecondary }}
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto mb-4">
            <table
              className="min-w-full border-collapse"
              style={{
                border: `1px solid ${COLORS.navy}`,
                borderRadius: '8px',
                overflow: 'hidden',
              }}
              {...props}
            />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead
            style={{ backgroundColor: COLORS.navy }}
            {...props}
          />
        ),
        tbody: ({ node, ...props }) => (
          <tbody {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr
            className="border-b"
            style={{
              borderColor: `${COLORS.navy}40`,
              borderBottomWidth: '1px',
            }}
            {...props}
          />
        ),
        th: ({ node, ...props }) => (
          <th
            className="text-left py-3 px-4 text-sm font-semibold"
            style={{ color: COLORS.textPrimary }}
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            className="text-left py-3 px-4 text-sm"
            style={{ color: COLORS.textSecondary }}
            {...props}
          />
        ),
        code: ({ node, className, children, ...props }: any) => {
          const inline = !(className || '').includes('language-');
          if (inline) {
            return (
              <code
                className="px-1 py-0.5 rounded text-xs font-mono"
                style={{
                  backgroundColor: `${COLORS.navy}80`,
                  color: COLORS.gold,
                  border: `1px solid ${COLORS.navy}`,
                }}
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <code
              className={className}
              style={{
                display: 'block',
                backgroundColor: `${COLORS.background}`,
                color: COLORS.textSecondary,
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                border: `1px solid ${COLORS.navy}60`,
                overflowX: 'auto',
                whiteSpace: 'pre',
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ node, ...props }) => (
          <pre
            className="mb-4 overflow-x-auto"
            style={{
              backgroundColor: 'transparent',
              padding: 0,
              margin: 0,
            }}
            {...props}
          />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="pl-4 py-2 mb-4 italic border-l-4"
            style={{
              borderColor: COLORS.gold,
              backgroundColor: `${COLORS.gold}10`,
              color: COLORS.textSecondary,
            }}
            {...props}
          />
        ),
        strong: ({ node, ...props }) => (
          <strong
            className="font-semibold"
            style={{ color: COLORS.textPrimary }}
            {...props}
          />
        ),
        em: ({ node, ...props }) => (
          <em
            style={{ color: COLORS.textSecondary }}
            {...props}
          />
        ),
        hr: ({ node, ...props }) => (
          <hr
            className="my-6"
            style={{
              borderColor: `${COLORS.navy}40`,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
