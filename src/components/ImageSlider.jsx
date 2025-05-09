/*
This component displays images and allow users to zoom in and out, pan in and pan out
the images (carousel). 
*/
import { useState, useEffect, useRef, useCallback } from 'react';
import style from '../styles/components/ImageSlider.module.css';
import { ChevronRightIcon, ChevronLeftIcon, 
  MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/solid';


const ImageSlider = ({ images, currentImageIndex, setCurrentImageIndex, }) => {
  const currentImage = images[currentImageIndex];
  const imageArrayLength = images.length;
  const containerRef = useRef();
  const imageRef = useRef();
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [panStartX, setPanStartX] = useState(undefined);
  const [panStartY, setPanStartY] = useState(undefined);  

  // align image within the container boundary (image boundary cannot be inside the container)
  const alignImage = useCallback( () =>{
    // Get bounding rectangles once per element
    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();    

    //calculating top-left boundary of container and image
    const containerTopY = containerRect.top;
    const imageTopY = imageRect.top;
    const containerLeftX = containerRect.left;
    const imageLeftX = imageRect.left;    
    
    const dLeftX = containerLeftX - imageLeftX; // calculate space between left side of container and image
    const dTopY = containerTopY - imageTopY; // calculate space between top side of container and image

    // align the image to the left or top boundary of the container 
    // Update offsetX if the condition for the X-axis is met
    if (imageLeftX > containerLeftX) {
      setOffsetX(prevValue => prevValue + (dLeftX / scale));
    }

    // Update offsetY if the condition for the Y-axis is met
    if (imageTopY > containerTopY) {
      setOffsetY(prevValue => prevValue + (dTopY / scale));
    }

    //calculating bottom-right boundary of container and image
    const containerBottomY = containerRect.bottom;
    const imageBottomY = imageRect.bottom;
    const containerRightX = containerRect.right;    
    const imageRightX = imageRect.right;  

    const dRightX = containerRightX - imageRightX; // calculate space between right side of container and image
    const dBottomY = containerBottomY - imageBottomY; // calculate space between bottom side of container and image

    // align the image to the right or bottom boundary of the container 
    // Update offsetX if the condition for the X-axis is met
    if (imageRightX < containerRightX) {
      setOffsetX(prevValue => prevValue + (dRightX / scale));
    }

    // Update offsetY if the condition for the Y-axis is met
    if (imageBottomY < containerBottomY) {
      setOffsetY(prevValue => prevValue + (dBottomY / scale));
    }
  },[scale]);

  // zoom in the image by increasing the scale factor (0.1 = 10%)
  const zoomIn = () => setScale((prevScale) => Math.min(4, prevScale + 0.1));
  const zoomOut = () => setScale((prevScale) => Math.max(1, prevScale - 0.1));

  //reset the scale factor of the image its original size
  const reset = () => {
    // Limit the maximum zoom level
    setScale(1);    
  };
  
  // displays the next image in the array
  const nextImage = (e) => {
    reset();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageArrayLength);      
  };

  // displays the previous image in the array
  const previousImage = () => {
    reset();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageArrayLength) % imageArrayLength);
  };

  // executes when the wheel function on the mouse is used
  const handleWheel = (e) => {
    e.deltaY > 0 ? zoomOut() : zoomIn();
  };

  // executes when the left mouse button is pressed
  const handlePanStart = (e) => {
    setPanStartX(e.clientX);
    setPanStartY(e.clientY);
  };

  // executes when the mouse is moved on the image
  // e.clientX - panStartX = distance between the starting to current mouse position on the x
  // e.clientY - panStartY = distance between the starting to current mouse position on the y
  const handlePan = (e) => {
    e.preventDefault();
    if (panStartX !== undefined && panStartY !== undefined) {
      setOffsetX((prevValue) => prevValue + (e.clientX - panStartX));
      setOffsetY((prevValue) => prevValue + (e.clientY - panStartY));
      setPanStartX(e.clientX);
      setPanStartY(e.clientY);
    }
  };

  // executes when the mouse left button is released or when the mouse leaves the image
  const handlePanEnd = () => {
    if(panStartX !==undefined){
      setPanStartX(undefined);
      setPanStartY(undefined);
      alignImage(); 
    }   
  };

  useEffect(()=> {    
    alignImage(); 
  }, [alignImage])  

  return (
    <div className={style['image-slider']} ref={containerRef}>
      <div className={style["zoom-controls"]}>
        <button onClick={() => zoomIn()} className={style['zoom-in-btn']}>
          <MagnifyingGlassPlusIcon className={style['mPlusIcon']}/>
        </button>
        <button onClick={() => zoomOut()} className={style['zoom-out-btn']}> 
          <MagnifyingGlassMinusIcon className={style['mMinusIcon']} /> 
        </button>
        <button onClick={() => reset()} className={style['reset-btn']}>
          Reset
        </button>        
      </div>
      <button className={style['prev-button']} onClick={previousImage}>
        <ChevronLeftIcon className={style['left-icon']} />
      </button>
      <button className={style['next-button']} onClick={nextImage}>
        <ChevronRightIcon className={style['right-icon']} />
      </button>
      {imageArrayLength &&
        <span className={style['image-index']}>{`${currentImageIndex + 1} / ${imageArrayLength}`}</span>
      }
      <img 
        key={currentImage?.name}
        className={style.image} 
        ref={imageRef}
        src={currentImage?.src} 
        alt={currentImage?.name} 
        style={{transform: `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`, cursor: 'grab'}}
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
        onMouseMove={handlePan}
        onMouseUp={handlePanEnd} 
        onMouseLeave={handlePanEnd}                  
      />   
    </div>
  );
};

export default ImageSlider;




