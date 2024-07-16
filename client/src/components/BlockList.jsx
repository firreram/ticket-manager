import React from 'react';
import Block from './Block';

function BlockList({ blocks }) {
    return (
        <>
            {blocks.length === 0 ? (
                <p>No answers yet</p>
            ) : (
                blocks.map((block) => <Block key={block.id} block={block} />)
            )}
        </>
    );
}

export default BlockList;
