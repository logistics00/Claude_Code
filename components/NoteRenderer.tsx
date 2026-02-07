type Mark = {
    type: 'bold' | 'italic' | 'code';
};

type TextNode = {
    type: 'text';
    text: string;
    marks?: Mark[];
};

type ContentNode = {
    type: string;
    attrs?: Record<string, unknown>;
    content?: ContentNode[];
    text?: string;
    marks?: Mark[];
};

type TipTapDoc = {
    type: 'doc';
    content?: ContentNode[];
};

function renderText(node: TextNode): React.ReactNode {
    let content: React.ReactNode = node.text;

    if (node.marks) {
        for (const mark of node.marks) {
            switch (mark.type) {
                case 'bold':
                    content = <strong key='bold'>{content}</strong>;
                    break;
                case 'italic':
                    content = <em key='italic'>{content}</em>;
                    break;
                case 'code':
                    content = (
                        <code
                            key='code'
                            className='rounded bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-800'
                        >
                            {content}
                        </code>
                    );
                    break;
            }
        }
    }

    return content;
}

function renderNode(node: ContentNode, index: number): React.ReactNode {
    const key = `${node.type}-${index}`;

    switch (node.type) {
        case 'text':
            return <span key={key}>{renderText(node as TextNode)}</span>;

        case 'paragraph':
            return (
                <p
                    key={key}
                    className='mb-4 leading-relaxed text-gray-700 dark:text-gray-300'
                >
                    {node.content?.map((child, i) => renderNode(child, i))}
                </p>
            );

        case 'heading': {
            const level = (node.attrs?.level as number) || 1;
            const children = node.content?.map((child, i) => renderNode(child, i));
            const className =
                {
                    1: 'mb-4 mt-6 text-3xl font-bold text-gray-900 dark:text-white',
                    2: 'mb-3 mt-5 text-2xl font-bold text-gray-900 dark:text-white',
                    3: 'mb-2 mt-4 text-xl font-semibold text-gray-900 dark:text-white',
                }[level] ||
                'mb-2 mt-4 text-lg font-semibold text-gray-900 dark:text-white';

            if (level === 1)
                return (
                    <h1 key={key} className={className}>
                        {children}
                    </h1>
                );
            if (level === 2)
                return (
                    <h2 key={key} className={className}>
                        {children}
                    </h2>
                );
            return (
                <h3 key={key} className={className}>
                    {children}
                </h3>
            );
        }

        case 'bulletList':
            return (
                <ul
                    key={key}
                    className='mb-4 ml-6 list-disc space-y-1 text-gray-700 dark:text-gray-300'
                >
                    {node.content?.map((child, i) => renderNode(child, i))}
                </ul>
            );

        case 'orderedList':
            return (
                <ol
                    key={key}
                    className='mb-4 ml-6 list-decimal space-y-1 text-gray-700 dark:text-gray-300'
                >
                    {node.content?.map((child, i) => renderNode(child, i))}
                </ol>
            );

        case 'listItem':
            return (
                <li key={key}>
                    {node.content?.map((child, i) => {
                        if (child.type === 'paragraph') {
                            return child.content?.map((c, j) => renderNode(c, j));
                        }
                        return renderNode(child, i);
                    })}
                </li>
            );

        case 'codeBlock':
            return (
                <pre
                    key={key}
                    className='mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100'
                >
                    <code>
                        {node.content?.map((child) => (child as TextNode).text).join('')}
                    </code>
                </pre>
            );

        case 'horizontalRule':
            return <hr key={key} className='my-6 border-gray-200 dark:border-gray-700' />;

        case 'blockquote':
            return (
                <blockquote
                    key={key}
                    className='mb-4 border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-600 dark:text-gray-400'
                >
                    {node.content?.map((child, i) => renderNode(child, i))}
                </blockquote>
            );

        default:
            return null;
    }
}

export function NoteRenderer({ content }: { content: string }) {
    let doc: TipTapDoc;
    try {
        doc = JSON.parse(content);
    } catch {
        return <p className='text-gray-500'>Unable to render note content.</p>;
    }

    if (!doc.content || doc.content.length === 0) {
        return <p className='text-gray-500 italic'>This note is empty.</p>;
    }

    return (
        <div className='prose-custom'>
            {doc.content.map((node, i) => renderNode(node, i))}
        </div>
    );
}
