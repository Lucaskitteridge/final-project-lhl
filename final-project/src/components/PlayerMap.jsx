import React, { useState } from 'react'
import { GoogleMap, Marker, InfoWindow, LoadScript } from '@react-google-maps/api';

let center = {
  lat: 43.644357428479296,
  lng: -79.40218810875912
};

const containerStyle = {
  width: '600px',
  height: '600px',
};

function Map() {

  const [selected, setSelected] = useState({});

  const onSelect = item => {
    setSelected(item);
  }

  const locations = [
    {
      name: "@JSmith",
      location: {
        lat: 43.6532,
        lng: -79.3832
      },
    },
    {
      name: "@ChuckNorr",
      location: {
        lat: 34.0522,
        lng: -118.2437
      },
    },
    {
      name: "@TFey",
      location: {
        lat: 40.7594,
        lng: -73.9800
      },
    },
    {
      name: "@CChanning",
      location: {
        lat: 45.5017,
        lng: -73.5673
      },
    },
    {
      name: "@CDion",
      location: {
        lat: 45.5020,
        lng: -73.5670
      },
    },
    {
      name: "@WGretzsky",
      location: {
        lat: 43.6535,
        lng: -79.3835
      },
    },
    {
      name: "@JTrudeau",
      location: {
        lat: 45.4445,
        lng: -75.6858
      },
    },
    {
      name: "@CTatum",
      location: {
        lat: 34.0928,
        lng: -118.3287
      },
    },
    {
      name: "@MMouse",
      location: {
        lat: 28.3852,
        lng: -81.5639
      },
    },
    {
      name: "@CLloyd",
      location: {
        lat: 34.1478,
        lng: -118.1445
      },
    }
  ];

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={3}
      >
        {
          locations.map(item => {
            return (
              <Marker key={item.name}
                position={item.location}
                onClick={() => onSelect(item)}
              />
            )
          })
        }
        {
          selected.location &&
          (
            <InfoWindow
              position={selected.location}
              clickable={true}
              onCloseClick={() => setSelected({})}
            >
              <div>
              <img src="./images/user.png" alt="User Icon"></img>
              <p style={{ margin: "0" }}>{selected.name}</p>
              </div>
            </InfoWindow>
          )
        }
      <></>
      </GoogleMap>
    </LoadScript >
  )
}

export default React.memo(Map)