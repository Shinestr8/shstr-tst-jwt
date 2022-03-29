import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";



function App() {


  //state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

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
        setUser(response.data.user);
      } catch (error) {
        console.log(error);
      }
    }
  }

  //success event handler
  function alertSuccess(){
    setSuccess(true);
    setTimeout(function(){
      setSuccess(false);
  }, 2000);
  }

  //alert handler
  function alertError(){
    setError(true);
    setTimeout(function(){
      setError(false);
  }, 2000);
  }

  //username handler
  function handleTextChange(e){
    setUsername(e.target.value);
  }

  //password handler
  function handlePasswordChange(e){
    setPassword(e.target.value);
  }
  
  
  //function called on delete click
  async function handleDelete(e, id){
    e.preventDefault();
    setSuccess(false);
    setError(false);
    try{
      await axiosJWT.delete("/users/"+id, {
        headers: {authorization: "Bearer " + fetchCookies()[0]}
      });
      alertSuccess();
    } catch (err){
      alertError(true);
    }
  }

  //function called on login click
  async function login(e){
    e.preventDefault();
    try{
      const res = await axios.post("/login", {username, password});
      setUser(res.data.user);
      setUsername("");
      setPassword("");
      document.cookie = "access=" + res.data.accessToken;
      document.cookie = "refresh=" + res.data.refreshToken;
    } catch(err){
      console.log(err);
    }
  }

  //function called on logout click
  async function handleLogout(e){
    e.preventDefault();
    const [accessToken, refreshToken] = fetchCookies();
    try {
      const config = {
        headers:{
          authorization: "Bearer " + accessToken,
        }
      };
      const data ={
        token: refreshToken,
      }
      await axios.post("/logout", data, config);
      setUser(null);
      setPassword("");
      setUsername("");
      setSuccess("");
      setError("");
      document.cookie = "access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (error) {
      console.log(error)
    }
  }


  if(user === null){
    //login form
    return (
      
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
            <button onClick={login}>Login</button>
          </footer>
          
        </form>
      </div>
    );
  }


  //user dashboard
  return (
    <div className='content'>
      {success && (
            <div className='msg-success'>User deleted successfully</div>
          )}
          {error &&(
            <div className='msg-error'>You can not delete this user</div>
          )}
      <div className='dashboard'>
        <header><h2>Dashboard</h2></header>
        <div className="dashboard-body">
          
          <div><strong>User: </strong>{user.username}</div>
          <div><strong>Role: </strong>{user.isAdmin ? "Admin" : "User"}</div>
        </div>
        
        <footer>
          <button onClick={handleLogout}>Log out</button>
          <button onClick={(e)=>handleDelete(e,1)}>Delete John</button>
          <button onClick={(e)=>handleDelete(e,2)}>Delete Jane</button>
        </footer>
        
      </div>
      
    </div>
  )

  }


  

export default App;
