import React, { Component } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import states from 'json!./states.geojson';
import counties from 'json!./counties.geojson';
import services from 'json!./services.geojson';
import Filter from './Filter'; 
import Button from './Button';

// store the map configuration properties in an object
let config = {};
config.params = {
  center: [37.8, -96],
  zoomControl: true,
  zoom: 4,
  minZoom: 4,
  maxZoom: 19,
  scrollwheel: false
};
config.tileLayer = {
  uri: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  params: {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a>MapBox</a>',
    id: 'mapbox.light',
    accessToken: ''
  }
};

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      tileLayer: null,
      statesLayer: null,
      servicesLayer: null,
      countyLayer: null,
      geojson: null,
      states: null,
      services: null,
      counties: null,
      stateName: '',
      countyName: ''
    };
    this._mapNode = null;
    this.onEachFeature = this.onEachFeature.bind(this);
    this.onEachCounty = this.onEachCounty.bind(this);
    this.highlightFeature = this.highlightFeature.bind(this);
    this.undoHighlight = this.undoHighlight.bind(this);
    this.zoomToFeature = this.zoomToFeature.bind(this);
    this.resetView = this.resetView.bind(this);
  }

  componentDidMount() {
    console.log('componentDidMount');
    this.getData();
    // create the Leaflet map object
    if (!this.state.map) this.init(this._mapNode);
  }

  componentDidUpdate(prevProps, prevState) {
    // code to run when the component receives new props or state
    // check to see if geojson is stored, map is created, and geojson overlay needs to be added
    if (this.state.services && this.state.states && this.state.map && !this.state.statesLayer) {
      // add the geojson overlay
      this.addStatesLayer(this.state.states);
      this.addServicesLayer(this.state.services);
    }
  }

  componentWillUnmount() {
    this.state.map.remove();
  }

  getData() {
    this.setState({states, services, counties});
  }

  addStatesLayer(geojson) {
   
    const statesLayer = L.geoJson(geojson, {
      onEachFeature: this.onEachFeature,
      style: this.style
    });
    statesLayer.addTo(this.state.map);
    this.setState({ statesLayer });
  }

  addServicesLayer(services){

    const servicesLayer = L.geoJson(services, {
      onEachFeature: this.onEachCounty,
      style: this.servicesStyle  
    });
    servicesLayer.addTo(this.state.map);
    this.setState({ servicesLayer });
  } 

  addCountyLayer(counties, target){
    const countyLayer = L.geoJson(counties, {
      onEachFeature: this.onEachCounty,
      style: this.countyStyle, 
      filter: function(feature, layer){
        if(feature.properties.STATE === target.feature.properties.name){
          return feature.properties;
        }
      }
    });
    countyLayer.addTo(this.state.map);
    this.setState({ countyLayer });  
  }

  onEachFeature(feature, layer) {
    layer.on({
      click: this.zoomToFeature,
      mouseover: this.highlightFeature,
      mouseout: this.undoHighlight
    });    
  }

  onEachCounty(feature, layer) {
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.undoHighlight,
    });  
    const popupContent = 'County: ' + layer.feature.properties.NAME + '<br>Services: ';
    layer.bindPopup(popupContent);
  } 
  
  zoomToFeature(e) {
    this.state.map.fitBounds(e.target.getBounds());

    if(!this.state.countyLayer === false){
      this.state.countyLayer.clearLayers();
    }

    this.addCountyLayer(this.state.counties, e.target);
  }

  style(feature) {
    return {
        fillColor: 'white',
        fillOpacity: 1,
        weight: 2,
        color: '#54585a',
        dashArray: '3'
    };
  }

  servicesStyle(feature){
    return {
      fillColor: feature.properties.COLOR,
      fillOpacity: 1,
      weight: 2,
      color: '#54585a',
    };
  }

  countyStyle(feature){
    return {
      fillColor: 'white',
      fillOpacity: 0.1,
      weight: 2,
      color: '#54585a',
      dashArray: '3'
    }
  }

  highlightFeature(e) { 
    var layer = e.target;
    layer.setStyle({ 
      weight: 5,
      color: '#54585a',
      dashArray: ''
    });
    
    if (!layer.feature.properties.NAME){
      this.setState({
        stateName: layer.feature.properties.name,
        countyName: ''
      });
    } 
    else {
      this.setState({
        countyName: layer.feature.properties.NAME, 
        stateName: layer.feature.properties.STATE
      });
    }
  }

  undoHighlight(e){
    var layer = e.target;
    layer.setStyle({
      weight: 2,
      color: '#54585a',
      dashArray: '3'
    });

    this.setState({
      countyName: '',
      stateName: ''
    });
  }

  resetView() {
    this.state.map.setView([37.8, -96], 4);
    this.state.countyLayer.clearLayers();
  }

  init(id) {
    if (this.state.map) return;
    // this function creates the Leaflet map object and is called after the Map component mounts
    let map = L.map(id, config.params);

    // a TileLayer is used as the "basemap"
    const tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);

    // set state to include the tile layer
    this.setState({ map, tileLayer });
  }
  
  render() {  
    return (
      <div id="mapUI">
        <Button onClick={this.resetView} />
        <Filter 
          state={this.state.stateName} 
          county={this.state.countyName}
        />
        {/*eslint-disable*/}
        <div ref={(node) => this._mapNode = node} id="map" />
      </div>
    );
  }
}

export default Map;
