// import { useEffect, useState} from 'react';
import 'leaflet/dist/leaflet.css';
import { renderToString } from 'react-dom/server';
import {MapPinIcon  } from '@heroicons/react/24/solid';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
// import L from 'leaflet';
import { Icon } from 'leaflet';

const iconUrl = `data:image/svg+xml;utf8,${encodeURIComponent(renderToString(<MapPinIcon style={{color: 'green'}} />))}`;
const customIcon = new Icon({
  iconUrl,
  iconSize: [20, 20]
})
const Map = ({markers = []}) => {
  const position = [17.250987, -88.769896];

  return (       
    <MapContainer    
      center={position} 
      zoom={8} 
      scrollWheelZoom={false}
      style={{width: '100%', height: '100%', zIndex: 0}}        
    >          
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers?.map((marker, index) => (
      <Marker position={[marker?.latitude, marker?.longitude]} key={index} icon={customIcon}>
        <Tooltip sticky >
          <strong style={{fontSize: '10px'}}>{marker?.locationName} </strong> <br/>
          <span style={{fontSize: '10px'}}>Lat: {(marker?.latitude).toFixed(6)}</span> <br/> 
          <span style={{fontSize: '10px'}}>Lng: {(marker?.longitude).toFixed(6)} </span>
        </Tooltip>
      </Marker>
      ))}
    </MapContainer>    
  )
}

export default Map