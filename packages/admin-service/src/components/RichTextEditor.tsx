'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useCallback, useEffect, useMemo } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variables?: string[]; // 变量名称列表，用于快速插入
  variableValues?: Record<string, string>; // 变量名和值的映射，用于显示变量值
}

// 变量节点的 React 组件
const VariableNodeView = (props: any) => {
  const { node, extension } = props;
  const varName = node.attrs.varName;
  const variableValues = extension.options.variableValues || {};
  const varValue = variableValues[varName];
  const hasValue = !!varValue;

  return (
    <NodeViewWrapper
      as="span"
      className={`variable-node ${
        hasValue ? 'variable-highlight' : 'variable-placeholder'
      }`}
      data-variable={varName}
      contentEditable={false}
      title={hasValue ? `${varName}: ${varValue}` : `变量: ${varName}`}
    >
      {hasValue ? varValue : `{${varName}}`}
    </NodeViewWrapper>
  );
};

// 创建变量节点扩展
const createVariableExtension = (variableValues: Record<string, string>) => {
  return Node.create({
    name: 'variable',
    group: 'inline',
    inline: true,
    atom: true, // 原子节点，不可分割

    addOptions() {
      return {
        variableValues,
      };
    },

    addAttributes() {
      return {
        varName: {
          default: '',
          parseHTML: (element) => element.getAttribute('data-variable'),
          renderHTML: (attributes) => {
            return {
              'data-variable': attributes.varName,
            };
          },
        },
      };
    },

    parseHTML() {
      return [
        {
          tag: 'span[data-variable]',
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      // atom 节点不应该有 content hole，只返回标签和属性
      return ['span', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
      return ReactNodeViewRenderer(VariableNodeView);
    },
  });
};

// 将 HTML 中的 {变量名} 转换为变量节点
function processHtmlToEditor(html: string): string {
  // 将 {变量名} 替换为 span 标签
  return html.replace(/\{([^}]+)\}/g, (_match, varName) => {
    return `<span data-variable="${varName}"></span>`;
  });
}

// 将编辑器内容转换回 HTML（将变量节点转为 {变量名}）
function processEditorToHtml(html: string): string {
  // 将 span[data-variable] 替换为 {变量名}
  return html.replace(
    /<span[^>]*data-variable="([^"]+)"[^>]*>.*?<\/span>/g,
    '{$1}'
  );
}

// 内部编辑器组件
function EditorComponent(props: RichTextEditorProps & { editorKey: string }) {
  const { value, onChange, variables = [], variableValues = {} } = props;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      createVariableExtension(variableValues),
    ],
    content: processHtmlToEditor(value),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(processEditorToHtml(html));
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
      },
    },
  });

  // 当外部value改变时，更新编辑器内容
  useEffect(() => {
    if (editor) {
      const currentHtml = processEditorToHtml(editor.getHTML());
      if (value !== currentHtml) {
        editor.commands.setContent(processHtmlToEditor(value));
      }
    }
  }, [value, editor]);

  // 图片上传处理（转base64）
  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        editor?.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [editor]);

  // 插入变量
  const insertVariable = useCallback(
    (varName: string) => {
      if (!editor) return;

      // 插入变量节点
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'variable',
          attrs: {
            varName,
          },
        })
        .run();
    },
    [editor]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* 标题 */}
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: level as any }).run();
            }
          }}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="0">正文</option>
          <option value="1">标题1</option>
          <option value="2">标题2</option>
          <option value="3">标题3</option>
          <option value="4">标题4</option>
          <option value="5">标题5</option>
          <option value="6">标题6</option>
        </select>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

        {/* 文字格式 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive('bold')
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          title="粗体"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive('italic')
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          title="斜体"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive('underline')
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          title="下划线"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive('strike')
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          title="删除线"
        >
          <s>S</s>
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

        {/* 列表 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive('bulletList')
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          title="无序列表"
        >
          ●
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive('orderedList')
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          title="有序列表"
        >
          1.
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

        {/* 对齐 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive({ textAlign: 'left' })
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          title="左对齐"
        >
          ≡
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive({ textAlign: 'center' })
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          title="居中对齐"
        >
          ≣
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            editor.isActive({ textAlign: 'right' })
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          title="右对齐"
        >
          ≣
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

        {/* 链接和图片 */}
        <button
          type="button"
          onClick={addImage}
          className="px-3 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          title="插入图片"
        >
          🖼️ 图片
        </button>
      </div>

      {/* 编辑区域 */}
      <EditorContent editor={editor} />

      {/* 变量提示 */}
      {variables.length > 0 && (
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-200 dark:border-purple-800">
          <p className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-2">
            💡 快速插入变量（点击下方变量可插入到光标位置）:
          </p>
          <div className="flex flex-wrap gap-2">
            {variables.map((varName) => {
              const hasValue = !!variableValues[varName];
              return (
                <code
                  key={varName}
                  className={`px-2 py-1 rounded text-xs font-mono cursor-pointer transition-colors ${
                    hasValue
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                  }`}
                  onClick={() => insertVariable(varName)}
                  title={
                    hasValue
                      ? `点击插入变量 {${varName}} (当前值: ${variableValues[varName]})`
                      : `点击插入变量 {${varName}} (未配置值)`
                  }
                >
                  {`{${varName}}`}
                  {hasValue && (
                    <span className="ml-1 text-[10px] opacity-70">
                      = {variableValues[varName]}
                    </span>
                  )}
                </code>
              );
            })}
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">
            💡 变量会在编辑器中显示实际值（如果已配置）：
            <span className="inline-block ml-2 px-2 py-0.5 bg-purple-600 text-white text-[10px] rounded">
              有值的变量（紫色）
            </span>
            <span className="inline-block ml-2 px-2 py-0.5 bg-yellow-500 text-yellow-900 text-[10px] rounded">
              未配置的变量（黄色）
            </span>
          </p>
        </div>
      )}

      <style>{`
        /* 编辑器基础样式 */
        .ProseMirror {
          min-height: 300px;
        }

        .ProseMirror:focus {
          outline: none;
        }

        /* 占位符 */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        /* 图片样式 */
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
        }

        /* 链接样式 */
        .ProseMirror a {
          color: rgb(59 130 246);
          text-decoration: underline;
        }

        .dark .ProseMirror a {
          color: rgb(96 165 250);
        }

        /* 变量节点样式 - 有值的变量 */
        .ProseMirror .variable-node.variable-highlight {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2px 8px;
          margin: 0 2px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.9em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          cursor: help;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(102, 126, 234, 0.3);
          user-select: all;
        }

        .ProseMirror .variable-node.variable-highlight:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.5);
        }

        .dark .ProseMirror .variable-node.variable-highlight {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          box-shadow: 0 1px 3px rgba(79, 70, 229, 0.4);
        }

        .dark .ProseMirror .variable-node.variable-highlight:hover {
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.6);
        }

        /* 变量节点样式 - 没有值的变量 */
        .ProseMirror .variable-node.variable-placeholder {
          display: inline-block;
          background: #fbbf24;
          color: #78350f;
          padding: 2px 8px;
          margin: 0 2px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.9em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          cursor: help;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(251, 191, 36, 0.3);
          user-select: all;
        }

        .ProseMirror .variable-node.variable-placeholder:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(251, 191, 36, 0.5);
        }

        .dark .ProseMirror .variable-node.variable-placeholder {
          background: #f59e0b;
          color: #451a03;
          box-shadow: 0 1px 3px rgba(245, 158, 11, 0.4);
        }

        .dark .ProseMirror .variable-node.variable-placeholder:hover {
          box-shadow: 0 2px 6px rgba(245, 158, 11, 0.6);
        }

        /* 选中状态 */
        .ProseMirror .variable-node.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

// 外层包装组件，使用 variableValues 的哈希作为 key 来强制重建编辑器
export default function RichTextEditor(props: RichTextEditorProps) {
  const { variableValues = {} } = props;

  // 生成一个基于 variableValues 的 key
  const editorKey = useMemo(() => {
    return JSON.stringify(variableValues);
  }, [variableValues]);

  // 使用 key 属性强制重建整个组件
  return <EditorComponent key={editorKey} {...props} editorKey={editorKey} />;
}
