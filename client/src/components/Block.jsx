import React from 'react';

function Block({ block }) {
    return (
        <div key={block.id} className="card my-2">
            <p className="m-2"><strong>{block.username}</strong> {block.timestamp}</p>
            <p className="mx-2">
                {block.body.split('\n').map((line, index) => (
                    <React.Fragment key={index}>{line}<br /></React.Fragment>
                ))}
            </p>
        </div>
    );
}

export default Block;
