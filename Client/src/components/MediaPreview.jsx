import React from 'react'

const MediaPreview = ({mediaSrc}) => {
  return (
    <div className='w-full h-[calc(100%-122px)] flex justify-center items-center'>
      <div className="w-[max-content]  h-[60%] my-3 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
        <img src={mediaSrc} alt="image-preview"  className='w-full h-full object-contain'/>
      </div>
    </div>
  )
}

export default MediaPreview
