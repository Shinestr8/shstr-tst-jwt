import { useState, useEffect } from "react";
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";


export function Login(props){

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // const [user, setUser] = useState(null);

    // useEffect(()=>{
    //     if(isLogged){
    //         const navigate = useNavigate();

    //     }
    // }, [isLogged])

    //username handler
    function handleTextChange(e){
        setUsername(e.target.value);
    }

    //password handler
    function handlePasswordChange(e){
        setPassword(e.target.value);
    }

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
    logFromJWT();
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

  async function logFromJWT(){
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
        // setUser(response.data.user);
        props.handleUser(response.data.user)
        navigate('/dashboard');
      } catch (error) {
        console.log(error);
      }
    }
  }

    async function login(e){
        e.preventDefault();
        try{
            const res = await axios.post("/login", {username, password});
            // setUser(res.data.user);
            props.handleUser(res.data.user);
            setUsername("");
            setPassword("");
            document.cookie = "access=" + res.data.accessToken;
            document.cookie = "refresh=" + res.data.refreshToken;
            navigate('/dashboard');
        } catch(err){
        console.log(err);
        }
    }

    function redirect(){
        navigate('/dashboard');
    }

    return(
        <div className='login'>
            <form>
            <header><h2>Login</h2></header>
            <div className='input-group'>
                <div>
                <label htmlFor='username'>Username</label>
                <input required onChange={handleTextChange} value={username} name="username" type="text"/>
                
                </div>
                <div>
                <label htmlFor='password'>Password</label>
                <input value={password} required onChange={handlePasswordChange} type="password" name="password"/>
                
                </div>
            </div>
            
            <footer>
                {/* <button onClick={redirect}>Test Login</button> */}
                <button onClick={login}>Login</button>
            </footer>
            
            </form>
        </div>
    );
}