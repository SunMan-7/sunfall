import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ArrowRightCircleIcon, ArrowLeftCircleIcon } from "@heroicons/react/24/solid";

// Create a custom next arrow button
function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <ArrowRightCircleIcon
      className={className}
      style={{ ...style, color: "#009C1C", }}
      onClick={onClick}
    />
  );
}

// Create a custom prev arrow button
function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <ArrowLeftCircleIcon
      className={className}
      style={{ ...style, color: "#009C1C"}}
      onClick={onClick}
    />
  );
}

// Creates an image carousel with the ability to browse left and right
function CustomSlider({images, currentIndex = null, setCurrentIndex = null}) {  
  let settings = {    
    // dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    afterChange: current => setCurrentIndex(current),
  };
  return (
    <>
    {/* <div>{currentIndex +1}</div> */}
    <Slider initialSlide={currentIndex} {...settings}>
      {images.map((image, index) => (
        // <div key={index}>
        <img src={image.src} alt={image?.name ? image.name : ''} key={index}/>        
        // </div>
      ))}
    </Slider>    
    </>
  );
}

export default CustomSlider;