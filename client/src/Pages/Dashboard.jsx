import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";

export function Dashboard(props){
    const user = props.user;

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const navigate = useNavigate();

    useEffect(function(){
        let timer;
        if(success){
            timer = setTimeout(function(){
                setSuccess(false);
            }, 2000);
        }
        if(error){
            timer = setTimeout(function(){
                setError(false);
            }, 2000);
        }
        return(function(){
            window.clearTimeout(timer)
        })
    }, [success, error])

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

      function alertSuccess(){
        setSuccess(true);
      }
    
      //alert handler
      function alertError(){
        setError(true);
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
      setSuccess("");
      setError("");
      document.cookie = "access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }


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