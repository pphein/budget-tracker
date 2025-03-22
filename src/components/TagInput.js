import React, { useState } from 'react';

const TagInput = ({tab, tags, setTags }) => {
    const [newTag, setNewTag] = useState('');
    console.log(tab);
    console.log(tags[tab]);

    const handleTagAdd = () => {
        if (newTag.trim() && !tags[tab].includes(newTag)) {
            setTags([...tags[tab], newTag.trim()]);
            setNewTag('');
        }
    };

    return (
        <div className="flex space-x-2">
            <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add custom tag"
                className="border px-2 py-1 rounded"
            />
            <button onClick={handleTagAdd} className="px-4 py-2 bg-blue-500 text-white rounded">
                Add
            </button>
        </div>
    );
};

export default TagInput;
