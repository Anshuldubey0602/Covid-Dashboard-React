import React, { useState, useEffect }from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from './InfoBox';
import './App.css';
import Map from './Map';
import Table from "./Table";
import { prettyPrintStat, sortData } from './utils';
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
  //Define a state
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const[mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
    //STATE = How to write a variable in REACT
  //https://disease.sh/v3/covid-19/countries

  // USEFFECT: Runs a piece of code 
  // based on a given condition

  useEffect(() =>{
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    })
  }, [])

  useEffect(() =>{
    // The code inseide here will run once
    // when the component loads and not again
    //We will have to run an async 
    //async = send a req. and wait for it, do smthn with info
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2
          }))
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
      })
    }
    getCountriesData();
  }, []);

  const onCountryChange = async(event) => {
    const countryCode = event.target.value
    setCountry(countryCode);
    const url = 
    countryCode === 'worldwide' 
    ? 'https://disease.sh/v3/covid-19/all' 
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);

      setCountryInfo(data);
      if(countryCode === 'worldwide'){
        setMapCenter([34.80746, -40.4796])}else{
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);}
      if(countryCode === 'worldwide'){
        setMapZoom(3)}else{
          setMapZoom(4)};
    })
    
  }


  return (
    <div className="App">
      <div className="app__left"> 
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>

        <FormControl className="app__dropdown">
        <Select variant="outlined" 
        onChange={onCountryChange}
        value={country}>
        <MenuItem value="worldwide">Worldwide</MenuItem>
        {countries.map((country) => (
          <MenuItem value={country.value}>{country.name}</MenuItem>
        ))}
        </Select>
      </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
          active={casesType === "cases"}
           onClick={(e) => setCasesType("cases")}
           isRed
           title="Coronavirus Cases" 
           cases={prettyPrintStat(countryInfo.todayCases)} 
           total={countryInfo.cases}/>
          <InfoBox 
          active={casesType === "recovered"}
           onClick={(e) => setCasesType("recovered")}
          title="Recovered Cases" 
          cases={prettyPrintStat(countryInfo.todayRecovered)} 
          total={countryInfo.recovered}/>
          <InfoBox 
          active={casesType === "deaths"}
           onClick={(e) => setCasesType("deaths")}
           isRed
          title="Deaths" 
          cases={prettyPrintStat(countryInfo.todayDeaths)} 
          total={countryInfo.deaths}/>
        </div>
        <Map
        casesType={casesType}
        countries={mapCountries}
        center={mapCenter}
        zoom={mapZoom}
        />
        </div>

     <Card className="app__right">
       <CardContent>
         <h3>Live Cases by Countries</h3>
         <Table countries={tableData} />
        <h3>Worldwide new cases {casesType}</h3>
         <LineGraph className="app__graph" casesType={casesType}/>
       </CardContent>
     {/* {Table}
     {Graph} */}
     </Card>
    </div>
  );
}

export default App;
