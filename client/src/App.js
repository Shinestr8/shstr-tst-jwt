import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import {Route, Routes, BrowserRouter } from 'react-router-dom';

import {Login} from './Pages/Login';
import { Dashboard } from './Pages/Dashboard';
import {Register} from './Pages/Register'

function App() {

  function handleUser(user){
    setUser(user);
  }

  //state
  const [user, setUser] = useState(null);

  //axios instance
  const axiosJWT = axios.create();

  //interceptor, executed before every request on axiosJWT
  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const [accessToken] = fetchCookies();
      const decodedToken = jwt_decode(accessToken);
      if(decodedToken.exp * 1000 < currentDate.getTime()){
        const data = await refreshToken();
        config.headers["authorization"] = "Bearer " + data.accessToken; 
      }
      return config
    }, (error)=>{return Promise.reject(error)}
  )

  async function refreshToken(){
    try{
      const [, refreshToken] = fetchCookies();
      const res = await axios.post("/refresh", {token: refreshToken});
      document.cookie = "access=" + res.data.accessToken;
      document.cookie = "refresh=" + res.data.refreshToken;
      console.log("refreshed")
      return res.data;
    }catch(err){
      console.log(err);
    }
  }

  //useEffect that executes only on first load, to login with JWT
  useEffect(function(){
    autoLoginFromToken();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  function fetchCookies(){
    let cookies = document.cookie;
    let response = [];
    if(cookies){
      cookies = cookies.split(";");
      let accessToken = cookies[0].split("=")[1];
      let refreshToken = cookies[1].split("=")[1];
      response = [accessToken, refreshToken]
    }
    return response;
  }

  async function autoLoginFromToken(){
    const [accessToken, refreshToken] = fetchCookies();
    if(accessToken&&refreshToken){
      try {
        const config = {
          headers:{
            authorization: "Bearer " + accessToken,
          }
        };
        const data ={
          token: accessToken,
          refresh: refreshToken
        }
        const response = await axiosJWT.post("/loginJWT", data, config);
        setUser(response.data.user);
      } catch (error) {
        console.log(error);
      }
    }
  }

  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login handleUser={handleUser}/>}/>
        <Route path="/dashboard" element={<Dashboard user={user}/>}/>
        <Route path="/register" element={<Register/>}/>
      </Routes>
    </BrowserRouter>
  )
}
export default App;
