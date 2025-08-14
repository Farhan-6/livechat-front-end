import React, { useEffect, useMemo, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import DOMPurify from 'dompurify';
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $isHeadingNode, HeadingNode } from '@lexical/rich-text';
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from '@lexical/list';
import { mergeRegister } from '@lexical/utils';
import '../Style/LexicalStyle.css';

/* --------------------- Optional: Auto-capitalize plugin ---------------------
   - Capitalizes the first character of a paragraph, and the character after ". "
   - Uses update listener only (no missing commands)
--------------------------------------------------------------------------- */
function CapitalizePlugin() {
  const [editor] = useLexicalComposerContext();
  const guard = React.useRef(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      if (guard.current) return;
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;

        const anchor = selection.anchor;
        const node = anchor.getNode();
        if (!$isTextNode(node)) return;

        const text = node.getTextContent();
        const offset = anchor.offset;
        if (offset === 0 || text.length === 0) return;

        const idx = offset - 1;
        const ch = text[idx];

        if (!/[a-z]/.test(ch)) return;

        const prev1 = idx - 1 >= 0 ? text[idx - 1] : null;
        const prev2 = idx - 2 >= 0 ? text[idx - 2] : null;

        const atStart = idx === 0;
        const afterPeriodSpace = prev2 === '.' && prev1 === ' ';

        if (atStart || afterPeriodSpace) {
          const newText = text.slice(0, idx) + ch.toUpperCase() + text.slice(idx + 1);
          guard.current = true;
          editor.update(() => {
            node.setTextContent(newText);
            node.select(idx + 1, idx + 1);
          });
          // small microtask delay to avoid re-entry on the same update
          queueMicrotask(() => (guard.current = false));
        }
      });
    });
  }, [editor]);

  return null;
}

/* Toolbar Plugin */
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    h1: false,
    h2: false,
    ul: false,
    ol: false,
  });

  const readActiveFromEditorState = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        setActiveFormats({
          bold: false,
          italic: false,
          underline: false,
          h1: false,
          h2: false,
          ul: false,
          ol: false,
        });
        return;
      }

      const bold = selection.hasFormat('bold');
      const italic = selection.hasFormat('italic');
      const underline = selection.hasFormat('underline');

      const anchorNode = selection.anchor.getNode();

      if (anchorNode.getKey() === 'root') {
      setActiveFormats({
        bold,
        italic,
        underline,
        h1: false,
        h2: false,
        ul: false,
        ol: false,
      });
      return;
    }
      const topElement = anchorNode.getTopLevelElementOrThrow();

      let h1 = false;
      let h2 = false;
      let ul = false;
      let ol = false;

      if ($isHeadingNode(topElement)) {
        const tag = topElement.getTag();
        h1 = tag === 'h1';
        h2 = tag === 'h2';
      } else if ($isListNode(topElement)) {
        const type = topElement.getListType();
        ul = type === 'bullet';
        ol = type === 'number';
      }

      setActiveFormats({ bold, italic, underline, h1, h2, ul, ol });
    });
  };

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        readActiveFromEditorState();
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          readActiveFromEditorState();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  // Actions
  const toggleFormat = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const toggleHeading = (level) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchorNode = selection.anchor.getNode();
      const topElement = anchorNode.getTopLevelElementOrThrow();
      const isActive = $isHeadingNode(topElement) && topElement.getTag() === level;

      $setBlocksType(selection, () =>
        isActive ? $createParagraphNode() : $createHeadingNode(level)
      );
    });
  };

  const toggleList = (type) => {
    const isActive = type === 'ul' ? activeFormats.ul : activeFormats.ol;
    editor.dispatchCommand(
      isActive ? REMOVE_LIST_COMMAND : type === 'ul' ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
      undefined
    );
  };

  const handleClearFormatting = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
        if (selection.hasFormat('bold')) editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        if (selection.hasFormat('italic')) editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        if (selection.hasFormat('underline')) editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
      }
    });
  };

  return (
    <div className="lexical-toolbar">
      <button
        type="button"
        onClick={handleClearFormatting}
        className={`toolbar-btn ${
          !activeFormats.bold &&
          !activeFormats.italic &&
          !activeFormats.underline &&
          !activeFormats.h1 &&
          !activeFormats.h2 &&
          !activeFormats.ul &&
          !activeFormats.ol
            ? 'active'
            : ''
        }`}
        title="Clear formatting"
      >
        T
      </button>

      <button
        type="button"
        onClick={() => toggleFormat('bold')}
        className={`toolbar-btn ${activeFormats.bold ? 'active' : ''}`}
        title="Bold"
      >
        <strong>B</strong>
      </button>

      <button
        type="button"
        onClick={() => toggleFormat('italic')}
        className={`toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
        title="Italic"
      >
        <em>I</em>
      </button>

      <button
        type="button"
        onClick={() => toggleFormat('underline')}
        className={`toolbar-btn ${activeFormats.underline ? 'active' : ''}`}
        title="Underline"
      >
        <u>U</u>
      </button>

      <button
        type="button"
        onClick={() => toggleHeading('h1')}
        className={`toolbar-btn ${activeFormats.h1 ? 'active' : ''}`}
        title="H1"
      >
        H1
      </button>

      <button
        type="button"
        onClick={() => toggleHeading('h2')}
        className={`toolbar-btn ${activeFormats.h2 ? 'active' : ''}`}
        title="H2"
      >
        H2
      </button>

      <button
        type="button"
        onClick={() => toggleList('ul')}
        className={`toolbar-btn ${activeFormats.ul ? 'active' : ''}`}
        title="Bulleted List"
      >
        • List
      </button>

      <button
        type="button"
        onClick={() => toggleList('ol')}
        className={`toolbar-btn ${activeFormats.ol ? 'active' : ''}`}
        title="Numbered List"
      >
        1. List
      </button>

      <button
        type="button"
        onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND)}
        className="toolbar-btn"
        title="Remove List"
      >
        No List
      </button>
    </div>
  );
}

/* Reset Plugin */
function ResetPlugin({ clearSignal }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (clearSignal) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const p = $createParagraphNode();
        p.append($createTextNode(''));
        root.append(p);
      });
    }
  }, [clearSignal, editor]);
  return null;
}

/* HTML conversion (preserves inline styles) */
function textNodeToHtml(textNode) {
  let text = textNode.getTextContent();
  if (textNode.hasFormat('bold')) {
    text = `<strong>${text}</strong>`;
  }
  if (textNode.hasFormat('italic')) {
    text = `<em>${text}</em>`;
  }
  if (textNode.hasFormat('underline')) {
    text = `<u>${text}</u>`;
  }
  return text;
}

function nodesToHtml(nodes) {
  return nodes
    .map((node) => {
      if ($isTextNode(node)) {
        return textNodeToHtml(node);
      }
      if (typeof node.getChildren === 'function') {
        return nodesToHtml(node.getChildren());
      }
      return '';
    })
    .join('');
}

function editorStateToHtml(editorState) {
  let html = '';
  editorState.read(() => {
    const root = $getRoot();
    html = root
      .getChildren()
      .map((node) => {
        if ($isHeadingNode(node)) {
          const tag = node.getTag();
          return `<${tag} class="lexical-text-${tag}">${nodesToHtml(node.getChildren())}</${tag}>`;
        }
        if ($isListNode(node)) {
          const tag = node.getListType() === 'number' ? 'ol' : 'ul';
          const items = node
            .getChildren()
            .map((child) => `<li class="lexical-list-item">${nodesToHtml(child.getChildren())}</li>`)
            .join('');
          return `<${tag} class="lexical-list-${tag}">${items}</${tag}>`;
        }
        if (typeof node.getChildren === 'function') {
          return `<p class="lexical-paragraph">${nodesToHtml(node.getChildren())}</p>`;
        }
        return '';
      })
      .join('');
  });
  return html;
}

function editorStateToPlainText(editorState) {
  let text = '';
  editorState.read(() => {
    text = $getRoot().getTextContent();
  });
  return text;
}

/* Main component */
const LexicalEditor = ({ initialValue, onChange, placeholder = 'Type here…', clearSignal }) => {
  const initialConfig = useMemo(() => {
    const editorStateInitializer = () => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      if (initialValue) {
        paragraph.append($createTextNode(initialValue));
      } else {
        paragraph.append($createTextNode(''));
      }
      root.append(paragraph);
    };

    return {
      namespace: 'PollEditor',
      nodes: [HeadingNode, ListNode, ListItemNode],
      theme: {
        paragraph: 'lexical-paragraph',
        heading: { h1: 'lexical-text-h1', h2: 'lexical-text-h2' },
        text: {
          plain_text: 'lexical-text-plain',
          bold: 'lexical-text-bold',
          italic: 'lexical-text-italic',
          underline: 'lexical-text-underline',
        },
        list: { ul: 'lexical-list-ul', ol: 'lexical-list-ol', listitem: 'lexical-list-item' },
      },
      editorState: editorStateInitializer,
      onError: console.error,
    };
  }, [initialValue]);

  const handleChange = (editorState) => {
    if (!onChange) return;
    const plain = editorStateToPlainText(editorState);
    const html = editorStateToHtml(editorState);
    onChange({ plain, html: DOMPurify.sanitize(html) });
  };

  return (
    <div className="lexical-editor-wrapper">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="lexical-editor">
          <ToolbarPlugin />
          <RichTextPlugin
            contentEditable={<ContentEditable className="lexical-content-editable" />}
            placeholder={<div className="lexical-placeholder">{placeholder}</div>}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          <ListPlugin />
          <CapitalizePlugin />
          <ResetPlugin clearSignal={clearSignal} />
        </div>
      </LexicalComposer>
    </div>
  );
};

export default LexicalEditor;
