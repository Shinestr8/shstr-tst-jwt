import { useEffect, useState} from "react";
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { config } from "../config/config";


export function Login(props){

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const API_URL = config.url.backend;

    useEffect(()=>{
      document.title = "Login"
    }, [])

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
      const res = await axios.post(API_URL + "/refresh", {token: refreshToken});
      document.cookie = "access=" + res.data.accessToken;
      document.cookie = "refresh=" + res.data.refreshToken;
      console.log("refreshed")
      return res.data;
    }catch(err){
      console.log(err);
    }
  }


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


    async function login(e){
        e.preventDefault();
        try{
            const res = await axios.post(API_URL + "/login", {username, password});
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

    function redirectToRegister(){
      navigate('/register');
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
                <button onClick={redirectToRegister} className="registerButton" type="button">Register here</button>  
                <button onClick={login} type="submit">Login</button>
            </footer>
            
            </form>
        </div>
    );
}