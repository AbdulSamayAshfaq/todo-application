'use client';

import { useState } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const MarkdownEditor = ({
  value,
  onChange,
  placeholder = 'Write your description here...',
  className = ''
}: MarkdownEditorProps) => {
  const [isPreview, setIsPreview] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Basic markdown conversion to HTML
  const convertMarkdownToHTML = (markdown: string): string => {
    let html = markdown;

    // Convert headers (# Header 1, ## Header 2, etc.)
    html = html.replace(/^(\s*)#+\s+(.*?)$/gm, (_, spaces, content) => {
      const level = Math.min((spaces.match(/\s/g) || []).length / 2 + 1, 6);
      return `<h${level}>${content}</h${level}>`;
    });

    // Convert bold (**bold** or __bold__)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Convert italic (*italic* or _italic_)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Convert links ([text](url))
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');

    // Convert code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');

    // Convert code blocks (```code```)
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded overflow-x-auto"><code>$1</code></pre>');

    // Convert paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = `<p>${html}</p>`;
    html = html.replace(/<p><\/p>/g, '');

    // Convert line breaks (\n)
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      <div className="flex border-b border-gray-300">
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          className={`px-4 py-2 text-sm font-medium ${
            !isPreview
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className={`px-4 py-2 text-sm font-medium ${
            isPreview
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preview
        </button>
      </div>

      {isPreview ? (
        <div className="p-3 bg-white min-h-[150px] max-h-96 overflow-y-auto prose prose-sm">
          <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(value) }} />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full h-40 p-3 border-0 focus:ring-0 resize-none"
        />
      )}
    </div>
  );
};